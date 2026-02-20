import { Avatar as H } from "../headless/avatar.js";

const SIZES = {
  sm: "width:32px;height:32px;font-size:var(--weui-FONT-SIZE-XS);",
  default: "width:40px;height:40px;font-size:var(--weui-FONT-SIZE-SM);",
  lg: "width:48px;height:48px;font-size:var(--weui-FONT-SIZE);",
};

const t = {
  root: ({ size }) => ({ style: "position:relative;display:flex;flex-shrink:0;overflow:hidden;border-radius:50%;" + (SIZES[size] || SIZES.default) }),
  image: { style: "width:100%;height:100%;object-fit:cover;" },
  fallback: { style: "display:flex;width:100%;height:100%;align-items:center;justify-content:center;border-radius:50%;background:var(--weui-BG-0);color:var(--weui-FG-1);font-weight:500;" },
};

export function Avatar(p) { return H({ ...p, theme: t }); }
