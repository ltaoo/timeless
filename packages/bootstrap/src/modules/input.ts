import { ui, vm } from "@timeless/timeless";
import {
  Icon,
  Show,
  View,
  ViewProps,
  classNames,
  combine,
  computed,
  refobj,
} from "@timeless/timeless";

export function Input(
  props: ViewProps & {
    store: vm.InputCore<any>;
    id?: string;
  },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const allowClear = computed(state_, (d) => !!d.allowClear);
  const hasValue = computed(state_, (d) => !!(d.value && d.value.length > 0));
  const isLoading = computed(state_, (d) => !!(d.loading || false));

  return ui.InputPrimitive.Root(
    { store, class: classNames(["input-root", props.class]) },
    [
      ui.InputPrimitive.Input({
        ...rest,
        id,
        store,
        class: classNames([
          "form-control",
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
            ui.InputPrimitive.Clear({ store, class: "input-clear" }, [
              Icon({ name: "circle-x", size: 14 }),
            ]),
          ];
        },
      }),
      ui.InputPrimitive.Loading({ store, class: "input-loading" }, [
        View({ class: "input-loading__inner" }, []),
      ]),
    ],
  );
}
