import { Skeleton as H } from "@timeless/headless";
const t = { root: { class: "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" } };
export function Skeleton(p) { return H({ ...p, theme: t }); }
