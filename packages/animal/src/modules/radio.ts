import { ui, vm } from "@timeless/timeless";
import {
  For,
  Label as NativeLabel,
  ListenerManager,
  View,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

export function Radio(
  props: ViewProps & { store: vm.RadioCore; id?: string },
) {
  const { store, id, class: cls, onUnmounted, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  return ui.RadioPrimitive.Root({ store }, [
    ui.RadioPrimitive.Input({ store, id }),
    ui.RadioPrimitive.Box(
      {
        ...rest,
        store,
        class: classNames([
          "animal-radio",
          computed(state_, (s) => (s.checked ? "is-checked" : "")),
          computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
          computed(state_, (s) => (s.status === "error" ? "is-invalid" : "")),
          cls,
        ]),
        onUnmounted() {
          listener$.destroy();
          if (onUnmounted) {
            onUnmounted();
          }
        },
      },
      [],
    ),
  ]);
}

export function RadioGroup(
  props: ViewProps & {
    store: vm.RadioGroupCore<any>;
    class?: string;
    itemClass?: string;
    direction?: "horizontal" | "vertical";
  },
) {
  const { store, direction = "vertical" } = props;
  const state = refobj(store.state);
  const listener$ = ListenerManager([state]);

  return ui.RadioPrimitive.Group(
    {
      store,
      class: classNames([
        "animal-radio-group",
        direction === "horizontal" ? "animal-radio-group--horizontal" : "",
        props.class,
      ]),
      onMounted() {
        listener$.add(store.onStateChange((v) => state.as(v)));
        return listener$.destroy;
      },
    },
    [
      For({
        each: computed(state, (s) => s.options),
        render(item: { label: string; value: any; core: vm.RadioCore }) {
          return RadioGroupItem({
            store,
            item,
            class: props.itemClass,
          });
        },
      }),
    ],
  );
}

export function RadioGroupItem(props: {
  store: vm.RadioGroupCore<any>;
  item: { label: string; value: any; core: vm.RadioCore };
  class?: string;
}) {
  const { item } = props;

  return View(
    {
      class: classNames(["animal-check", "animal-radio-group__item", props.class]),
      onClick() {
        item.core.check();
      },
    },
    [
      Radio({ id: item.value, store: item.core }),
      NativeLabel({ for: item.value, class: "animal-check__label" }, [item.label]),
    ],
  );
}
