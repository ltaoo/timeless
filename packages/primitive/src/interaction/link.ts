import { Ref, combine, isRef } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewAttributes, ViewChildren } from "@/content/type";

export interface LinkProps extends Omit<ViewProps, "as"> {
  href?: string | Ref<string>;
  target?: NativeLinkTarget | Ref<NativeLinkTarget>;
  rel?: string | Ref<string>;
  disabled?: boolean | Ref<boolean>;
  download?: boolean | string | Ref<boolean | string>;
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  hreflang?: string | Ref<string>;
  hrefLang?: string | Ref<string>;
  type?: string | Ref<string>;
  ping?: string | Ref<string>;
}

export type NativeLinkTarget =
  | "_self"
  | "_blank"
  | "_parent"
  | "_top"
  | (string & {});

export function Link(props: LinkProps = {}, children?: ViewChildren) {
  const {
    href,
    target,
    rel,
    disabled,
    download,
    referrerPolicy,
    hreflang,
    hrefLang,
    type,
    ping,
    attributes,
    ...rest
  } = props;

  const attrHrefLang = hreflang ?? hrefLang;
  const isDisabled = () => (isRef(disabled) ? !!disabled.value : !!disabled);
  const ariaDisabled = isRef(disabled)
    ? combine([disabled], (d) => (d ? "true" : undefined))
    : disabled
      ? "true"
      : undefined;
  const tabIndex = isRef(disabled)
    ? combine([disabled], (d) => (d ? -1 : undefined))
    : disabled
      ? -1
      : undefined;

  let mergedAttributes: ViewAttributes | undefined = attributes;
  if (href !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), href };
  }
  if (target !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), target };
  }
  if (rel !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), rel };
  }
  if (disabled !== undefined) {
    mergedAttributes = {
      ...(mergedAttributes || {}),
      "aria-disabled": ariaDisabled as any,
      tabindex: tabIndex as any,
    };
  }
  if (download !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), download };
  }
  if (referrerPolicy !== undefined) {
    mergedAttributes = {
      ...(mergedAttributes || {}),
      referrerpolicy: referrerPolicy as any,
    };
  }
  if (attrHrefLang !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), hreflang: attrHrefLang };
  }
  if (type !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), type };
  }
  if (ping !== undefined) {
    mergedAttributes = { ...(mergedAttributes || {}), ping };
  }

  return View(
    {
      ...rest,
      as: "a",
      attributes: mergedAttributes,
      onPointerDown(e) {
        if (isDisabled()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          return;
        }
        if (rest.onPointerDown) rest.onPointerDown(e);
      },
      onClick(e) {
        if (isDisabled()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          return;
        }
        if (rest.onClick) rest.onClick(e);
      },
    },
    children,
  );
}
