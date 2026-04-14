import {
  View,
  ViewProps,
  ViewChildren,
  Button,
  ButtonProps,
} from "@timeless/timeless";
import { TabHeaderCore } from "@timeless/ui-vm";

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
  props: ButtonProps & {
    store: TabHeaderCore<any>;
    value: string;
    index: number;
  },
  children?: ViewChildren,
) {
  const { store, value, index, ...rest } = props;

  return Button(
    {
      ...rest,
      onMounted(event) {
        const $el = event.target;
        store.updateTabClient(index, {
          rect() {
            return $el.getBoundingClientRect();
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
