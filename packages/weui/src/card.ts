import { Headless } from "@timeless/shadcnui";
const { Card: H, CardHeader: HH, CardTitle: HT, CardDescription: HD, CardContent: HC, CardFooter: HF } = Headless;

const t = {
  root: { style: "background:var(--weui-BG-2);border-radius:8px;overflow:hidden;" },
  header: { style: "padding:var(--weui-CELL-GAP);padding-bottom:8px;" },
  title: { style: "font-size:var(--weui-FONT-SIZE);font-weight:600;color:var(--weui-FG-0);line-height:1.4;" },
  description: { style: "font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-1);margin-top:4px;" },
  content: { style: "padding:0 var(--weui-CELL-GAP) var(--weui-CELL-GAP);" },
  footer: { style: "display:flex;align-items:center;padding:0 var(--weui-CELL-GAP) var(--weui-CELL-GAP);border-top:1px solid var(--weui-SEPARATOR-0);padding-top:var(--weui-CELL-GAP);" },
};

export function Card(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }
export function CardHeader(p: Parameters<typeof HH>[0], c) { return HH({ ...p, theme: t }, c); }
export function CardTitle(p: Parameters<typeof HT>[0], c) { return HT({ ...p, theme: t }, c); }
export function CardDescription(p: Parameters<typeof HD>[0], c) { return HD({ ...p, theme: t }, c); }
export function CardContent(p: Parameters<typeof HC>[0], c) { return HC({ ...p, theme: t }, c); }
export function CardFooter(p: Parameters<typeof HF>[0], c) { return HF({ ...p, theme: t }, c); }
