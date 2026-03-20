import { refobj, computed } from "@timeless/reactive";
import { StepCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { For } from "./for";
import { Txt } from "./text";
import { h } from "./h";

export type StepItem = {
  title: string;
  description?: string;
};

export function Root(
  props: ViewProps & { store: StepCore; items: StepItem[] },
  children?: ViewChildren,
) {
  const { store, items, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      ...rest,
      // "data-steps-root": "",
    },
    children,
  );
}

export function List(
  props: ViewProps & { store: StepCore; items: StepItem[] },
  children?: ViewChildren,
) {
  const { store, items, ...rest } = props;

  return View(
    {
      ...rest,
      // "data-steps-list": "",
    },
    children ??
      For({
        each: items,
        render: (item, index) => {
          return Item(
            { store, index, item },
            [
              Indicator({ store, index }),
              Title({}, [Txt(item.title)]),
              index < items.length - 1 ? Connector({ store, index }) : null,
            ].filter(Boolean) as ViewChildren,
          );
        },
      }),
  );
}

export function Item(
  props: ViewProps & { store: StepCore; index: number; item?: StepItem },
  children?: ViewChildren,
) {
  const { store, index, item, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      ...rest,
      // "data-steps-item": "",
      // "data-state": computed(state_, (s) => {
      //   if (index < s.value) return "completed";
      //   if (index === s.value) return "current";
      //   return "upcoming";
      // }),
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & { store: StepCore; index: number },
  children?: ViewChildren,
) {
  const { store, index, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const stepState = computed(state_, (s) => {
    if (index < s.value) return "completed";
    if (index === s.value) return "current";
    return "upcoming";
  });

  return View(
    {
      ...rest,
      // "data-steps-indicator": "",
      // "data-state": stepState,
    },
    children ??
      h(
        Txt,
        computed(state_, (s) => (index < s.value ? "✓" : String(index + 1))),
      ),
  );
}

export function Connector(
  props: ViewProps & { store: StepCore; index: number },
  children?: ViewChildren,
) {
  const { store, index, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      ...rest,
      // "data-steps-connector": "",
      // "data-state": computed(state_, (s) =>
      //   index < s.value ? "completed" : "upcoming",
      // ),
    },
    children,
  );
}

export function Title(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-steps-title": "",
    },
    children,
  );
}

export function Description(props: ViewProps, children?: ViewChildren) {
  return View(
    {
      ...props,
      // "data-steps-description": "",
    },
    children,
  );
}
