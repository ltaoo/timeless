export * from "./renderer";
import { getCurrentHost } from "./host";

export { render } from "./renderer/index";

export const platform = {
  addEventListener(type: string, handler: (event: any) => void, options?: any) {
    if (typeof window !== "undefined") {
      window.addEventListener(type, handler, options);
    }
  },
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ) {
    if (typeof window !== "undefined") {
      window.removeEventListener(type, handler, options);
    }
  },
  enableDebug(enabled: boolean) {
    const host = getCurrentHost();
    if (host && host.enableDebug) {
      host.enableDebug(enabled);
    } else {
      console.warn("No canvas host available for debug mode");
    }
  },
};
