import { Separator as H } from "../headless/separator.js";

const t = {
  root: ({ orientation }) => ({
    style: orientation === "vertical"
      ? "width:1px;height:100%;background:var(--weui-SEPARATOR-0);flex-shrink:0;"
      : "height:1px;width:100%;background:var(--weui-SEPARATOR-0);flex-shrink:0;",
  }),
};

export function Separator(p) { return H({ ...p, theme: t }); }
