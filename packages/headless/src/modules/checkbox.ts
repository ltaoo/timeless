import { ref, computed } from "@timeless/reactive";
import { CheckboxCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "../primitive/view";
import { Show } from "../primitive/show";
import { NativeInput, NativeInputProps } from "../native/input";

export function Root(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Fragment({}, children);
}

export function Box(
  props: ViewProps & { store: CheckboxCore; id?: string },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;
  const state = ref(store.state);
  const events: any[] = [];

  return View(
    {
      ...rest,
      as: "button",
      onClick(e) {
        if (rest.onClick) rest.onClick(e);
        store.toggle();
      },
      dataset: {
        checked: computed(state, (d) => (d.checked ? "" : undefined)),
        disabled: computed(state, (d) => (d.disabled ? "" : undefined)),
      },
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state.as(store.state);
          }),
        );
        if (store.onChange) {
          events.push(
            store.onChange(() => {
              state.as(store.state);
            }),
          );
        }
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = ref(store.state);
  const events: any[] = [];

  return Show(
    {
      when: computed(state_, (d) => !!d.checked),
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state_.as(store.state);
          }),
        );
        if (store.onChange) {
          events.push(
            store.onChange(() => {
              state_.as(store.state);
            }),
          );
        }
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
      },
    },
    children,
  );
}

export function Input(
  props: NativeInputProps & { store: CheckboxCore; id?: string },
) {
  const { store, id, ...rest } = props;
  const events: any[] = [];

  return NativeInput({
    ...rest,
    type: "checkbox",
    id,
    style:
      "position: absolute; pointer-events: none; opacity: 0; margin: 0px; transform: translateX(-100%); width: 16px; height: 16px;",
    onChange() {
      store.toggle();
    },
    onMounted($elm: HTMLInputElement) {
      $elm.checked = !!store.state.checked;
      events.push(
        store.onStateChange(() => {
          $elm.checked = !!store.state.checked;
        }),
      );
      if (rest.onMounted) rest.onMounted($elm);
    },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  });
}

export function Label(
  props: ViewProps & { for?: string; store?: CheckboxCore },
  children?: ViewChildren,
) {
  const { for: htmlFor, store, ...rest } = props;
  const events: any[] = [];
  return View(
    {
      ...rest,
      as: "label",
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

// CheckboxGroup primitives
import { CheckboxGroupCore } from "@timeless/ui";
import { Fragment } from "@/primitive/fragment";

export function Group(
  props: ViewProps & { store: CheckboxGroupCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      // role: "group",
    },
    children,
  );
}

export function GroupItem(
  props: ViewProps & {
    store: CheckboxGroupCore<any>;
    item: { label: string; value: any; core: CheckboxCore };
    renderCheckbox?: (core: CheckboxCore) => ViewChildren;
    renderLabel?: (label: string) => ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, item, renderCheckbox, renderLabel, ...rest } = props;

  // const checkboxContent = renderCheckbox
  //   ? renderCheckbox(item.core)
  //   : Box({ store: item.core }, [Indicator({ store: item.core }, children)]);
  const checkboxContent = Box({ store: item.core }, [
    Indicator({ store: item.core }, children),
  ]);
  // const labelContent = renderLabel ? renderLabel(item.label) : item.label;
  const labelContent = item.label;

  return View(
    {
      ...rest,
    },
    [checkboxContent, labelContent],
  );
}
