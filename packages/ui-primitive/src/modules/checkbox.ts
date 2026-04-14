import { ref, computed, refobj } from "@timeless/timeless";
import { Logger } from "@timeless/timeless";
import {
  Show,
  Fragment,
  View,
  ViewProps,
  ViewChildren,
  Checkbox,
  CheckboxProps,
  Button,
  ButtonProps,
  Label as NativeLabel,
  ListenerManager,
} from "@timeless/timeless";
import { CheckboxCore, CheckboxGroupCore } from "@timeless/ui-vm";

const logger = Logger({ prefix: "primitive", scope: "modules.checkbox" });

export function Root(
  props: ViewProps & { store: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return Fragment({}, children);
}

export function Box(
  props: ButtonProps & { store: CheckboxCore; id?: string },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  return Button(
    {
      ...rest,
      dataset: {
        checked: computed(state_, (d) => (d.checked ? "" : undefined)),
        disabled: computed(state_, (d) => (d.disabled ? "" : undefined)),
      },
      onMounted(event) {
        listener$.push(
          store.onStateChange(() => {
            state_.as(store.state);
          }),
        );
        if (store.onChange) {
          listener$.push(
            store.onChange(() => {
              state_.as(store.state);
            }),
          );
        }
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
      },
      onUnmounted() {
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
      onClick(e) {
        logger.log("Box onClick");
        if (rest.onClick) {
          rest.onClick(e);
        }
        store.toggle();
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
  const listener$ = ListenerManager([state_]);

  listener$.push(
    store.onStateChange((v) => {
      // logger.log("Indicator onStateChange", v.checked);
      state_.as(v);
    }),
  );

  return Show({
    when: computed(state_, (d) => !!d.checked),
    ok() {
      return children || [];
    },
    onMounted(event) {
      // logger.log("Indicator onMounted");
      if (rest.onMounted) {
        listener$.push(rest.onMounted(event));
      }
    },
  });
}

export function Input(
  props: CheckboxProps & { store: CheckboxCore; id?: string },
) {
  const { store, id, ...rest } = props;
  const listener$ = ListenerManager();

  return Checkbox({
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
      store.toggle();
    },
    onMounted(event) {
      // const $elm = event.target as HTMLInputElement;
      // $elm.checked = !!store.state.checked;
      listener$.push(
        store.onStateChange(() => {
          // $elm.checked = !!store.state.checked;
        }),
      );
      if (rest.onMounted) {
        listener$.push(rest.onMounted(event));
      }
    },
    onUnmounted() {
      // listener$.destroy();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  });
}

export function Label(
  props: ViewProps & { for?: string; store?: CheckboxCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return NativeLabel({ ...rest }, children);
}

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
  const box$ = Box({ store: item.core }, [
    Indicator({ store: item.core }, children),
  ]);
  // const labelContent = renderLabel ? renderLabel(item.label) : item.label;
  const labelContent = item.label;

  return View(
    {
      ...rest,
    },
    [box$, labelContent],
  );
}
