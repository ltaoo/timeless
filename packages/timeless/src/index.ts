import * as icons from "@timeless/inner-icons";
import {
  registerIcons,
  setPlatform as setPrimitivePlatform,
  type Platform,
} from "@timeless/lite";
import * as vm from "@timeless/inner-vm";

console.log("timeless.version " + __Version);

registerIcons(icons.iconRegistry);

export * from "@timeless/lite";
export { icons };
export * as kit from "@timeless/inner-kit";
export * as ui from "@timeless/ui-primitive";
export * as utils from "@timeless/inner-utils";
export { vm };
export { Result, base, mitt } from "@timeless/lite";

export const Version = __Version;

export function setPlatform<T extends Platform = Platform>(platform: T): T {
  setPrimitivePlatform(platform);
  vm.setPopperPlatform(platform);
  return platform;
}
