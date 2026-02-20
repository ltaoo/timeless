import { Progress as H } from "../headless/progress.js";

const t = {
  root: { style: "position:relative;height:4px;width:100%;border-radius:2px;background:var(--weui-BG-0);overflow:hidden;" },
  fill: { style: "height:100%;background:var(--weui-BRAND);transition:width .3s;" },
};

export function Progress(p) { return H({ ...p, theme: t }); }
