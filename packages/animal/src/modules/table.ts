import { ui } from "@timeless/timeless";
import { ViewChildren, ViewProps, classNames } from "@timeless/timeless";

/**
 * Table · Animal Island
 *
 * 根节点挂 .animal-table，其余部位沿用原生语义标签（thead / tbody / tr / th / td），
 * 样式在 CSS 里通过 .animal-table > thead > tr > th 这类后代选择器作用域化。
 * Animal Island 特征：行分割线 --border-subtle，表头字 --muted-foreground，
 * 可排序表头 hover 转薄荷青 --primary。
 */

export function Table(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.Table(
    { ...rest, class: classNames(["animal-table", cls]) },
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
