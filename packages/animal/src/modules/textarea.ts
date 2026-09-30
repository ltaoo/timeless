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

export function Textarea(
  props: ViewProps & {
    store: vm.InputCore<any>;
    id?: string;
    showClear?: boolean;
    showLoading?: boolean;
    showCount?: boolean;
  },
) {
  const {
    store,
    id,
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
      class: classNames(["animal-textarea", cls]),
      onUnmounted() {
        listener$.destroy();
        if (onUnmounted) {
          onUnmounted();
        }
      },
    },
    [
      ui.TextareaPrimitive.Root({ store, class: "animal-textarea__field" }, [
        ui.TextareaPrimitive.Textarea({
          ...rest,
          store,
          id,
          class: classNames([
            "animal-control",
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
              ui.TextareaPrimitive.Clear({ store, class: "animal-textarea__clear" }, [
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
                { store, class: "animal-textarea__loading" },
                [View({ class: "animal-textarea__loading-inner" }, [])],
              ),
            ];
          },
        }),
      ]),
      Show({
        when: showCount,
        ok() {
          return [
            ui.TextareaPrimitive.Count({ store, class: "animal-textarea__count" }, []),
          ];
        },
      }),
    ],
  );
}
