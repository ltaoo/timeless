import { ui } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";

export function Card(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.Card(
    {
      ...rest,
      class: classNames([
        "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        cls,
      ]),
    },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardHeader(
    {
      ...rest,
      class: classNames(["flex flex-col space-y-1.5 p-6", cls]),
    },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardTitle(
    {
      ...rest,
      class: classNames([
        "text-2xl font-semibold leading-none tracking-tight",
        cls,
      ]),
    },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardDescription(
    {
      ...rest,
      class: classNames(["text-sm text-zinc-500 dark:text-zinc-400", cls]),
    },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardContent(
    {
      ...rest,
      class: classNames(["p-6", cls]),
    },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardFooter(
    {
      ...rest,
      class: classNames(["flex items-center p-6 pt-0", cls]),
    },
    children,
  );
}
