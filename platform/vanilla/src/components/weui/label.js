import { Label as H } from "../headless/label.js";
const t = { root: { style: "display:block;width:105px;flex-shrink:0;font-size:var(--weui-FONT-SIZE);font-weight:400;color:var(--weui-FG-0);line-height:1.4;word-wrap:break-word;" } };
export function Label(p, c) { return H({ ...p, theme: t }, c); }
