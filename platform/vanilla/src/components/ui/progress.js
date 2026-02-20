import { Progress as H } from "../headless/progress.js";

const t = {
  root: { class: "relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" },
  fill: { class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50" },
};

export function Progress(p) { return H({ ...p, theme: t }); }
