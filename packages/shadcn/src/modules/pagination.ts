import {
  Button as PrimitiveButton,
  ButtonProps,
  Icon,
  View,
  ViewProps,
  ViewChildren,
  Ref,
  DerivedRef,
  derive,
  classNames,
  resolve_children,
  TimelessElement,
} from "@timeless/timeless";
import { buttonVariants, ButtonSize } from "./button";

export function Pagination(props: ViewProps = {}, children?: ViewChildren) {
  const { class: cls, attributes, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["mx-auto flex w-full justify-center", cls]),
      attributes: {
        n: "pagination",
        role: "navigation",
        "aria-label": "Pagination",
        "data-slot": "pagination",
        ...attributes,
      },
    },
    children,
  );
}

export function PaginationContent(
  props: ViewProps = {},
  children?: ViewChildren,
) {
  const { class: cls, attributes, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["flex flex-row items-center gap-1", cls]),
      attributes: {
        n: "pagination-content",
        role: "list",
        "data-slot": "pagination-content",
        ...attributes,
      },
    },
    children,
  );
}

export function PaginationItem(props: ViewProps = {}, children?: ViewChildren) {
  return View(
    {
      ...props,
      attributes: {
        n: "pagination-item",
        role: "listitem",
        "data-slot": "pagination-item",
        ...props.attributes,
      },
    },
    children,
  );
}

export type PaginationLinkProps = ButtonProps & {
  isActive?: boolean | Ref<boolean> | DerivedRef<boolean>;
  size?: ButtonSize;
};

export function PaginationLink(
  props: PaginationLinkProps = {},
  children?: ViewChildren,
): TimelessElement {
  const {
    isActive = false,
    size = "icon",
    class: cls,
    attributes,
    ...rest
  } = props;
  return PrimitiveButton(
    {
      ...rest,
      class: classNames([
        "data-[active=true]:border-border",
        derive({ isActive }, ({ isActive }) =>
          buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
        ),
        cls,
      ]),
      attributes: {
        n: "pagination-link",
        "data-slot": "pagination-link",
        "aria-current": derive({ isActive }, ({ isActive }) =>
          isActive ? "page" : undefined,
        ),
        "data-active": derive({ isActive }, ({ isActive }) => String(isActive)),
        ...attributes,
      },
    },
    children,
  );
}

export function PaginationPrevious(
  props: PaginationLinkProps = {},
  children: ViewChildren = ["Previous"],
): TimelessElement {
  return PaginationLink(
    {
      ...props,
      size: props.size ?? "default",
      class: classNames(["gap-1 px-2.5", props.class]),
      attributes: {
        n: "pagination-previous",
        "aria-label": "Go to previous page",
        ...props.attributes,
      },
    },
    [
      Icon({
        name: "chevron-left",
        size: 16,
        attributes: { n: "pagination-previous-icon", "aria-hidden": "true" },
      }),
      ...(resolve_children(children) ?? []),
    ],
  );
}

export function PaginationNext(
  props: PaginationLinkProps = {},
  children: ViewChildren = ["Next"],
): TimelessElement {
  return PaginationLink(
    {
      ...props,
      size: props.size ?? "default",
      class: classNames(["gap-1 px-2.5", props.class]),
      attributes: {
        n: "pagination-next",
        "aria-label": "Go to next page",
        ...props.attributes,
      },
    },
    [
      ...(resolve_children(children) ?? []),
      Icon({
        name: "chevron-right",
        size: 16,
        attributes: { n: "pagination-next-icon", "aria-hidden": "true" },
      }),
    ],
  );
}

export function PaginationEllipsis(props: ViewProps = {}) {
  const { class: cls, attributes, ...rest } = props;
  return View(
    {
      ...rest,
      class: classNames(["flex size-8 items-center justify-center", cls]),
      attributes: {
        n: "pagination-ellipsis",
        "data-slot": "pagination-ellipsis",
        "aria-hidden": "true",
        ...attributes,
      },
    },
    [
      Icon({
        name: "ellipsis",
        size: 16,
        attributes: { n: "pagination-ellipsis-icon", "aria-hidden": "true" },
      }),
    ],
  );
}
