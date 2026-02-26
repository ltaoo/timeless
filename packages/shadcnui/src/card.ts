import { Card as H, CardHeader as HH, CardTitle as HT, CardDescription as HD, CardContent as HC, CardFooter as HF } from "@timeless/headless";

const t = {
  root: { class: "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50" },
  header: { class: "flex flex-col space-y-1.5 p-6" },
  title: { class: "text-2xl font-semibold leading-none tracking-tight" },
  description: { class: "text-sm text-zinc-500 dark:text-zinc-400" },
  content: { class: "p-6 pt-0" },
  footer: { class: "flex items-center p-6 pt-0" },
};

export function Card(p: any, c: any) { return H({ ...p, theme: t }, c); }
export function CardHeader(p: any, c: any) { return HH({ ...p, theme: t }, c); }
export function CardTitle(p: any, c: any) { return HT({ ...p, theme: t }, c); }
export function CardDescription(p: any, c: any) { return HD({ ...p, theme: t }, c); }
export function CardContent(p: any, c: any) { return HC({ ...p, theme: t }, c); }
export function CardFooter(p: any, c: any) { return HF({ ...p, theme: t }, c); }
