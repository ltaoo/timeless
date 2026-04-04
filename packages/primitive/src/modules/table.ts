import { View, ViewChildren, ViewProps } from "@/content/view";

export function Table(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "table",
      dataset: {
        table: "",
      },
      ...props,
    },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "thead",
      ...props,
      // "data-table-header": "",
    },
    children,
  );
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "tbody",
      ...props,
      // "data-table-body": "",
    },
    children,
  );
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "tr",
      ...props,
      // "data-table-row": "",
    },
    children,
  );
}

export function TableHead(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "th",
      ...props,
      // "data-table-head": "",
    },
    children,
  );
}

export function TableCell(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      as: "td",
      ...props,
      // "data-table-cell": "",
    },
    children,
  );
}
