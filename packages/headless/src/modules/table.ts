import { View, ViewChildren, ViewProps } from "../primitive/view";

export function Table(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "table",
      ...props,
      // "data-table": "",
    },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "thead",
      ...props,
      // "data-table-header": "",
    },
    children,
  );
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "tbody",
      ...props,
      // "data-table-body": "",
    },
    children,
  );
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "tr",
      ...props,
      // "data-table-row": "",
    },
    children,
  );
}

export function TableHead(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "th",
      ...props,
      // "data-table-head": "",
    },
    children,
  );
}

export function TableCell(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      type: "td",
      ...props,
      // "data-table-cell": "",
    },
    children,
  );
}
