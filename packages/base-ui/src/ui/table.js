import { Table as H, TableHeader as HH, TableBody as HB, TableRow as HR, TableHead as HTh, TableCell as HTd } from "@timeless/headless";

const t = {
  table: { class: "w-full caption-bottom text-sm" },
  header: { class: "[&_tr]:border-b" },
  body: { class: "[&_tr:last-child]:border-0" },
  row: { class: "border-b border-zinc-200 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:hover:bg-zinc-800/50" },
  head: { class: "h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400" },
  cell: { class: "p-4 align-middle" },
};

export function Table(p, c) { return H({ ...p, theme: t }, c); }
export function TableHeader(p, c) { return HH({ ...p, theme: t }, c); }
export function TableBody(p, c) { return HB({ ...p, theme: t }, c); }
export function TableRow(p, c) { return HR({ ...p, theme: t }, c); }
export function TableHead(p, c) { return HTh({ ...p, theme: t }, c); }
export function TableCell(p, c) { return HTd({ ...p, theme: t }, c); }
