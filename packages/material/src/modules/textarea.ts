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
 * Material 3 多行输入。与 Input 共用 filled / outlined 两种形态。
 */
export function Textarea(
  props: ViewProps & {
    store: vm.InputCore<any>;
    id?: string;
    variant?: "filled" | "outlined";
    showClear?: boolean;
    showLoading?: boolean;
    showCount?: boolean;
  },
) {
  const {
    store,
    id,
    variant = "outlined",
    showClear = false,
    showLoading = false,
    showCount = false,
    class: cls,
    onUnmounted,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange((v) => state_.as(v)));

  const hasValue = computed(state_, (d) => !!(d.value && d.value.length > 0));
  const isLoading = computed(state_, (d) => !!(d.loading || false));
  const affix = combine({ hasValue, isLoading }, (t) =>
    (showClear && t.hasValue) || (showLoading && t.isLoading) ? "has-affix" : "",
  );
  listener$.add(affix);

  return ui.TextareaPrimitive.Root(
    {
      store,
      class: classNames(["m3-textarea-root", cls]),
      onUnmounted() {
        listener$.destroy();
        if (onUnmounted) {
          onUnmounted();
        }
      },
    },
    [
      ui.TextareaPrimitive.Root({ store, class: "m3-textarea-field" }, [
        ui.TextareaPrimitive.Textarea({
          ...rest,
          store,
          id,
          class: classNames([
            "m3-textarea",
            variant === "filled"
              ? "m3-textarea--filled"
              : "m3-textarea--outlined",
            computed(state_, (d) => (d.focus ? "is-focused" : "")),
            computed(state_, (d) => (d.disabled ? "is-disabled" : "")),
            computed(state_, (d) => (d.status === "error" ? "is-invalid" : "")),
            affix,
          ]),
        }),
        Show({
          when: combine({ hasValue }, (t) => showClear && t.hasValue),
          ok() {
            return [
              ui.TextareaPrimitive.Clear({ store, class: "m3-textarea__clear" }, [
                Icon({ name: "circle-x", size: 14 }),
              ]),
            ];
          },
        }),
        Show({
          when: combine({ isLoading }, (t) => showLoading && t.isLoading),
          ok() {
            return [
              ui.TextareaPrimitive.Loading(
                { store, class: "m3-textarea__loading" },
                [View({ class: "m3-textarea__spinner" }, [])],
              ),
            ];
          },
        }),
      ]),
      Show({
        when: showCount,
        ok() {
          return [
            ui.TextareaPrimitive.Count({ store, class: "m3-textarea__count" }, []),
          ];
        },
      }),
    ],
  );
}
