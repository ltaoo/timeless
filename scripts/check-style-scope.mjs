#!/usr/bin/env node
/**
 * 作用域隔离校验：检查「作用域型」样式库的构建产物里，每一条顶层规则块的选择器
 * 是否都带 `[data-tt-style=<lib>]`。
 *
 * 为什么需要它：`bootstrap` / `material` / `fluent` 三套 CSS 允许同页共存，
 * 前提是没有任何一条规则泄漏到全局（否则会互相串味，还会盖住应用自身样式）。
 * 这条约束靠人工 review 容易漏，所以做成门禁。
 *
 * `shadcn` / `weui` / `findrssui` 是**全局型**样式（`:root` / `body` / `*` 是设计的一部分），
 * 不在本脚本的检查范围内。
 *
 * 用法：
 *   node scripts/check-style-scope.mjs              # 检查所有作用域库
 *   node scripts/check-style-scope.mjs material     # 只检查某个库
 *
 * 退出码：0 = 全部通过，1 = 有不带作用域的规则块。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** 作用域型样式库 -> 构建产物 CSS 路径 */
const SCOPED_LIBS = {
  bootstrap: "packages/bootstrap/dist/timeless.bootstrap.css",
  material: "packages/material/dist/timeless.material.css",
  fluent: "packages/fluent/dist/timeless.fluent.css",
  animal: "packages/animal/dist/timeless.animal.css",
};

/**
 * 逐字符扫描 CSS，收集「深度为 1 的规则块」的选择器。
 * 不用正则是因为 CSS 里嵌套规则（@media / @supports）会让简单的行匹配失真。
 */
function topLevelSelectors(css) {
  const selectors = [];
  let depth = 0;
  let buf = "";
  let inComment = false;
  let inString = null;

  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    const next = css[i + 1];

    // 跳过 /* ... */；压缩产物里注释通常已被移除，但源码级调试时会遇到
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i++;
      }
      continue;
    }
    if (!inString && ch === "/" && next === "*") {
      inComment = true;
      i++;
      continue;
    }

    // 字符串内的 { } ; 不参与结构判断
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      if (depth === 0) buf += ch;
      continue;
    }

    if (ch === "{") {
      depth++;
      if (depth === 1) selectors.push({ raw: buf.trim(), index: selectors.length });
      buf = "";
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
    } else if (depth === 0) {
      buf += ch;
    }
  }
  return selectors;
}

function checkLib(lib, relPath) {
  const absPath = path.join(rootDir, relPath);
  if (!fs.existsSync(absPath)) {
    return { lib, missing: true, relPath, total: 0, unscoped: [] };
  }

  const selectors = topLevelSelectors(fs.readFileSync(absPath, "utf8"));
  // 压缩后属性值引号被去掉（[data-tt-style=material]），比对前统一去掉引号
  const needle = `[data-tt-style=${lib}]`;

  const unscoped = selectors
    .filter(({ raw }) => {
      const normalized = raw.replace(/"/g, "");
      // @media / @supports / @keyframes / @layer 这类 at-rule 的 prelude 不算选择器
      if (normalized.startsWith("@")) return false;
      return !normalized.includes(needle);
    })
    .map(({ raw }) => raw.slice(0, 120));

  return { lib, missing: false, relPath, total: selectors.length, unscoped };
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = Object.entries(SCOPED_LIBS).filter(([lib]) => only.length === 0 || only.includes(lib));

if (targets.length === 0) {
  console.error(`unknown lib(s): ${only.join(", ")}`);
  console.error(`available: ${Object.keys(SCOPED_LIBS).join(", ")}`);
  process.exit(1);
}

let failed = false;
for (const [lib, relPath] of targets) {
  const r = checkLib(lib, relPath);
  if (r.missing) {
    console.log(`${lib}: SKIP (built css not found: ${relPath})`);
    continue;
  }
  if (r.unscoped.length > 0) {
    failed = true;
    console.log(`${lib}: ${r.total} blocks, UNSCOPED = ${r.unscoped.length}`);
    r.unscoped.forEach((s) => console.log(`   BAD: ${s}`));
  } else {
    console.log(`${lib}: ${r.total} blocks, unscoped = 0`);
  }
}

if (failed) {
  console.error(
    "\n作用域校验失败：上面列出的选择器不在 [data-tt-style=<lib>] 之下。" +
      "\n多库共存的前提是零全局泄漏，见 THEME_PACKAGE_GUIDE.md 第 5 节。",
  );
  process.exit(1);
}

console.log("\nStyle scope check passed: no unscoped selectors.");
