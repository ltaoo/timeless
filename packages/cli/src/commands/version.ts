import pc from "picocolors";
import { VERSION } from "../version.js";

export function version() {
  console.log(`${pc.cyan("@timeless/cli")} ${pc.green(`v${VERSION}`)}`);
}
