import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
} from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const output = resolve(root, "apps/web-shadcn/build/windows-x64");
function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command} failed (${result.status})`);
  return result.stdout?.trim();
}
run("pnpm", [
  "--filter",
  "@timeless/inner-vite-plugin",
  "--filter",
  "@timeless/timeless-native",
  "--filter",
  "@timeless/timeless-macos",
  "--filter",
  "@timeless/timeless-windows",
  "-r",
  "build",
]);
run("pnpm", ["--filter", "./apps/web-shadcn", "test:windows"]);
for (const [name, repository, revision] of [
  [
    "quickjs",
    "https://github.com/quickjs-ng/quickjs.git",
    "6a9fe9af5ca0bf7c49ae697edef44864272317d1",
  ],
  [
    "yoga",
    "https://github.com/facebook/yoga.git",
    "042f5013152eb81c1552dec945b88f7b95ca350f",
  ],
]) {
  const source = resolve(root, "apps/web-shadcn/build/windows-sources", name);
  if (!existsSync(resolve(source, ".git"))) {
    mkdirSync(source, { recursive: true });
    run("git", ["init", "--quiet", source]);
    run("git", ["-C", source, "fetch", "--depth", "1", repository, revision]);
    run("git", ["-C", source, "checkout", "--quiet", "--detach", "FETCH_HEAD"]);
  }
  if (run("git", ["-C", source, "rev-parse", "HEAD"], true) !== revision)
    throw Error(`${name} source revision must be ${revision}`);
  if (run("git", ["-C", source, "status", "--porcelain"], true))
    throw Error(
      `${name} build source has local changes; use a clean generated checkout`,
    );
}
mkdirSync(resolve(output, ".."), { recursive: true });
const stage = mkdtempSync(resolve(output, "../.windows-build-"));
try {
  run("docker", [
    "--context",
    "orbstack",
    "build",
    "--progress=plain",
    "--file",
    "apps/web-shadcn/Dockerfile.windows",
    "--target",
    "artifact",
    "--output",
    `type=local,dest=${stage}`,
    root,
  ]);
  rmSync(output, { recursive: true, force: true });
  renameSync(stage, output);
  console.log(`Built ${output}/Timeless-Shadcn.exe`);
} finally {
  rmSync(stage, { recursive: true, force: true });
}
