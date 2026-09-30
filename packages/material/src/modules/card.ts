import { ui } from "@timeless/timeless";
import { ViewProps, ViewChildren, classNames } from "@timeless/timeless";

/**
 * Material 3 卡片：用 --surface-container-* 做层级填充，
 * 默认 elevated（--elevation-1）；outlined / filled 通过 class 修饰。
 */
export function Card(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.Card(
    { ...rest, class: classNames(["m3-card", cls]) },
    children,
  );
}

export function CardHeader(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardHeader(
    { ...rest, class: classNames(["m3-card__header", cls]) },
    children,
  );
}

export function CardTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardTitle(
    { ...rest, class: classNames(["m3-card__title", cls]) },
    children,
  );
}

export function CardDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardDescription(
    { ...rest, class: classNames(["m3-card__description", cls]) },
    children,
  );
}

export function CardContent(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardContent(
    { ...rest, class: classNames(["m3-card__content", cls]) },
    children,
  );
}

export function CardFooter(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return ui.CardPrimitive.CardFooter(
    { ...rest, class: classNames(["m3-card__footer", cls]) },
    children,
  );
}
