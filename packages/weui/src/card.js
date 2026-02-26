import { Headless } from "@timeless/base-ui";
const { Card: H, CardHeader: HH, CardTitle: HT, CardDescription: HD, CardContent: HC, CardFooter: HF } = Headless;

const t = {
  root: { style: "background:var(--weui-BG-2);border-radius:8px;overflow:hidden;" },
  header: { style: "padding:var(--weui-CELL-GAP);padding-bottom:8px;" },
  title: { style: "font-size:var(--weui-FONT-SIZE);font-weight:600;color:var(--weui-FG-0);line-height:1.4;" },
  description: { style: "font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-1);margin-top:4px;" },
  content: { style: "padding:0 var(--weui-CELL-GAP) var(--weui-CELL-GAP);" },
  footer: { style: "display:flex;align-items:center;padding:0 var(--weui-CELL-GAP) var(--weui-CELL-GAP);border-top:1px solid var(--weui-SEPARATOR-0);padding-top:var(--weui-CELL-GAP);" },
};

export function Card(p, c) { return H({ ...p, theme: t }, c); }
export function CardHeader(p, c) { return HH({ ...p, theme: t }, c); }
export function CardTitle(p, c) { return HT({ ...p, theme: t }, c); }
export function CardDescription(p, c) { return HD({ ...p, theme: t }, c); }
export function CardContent(p, c) { return HC({ ...p, theme: t }, c); }
export function CardFooter(p, c) { return HF({ ...p, theme: t }, c); }
