import { CardPrimitive, ViewProps, ViewChildren } from "@timeless/primitive";
import { cn } from "@timeless/primitive";

export function Card(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.Card(
    {
      ...rest,
      class: cn([
        "rounded-lg border border-zinc-200 bg-white text-zinc-950 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        cls,
      ]),
    },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.CardHeader(
    {
      ...rest,
      class: cn(["flex flex-col space-y-1.5 p-6", cls]),
    },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.CardTitle(
    {
      ...rest,
      class: cn(["text-2xl font-semibold leading-none tracking-tight", cls]),
    },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.CardDescription(
    {
      ...rest,
      class: cn(["text-sm text-zinc-500 dark:text-zinc-400", cls]),
    },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.CardContent(
    {
      ...rest,
      class: cn(["p-6", cls]),
    },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return CardPrimitive.CardFooter(
    {
      ...rest,
      class: cn(["flex items-center p-6 pt-0", cls]),
    },
    children,
  );
}
