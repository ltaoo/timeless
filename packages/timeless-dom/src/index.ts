import { setPlatform } from "@timeless/timeless";

import { render } from "./renderer";
import { hydrate } from "./renderer/hydrate";

console.log("timeless.dom.version " + __Version);

export { render };
export { hydrate };

// ─── Platform ────────────────────────────────────────────────────
export const platform = setPlatform({
  addEventListener(type, handler, options) {
    if (typeof window !== "undefined") {
      window.addEventListener(type, handler, options);
      return () => window.removeEventListener(type, handler, options);
    }
    return () => {};
  },
  patchBodyStyle(style) {
    if (typeof window !== "undefined") {
      Object.assign(document.body.style, style);
    }
  },
});
