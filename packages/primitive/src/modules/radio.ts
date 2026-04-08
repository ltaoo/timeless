import { ref, computed } from "@timeless/reactive";
import { RadioCore, RadioGroupCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Show } from "@/reactive/show";
// import { InputProps } from "@/input/input";
import { Fragment } from "@/content/fragment";
import { Radio, RadioProps } from "@/input/radio";

export function Root(
  props: ViewProps & { store: RadioCore },
  children?: ViewChildren,
) {
  return Fragment({}, children);
}

export function Box(
  props: ViewProps & { store: RadioCore; id?: string },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;

  const state = ref(store.state);
  const events: any[] = [];

  return View(
    {
      ...rest,
      as: "button",
      dataset: {
        // checked: computed(state, (d) => (d.checked ? "" : undefined)),
        // disabled: computed(state, (d) => (d.disabled ? "" : undefined)),
      },
      onClick(e) {
        if (rest.onClick) {
          rest.onClick(e);
        }
        store.check();
      },
      onMounted() {
        events.push(
          store.onStateChange(() => {
            state.as(store.state);
          }),
        );
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
  props: ViewProps & { store: RadioCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = ref(store.state);
  const events: any[] = [];

  return Show({
    when: computed(state_, (d) => d.checked),
    ok() {
      return children || [];
    },
    onMounted() {
      events.push(
        store.onStateChange(() => {
          state_.as(store.state);
        }),
      );
    },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
    },
  });
}

export function Input(props: RadioProps & { store: RadioCore; id?: string }) {
  const { store, id, ...rest } = props;
  const events: any[] = [];

  return Radio({
    ...rest,
    id,
    style: {
      position: "absolute",
      "pointer-events": "none",
      opacity: 0,
      margin: "0px",
      transform: "translateX(-100%)",
      width: "16px",
      height: "16px",
    },
    onChange() {
      store.check();
    },
    onMounted(event) {
      const $elm = (event as any).target as HTMLInputElement;
      $elm.checked = !!store.state.checked;
      events.push(
        store.onStateChange(() => {
          $elm.checked = !!store.state.checked;
        }),
      );
      if (rest.onMounted) rest.onMounted(event);
    },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (rest.onUnmounted) rest.onUnmounted();
    },
  });
}

export function Label(
  props: ViewProps & { for?: string; store?: RadioCore },
  children?: ViewChildren,
) {
  const { for: htmlFor, store, ...rest } = props;
  const events: any[] = [];

  // const hiddenInput = store
  //   ? View(
  //       {
  //         as: "input",
  //         dataset: {
  //           type: "radio",
  //         },
  //         id: htmlFor,
  //         // name: htmlFor,
  //         style:
  //           "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
  //         onClick(e) {
  //           e.stopPropagation();
  //           store.check();
  //         },
  //         onMounted($elm: HTMLInputElement) {
  //           $elm.checked = !!store.state.checked;
  //           events.push(
  //             store.onStateChange(() => {
  //               $elm.checked = !!store.state.checked;
  //             }),
  //           );
  //         },
  //       },
  //       [],
  //     )
  //   : null;

  return View(
    {
      ...rest,
      as: "label",
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    // hiddenInput ? [hiddenInput, ...(children || [])] : children,
    children,
  );
}

// RadioGroup primitives
export function Group(
  props: ViewProps & { store: RadioGroupCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      // role: "radiogroup",
    },
    children,
  );
}

export function GroupItem(
  props: ViewProps & {
    store: RadioGroupCore<any>;
    item: { label: string; value: any; core: RadioCore };
    renderRadio?: (core: RadioCore) => ViewChildren;
    renderLabel?: (label: string) => ViewChildren;
  },
  children?: ViewChildren,
) {
  const { store, item, renderRadio, renderLabel, ...rest } = props;

  // const radioContent = renderRadio
  //   ? renderRadio(item.core)
  //   : Box({ store: item.core }, [Indicator({ store: item.core }, children)]);
  const radioContent = Box({ store: item.core }, [
    Indicator({ store: item.core }, children),
  ]);

  // const labelContent = renderLabel ? renderLabel(item.label) : item.label;
  const labelContent = item.label;

  return View(
    {
      ...rest,
    },
    [radioContent, labelContent],
  );
}
