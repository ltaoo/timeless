import { Slider as H } from "../headless/slider.js";

const t = {
  root: ({ disabled }) => ({
    class: ["relative flex w-full touch-none select-none items-center py-4 cursor-pointer", disabled ? "opacity-50 cursor-not-allowed" : ""].filter(Boolean).join(" "),
  }),
  track: { class: "relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" },
  fill: { class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50" },
  thumb: { class: "absolute block h-5 w-5 rounded-full border-2 border-zinc-900 bg-white shadow ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-50 dark:bg-zinc-950" },
};

export function Slider(p) { return H({ ...p, theme: t }); }
