// import { Tooltip } from "@timeless/headless";

import { View, ViewChildren, ViewProps } from "@timeless/headless";

// const t = {
//   wrapper: { style: "display:inline-block;" },
//   tip: { style: "padding:8px 12px;background:var(--weui-BG-4);color:#fff;border-radius:8px;font-size:var(--weui-FONT-SIZE-SM);max-width:200px;" },
// };

// export function Tooltip(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }

export function Tooltip(props: ViewProps, children: ViewChildren) {
  return View({}, []);
}
