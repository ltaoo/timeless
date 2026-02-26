import { Headless } from "@timeless/base-ui";
const { Badge: H } = Headless;

const VARIANTS = {
  default: "background:var(--weui-BRAND);color:#fff;",
  secondary: "background:var(--weui-FG-5);color:var(--weui-FG-0);",
  outline: "background:transparent;border:1px solid var(--weui-SEPARATOR-1);color:var(--weui-FG-0);",
  destructive: "background:var(--weui-RED);color:#fff;",
};

const t = {
  root: ({ variant }) => ({
    style: "display:inline-flex;align-items:center;border-radius:100px;padding:2px 8px;font-size:var(--weui-FONT-SIZE-XS);font-weight:500;white-space:nowrap;" + (VARIANTS[variant] || VARIANTS.default),
  }),
};

export function Badge(p, c) { return H({ ...p, theme: t }, c); }
