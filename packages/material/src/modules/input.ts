import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  Show,
  View,
  ViewProps,
  classNames,
  combine,
  computed,
  refobj,
} from "@timeless/timeless";

/**
 * Material 3 输入框。两种形态：
 *   outlined（默认）—— 1px --outline 描边，聚焦 2px --primary
 *   filled         —— --surface-container-highest 填充 + 底部 1px 指示线
 */
export function Input(
  props: ViewProps & {
    store: vm.InputCore<any>;
    id?: string;
    variant?: "filled" | "outlined";
  },
) {
  const { store, id, variant = "outlined", class: cls, onUnmounted, ...rest } = props;
  const state_ = refobj(store.state);

  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange((v) => state_.as(v)));

  const allowClear = computed(state_, (d) => !!d.allowClear);
  const hasValue = computed(state_, (d) => !!(d.value && d.value.length > 0));
  const isLoading = computed(state_, (d) => !!(d.loading || false));

  return ui.InputPrimitive.Root(
    {
      store,
      class: classNames([
        "m3-input-root",
        variant === "filled" ? "m3-input-root--filled" : "m3-input-root--outlined",
        cls,
      ]),
      onUnmounted() {
        listener$.destroy();
        if (onUnmounted) {
          onUnmounted();
        }
      },
    },
    [
      ui.InputPrimitive.Input({
        ...rest,
        id,
        store,
        class: classNames([
          "m3-input",
          variant === "filled" ? "m3-input--filled" : "m3-input--outlined",
          computed(state_, (t) => (t.focus ? "is-focused" : "")),
          computed(state_, (d) => (d.disabled ? "is-disabled" : "")),
          computed(state_, (t) => (t.status === "error" ? "is-invalid" : "")),
          combine({ allowClear, isLoading }, (t) =>
            t.isLoading || t.allowClear ? "has-affix" : "",
          ),
        ]),
      }),
      Show({
        when: combine(
          { allowClear, hasValue, isLoading },
          (t) => t.hasValue && t.allowClear && !t.isLoading,
        ),
        ok() {
          return [
            ui.InputPrimitive.Clear({ store, class: "m3-input__clear" }, [
              Icon({ name: "circle-x", size: 14 }),
            ]),
          ];
        },
      }),
      ui.InputPrimitive.Loading({ store, class: "m3-input__loading" }, [
        View({ class: "m3-input__spinner" }, []),
      ]),
    ],
  );
}
