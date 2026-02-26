import { Headless } from "@timeless/shadcnui";
const { Checkbox: H } = Headless;

const t = {
  root: { style: "display:flex;align-items:center;gap:8px;cursor:pointer;" },
  box: ({ checked, disabled }) => ({
    style: [
      "width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;",
      checked ? "background:var(--weui-BRAND);border:1px solid var(--weui-BRAND);" : "background:transparent;border:1px solid var(--weui-FG-2);",
      disabled ? "opacity:0.3;" : "",
    ].join(""),
  }),
  check: ({ checked }) => ({
    style: checked ? "color:#fff;font-size:12px;line-height:1;" : "display:none;",
  }),
};

export function Checkbox(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
