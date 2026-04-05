import { installDomHost } from "./renderer/hydrate";

console.log("dom.version" + __Version);

if (typeof document !== "undefined" && typeof window !== "undefined") {
  installDomHost();
}

// ─── Platform ────────────────────────────────────────────────────

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
};
