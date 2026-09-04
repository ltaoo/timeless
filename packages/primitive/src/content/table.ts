import { View, ViewProps } from "./view";
import { TimelessElement, ViewChildren } from "./type";

export type TableElementType =
  | "table"
  | "table-caption"
  | "table-header"
  | "table-body"
  | "table-footer"
  | "table-row"
  | "table-head"
  | "table-cell";

export type TableCellProps = ViewProps & {
  colSpan?: number;
  rowSpan?: number;
  scope?: "col" | "colgroup" | "row" | "rowgroup";
};

function create_table_element(
  type: TableElementType,
  name: string,
  props: ViewProps,
  children?: ViewChildren,
): TimelessElement {
  const element = View(
    {
      ...props,
      attributes: { n: name, ...(props.attributes || {}) },
    },
    children,
  );
  element.t = type;
  return element;
}

function table_cell_props(props: TableCellProps): ViewProps {
  const { colSpan, rowSpan, scope, ...rest } = props;
  return {
    ...rest,
    attributes: {
      ...(rest.attributes || {}),
      ...(colSpan === undefined ? {} : { colspan: colSpan }),
      ...(rowSpan === undefined ? {} : { rowspan: rowSpan }),
      ...(scope === undefined ? {} : { scope }),
    },
  };
}

export function Table(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element("table", "table", props, children);
}

export function TableCaption(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element(
    "table-caption",
    "table-caption",
    props,
    children,
  );
}

export function TableHeader(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element("table-header", "table-header", props, children);
}

export function TableBody(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element("table-body", "table-body", props, children);
}

export function TableFooter(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element("table-footer", "table-footer", props, children);
}

export function TableRow(props: ViewProps = {}, children?: ViewChildren) {
  return create_table_element("table-row", "table-row", props, children);
}

export function TableHead(props: TableCellProps = {}, children?: ViewChildren) {
  return create_table_element(
    "table-head",
    "table-head",
    table_cell_props(props),
    children,
  );
}

export function TableCell(props: TableCellProps = {}, children?: ViewChildren) {
  return create_table_element(
    "table-cell",
    "table-cell",
    table_cell_props(props),
    children,
  );
}
