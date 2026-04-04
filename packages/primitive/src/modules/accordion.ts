import { computed } from "@timeless/reactive";
import { AccordionCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "@/content/view";

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

  const toggle = () => {
    if (store.type === "single") {
      store.openItems.as(store.openItems.value.includes(index) ? [] : [index]);
    } else {
      const nextOpenItems = store.openItems.value.includes(index)
        ? store.openItems.value.filter((i: number) => i !== index)
        : [...store.openItems.value, index];
      store.openItems.as(nextOpenItems);
    }
  };

  return View(
    {
      ...rest,
      onClick: toggle,
    },
    children,
  );
}

export function Chevron(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren = [],
) {
  const { store, index, ...rest } = props;
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  return View(
    {
      ...rest,
      class: computed(isOpen, (d) => {
        const baseClass = rest.class || "";
        return typeof baseClass === "string" ? baseClass : "";
      }),
    },
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
      class: computed(isOpen, (d) => {
        const baseClass = rest.class || "";
        return typeof baseClass === "string" ? baseClass : "";
      }),
    },
    children,
  );
}
