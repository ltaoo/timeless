import * as icons from "@timeless/inner-icons";
import { registerIcons } from "@timeless/inner-primitive";

console.log("timeless.version " + __Version);

registerIcons(icons.iconRegistry);

export * from "./core";
export { icons };
export * as kit from "@timeless/inner-kit";
export * as ui from "@timeless/ui-primitive";
export * as utils from "@timeless/inner-utils";
export * as vm from "@timeless/inner-vm";
export { Result, base, mitt } from "@timeless/inner-primitive";
