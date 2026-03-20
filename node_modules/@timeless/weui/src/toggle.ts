import { Toggle as H } from "@timeless/headless";

const t = {
  root: ({ on, disabled }) => ({
    style: [
      "position:relative;width:52px;height:32px;border-radius:16px;border:none;padding:2px;cursor:pointer;transition:background .3s;outline:none;flex-shrink:0;",
      on ? "background:var(--weui-BRAND);" : "background:var(--weui-BG-0);",
      disabled ? "opacity:0.3;cursor:not-allowed;" : "",
    ].join(""),
  }),
  thumb: ({ on }) => ({
    style: [
      "display:block;width:28px;height:28px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:transform .3s;",
      on ? "transform:translateX(20px);" : "transform:translateX(0);",
    ].join(""),
  }),
};

export function Toggle(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
