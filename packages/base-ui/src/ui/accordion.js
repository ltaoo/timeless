import { Accordion as H } from "@timeless/headless";

const t = {
  root: { class: "w-full" },
  item: { class: "border-b border-zinc-200 dark:border-zinc-800" },
  trigger: { class: "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline" },
  chevron: ({ isOpen }) => ({ class: ["text-sm transition-transform duration-200", isOpen ? "rotate-180" : ""].join(" ") }),
  content: ({ isOpen }) => ({ class: isOpen ? "overflow-hidden pb-4 pt-0 text-sm" : "hidden" }),
};

export function Accordion(p) { return H({ ...p, theme: t }); }
