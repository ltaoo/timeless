import { Tooltip as H } from "../headless/tooltip.js";

const t = {
  wrapper: { style: "display:inline-block;" },
  tip: { style: "padding:8px 12px;background:var(--weui-BG-4);color:#fff;border-radius:8px;font-size:var(--weui-FONT-SIZE-SM);max-width:200px;" },
};

export function Tooltip(p, c) { return H({ ...p, theme: t }, c); }
