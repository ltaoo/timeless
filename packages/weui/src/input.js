import { Headless } from "@timeless/base-ui";
const { Input: H } = Headless;

const t = {
  root: { style: "flex:1;width:100%;height:100%;padding:0;border:none;outline:none;background:transparent;color:var(--weui-FG-0);font-size:var(--weui-FONT-SIZE);box-sizing:border-box;" },
};

export function Input(p) { return H({ ...p, theme: t }); }
