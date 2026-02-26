import { Headless } from "@timeless/shadcnui";
const { Alert: H, AlertTitle: HT, AlertDescription: HD } = Headless;

const VARIANTS = {
  default: "border-left:4px solid var(--weui-BRAND);",
  destructive: "border-left:4px solid var(--weui-RED);",
};

const t = {
  root: ({ variant }) => ({
    style: "padding:var(--weui-CELL-GAP);background:var(--weui-BG-2);border-radius:4px;" + (VARIANTS[variant] || VARIANTS.default),
  }),
  title: { style: "font-weight:600;font-size:var(--weui-FONT-SIZE);color:var(--weui-FG-0);margin-bottom:4px;" },
  description: { style: "font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-1);line-height:1.6;" },
};

export function Alert(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }
export function AlertTitle(p: Parameters<typeof HT>[0], c) { return HT({ ...p, theme: t }, c); }
export function AlertDescription(p: Parameters<typeof HD>[0], c) { return HD({ ...p, theme: t }, c); }
