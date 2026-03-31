import { Table as H, TableHeader as HH, TableBody as HB, TableRow as HR, TableHead as HTh, TableCell as HTd } from "@timeless/timeless";

const t = {
  table: { style: "width:100%;font-size:var(--weui-FONT-SIZE-SM);border-collapse:collapse;" },
  header: {},
  body: {},
  row: { style: "border-bottom:1px solid var(--weui-SEPARATOR-0);transition:background .2s;" },
  head: { style: "height:48px;padding:0 var(--weui-CELL-GAP);text-align:left;vertical-align:middle;font-weight:500;color:var(--weui-FG-1);" },
  cell: { style: "padding:var(--weui-CELL-GAP);vertical-align:middle;color:var(--weui-FG-0);" },
};

export function Table(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }
export function TableHeader(p: Parameters<typeof HH>[0], c) { return HH({ ...p, theme: t }, c); }
export function TableBody(p: Parameters<typeof HB>[0], c) { return HB({ ...p, theme: t }, c); }
export function TableRow(p: Parameters<typeof HR>[0], c) { return HR({ ...p, theme: t }, c); }
export function TableHead(p: Parameters<typeof HTh>[0], c) { return HTh({ ...p, theme: t }, c); }
export function TableCell(p: Parameters<typeof HTd>[0], c) { return HTd({ ...p, theme: t }, c); }
