import {
  Table as H,
  TableHeader as HH,
  TableBody as HB,
  TableRow as HR,
  TableHead as HTh,
  TableCell as HTd,
  ViewProps,
  ViewChildren,
} from "@timeless/headless";
import { cn } from "@timeless/reactive";

export function Table(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return H(
    {
      ...rest,
      class: cn(["w-full caption-bottom text-sm", cls]),
    },
    children,
  );
}

export function TableHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return HH(
    {
      ...rest,
      class: cn(["[&_tr]:border-b", cls]),
    },
    children,
  );
}

export function TableBody(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return HB(
    {
      ...rest,
      class: cn(["[&_tr:last-child]:border-0", cls]),
    },
    children,
  );
}

export function TableRow(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return HR(
    {
      ...rest,
      class: cn([
        "border-b border-zinc-200 transition-colors hover:bg-zinc-100/50 dark:border-zinc-800 dark:hover:bg-zinc-800/50",
        cls,
      ]),
    },
    children,
  );
}

export function TableHead(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return HTh(
    {
      ...rest,
      class: cn([
        "h-12 px-4 text-left align-middle font-medium text-zinc-500 dark:text-zinc-400",
        cls,
      ]),
    },
    children,
  );
}

export function TableCell(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return HTd(
    {
      ...rest,
      class: cn(["p-4 align-middle", cls]),
    },
    children,
  );
}
