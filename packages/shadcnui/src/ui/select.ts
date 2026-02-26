import { Select as H } from "@timeless/headless";

const t = {
  root: { class: "relative" },
  trigger: { class: "flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer" },
  valueText: ({ hasValue }) => ({
    class: hasValue ? "text-zinc-900 dark:text-zinc-50 truncate" : "text-zinc-500",
  }),
  arrow: { class: "ml-auto pl-2 text-zinc-500" },
  dropdown: { class: "z-[999] fixed" },
  list: { class: "min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white p-1 text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" },
  option: ({ selected }) => ({
    class: [
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800",
      selected ? "bg-zinc-100 dark:bg-zinc-800" : "",
    ].filter(Boolean).join(" "),
  }),
};

export function Select(p: any) { return H({ ...p, theme: t }); }
