import { Skeleton as H } from "@timeless/timeless";
const t = { root: { style: "border-radius:4px;background:var(--weui-BG-0);animation:weui-pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;" } };
export function Skeleton(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
