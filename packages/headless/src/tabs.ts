import { computed } from "@timeless/reactive";
import { TabHeaderCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "./view";
import { Txt } from "./text";

export function Root(
  props: ViewProps & { store: TabHeaderCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function List(
  props: ViewProps & { store: TabHeaderCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

export function Tab(
  props: ViewProps & {
    store: TabHeaderCore<any>;
    value: string;
    index: number;
  },
  children?: ViewChildren,
) {
  const { store, value, index, ...rest } = props;

  return View(
    {
      type: "button",
      ...rest,
      onMounted($el) {
        store.updateTabClient(index, {
          rect() {
            return $el.getBoundingClientRect();
          },
        });
        if (rest.onMounted) {
          rest.onMounted($el);
        }
      },
      onClick() {
        store.selectById(value);
      },
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & { store: TabHeaderCore<any>; value: string },
  children?: ViewChildren,
) {
  const { store, value, ...rest } = props;
  return View(rest, children);
}

export function Content(
  props: ViewProps & { store: TabHeaderCore<any>; value: string },
  children?: ViewChildren,
) {
  const { store, value, ...rest } = props;
  return View(rest, children);
}
