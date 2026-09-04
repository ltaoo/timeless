import {
  Table as CoreTable,
  TableBody as CoreTableBody,
  TableCaption as CoreTableCaption,
  TableCell as CoreTableCell,
  TableCellProps,
  TableFooter as CoreTableFooter,
  TableHead as CoreTableHead,
  TableHeader as CoreTableHeader,
  TableRow as CoreTableRow,
  ViewProps,
  ViewChildren,
} from "../core";

export function Table(props: ViewProps, children?: ViewChildren) {
  const { dataset, ...rest } = props;
  return CoreTable(
    {
      dataset: {
        table: "",
        ...(dataset || {}),
      },
      ...rest,
    },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  return CoreTableHeader(props, children);
}

export function TableCaption(props: ViewProps, children?: ViewChildren) {
  return CoreTableCaption(props, children);
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  return CoreTableBody(props, children);
}

export function TableFooter(props: ViewProps, children?: ViewChildren) {
  return CoreTableFooter(props, children);
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  return CoreTableRow(props, children);
}

export function TableHead(props: TableCellProps, children?: ViewChildren) {
  return CoreTableHead(props, children);
}

export function TableCell(props: TableCellProps, children?: ViewChildren) {
  return CoreTableCell(props, children);
}
