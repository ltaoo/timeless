import { Alert as H, AlertTitle as HT, AlertDescription as HD } from "@timeless/headless";

const VARIANTS = {
  default: "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 [&>div.alert-icon]:text-zinc-950 dark:[&>div.alert-icon]:text-zinc-50",
  destructive: "border-red-500/50 text-red-500 dark:border-red-500 [&>div.alert-icon]:text-red-500",
};

const t = {
  root: ({ variant }) => ({
    class: ["relative w-full rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 [&>div.alert-icon+div]:translate-y-[-3px] [&>div.alert-icon]:absolute [&>div.alert-icon]:left-4 [&>div.alert-icon]:top-4 [&>div.alert-icon~*]:pl-7", VARIANTS[variant] || VARIANTS.default].join(" "),
  }),
  title: { class: "mb-1 font-medium leading-none tracking-tight" },
  description: { class: "text-sm [&_p]:leading-relaxed" },
};

export function Alert(p, c) { return H({ ...p, theme: t }, c); }
export function AlertTitle(p, c) { return HT({ ...p, theme: t }, c); }
export function AlertDescription(p, c) { return HD({ ...p, theme: t }, c); }
