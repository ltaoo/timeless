import * as icons from "@timeless/inner-icons";
import {
  registerIcons,
  setPlatform as setPrimitivePlatform,
  type Platform,
} from "@timeless/inner-primitive";
import * as vm from "@timeless/inner-vm";

console.log("timeless.version " + __Version);

registerIcons(icons.iconRegistry);

export * from "./core";
export { icons };
export * as kit from "@timeless/inner-kit";
export * as ui from "@timeless/ui-primitive";
export * as utils from "@timeless/inner-utils";
export { vm };
export { Result, base, mitt } from "@timeless/inner-primitive";

export function setPlatform<T extends Platform = Platform>(platform: T): T {
  setPrimitivePlatform(platform);
  vm.setPopperPlatform(platform);
  return platform;
}
