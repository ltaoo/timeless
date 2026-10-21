#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
} from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    bundle: { type: "string" },
    output: { type: "string" },
    name: { type: "string", default: "Timeless" },
    identifier: { type: "string", default: "com.timeless.application" },
  },
});
if (process.platform !== "darwin")
  throw Error("AppKit applications must be compiled on macOS");
if (!values.bundle || !values.output)
  throw Error(
    "Usage: timeless-macos --bundle app.js --output Application.app [--name Name] [--identifier com.example.app]",
  );
const bundle = resolve(values.bundle),
  output = resolve(values.output);
if (!output.endsWith(".app") || basename(output) === ".app")
  throw Error("Output must name an .app bundle");
if (!existsSync(bundle)) throw Error(`JS bundle does not exist: ${bundle}`);
if (!/^[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(values.identifier))
  throw Error("Invalid bundle identifier");

const native = resolve(import.meta.dirname, "../native");
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`${command} failed (${result.status})`);
  return result.stdout;
}
run("swift", ["build", "--package-path", native, "-c", "release"]);
const binaryDir = run(
  "swift",
  ["build", "--package-path", native, "-c", "release", "--show-bin-path"],
  { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
).trim();
mkdirSync(dirname(output), { recursive: true });
const temporary = mkdtempSync(resolve(dirname(output), ".timeless-macos-"));
const staged = resolve(temporary, basename(output));
try {
  const contents = resolve(staged, "Contents"),
    resources = resolve(contents, "Resources");
  mkdirSync(resolve(contents, "MacOS"), { recursive: true });
  mkdirSync(resources);
  copyFileSync(
    resolve(binaryDir, "TimelessMacOS"),
    resolve(contents, "MacOS/TimelessMacOS"),
  );
  copyFileSync(bundle, resolve(resources, "app.js"));
  const yogaLicense = resolve(native, ".build/checkouts/yoga/LICENSE");
  if (existsSync(yogaLicense))
    copyFileSync(yogaLicense, resolve(resources, "YOGA-LICENSE.txt"));
  const repositoryLicense = resolve(import.meta.dirname, "../../../LICENSE");
  if (existsSync(repositoryLicense))
    copyFileSync(repositoryLicense, resolve(resources, "LICENSE.txt"));
  const metadata = {
    CFBundleExecutable: "TimelessMacOS",
    CFBundleIdentifier: values.identifier,
    CFBundleName: values.name,
    CFBundleDisplayName: values.name,
    CFBundleVersion: "1",
    CFBundleShortVersionString: "1.0.0",
    CFBundlePackageType: "APPL",
    LSMinimumSystemVersion: "13.0",
    NSHighResolutionCapable: true,
    NSPrincipalClass: "NSApplication",
  };
  run(
    "/usr/bin/plutil",
    ["-convert", "xml1", "-o", resolve(contents, "Info.plist"), "-"],
    { input: JSON.stringify(metadata), stdio: ["pipe", "inherit", "inherit"] },
  );
  run("/usr/bin/codesign", [
    "--force",
    "--sign",
    "-",
    "--timestamp=none",
    staged,
  ]);
  run("/usr/bin/codesign", ["--verify", "--deep", "--strict", staged]);
  // Replace only after compilation and signing succeed.
  rmSync(output, { recursive: true, force: true });
  renameSync(staged, output);
  console.log(`Built ${output}`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
