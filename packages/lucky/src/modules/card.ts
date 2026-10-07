import { ui } from "@timeless/timeless";
import { ViewProps, ViewChildren, classNames } from "@timeless/timeless";

export function Card(props: ViewProps & { variant?: "surface" | "profile" | "member" }, children?: ViewChildren) {
  const { variant = "surface", class: cls, ...rest } = props;
  return ui.CardPrimitive.Card(
    { ...rest, class: classNames(["lucky-card", `lucky-card--${variant}`, cls]) },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardHeader(
    { ...rest, class: classNames(["lucky-card__header", cls]) },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardTitle(
    { ...rest, class: classNames(["lucky-card__title", cls]) },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardDescription(
    { ...rest, class: classNames(["lucky-card__description", cls]) },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardContent(
    { ...rest, class: classNames(["lucky-card__content", cls]) },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardFooter(
    { ...rest, class: classNames(["lucky-card__footer", cls]) },
    children,
  );
}
