import postcss from "postcss";
import * as ts from "typescript";
import type { Plugin } from "vite";

const tailwindClassPrefix = "tt-";

const customClassNames = new Set([
  "alert-icon",
  "animate-dash",
  "cascader__content",
  "cascader__panel",
  "cn-menu-target",
  "cn-menu-translucent",
  "cn-rtl-flip",
  "dark",
  "flow-node-content",
  "no-scrollbar",
  "overlay-scrollbar",
  "scroll-view",
  "select__content",
  "t-file-dropzone",
  "t-file-input",
  "t-menu-item-wrap",
  "t-input",
]);

const bareTailwindUtilities = new Set([
  "absolute",
  "block",
  "border",
  "contents",
  "flex",
  "fixed",
  "grid",
  "grow",
  "hidden",
  "inline",
  "inline-block",
  "inline-flex",
  "invisible",
  "isolate",
  "relative",
  "rounded",
  "shadow",
  "sr-only",
  "static",
  "sticky",
  "transform",
  "transform-gpu",
  "truncate",
  "visible",
]);

function findUtilityStart(token: string) {
  let bracketDepth = 0;
  let parenDepth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let i = 0; i < token.length; i += 1) {
    const char = token[i];
    const prev = token[i - 1];

    if (quote) {
      if (char === quote && prev !== "\\") quote = null;
      continue;
    }
    if ((char === "'" || char === '"') && prev !== "\\") {
      quote = char;
      continue;
    }
    if (char === "[" && prev !== "\\") {
      bracketDepth += 1;
      continue;
    }
    if (char === "]" && prev !== "\\" && bracketDepth > 0) {
      bracketDepth -= 1;
      continue;
    }
    if (char === "(" && prev !== "\\") {
      parenDepth += 1;
      continue;
    }
    if (char === ")" && prev !== "\\" && parenDepth > 0) {
      parenDepth -= 1;
      continue;
    }
    if (char === ":" && bracketDepth === 0 && parenDepth === 0) {
      start = i + 1;
    }
  }

  return start;
}

function stripUtilityMarks(utility: string) {
  let value = utility;
  if (value.startsWith("!")) value = value.slice(1);
  if (value.startsWith("-")) value = value.slice(1);
  if (value.endsWith("!")) value = value.slice(0, -1);
  return value;
}

function shouldPreserveUtility(utility: string) {
  const value = stripUtilityMarks(utility);
  return (
    value.startsWith(tailwindClassPrefix) ||
    customClassNames.has(value) ||
    value.startsWith("cn-") ||
    value.startsWith("t-") ||
    value.startsWith("flow-") ||
    value.includes("__")
  );
}

function looksLikeTailwindToken(token: string) {
  if (!token) return false;

  const utility = token.slice(findUtilityStart(token));
  const value = stripUtilityMarks(utility);
  if (!value || shouldPreserveUtility(value)) return false;
  if (bareTailwindUtilities.has(value)) return true;
  if (token.includes(":")) return true;
  return /[-/[\]().%!]/.test(value);
}

function prefixUtility(utility: string) {
  if (!utility || shouldPreserveUtility(utility)) return utility;

  let start = 0;
  if (utility[start] === "!") start += 1;
  if (utility[start] === "-") start += 1;

  return `${utility.slice(0, start)}${tailwindClassPrefix}${utility.slice(start)}`;
}

function prefixTailwindClass(token: string) {
  if (!looksLikeTailwindToken(token)) return token;

  const utilityStart = findUtilityStart(token);
  return `${token.slice(0, utilityStart)}${prefixUtility(token.slice(utilityStart))}`;
}

function prefixTailwindClasses(value: string) {
  return value.replace(/\S+/g, (token) => prefixTailwindClass(token));
}

function hasTailwindClass(value: string) {
  return /\S+/.test(value) && value.split(/\s+/).some(looksLikeTailwindToken);
}

function escapeTemplateSegment(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function quoteString(value: string, quote: string) {
  if (quote === "'")
    return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  return JSON.stringify(value);
}

function propertyNameText(name: ts.PropertyName) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }
  return "";
}

function isReferenceIdentifier(node: ts.Identifier) {
  const parent = node.parent;
  if (!parent) return true;
  if (
    (ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent)) &&
    parent.name === node
  ) {
    return false;
  }
  if (ts.isPropertyAccessExpression(parent) && parent.name === node)
    return false;
  if (ts.isBindingElement(parent) && parent.name === node) return false;
  if (ts.isVariableDeclaration(parent) && parent.name === node) return false;
  if (ts.isParameter(parent) && parent.name === node) return false;
  if (ts.isShorthandPropertyAssignment(parent) && parent.name === node)
    return true;
  return true;
}

type Replacement = {
  start: number;
  end: number;
  text: string;
};

function prefixClassStrings(code: string, id: string) {
  const sourceFile = ts.createSourceFile(
    id,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declarations = new Map<string, ts.Expression[]>();
  const marked = new Set<ts.Node>();
  const queue: ts.Node[] = [];
  const replacements = new Map<string, Replacement>();

  function rememberDeclaration(
    name: string,
    initializer: ts.Expression | undefined,
  ) {
    if (!initializer) return;
    const list = declarations.get(name);
    if (list) list.push(initializer);
    else declarations.set(name, [initializer]);
  }

  function collectDeclarations(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      rememberDeclaration(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collectDeclarations);
  }

  function mark(node: ts.Node | undefined) {
    if (!node || marked.has(node)) return;
    marked.add(node);
    queue.push(node);
  }

  function collectClassRoots(node: ts.Node) {
    if (
      ts.isPropertyAssignment(node) &&
      propertyNameText(node.name) === "class"
    ) {
      mark(node.initializer);
    }
    ts.forEachChild(node, collectClassRoots);
  }

  function addReplacement(start: number, end: number, text: string) {
    const key = `${start}:${end}`;
    if (!replacements.has(key)) {
      replacements.set(key, { start, end, text });
    }
  }

  function collectIdentifierReferences(node: ts.Node) {
    if (ts.isIdentifier(node) && isReferenceIdentifier(node)) {
      const targets = declarations.get(node.text);
      if (targets) targets.forEach(mark);
    }
    ts.forEachChild(node, collectIdentifierReferences);
  }

  function replaceStringLiteral(node: ts.StringLiteral) {
    if (!hasTailwindClass(node.text)) return;
    const quote = code[node.getStart(sourceFile)] || '"';
    addReplacement(
      node.getStart(sourceFile),
      node.getEnd(),
      quoteString(prefixTailwindClasses(node.text), quote),
    );
  }

  function replaceNoSubstitutionTemplate(
    node: ts.NoSubstitutionTemplateLiteral,
  ) {
    if (!hasTailwindClass(node.text)) return;
    addReplacement(
      node.getStart(sourceFile),
      node.getEnd(),
      `\`${escapeTemplateSegment(prefixTailwindClasses(node.text))}\``,
    );
  }

  function replaceTemplateExpression(node: ts.TemplateExpression) {
    const parts = [
      node.head.text,
      ...node.templateSpans.map((span) => span.literal.text),
    ];
    if (!parts.some(hasTailwindClass)) return;

    let text = `\`${escapeTemplateSegment(prefixTailwindClasses(node.head.text))}`;
    for (const span of node.templateSpans) {
      text += "${";
      text += code.slice(
        span.expression.getStart(sourceFile),
        span.expression.getEnd(),
      );
      text += "}";
      text += escapeTemplateSegment(prefixTailwindClasses(span.literal.text));
    }
    text += "`";
    addReplacement(node.getStart(sourceFile), node.getEnd(), text);
  }

  function collectLiteralReplacements(node: ts.Node) {
    if (ts.isStringLiteral(node)) {
      replaceStringLiteral(node);
      return;
    }
    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      replaceNoSubstitutionTemplate(node);
      return;
    }
    if (ts.isTemplateExpression(node)) {
      replaceTemplateExpression(node);
      return;
    }
    ts.forEachChild(node, collectLiteralReplacements);
  }

  collectDeclarations(sourceFile);
  collectClassRoots(sourceFile);

  for (let i = 0; i < queue.length; i += 1) {
    collectIdentifierReferences(queue[i]);
  }

  marked.forEach(collectLiteralReplacements);

  if (replacements.size === 0) return null;

  let next = code;
  const ordered = [...replacements.values()].sort((a, b) => b.start - a.start);
  for (const replacement of ordered) {
    next = `${next.slice(0, replacement.start)}${replacement.text}${next.slice(replacement.end)}`;
  }
  return next;
}

function unescapeCssClassName(value: string) {
  return value.replace(/\\(.)/g, "$1");
}

function shouldPreserveCssClassName(className: string) {
  const utility = stripUtilityMarks(className.split(":").pop() || className);
  return (
    utility.startsWith(tailwindClassPrefix) ||
    customClassNames.has(className) ||
    customClassNames.has(utility) ||
    utility.startsWith("cn-") ||
    utility.startsWith("t-") ||
    utility.startsWith("flow-") ||
    utility.includes("__")
  );
}

function findEscapedUtilityStart(className: string) {
  let start = 0;
  for (let i = 0; i < className.length - 1; i += 1) {
    if (className[i] === "\\" && className[i + 1] === ":") {
      start = i + 2;
      i += 1;
    }
  }
  return start;
}

function prefixEscapedClassName(className: string) {
  const unescaped = unescapeCssClassName(className);
  if (shouldPreserveCssClassName(unescaped)) return className;

  const utilityStart = findEscapedUtilityStart(className);
  let insertAt = utilityStart;
  if (className.slice(insertAt, insertAt + 2) === "\\!") insertAt += 2;
  if (className[insertAt] === "-") insertAt += 1;

  return `${className.slice(0, insertAt)}${tailwindClassPrefix}${className.slice(insertAt)}`;
}

function isInLayer(rule: postcss.Rule, name: string) {
  let current: postcss.Container | undefined = rule.parent;
  while (current) {
    if (current.type === "atrule" && current.name === "layer") {
      return current.params
        .split(",")
        .map((value) => value.trim())
        .includes(name);
    }
    current = current.parent;
  }
  return false;
}

function prefixCssSelector(selector: string) {
  let next = "";
  for (let i = 0; i < selector.length; i += 1) {
    const char = selector[i];
    if (char !== ".") {
      next += char;
      continue;
    }

    let className = "";
    let j = i + 1;
    for (; j < selector.length; j += 1) {
      const current = selector[j];
      if (current === "\\" && j + 1 < selector.length) {
        className += current + selector[j + 1];
        j += 1;
        continue;
      }
      if (/[\s.#:[>+~,){}]/.test(current)) break;
      className += current;
    }

    if (!className) {
      next += char;
      continue;
    }

    next += `.${prefixEscapedClassName(className)}`;
    i = j - 1;
  }
  return next;
}

function unwrapLayers(root: postcss.Root) {
  root.walkAtRules("layer", (atRule) => {
    if (atRule.nodes && atRule.nodes.length > 0) {
      atRule.replaceWith(atRule.nodes);
    } else {
      atRule.remove();
    }
  });
}

function prefixTailwindCss(css: string) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    if (!isInLayer(rule, "utilities")) return;
    rule.selector = prefixCssSelector(rule.selector);
  });
  unwrapLayers(root);
  return root.toString();
}

export function prefixTailwindClassesPlugin(sourceDir: string): Plugin[] {
  const normalizedSourceDir = sourceDir.replace(/\\/g, "/");

  return [
    {
      name: "shadcn-prefix-tailwind-source-classes",
      enforce: "pre",
      transform(code, id) {
        const file = id.split("?")[0].replace(/\\/g, "/");
        if (
          !file.startsWith(normalizedSourceDir) ||
          !/\.(ts|tsx)$/.test(file)
        ) {
          return null;
        }
        if (file.endsWith(".d.ts")) return null;

        const next = prefixClassStrings(code, file);
        return next ? { code: next, map: null } : null;
      },
    },
    {
      name: "shadcn-prefix-tailwind-css-selectors",
      enforce: "post",
      generateBundle(_options, bundle) {
        for (const asset of Object.values(bundle)) {
          if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) {
            continue;
          }
          const source =
            typeof asset.source === "string"
              ? asset.source
              : Buffer.from(asset.source).toString("utf-8");
          asset.source = prefixTailwindCss(source);
        }
      },
    },
  ];
}
