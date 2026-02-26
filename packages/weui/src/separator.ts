import { Headless } from "@timeless/shadcnui";
const { Separator: H } = Headless;

const t = {
  root: ({ orientation }) => ({
    style: orientation === "vertical"
      ? "width:1px;height:100%;background:var(--weui-SEPARATOR-0);flex-shrink:0;"
      : "height:1px;width:100%;background:var(--weui-SEPARATOR-0);flex-shrink:0;",
  }),
};

export function Separator(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
