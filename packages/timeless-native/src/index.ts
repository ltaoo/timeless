import { render } from "./renderer";
import { buildAndRender, nativePlatform } from "./renderer";

console.log("native.version" + __Version);

export { render, buildAndRender, nativePlatform };

export const TimelessNativeVersion = __Version;

export const platform = {
  addEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) {},
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) {},
};
