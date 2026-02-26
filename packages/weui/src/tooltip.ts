import { Headless } from "@timeless/shadcnui";
const { Tooltip: H } = Headless;

const t = {
  wrapper: { style: "display:inline-block;" },
  tip: { style: "padding:8px 12px;background:var(--weui-BG-4);color:#fff;border-radius:8px;font-size:var(--weui-FONT-SIZE-SM);max-width:200px;" },
};

export function Tooltip(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }
