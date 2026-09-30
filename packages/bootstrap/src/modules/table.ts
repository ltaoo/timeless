import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * Table · Bootstrap 5.3
 *
 * 根节点挂 .table，其余部位沿用原生语义标签（thead / tbody / tr / th / td），
 * 样式在 CSS 里通过 .table > thead > tr > th 这类后代选择器作用域化，
 * 与 Bootstrap 自身的 table 样式策略一致。
 */

export function Table(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.Table(
    { ...rest, class: classNames(["table", cls]) },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  return ui.TablePrimitive.TableHeader(props, children);
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  return ui.TablePrimitive.TableBody(props, children);
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  return ui.TablePrimitive.TableRow(props, children);
}

export function TableHead(props: ViewProps, children?: ViewChildren) {
  return ui.TablePrimitive.TableHead(props, children);
}

export function TableCell(props: ViewProps, children?: ViewChildren) {
  return ui.TablePrimitive.TableCell(props, children);
}
