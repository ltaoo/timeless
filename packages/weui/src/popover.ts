import { Headless } from "@timeless/shadcnui";
const { Popover: H } = Headless;

const t = {
  wrapper: { style: "position:fixed;z-index:999;left:0;top:0;" },
  content: ({ enter, exit }) => ({
    style: ["background:var(--weui-BG-2);border-radius:8px;padding:var(--weui-CELL-GAP);box-shadow:0 4px 12px rgba(0,0,0,.12);min-width:200px;", enter ? "animation:weui-fade-in .2s;" : "", exit ? "animation:weui-fade-out .2s;" : ""].join(""),
  }),
};

export function Popover(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }
