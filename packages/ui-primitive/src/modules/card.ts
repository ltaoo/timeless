import { View, ViewProps, ViewChildren } from "../core";

export function Card(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { card: "" },
    },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { "card-header": "" },
    },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { "card-title": "" },
    },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { "card-description": "" },
    },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { "card-content": "" },
    },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      dataset: { "card-footer": "" },
    },
    children,
  );
}
