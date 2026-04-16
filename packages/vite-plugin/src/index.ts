import type { Plugin } from "vite";

/**
 * Timeless HMR Plugin — HMR-Aware Reactive Primitives
 *
 * Instead of collecting ref variable names and injecting hmrRestore(),
 * this plugin lets ref/refobj/refarr self-restore via an __hmr_key param.
 *
 * The plugin injects:
 *   1. `__hmr_scope(import.meta.hot)` — module-level scope marker
 *   2. `__hmr_key` argument on each ref/refobj/refarr call
 *   3. Element tracking — before return, saves props/children for next reload
 *   4. Module-level `new X()` preservation
 *   5. `import.meta.hot.accept(...)` handler
 */
export function timelessHMR(): Plugin {
  return {
    name: "timeless-hmr",
    enforce: "pre",
    apply: "serve",
    transform(code, id) {
      if (!/\.[jt]sx?$/.test(id)) return;
      if (id.includes("node_modules")) return;
      if (!code.includes("@timeless/timeless")) return;
      if (!/export\s+(?:default\s+)?function/.test(code)) return;
      if (code.includes("import.meta.hot.accept")) return;

      const result = transformComponent(code);
      if (!result) return;
      return { code: result, map: null };
    },
  };
}

export default timelessHMR;

/**
 * Timeless Native HMR Plugin — for macOS/native JavaScriptCore apps
 *
 * Injects:
 *   1. `hmrScope(globalThis.__native_hmr)` — connects to the native HMR store
 *   2. `__hmr_key` argument on each ref/refobj/refarr call — enables state restoration
 *
 * The native host (Swift) provides `globalThis.__native_hmr` and re-evaluates
 * the UMD bundle on file change. Refs auto-restore their previous values.
 */
export function timelessNativeHMR(): Plugin {
  return {
    name: "timeless-native-hmr",
    enforce: "pre",
    transform(code, id) {
      if (!/\.[jt]sx?$/.test(id)) return;
      if (id.includes("node_modules")) return;
      if (!code.includes("@timeless/timeless")) return;
      if (!/function\s+\w+/.test(code)) return;

      const result = transformNativeComponent(code);
      if (!result) return;
      return { code: result, map: null };
    },
  };
}

function transformNativeComponent(code: string): string | null {
  const funcRe =
    /(?:export\s+(?:default\s+)?)?function\s+(\w+)\s*\(([^)]*)\)/g;

  type Insertion = { pos: number; text: string };
  const insertions: Insertion[] = [];
  let funcMatch: RegExpExecArray | null;
  let hasRefCalls = false;

  while ((funcMatch = funcRe.exec(code)) !== null) {
    const funcName = funcMatch[1];
    const afterSignature = funcMatch.index! + funcMatch[0].length;
    const bodyOpen = code.indexOf("{", afterSignature);
    if (bodyOpen === -1) continue;
    const bodyClose = findMatchingBrace(code, bodyOpen);
    if (bodyClose === -1) continue;

    const depths = computeDepths(code, bodyOpen, bodyClose);
    const pattern = REACTIVE_CREATORS.join("|");
    const refRe = new RegExp(
      `\\b(?:const|let)\\s+([\\w$]+)\\s*=\\s*(${pattern})\\s*\\(`,
      "g",
    );
    let m: RegExpExecArray | null;

    while ((m = refRe.exec(code)) !== null) {
      if (
        m.index > bodyOpen &&
        m.index < bodyClose &&
        depths[m.index - bodyOpen] === 1
      ) {
        const varName = m[1];
        const openParenPos = m.index + m[0].length - 1;
        const closeParenPos = findMatchingParen(code, openParenPos);
        if (closeParenPos !== -1) {
          hasRefCalls = true;
          const key = `"${funcName}:${varName}"`;
          insertions.push({ pos: closeParenPos, text: `, ${key}` });
        }
      }
    }
  }

  if (!hasRefCalls) return null;

  // Add hmrScope import and call
  const newLines: string[] = [];
  if (!isImported(code, "hmrScope")) {
    newLines.push(`import { hmrScope } from "@timeless/timeless";`);
  }
  newLines.push(`hmrScope(globalThis.__native_hmr);`);
  insertions.push({
    pos: findLastImportEnd(code),
    text: "\n" + newLines.join("\n"),
  });

  // Apply insertions from end to start
  insertions.sort((a, b) => b.pos - a.pos);
  let result = code;
  for (const ins of insertions) {
    result = result.slice(0, ins.pos) + ins.text + result.slice(ins.pos);
  }

  return result;
}

// ─── Reactive creators that need __hmr_key ──────────────────────────────────

const REACTIVE_CREATORS = ["ref", "refobj", "refarr"];

// ─── Component info ─────────────────────────────────────────────────────────

type ComponentInfo = {
  exportName: string;
  funcName: string;
  propsParam: string;
  childrenParam: string;
  bodyOpen: number;
  bodyClose: number;
  elementVar: string;
  returnMatch: RegExpExecArray;
  isExprReturn: false;
} | {
  exportName: string;
  funcName: string;
  propsParam: string;
  childrenParam: string;
  bodyOpen: number;
  bodyClose: number;
  elementVar: string;
  isExprReturn: true;
  returnKeywordIndex: number;
  returnStmtEnd: number;
};

// ─── Ref call info ──────────────────────────────────────────────────────────

type RefCallInfo = {
  varName: string;
  funcName: string; // enclosing component function name
  /** Position of the closing `)` of the ref/refobj/refarr call */
  closeParenPos: number;
};

// ─── Core transform ─────────────────────────────────────────────────────────

function transformComponent(code: string): string | null {
  const funcRe =
    /export\s+(default\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;

  const components: ComponentInfo[] = [];
  const refCalls: RefCallInfo[] = [];
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

    const afterSignature = funcMatch.index! + funcMatch[0].length;
    const bodyOpen = code.indexOf("{", afterSignature);
    if (bodyOpen === -1) continue;

    const bodyClose = findMatchingBrace(code, bodyOpen);
    if (bodyClose === -1) continue;

    const depths = computeDepths(code, bodyOpen, bodyClose);

    // Collect ref/refobj/refarr calls at depth 1 and record their close-paren position
    const pattern = REACTIVE_CREATORS.join("|");
    const refRe = new RegExp(
      `\\b(?:const|let)\\s+([\\w$]+)\\s*=\\s*(${pattern})\\s*\\(`,
      "g",
    );
    let m: RegExpExecArray | null;

    while ((m = refRe.exec(code)) !== null) {
      if (
        m.index > bodyOpen &&
        m.index < bodyClose &&
        depths[m.index - bodyOpen] === 1
      ) {
        const varName = m[1];
        const creatorName = m[2];
        // Find the matching close paren for the call
        const openParenPos = m.index + m[0].length - 1; // position of "("
        const closeParenPos = findMatchingParen(code, openParenPos);
        if (closeParenPos !== -1) {
          refCalls.push({
            varName,
            funcName,
            closeParenPos,
          });
        }
      }
    }

    // Find return statement at depth 1
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
        const simpleRe = /^([\w$]+)\s*;/;
        const simpleMatch = simpleRe.exec(code.slice(afterReturn));
        if (simpleMatch) {
          const fullMatch = Object.assign(
            [m[0] + simpleMatch[0], simpleMatch[1]] as RegExpMatchArray,
            { index: m.index, input: code, groups: undefined },
          ) as RegExpExecArray;
          returnInfo = { type: "simple", match: fullMatch, elementVar: simpleMatch[1] };
        } else {
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

  if (components.length === 0) return null;

  // ── Build insertions ───────────────────────────────────────────────────────

  type Insertion = { pos: number; text: string; end?: number };
  const insertions: Insertion[] = [];

  // a. Imports + hmrScope call
  const newImportLines: string[] = [];
  const timelessNeeded: string[] = [];
  if (!isImported(code, "hmrScope")) timelessNeeded.push("hmrScope");
  if (!isImported(code, "patch")) timelessNeeded.push("patch");
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
  // Always add hmrScope call after imports
  newImportLines.push(`hmrScope(import.meta.hot);`);
  insertions.push({
    pos: findLastImportEnd(code),
    text: "\n" + newImportLines.join("\n"),
  });

  // b. Inject __hmr_key argument into each ref/refobj/refarr call
  for (const rc of refCalls) {
    const key = `"${rc.funcName}:${rc.varName}"`;
    insertions.push({
      pos: rc.closeParenPos,
      text: `, ${key}`,
    });
  }

  // d. Per-component element tracking
  for (const comp of components) {
    const trackLines = [
      `if (import.meta.hot) {`,
      `    if (!import.meta.hot.data.elements) import.meta.hot.data.elements = [];`,
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
      const returnKeyword = "return ";
      const exprStart = comp.returnKeywordIndex + returnKeyword.length;
      const exprText = code.slice(exprStart, comp.returnStmtEnd - 1);
      const replacement =
        `const ${comp.elementVar} = ${exprText};\n  ` +
        trackLines.join("\n  ") +
        `\n  return ${comp.elementVar};`;
      insertions.push({
        pos: comp.returnKeywordIndex,
        text: replacement,
        end: comp.returnStmtEnd,
      });
    } else {
      insertions.push({
        pos: comp.returnMatch.index,
        text: trackLines.join("\n  ") + "\n  ",
      });
    }
  }

  // e. Module-level `new X()` preservation
  const moduleStateRe = /\b(?:const|let)\s+([\w$]+)\s*=\s*new\b/g;
  let ms: RegExpExecArray | null;
  const moduleStateVars: string[] = [];

  while ((ms = moduleStateRe.exec(code)) !== null) {
    if (braceDepthAt(code, ms.index) === 0) {
      const name = ms[1];
      const newPos = ms.index + ms[0].length - 3;
      moduleStateVars.push(name);
      insertions.push({
        pos: newPos,
        text: `import.meta.hot?.data?.__hmr_${name} ?? `,
      });
    }
  }

  // f. HMR accept handler
  const lastComp = components[components.length - 1];
  const storeLines = moduleStateVars.map(
    (name) => `  import.meta.hot.data.__hmr_${name} = ${name};`,
  ).join("\n");
  insertions.push({
    pos: lastComp.bodyClose + 1,
    text: `

if (import.meta.hot) {
${storeLines ? storeLines + "\n" : ""}  import.meta.hot.accept((new_mod) => {
    const elements = import.meta.hot.data.elements;
    if (!new_mod || !elements || !elements.length) return;
    import.meta.hot.data.elements = [];
    elements.forEach((old_element) => {
      const factory = old_element._hmr_export === "default"
        ? new_mod.default
        : new_mod[old_element._hmr_export];
      if (!factory) return;
      const new_element = factory(old_element._hmr_props, old_element._hmr_children);
      patch(old_element, new_element, { buildAndRender });
    });
  });
}
`,
  });

  // ── Apply insertions from end to start ─────────────────────────────────────

  insertions.sort((a, b) => (b.end ?? b.pos) - (a.end ?? a.pos));
  let result = code;
  for (const ins of insertions) {
    if (ins.end != null) {
      result = result.slice(0, ins.pos) + ins.text + result.slice(ins.end);
    } else {
      result = result.slice(0, ins.pos) + ins.text + result.slice(ins.pos);
    }
  }

  return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function braceDepthAt(code: string, pos: number): number {
  let depth = 0;
  for (let i = 0; i < pos; i++) {
    if (code[i] === "{") depth++;
    else if (code[i] === "}") depth--;
  }
  return depth;
}

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

function findMatchingParen(code: string, openIdx: number): number {
  let depth = 0;
  let inString: string | null = null;
  let inTemplate = false;
  for (let i = openIdx; i < code.length; i++) {
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : "";

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

    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

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

function isImported(code: string, name: string): boolean {
  const re = new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from`);
  return re.test(code);
}

function findReturnStmtEnd(code: string, exprStart: number): number {
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString: string | null = null;
  let inTemplate = false;

  for (let i = exprStart; i < code.length; i++) {
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : "";

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
      return i + 1;
    }
  }
  return -1;
}

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
