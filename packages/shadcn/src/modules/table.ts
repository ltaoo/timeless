import { ui } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function Table(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.Table(
    {
      ...rest,
      class: classNames(["w-full caption-bottom text-sm", cls]),
    },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.TableHeader(
    {
      ...rest,
      class: classNames(["[&_tr]:border-b", cls]),
    },
    children,
  );
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.TableBody(
    {
      ...rest,
      class: classNames(["[&_tr:last-child]:border-0", cls]),
    },
    children,
  );
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.TableRow(
    {
      ...rest,
      class: classNames([
        "border-b border-zinc-200 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:hover:bg-zinc-800/50",
        cls,
      ]),
    },
    children,
  );
}

export function TableHead(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.TableHead(
    {
      ...rest,
      class: classNames([
        "h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400",
        cls,
      ]),
    },
    children,
  );
}

export function TableCell(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.TablePrimitive.TableCell(
    {
      ...rest,
      class: classNames(["p-4 align-middle", cls]),
    },
    children,
  );
}
