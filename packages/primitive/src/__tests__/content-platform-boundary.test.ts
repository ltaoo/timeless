import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";

it("keeps content factories independent of host tag names throughout framework source", () => {
  const packages = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const violations: string[] = [];
  function inspect(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "__tests__") continue;
      const file = join(dir, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (
        /\.[jt]s$/.test(file) &&
        /\bHtml\b|["']html:["']/.test(readFileSync(file, "utf8"))
      )
        violations.push(file);
    }
  }
  for (const entry of readdirSync(packages, { withFileTypes: true })) {
    const src = join(packages, entry.name, "src");
    if (
      entry.isDirectory() &&
      readdirSync(join(packages, entry.name)).includes("src")
    )
      inspect(src);
  }
  expect(violations).toEqual([]);
});
