import { Headless } from "@timeless/shadcnui";
const { Progress: H } = Headless;

const t = {
  root: { style: "position:relative;height:4px;width:100%;border-radius:2px;background:var(--weui-BG-0);overflow:hidden;" },
  fill: { style: "height:100%;background:var(--weui-BRAND);transition:width .3s;" },
};

export function Progress(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
