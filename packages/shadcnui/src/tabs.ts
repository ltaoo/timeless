import { Tabs as H } from "@timeless/headless";

const t = {
  root: { class: "w-full" },
  list: { class: "inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  tab: ({ active }) => ({
    class: [
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2",
      active ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50" : "hover:text-zinc-950 dark:hover:text-zinc-50",
    ].join(" "),
  }),
  indicator: () => ({ style: "display:none;" }),
  content: { class: "mt-2" },
};

export function Tabs(p: any) { return H({ ...p, theme: t }); }
