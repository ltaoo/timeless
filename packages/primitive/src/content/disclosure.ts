import { computed, isRef, ref, Ref } from "@timeless/inner-reactive";
import { Button, ButtonProps } from "@/interaction/button";
import { View, ViewProps } from "./view";
import { ViewChildren } from "./type";

/** A host-independent expandable section. The trigger remains keyboard operable. */
export type DisclosureProps = ViewProps & {
  summary: ViewChildren;
  open?: boolean | Ref<boolean>;
  triggerProps?: ButtonProps;
  contentProps?: ViewProps;
  onToggle?: (open: boolean) => void;
};
let disclosure_id = 0;
export function Disclosure(props: DisclosureProps, children?: ViewChildren) {
  const {
    summary,
    open = false,
    triggerProps = {},
    contentProps = {},
    onToggle,
    ...rest
  } = props;
  const expanded = isRef(open) ? open : ref(open);
  const content_id = String(
    contentProps.attributes?.id || `tt-disclosure-${++disclosure_id}`,
  );
  return View(rest, [
    Button(
      {
        style: {
          background: "transparent",
          border: 0,
          padding: 0,
          color: "inherit",
          font: "inherit",
          textAlign: "start",
          cursor: "pointer",
        },
        ...triggerProps,
        attributes: {
          ...triggerProps.attributes,
          type: "button",
          "aria-expanded": computed(expanded, String),
          "aria-controls": content_id,
        },
        onClick(event) {
          triggerProps.onClick?.(event);
          if (event.defaultPrevented) return;
          expanded.set(!expanded.value);
          onToggle?.(expanded.value);
        },
      },
      summary,
    ),
    // Keep visibility on an unstyled wrapper: a themed flex/grid class must
    // never override the host's hidden presentation of the collapsed body.
    View(
      {
        attributes: {
          id: content_id,
          hidden: computed(expanded, (value) => !value),
        },
      },
      [
        View(
          {
            ...contentProps,
            attributes: { ...contentProps.attributes, id: undefined },
          },
          children,
        ),
      ],
    ),
  ]);
}
