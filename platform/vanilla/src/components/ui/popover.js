import { Popover as H } from "../headless/popover.js";

const t = {
  wrapper: { style: "position:fixed;z-index:999;left:0;top:0;" },
  content: ({ enter, exit }) => ({
    class: ["z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-md outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50", enter ? "animate-in fade-in-0 zoom-in-95" : "", exit ? "animate-out fade-out-0 zoom-out-95" : ""].filter(Boolean).join(" "),
  }),
};

export function Popover(p, c) { return H({ ...p, theme: t }, c); }
