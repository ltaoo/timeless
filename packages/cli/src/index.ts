#!/usr/bin/env node

import cac from "cac";
import pc from "picocolors";

import { dev } from "./commands/dev.js";
import { build } from "./commands/build.js";
import { start } from "./commands/start.js";
import { version } from "./commands/version.js";
import { VERSION } from "./version.js";

const cli = cac("timeless");

function withVersion<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    console.log(`${pc.cyan("@timeless/cli")} ${pc.green(`v${VERSION}`)}`);
    return fn(...args);
  }) as T;
}

cli
  .command("dev", "Start development server with SSR and HMR")
  .option("-p, --port <port>", "Server port", { default: 3000 })
  .option("-h, --host <host>", "Server host", { default: "localhost" })
  .action(withVersion(dev));

cli.command("build", "Build for production").action(withVersion(build));

cli
  .command("start", "Start production server")
  .option("-p, --port <port>", "Server port", { default: 3000 })
  .action(withVersion(start));

cli.command("version", "Show version number").action(version);

cli.help();
cli.version(VERSION);

cli.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log();
  console.log(`  ${pc.cyan("timeless")} ${pc.green("<command>")} [options]`);
  console.log();
  console.log("  Commands:");
  console.log(`    ${pc.green("dev")}       Start development server`);
  console.log(`    ${pc.green("build")}     Build for production`);
  console.log(`    ${pc.green("start")}     Start production server`);
  console.log(`    ${pc.green("version")}   Show version number`);
  console.log();
  console.log(`  Run ${pc.cyan("timeless <command> --help")} for more info`);
  console.log();
}
