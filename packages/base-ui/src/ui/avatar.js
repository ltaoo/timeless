import { Avatar as H } from "@timeless/headless";

const SIZES = { sm: "h-8 w-8 text-xs", default: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

const t = {
  root: ({ size }) => ({ class: ["relative flex shrink-0 overflow-hidden rounded-full", SIZES[size] || SIZES.default].join(" ") }),
  image: { class: "aspect-square h-full w-full object-cover" },
  fallback: { class: "flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium" },
};

export function Avatar(p) { return H({ ...p, theme: t }); }
