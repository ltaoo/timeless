import { Headless } from "@timeless/shadcnui";
const { Textarea: H } = Headless;

const t = {
  root: { style: "flex:1;width:100%;min-height:80px;padding:0;border:none;outline:none;background:transparent;color:var(--weui-FG-0);font-size:var(--weui-FONT-SIZE);box-sizing:border-box;resize:vertical;" },
};

export function Textarea(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
