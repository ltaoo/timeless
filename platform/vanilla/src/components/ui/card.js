import { Card as H, CardHeader as HH, CardTitle as HT, CardDescription as HD, CardContent as HC, CardFooter as HF } from "../headless/card.js";

const t = {
  root: { class: "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" },
  header: { class: "flex flex-col space-y-1.5 p-6" },
  title: { class: "text-2xl font-semibold leading-none tracking-tight" },
  description: { class: "text-sm text-zinc-500 dark:text-zinc-400" },
  content: { class: "p-6 pt-0" },
  footer: { class: "flex items-center p-6 pt-0" },
};

export function Card(p, c) { return H({ ...p, theme: t }, c); }
export function CardHeader(p, c) { return HH({ ...p, theme: t }, c); }
export function CardTitle(p, c) { return HT({ ...p, theme: t }, c); }
export function CardDescription(p, c) { return HD({ ...p, theme: t }, c); }
export function CardContent(p, c) { return HC({ ...p, theme: t }, c); }
export function CardFooter(p, c) { return HF({ ...p, theme: t }, c); }
