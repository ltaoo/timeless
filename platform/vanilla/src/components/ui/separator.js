import { Separator as H } from "../headless/separator.js";

const t = {
  root: ({ orientation }) => ({
    class: ["shrink-0 bg-zinc-200 dark:bg-zinc-800", orientation === "vertical" ? "w-[1px] h-full" : "h-[1px] w-full"].join(" "),
  }),
};

export function Separator(p) { return H({ ...p, theme: t }); }
