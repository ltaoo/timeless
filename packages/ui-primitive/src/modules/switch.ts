import { computed, Fragment, refobj } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Checkbox,
  Button,
  ButtonProps,
} from "@timeless/timeless";
import { SwitchCore } from "@timeless/ui-vm";

export function Root(
  props: ButtonProps & {
    store: SwitchCore;
    id?: string;
  },
  children?: ViewChildren,
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);
  const events: Array<undefined | (() => void)> = [];

  const toggle = () => {
    if (store.state.disabled) return;
    store.setValue(!store.state.checked);
  };

  return Button(
    {
      ...rest,
      attributes: {
        role: "switch",
        "aria-checked": computed(state_, (d) => d.checked),
        "aria-disabled": computed(state_, (d) => d.disabled),
        disabled: computed(state_, (d) => d.disabled),
      },
      dataset: {
        checked: computed(state_, (d) => (d.checked ? "" : undefined)),
        disabled: computed(state_, (d) => (d.disabled ? "" : undefined)),
      },
      onClick(e) {
        if ((e.target as any)?.tagName === "INPUT") return;
        rest.onClick?.(e);
        if ((e as any).defaultPrevented) return;
        toggle();
      },
      onKeyDown(e) {
        rest.onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      },
      onMounted(el) {
        events.push(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        rest.onMounted?.(el);
      },
      onUnmounted() {
        for (const fn of events) fn?.();
        rest.onUnmounted?.();
      },
    },
    [
      Checkbox({
        id,
        checked: computed(state_, (d) => d.checked),
        disabled: computed(state_, (d) => d.disabled),
        style: {
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          "white-space": "nowrap",
          "border-width": 0,
        },
        onClick(e) {
          e.stopPropagation();
        },
        onChange(e) {
          const $input = e.target as HTMLInputElement | null;
          if (!$input) return;
          store.handleChange(!!$input.checked);
        },
      }),
      Fragment({}, children),
    ],
  );
}

export function Thumb(
  props: ViewProps & { store: SwitchCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}
