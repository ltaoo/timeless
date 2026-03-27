import { TabHeaderCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "../primitive/view";

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
      as: "button",
      ...rest,
      onMounted($el: HTMLDivElement) {
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
