import { Tooltip as H } from "@timeless/headless";

const t = {
  wrapper: { class: "inline-block" },
  tip: { class: "z-[999] overflow-hidden rounded-md border border-zinc-200 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-50 shadow-md dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900" },
};

export function Tooltip(p, c) { return H({ ...p, theme: t }, c); }
