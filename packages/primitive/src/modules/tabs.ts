import { TabHeaderCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { getHost } from "@/host";

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
  const host = getHost();
  const { store, value, index, ...rest } = props;

  return View(
    {
      as: "button",
      ...rest,
      onMounted(event) {
        const $el = (event as any).target as HTMLDivElement;
        store.updateTabClient(index, {
          rect() {
            return host.getBoundingClientRect?.($el) as any;
          },
        });
        if (rest.onMounted) {
          rest.onMounted(event);
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
