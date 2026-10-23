import { computed } from "../core";
import { Button, View, ViewProps, ViewChildren, styleNames } from "../core";
import { AccordionCore } from "@timeless/inner-vm";

export function Root(
  props: ViewProps & { store: AccordionCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Item(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;
  return View(rest, children);
}

export function Trigger(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  return Button(
    {
      ...rest,
      attributes: {
        n: "accordion-trigger",
        type: "button",
        ...rest.attributes,
        "aria-expanded": computed(isOpen, (open) => String(open)),
      },
      onClick(event) {
        rest.onClick?.(event);
        if (!event.defaultPrevented) store.toggle(index);
      },
    },
    children,
  );
}

export function Chevron(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren = [],
) {
  const { store, index, ...rest } = props;
  return View(
    { ...rest, attributes: { n: "accordion-chevron", ...rest.attributes } },
    children,
  );
}

export function Content(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  return View(
    {
      ...rest,
      attributes: { n: "accordion-content", ...rest.attributes },
      style: styleNames([
        rest.style,
        { display: computed(isOpen, (open) => (open ? undefined : "none")) },
      ]),
    },
    children,
  );
}
