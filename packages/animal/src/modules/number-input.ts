import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  ListenerManager,
  Show,
  View,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";

export function NumberInput(
  props: ViewProps & {
    store: vm.NumberInputCore;
    id?: string;
    showControls?: boolean;
  },
) {
  const {
    store,
    id,
    showControls = true,
    class: cls,
    onUnmounted,
    ...rest
  } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange((v) => state_.as(v)));

  const isDisabled = computed(state_, (d) => d.disabled);
  const isInvalid = computed(state_, (d) => d.status === "error");
  listener$.add(isDisabled);
  listener$.add(isInvalid);

  return ui.NumberInputPrimitive.Root(
    {
      store,
      class: classNames([
        "animal-number-input",
        computed(state_, (d) => (d.disabled ? "is-disabled" : "")),
        computed(state_, (d) => (d.status === "error" ? "is-invalid" : "")),
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
      ui.NumberInputPrimitive.Input({
        ...rest,
        store,
        id,
        class: classNames([
          "animal-control",
          computed(state_, (d) => (d.focus ? "is-focused" : "")),
          computed(state_, (d) => (d.disabled ? "is-disabled" : "")),
          computed(state_, (d) => (d.status === "error" ? "is-invalid" : "")),
        ]),
      }),
      Show({
        when: showControls,
        ok() {
          return [
            View({ class: "animal-number-input__controls" }, [
              ui.NumberInputPrimitive.IncreaseButton(
                { store, class: "animal-number-input__step animal-number-input__step--up" },
                [Icon({ name: "chevron-up", size: 12 })],
              ),
              ui.NumberInputPrimitive.DecreaseButton(
                { store, class: "animal-number-input__step animal-number-input__step--down" },
                [Icon({ name: "chevron-down", size: 12 })],
              ),
            ]),
          ];
        },
      }),
    ],
  );
}
