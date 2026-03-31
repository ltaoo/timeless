import { Slider as H } from "@timeless/timeless";

const t = {
  root: ({ disabled }) => ({
    style: [
      "position:relative;display:flex;align-items:center;width:100%;padding:16px 0;cursor:pointer;touch-action:none;user-select:none;",
      disabled ? "opacity:0.3;cursor:not-allowed;" : "",
    ].join(""),
  }),
  track: { style: "position:relative;height:4px;width:100%;border-radius:2px;background:var(--weui-BG-0);overflow:hidden;" },
  fill: { style: "height:100%;background:var(--weui-BRAND);transition:width .1s;" },
  thumb: { style: "position:absolute;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);" },
};

export function Slider(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
