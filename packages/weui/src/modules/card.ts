import { ViewProps, ViewChildren } from "@timeless/timeless";
import { CardPrimitive } from "@timeless/ui-primitive";

export function Card(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.Card(
    {
      ...props,
      style: {
        background: "var(--weui-BG-2)",
        "border-radius": "8px",
        overflow: "hidden",
      },
    },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.CardHeader(
    {
      ...props,
      style: {
        padding: "var(--weui-CELL-GAP)",
        "padding-bottom": "8px",
      },
    },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.CardTitle(
    {
      ...props,
      style: {
        "font-size": "var(--weui-FONT-SIZE)",
        "font-weight": "600",
        color: "var(--weui-FG-0)",
        "line-height": "1.4",
      },
    },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.CardDescription(
    {
      ...props,
      style: {
        "font-size": "var(--weui-FONT-SIZE-SM)",
        color: "var(--weui-FG-1)",
        "margin-top": "4px",
      },
    },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.CardContent(
    {
      ...props,
      style: {
        padding: "0 var(--weui-CELL-GAP) var(--weui-CELL-GAP)",
      },
    },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  return CardPrimitive.CardFooter(
    {
      ...props,
      style: {
        display: "flex",
        "align-items": "center",
        padding: "0 var(--weui-CELL-GAP) var(--weui-CELL-GAP)",
        "border-top": "1px solid var(--weui-SEPARATOR-0)",
        "padding-top": "var(--weui-CELL-GAP)",
      },
    },
    children,
  );
}
