import { ref, computed } from "@timeless/timeless";
import { Radio, RadioProps, Label as NativeLabel } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Show,
  Fragment,
  Button,
  ButtonProps,
  ListenerManager,
} from "@timeless/timeless";
import { RadioCore, RadioGroupCore } from "@timeless/ui-vm";

export function Root(
  props: ViewProps & { store: RadioCore },
  children?: ViewChildren,
) {
  return Fragment({}, children);
}

export function Box(
  props: ButtonProps & { store: RadioCore; id?: string },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;

  const state = ref(store.state);
  const events: any[] = [];

  return Button(
    {
      ...rest,
      dataset: {
        checked: computed(state, (d) => (d.checked ? "" : undefined)),
        disabled: computed(state, (d) => (d.disabled ? "" : undefined)),
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
  props: { store: RadioCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = ref(store.state);

  const listener$ = ListenerManager([state_]);
  listener$.add(
    store.onStateChange(() => {
      state_.as(store.state);
    }),
  );

  return Show({
    when: computed(state_, (d) => d.checked),
    ok() {
      return children || [];
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
      const $elm = event.target;
      // events.push(
      //   store.onStateChange(() => {
      //     $elm.checked = !!store.state.checked;
      //   }),
      // );
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
  const { store, ...rest } = props;

  return NativeLabel({ ...rest }, children);
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
      attributes: {
        role: "radiogroup",
      },
    },
    children,
  );
}

export function GroupItem(
  props: ViewProps & {
    store: RadioGroupCore<any>;
    item: { label: string; value: any; core: RadioCore };
  },
  children?: ViewChildren,
) {
  const { store, item, ...rest } = props;

  const content$ = Box({ store: item.core }, [
    Indicator({ store: item.core }, children),
  ]);

  return View({ ...rest }, [content$, item.label]);
}
