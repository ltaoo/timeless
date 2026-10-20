import { readFile } from "node:fs/promises";
import postcss from "postcss";
import type { Plugin } from "vite";

type Rule = {
  classes: string[];
  states: string[];
  style: Record<string, string>;
};
const length = "-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:px)?";
const nonnegative_length = "(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:px)?";
const color =
  /^(?:#[\da-f]{3,4}|#[\da-f]{6}|#[\da-f]{8}|transparent|black|white)$/i;
const dimensions = new RegExp(
  `^(?:${nonnegative_length}|(?:\\d+(?:\\.\\d+)?)%|auto)$`,
);
const values: Record<string, RegExp> = {
  "background-color": color,
  color,
  "border-color": color,
  "border-width": new RegExp(`^${nonnegative_length}$`),
  "border-radius": new RegExp(`^${nonnegative_length}$`),
  opacity: /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/,
  "font-size": new RegExp(`^${nonnegative_length}$`),
  "font-weight": /^(?:normal|bold|[1-9]00)$/,
  "text-align": /^(?:left|center|right)$/,
  display: /^(?:flex|none)$/,
  position: /^(?:relative|absolute)$/,
  "flex-direction": /^(?:row|column)(?:-reverse)?$/,
  "flex-wrap": /^(?:nowrap|wrap|wrap-reverse)$/,
  "flex-grow": /^(?:\d+(?:\.\d+)?|\.\d+)$/,
  "flex-shrink": /^(?:\d+(?:\.\d+)?|\.\d+)$/,
  "flex-basis": dimensions,
  "align-items": /^(?:flex-start|flex-end|center|stretch|baseline)$/,
  "align-self": /^(?:auto|flex-start|flex-end|center|stretch|baseline)$/,
  "justify-content":
    /^(?:flex-start|flex-end|center|space-between|space-around|space-evenly)$/,
};
for (const name of ["width", "height"]) values[name] = dimensions;
for (const name of ["min-width", "min-height", "max-width", "max-height"])
  values[name] = new RegExp(
    `^(?:${nonnegative_length}|(?:\\d+(?:\\.\\d+)?)%)$`,
  );
for (const name of ["gap", "row-gap", "column-gap"])
  values[name] = new RegExp(`^${nonnegative_length}$`);
for (const edge of ["top", "right", "bottom", "left"]) {
  values[edge] = new RegExp(`^${length}$`);
  values[`padding-${edge}`] = new RegExp(`^${nonnegative_length}$`);
  values[`margin-${edge}`] = new RegExp(`^${length}$`);
}

/** A deliberately bounded CSS dialect; unsupported syntax fails at its source location. */
export function compileNativeStyles(source: string, filename: string): Rule[] {
  const root = postcss.parse(source, { from: filename });
  const rules: Rule[] = [];
  for (const node of root.nodes) {
    if (node.type === "comment") continue;
    if (node.type !== "rule")
      throw node.error(
        "Native styles only support class rules; at-rules are unsupported",
      );
    const style: Record<string, string> = {};
    for (const decl of node.nodes) {
      if (decl.type === "comment") continue;
      if (decl.type !== "decl")
        throw decl.error("Nested native style rules are unsupported");
      if (decl.important)
        throw decl.error("Native styles do not support !important");
      const property = decl.prop.toLowerCase();
      const value = decl.value.trim();
      if (property === "padding" || property === "margin") {
        const parts = value.split(/\s+/);
        const pattern = new RegExp(
          `^${property === "padding" ? nonnegative_length : length}$`,
        );
        if (parts.length > 4 || !parts.every((part) => pattern.test(part)))
          throw decl.error(`Unsupported native ${property}: ${value}`);
        const [top, right = top, bottom = top, left = right] = parts;
        Object.assign(style, {
          [`${property}-top`]: top,
          [`${property}-right`]: right,
          [`${property}-bottom`]: bottom,
          [`${property}-left`]: left,
        });
      } else {
        if (
          !values[property]?.test(value) ||
          (property === "font-size" && parseFloat(value) <= 0)
        )
          throw decl.error(
            `Unsupported native declaration: ${property}: ${value}`,
          );
        style[property] = value;
      }
    }
    for (const selector of node.selectors) {
      if (
        !/^(?:\.[a-z_][\w-]*)+(?::(?:hover|active|focus|disabled))*$/i.test(
          selector,
        )
      ) {
        throw node.error(
          `Unsupported native selector: ${selector}; use .class, .class.other and :hover/:active/:focus/:disabled`,
        );
      }
      rules.push({
        classes: [...selector.matchAll(/\.([\w-]+)/g)].map((match) => match[1]),
        states: [...selector.matchAll(/:([\w-]+)/g)].map((match) =>
          match[1].toLowerCase(),
        ),
        style,
      });
    }
  }
  return rules;
}

/** Imports *.native.css as JS registration code, so JavaScriptCore needs no CSS loader. */
export function timelessNativeStyles(): Plugin {
  const prefix = "\0timeless-native-styles:";
  return {
    name: "timeless-native-styles",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!source.endsWith(".native.css")) return;
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (resolved) return `${prefix}${resolved.id}.js`;
    },
    async load(id) {
      if (!id.startsWith(prefix)) return;
      const filename = id.slice(prefix.length, -3);
      this.addWatchFile(filename);
      const rules = compileNativeStyles(
        await readFile(filename, "utf8"),
        filename,
      );
      return `import { registerNativeStyleSheet } from "@timeless/timeless-native";\nregisterNativeStyleSheet(${JSON.stringify(filename)}, ${JSON.stringify(rules)});`;
    },
  };
}
