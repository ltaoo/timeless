import { Checkbox as H } from "../headless/checkbox.js";

const t = {
  root: { class: "flex items-center gap-2" },
  box: ({ checked, disabled }) => ({
    class: [
      "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 flex items-center justify-center cursor-pointer",
      checked ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : "bg-white dark:bg-zinc-950",
      disabled ? "opacity-50 cursor-not-allowed" : "",
    ].filter(Boolean).join(" "),
  }),
  check: ({ checked }) => ({
    class: checked ? "inline-block" : "hidden",
    style: "font-size:12px;line-height:1;",
  }),
};

export function Checkbox(p) { return H({ ...p, theme: t }); }
