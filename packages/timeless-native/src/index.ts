import { render } from "./renderer";

console.log("native.version" + __Version);

export { render };

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
