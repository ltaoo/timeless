import { View, ViewChildren, ViewProps } from "@/primitive/view";

export function Card(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card": "",
    },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card-header": "",
    },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card-title": "",
    },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card-description": "",
    },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card-content": "",
    },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-card-footer": "",
    },
    children,
  );
}
