import type { Plugin } from "vite";

/**
 * Timeless HMR Plugin
 *
 * Like @vitejs/plugin-react or @vitejs/plugin-vue, this plugin automatically
 * detects Timeless components and injects HMR code. Detection is based on
 * component characteristics, not file paths:
 *
 *   A file is a Timeless component when it has:
 *   1. An exported function (`export default function` or `export function`)
 *   2. Reactive state declarations (ref / refobj / refarr) at the function top level
 *   3. A return statement returning the element tree
 *
 * Supports multiple exported components in a single file.
 *
 * The plugin injects:
 *   1. `hmrRestore(...)` — after ref declarations, restores state across reloads
 *   2. Element tracking — before return, saves state/props/children for next reload
 *   3. `import.meta.hot.accept(...)` — module-level HMR accept handler
 *   4. Required imports — `hmrRestore`, `patch`, `buildAndRender`
 *
 * Files that don't match the component pattern are left untouched:
 *   - Utility modules (no exported functions)
 *   - Entry points (no reactive refs at top level, or call render() directly)
 *   - Already-transformed files (have import.meta.hot.accept)
 *   - Non-JS files, node_modules, etc.
 */
export function timelessHMR(): Plugin {
  return {
    name: "timeless-hmr",
    enforce: "pre",
    apply: "serve",
    transform(code, id) {
      // Skip non-JS files and dependencies
      if (!/\.[jt]sx?$/.test(id)) return;
      if (id.includes("node_modules")) return;

      // Quick bail-out: must use the framework and export a function
      if (!code.includes("@timeless/timeless")) return;
      if (!/export\s+(?:default\s+)?function/.test(code)) return;

      // Skip if already has HMR accept handler (manually written or previously injected)
      if (code.includes("import.meta.hot.accept")) return;

      const result = transformComponent(code);
      if (!result) return;
      return { code: result, map: null };
    },
  };
}

export default timelessHMR;

// ─── Reactive creators to collect ────────────────────────────────────────────
//
// Only ref/refobj/refarr are writable (.as()) and need value restoration.
// computed/combine/derive are read-only derived refs — they are recreated
// from restored source refs automatically, no need to collect them.

const REACTIVE_CREATORS = ["ref", "refobj", "refarr"];

// ─── Component info ─────────────────────────────────────────────────────────

type ComponentInfo = {
  exportName: string; // "default" or the named export
  funcName: string; // actual function name
  propsParam: string;
  childrenParam: string;
  bodyOpen: number;
  bodyClose: number;
  refVars: string[];
  lastRefLineEnd: number;
  elementVar: string;
  // Simple return: `return identifier;`
  returnMatch: RegExpExecArray;
  isExprReturn: false;
} | {
  exportName: string;
  funcName: string;
  propsParam: string;
  childrenParam: string;
  bodyOpen: number;
  bodyClose: number;
  refVars: string[];
  lastRefLineEnd: number;
  elementVar: string;
  // Expression return: `return Expr(...);` → rewrite to temp var
  isExprReturn: true;
  returnKeywordIndex: number;
  returnStmtEnd: number; // position after the ";"
};

// ─── Core transform ─────────────────────────────────────────────────────────

function transformComponent(code: string): string | null {
  // 1. Find all exported functions: `export default function Name(params)` and `export function Name(params)`
  const funcRe =
    /export\s+(default\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;

  const components: ComponentInfo[] = [];
  let funcMatch: RegExpExecArray | null;
  let exprReturnCounter = 0;

  while ((funcMatch = funcRe.exec(code)) !== null) {
    const isDefault = !!funcMatch[1];
    const funcName = funcMatch[2];
    const exportName = isDefault ? "default" : funcName;

    const rawParams = funcMatch[3];
    const params = rawParams
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const propsParam = params[0] || "";
    const childrenParam = params[1] || "";

    // Find function body boundaries { ... }
    const afterSignature = funcMatch.index! + funcMatch[0].length;
    const bodyOpen = code.indexOf("{", afterSignature);
    if (bodyOpen === -1) continue;

    const bodyClose = findMatchingBrace(code, bodyOpen);
    if (bodyClose === -1) continue;

    // Precompute brace depth for each position in the function body
    const depths = computeDepths(code, bodyOpen, bodyClose);

    // Collect ref/refobj/refarr declarations at depth 1
    const pattern = REACTIVE_CREATORS.join("|");
    const refRe = new RegExp(
      `\\b(?:const|let)\\s+([\\w$]+)\\s*=\\s*(?:${pattern})\\s*\\(`,
      "g",
    );

    const refVars: string[] = [];
    let lastRefLineEnd = -1;
    let m: RegExpExecArray | null;

    while ((m = refRe.exec(code)) !== null) {
      if (
        m.index > bodyOpen &&
        m.index < bodyClose &&
        depths[m.index - bodyOpen] === 1
      ) {
        refVars.push(m[1]);
        const lineEnd = code.indexOf("\n", m.index);
        lastRefLineEnd = lineEnd !== -1 ? lineEnd : code.length;
      }
    }

    // Find return statement at depth 1
    // Supports both `return identifier;` and `return Expression(...);`
    const returnRe = /\breturn\s+/g;
    let returnInfo: {
      type: "simple";
      match: RegExpExecArray;
      elementVar: string;
    } | {
      type: "expr";
      keywordIndex: number;
      stmtEnd: number;
    } | null = null;

    while ((m = returnRe.exec(code)) !== null) {
      if (
        m.index > bodyOpen &&
        m.index < bodyClose &&
        depths[m.index - bodyOpen] === 1
      ) {
        const afterReturn = m.index + m[0].length;
        // Check if it's `return identifier;`
        const simpleRe = /^([\w$]+)\s*;/;
        const simpleMatch = simpleRe.exec(code.slice(afterReturn));
        if (simpleMatch) {
          // Create a RegExpExecArray-like object for backward compat
          const fullMatch = Object.assign(
            [m[0] + simpleMatch[0], simpleMatch[1]] as RegExpMatchArray,
            { index: m.index, input: code, groups: undefined },
          ) as RegExpExecArray;
          returnInfo = { type: "simple", match: fullMatch, elementVar: simpleMatch[1] };
        } else {
          // Expression return — find the end of the statement
          const stmtEnd = findReturnStmtEnd(code, afterReturn);
          if (stmtEnd !== -1) {
            returnInfo = { type: "expr", keywordIndex: m.index, stmtEnd };
          }
        }
      }
    }

    if (!returnInfo) continue;

    const compBase = {
      exportName,
      funcName,
      propsParam,
      childrenParam,
      bodyOpen,
      bodyClose,
      refVars,
      lastRefLineEnd,
    };

    if (returnInfo.type === "simple") {
      components.push({
        ...compBase,
        isExprReturn: false,
        returnMatch: returnInfo.match,
        elementVar: returnInfo.elementVar,
      });
    } else {
      exprReturnCounter++;
      components.push({
        ...compBase,
        isExprReturn: true,
        elementVar: `__hmr_el${exprReturnCounter > 1 ? exprReturnCounter : ""}`,
        returnKeywordIndex: returnInfo.keywordIndex,
        returnStmtEnd: returnInfo.stmtEnd,
      });
    }
  }

  // No components found → skip file
  if (components.length === 0) return null;

  // ── Build insertions ───────────────────────────────────────────────────────

  const insertions: { pos: number; text: string }[] = [];

  // a. Imports (once per file)
  const anyHasRefs = components.some((c) => c.refVars.length > 0);
  const timelessNeeded: string[] = [];
  if (anyHasRefs && !isImported(code, "hmrRestore")) timelessNeeded.push("hmrRestore");
  if (!isImported(code, "patch")) timelessNeeded.push("patch");

  const newImportLines: string[] = [];
  if (timelessNeeded.length > 0) {
    newImportLines.push(
      `import { ${timelessNeeded.join(", ")} } from "@timeless/timeless";`,
    );
  }
  if (!isImported(code, "buildAndRender")) {
    newImportLines.push(
      `import { buildAndRender } from "@timeless/timeless-dom";`,
    );
  }
  if (newImportLines.length > 0) {
    insertions.push({
      pos: findLastImportEnd(code),
      text: "\n" + newImportLines.join("\n"),
    });
  }

  // b. Per-component injections
  for (const comp of components) {
    const hasRefs = comp.refVars.length > 0;
    const refNamesStr = comp.refVars.join(", ");

    // hmrRestore — after last ref declaration (only for stateful components)
    if (hasRefs) {
      insertions.push({
        pos: comp.lastRefLineEnd,
        text: `\n  hmrRestore(import.meta.hot, { ${refNamesStr} });`,
      });
    }

    // Element tracking — before return
    const trackLines = [
      `if (import.meta.hot) {`,
      `    if (!import.meta.hot.data.elements) import.meta.hot.data.elements = [];`,
      `    ${comp.elementVar}._hmr_state = { ${refNamesStr} };`,
      `    ${comp.elementVar}._hmr_export = ${JSON.stringify(comp.exportName)};`,
    ];
    if (comp.propsParam) {
      trackLines.push(
        `    ${comp.elementVar}._hmr_props = ${comp.propsParam};`,
      );
    }
    if (comp.childrenParam) {
      trackLines.push(
        `    ${comp.elementVar}._hmr_children = ${comp.childrenParam};`,
      );
    }
    trackLines.push(
      `    import.meta.hot.data.elements.push(${comp.elementVar});`,
      `  }`,
    );

    if (comp.isExprReturn) {
      // Expression return: replace `return <expr>;` with
      // `const __hmr_el = <expr>;\n  tracking\n  return __hmr_el;`
      const returnKeyword = "return ";
      const exprStart = comp.returnKeywordIndex + returnKeyword.length;
      const exprText = code.slice(exprStart, comp.returnStmtEnd - 1); // exclude ";"
      const replacement =
        `const ${comp.elementVar} = ${exprText};\n  ` +
        trackLines.join("\n  ") +
        `\n  return ${comp.elementVar};`;
      insertions.push({
        pos: comp.returnKeywordIndex,
        text: replacement,
        end: comp.returnStmtEnd,
      } as any);
    } else {
      insertions.push({
        pos: comp.returnMatch.index,
        text: trackLines.join("\n  ") + "\n  ",
      });
    }
  }

  // c. HMR accept handler — after last component's function body
  const lastComp = components[components.length - 1];
  insertions.push({
    pos: lastComp.bodyClose + 1,
    text: `

if (import.meta.hot) {
  import.meta.hot.accept((new_mod) => {
    const elements = import.meta.hot.data.elements;
    if (!new_mod || !elements || !elements.length) return;
    import.meta.hot.data.elements = [];
    elements.forEach((old_element, idx) => {
      const factory = old_element._hmr_export === "default"
        ? new_mod.default
        : new_mod[old_element._hmr_export];
      if (!factory) return;
      import.meta.hot.data._hmr_inject = old_element._hmr_state;
      const new_element = factory(old_element._hmr_props, old_element._hmr_children);
      import.meta.hot.data._hmr_inject = null;
      patch(old_element, new_element, { buildAndRender });
      elements[idx] = new_element;
    });
    import.meta.hot.data.elements = elements;
  });
}
`,
  });

  // ── Apply insertions from end to start (preserves positions) ───────────────

  type Insertion = { pos: number; text: string; end?: number };
  insertions.sort((a: Insertion, b: Insertion) => (b.end ?? b.pos) - (a.end ?? a.pos));
  let result = code;
  for (const ins of insertions as Insertion[]) {
    if (ins.end != null) {
      // Replacement: replace code[pos..end) with text
      result = result.slice(0, ins.pos) + ins.text + result.slice(ins.end);
    } else {
      result = result.slice(0, ins.pos) + ins.text + result.slice(ins.pos);
    }
  }

  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Find the matching closing brace for an opening brace at `openIdx`. */
function findMatchingBrace(code: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < code.length; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/**
 * Compute brace depth for each character in code[bodyOpen..bodyClose].
 * Returns a Uint8Array where index 0 corresponds to bodyOpen.
 * Depth 1 = top-level statements inside the function body.
 */
function computeDepths(
  code: string,
  bodyOpen: number,
  bodyClose: number,
): Uint8Array {
  const len = bodyClose - bodyOpen + 1;
  const depths = new Uint8Array(len);
  let depth = 0;
  for (let i = 0; i < len; i++) {
    const ch = code[bodyOpen + i];
    if (ch === "{") depth++;
    depths[i] = depth;
    if (ch === "}") depth--;
  }
  return depths;
}

/** Check whether `name` appears inside an import { ... } from statement. */
function isImported(code: string, name: string): boolean {
  const re = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`);
  return re.test(code);
}

/**
 * Find the end of a return statement (position after the ";").
 * Tracks paren/brace/bracket nesting to handle expressions like `return View({...}, [...]);`
 */
function findReturnStmtEnd(code: string, exprStart: number): number {
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString: string | null = null;
  let inTemplate = false;

  for (let i = exprStart; i < code.length; i++) {
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : "";

    // Handle string literals
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (inTemplate) {
      if (ch === "`" && prev !== "\\") inTemplate = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inString = ch; continue; }
    if (ch === "`") { inTemplate = true; continue; }

    if (ch === "(") parenDepth++;
    else if (ch === ")") parenDepth--;
    else if (ch === "{") braceDepth++;
    else if (ch === "}") braceDepth--;
    else if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth--;
    else if (ch === ";" && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
      return i + 1; // position after ";"
    }
  }
  return -1;
}

/** Find the byte offset at the end of the last import statement. */
function findLastImportEnd(code: string): number {
  const re = /from\s+["'][^"']+["']\s*;?/g;
  let lastEnd = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const end = m.index + m[0].length;
    const lineEnd = code.indexOf("\n", end);
    lastEnd = lineEnd !== -1 ? lineEnd : end;
  }
  return lastEnd;
}
