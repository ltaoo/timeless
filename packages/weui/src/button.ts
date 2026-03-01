import { Button as H } from "@timeless/headless";

const S = {
  base: "position:relative;display:flex;align-items:center;justify-content:center;white-space:nowrap;border:none;outline:none;cursor:pointer;border-radius:var(--weui-BTN-RADIUS);font-size:var(--weui-FONT-SIZE);transition:opacity .3s;-webkit-tap-highlight-color:transparent;",
  primary: "background:var(--weui-BRAND);color:#fff;",
  default: "background:var(--weui-FG-5);color:var(--weui-FG-0);",
  warn: "background:var(--weui-RED);color:#fff;",
  text: "background:transparent;color:var(--weui-BRAND);",
  lg: "height:var(--weui-BTN-HEIGHT);padding:0 24px;width:100%;",
  md: "height:var(--weui-BTN-HEIGHT-MEDIUM);padding:0 20px;",
  sm: "height:var(--weui-BTN-HEIGHT-SMALL);padding:0 12px;font-size:var(--weui-FONT-SIZE-SM);",
  disabled: "opacity:0.3;pointer-events:none;",
  loading: "opacity:0.7;pointer-events:none;",
};

const t = {
  root: ({ variant = "primary", size = "md", loading, disabled }: any) => ({
    style:
      S.base +
      (S[variant as keyof typeof S] || S.primary) +
      (S[size as keyof typeof S] || S.md) +
      (loading ? S.loading : "") +
      (disabled ? S.disabled : ""),
  }),
  spinner: {
    style:
      "width:16px;height:16px;margin-right:8px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:weui-spin 1s linear infinite;",
  },
};

export function Button(p: Parameters<typeof H>[0], c?: any) {
  const el = H({ ...p, theme: t }, c);
  const $ = el.$elm as HTMLElement;
  $.addEventListener("mouseenter", () => {
    if (!p.disabled && !p.loading) {
      $.style.opacity = "0.8";
    }
  });
  $.addEventListener("mouseleave", () => {
    if (!p.disabled && !p.loading) {
      $.style.opacity = "";
    }
  });
  return el;
}
