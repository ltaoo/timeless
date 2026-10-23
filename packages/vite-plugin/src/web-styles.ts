import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import tailwindcss from "@tailwindcss/postcss";
import type { Plugin } from "vite";

function selector(nodes: any[]): any[] {
  return nodes.map((node) => ({
    type: node.type,
    value: node.value,
    ...(node.type === "attribute" && {
      attribute: node.attribute,
      operator: node.operator,
      insensitive: node.insensitive,
    }),
    ...(node.nodes && {
      nodes: node.nodes.map((child: any) => selector(child.nodes ?? [child])),
    }),
  }));
}

function specificity(nodes: any[]): number {
  return nodes.reduce((sum, node) => {
    if (node.type === "id") return sum + 10000;
    if (node.type === "class" || node.type === "attribute") return sum + 100;
    if (node.type === "tag") return sum + 1;
    if (node.type !== "pseudo" || node.value === ":where") return sum;
    if ([":is", ":not", ":has"].includes(node.value))
      return (
        sum +
        Math.max(0, ...node.nodes.map((child: any) => specificity(child.nodes)))
      );
    return sum + (node.value.startsWith("::") ? 1 : 100);
  }, 0);
}

/** Preserve CSS declarations and selector semantics; host renderers never interpret utility names. */
export function compileWebStyles(source: string, filename: string) {
  const root = postcss.parse(source, { from: filename });
  const properties: Record<string, { value?: string; inherits: boolean }> = {};
  const rules: any[] = [];
  const keyframes: Record<
    string,
    { offset: number; declarations: Record<string, string> }[]
  > = {};
  root.walkAtRules((rule) => {
    if (!/^(?:-webkit-)?keyframes$/.test(rule.name)) return;
    const frames = new Map<number, Record<string, string>>();
    rule.walkRules((frame) => {
      for (const selector of frame.selector.split(",")) {
        const key = selector.trim();
        const offset =
          key === "from"
            ? 0
            : key === "to"
              ? 1
              : key.endsWith("%")
                ? Number(key.slice(0, -1)) / 100
                : NaN;
        if (!Number.isFinite(offset) || offset < 0 || offset > 1) continue;
        const declarations = frames.get(offset) ?? {};
        frame.walkDecls((decl) => {
          if (!decl.important) declarations[decl.prop] = decl.value;
        });
        frames.set(offset, declarations);
      }
    });
    keyframes[rule.params] = [...frames]
      .sort(([a], [b]) => a - b)
      .map(([offset, declarations]) => ({ offset, declarations }));
  });
  root.walkAtRules("property", (rule) => {
    let value: string | undefined,
      inherits = false;
    rule.walkDecls((decl) => {
      if (decl.prop === "initial-value") value = decl.value;
      if (decl.prop === "inherits") inherits = decl.value === "true";
    });
    properties[rule.params] = { value, inherits };
  });
  root.walkRules((rule) => {
    const media: string[] = [];
    let parent = rule.parent;
    while (parent && parent.type !== "root") {
      if (parent.type === "atrule") {
        if (/keyframes$/.test(parent.name) || parent.name === "property")
          return;
        if (parent.name === "media") media.push(parent.params);
      }
      parent = parent.parent;
    }
    const declarations = rule.nodes
      .filter((node) => node.type === "decl")
      .map((node: any) => [node.prop, node.value, !!node.important]);
    if (!declarations.length) return;
    const ast = selectorParser().astSync(rule.selector);
    for (const item of ast.nodes) {
      rules.push({
        selector: selector(item.nodes),
        specificity: specificity(item.nodes),
        declarations,
        media,
      });
    }
  });
  return { properties, rules, keyframes };
}

/** Consume the same stylesheet links and Tailwind source that the browser entry consumes. */
export function timelessWebStyles(options: {
  html: string;
  native?: boolean;
}): Plugin {
  const id = "\0timeless-web-styles";
  const prefix = "\0timeless-web-css:";
  return {
    name: "timeless-web-styles",
    enforce: "pre",
    async transformIndexHtml(html) {
      if (options.native !== false) return html;
      for (const match of [
        ...html.matchAll(
          /<style\b[^>]*type=["']text\/tailwindcss["'][^>]*>([\s\S]*?)<\/style>/g,
        ),
      ]) {
        const filename = `${resolve(options.html)}.css`;
        const result = await postcss([
          tailwindcss({ base: dirname(resolve(options.html)), optimize: true }),
        ]).process(match[1], { from: filename });
        html = html.replace(
          match[0],
          `<style data-n="shared-utilities">${result.css}</style>`,
        );
      }
      return html.replace(
        /<script\b[^>]*src=["'][^"']*tailwindcss[^"']*["'][^>]*>\s*<\/script>/g,
        "",
      );
    },
    async resolveId(source, importer) {
      if (source === "virtual:timeless-web-styles") return id;
      if (
        options.native === false ||
        !source.endsWith(".css") ||
        source.endsWith(".native.css")
      )
        return;
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (resolved) return `${prefix}${resolved.id}.js`;
    },
    async load(source) {
      if (source.startsWith(prefix)) {
        const filename = source.slice(prefix.length, -3);
        this.addWatchFile(filename);
        const result = await postcss([
          tailwindcss({ base: dirname(filename), optimize: true }),
        ]).process(await readFile(filename, "utf8"), { from: filename });
        for (const message of result.messages)
          if (message.type === "dependency") this.addWatchFile(message.file);
        return `import { registerWebStyleSheet } from "@timeless/timeless-native";\nregisterWebStyleSheet(${JSON.stringify(filename)}, ${JSON.stringify(compileWebStyles(result.css, filename))});`;
      }
      if (source !== id) return;
      const html_path = resolve(options.html);
      this.addWatchFile(html_path);
      const html = await readFile(html_path, "utf8");
      const sheets: { filename: string; css: string }[] = [];
      for (const match of html.matchAll(
        /<link\b[^>]*href=["']([^"']+\.css)["'][^>]*>/g,
      )) {
        const filename = resolve(
          dirname(html_path),
          match[1].replace(/^\//, ""),
        );
        this.addWatchFile(filename);
        sheets.push({ filename, css: await readFile(filename, "utf8") });
      }
      for (const match of html.matchAll(
        /<style\b[^>]*type=["']text\/tailwindcss["'][^>]*>([\s\S]*?)<\/style>/g,
      )) {
        const filename = `${html_path}.css`;
        const result = await postcss([
          tailwindcss({ base: dirname(html_path), optimize: true }),
        ]).process(match[1], { from: filename });
        for (const message of result.messages) {
          if (message.type === "dependency") this.addWatchFile(message.file);
        }
        sheets.push({ filename, css: result.css });
      }
      return `import { registerWebStyleSheet } from "@timeless/timeless-native";\n${sheets.map(({ filename, css }) => `registerWebStyleSheet(${JSON.stringify(filename)}, ${JSON.stringify(compileWebStyles(css, filename))});`).join("\n")}`;
    },
  };
}
