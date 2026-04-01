import pc from "picocolors";

export interface StartOptions {
  port: number;
}

export async function start(options: StartOptions) {
  console.log();
  console.log(pc.cyan("  Timeless Production Server"));
  console.log();
  console.log(pc.yellow("  Start command not yet implemented"));
  console.log(pc.dim("  Run 'timeless build' first, then 'timeless start'"));
  console.log();
}
