import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

export type DisabledValue = boolean | DerivedRef<boolean> | Ref<boolean>;

export function bind_disabled(options: {
  value?: DisabledValue;
  set_disabled: (value: boolean) => void;
  add_cleanup: (cleanup?: void | (() => void)) => unknown;
}) {
  const { value, set_disabled, add_cleanup } = options;
  if (value === undefined) {
    return;
  }

  if (isRef(value)) {
    set_disabled(Boolean(value.value));
    add_cleanup(
      value.subscribe({
        onChange(next_value) {
          set_disabled(Boolean(next_value));
        },
      }),
    );
    return;
  }

  set_disabled(Boolean(value));
}

export function bind_inert_disabled(options: {
  value?: DisabledValue;
  state: {
    disabled: boolean;
    attributes: Record<string, string | number | boolean | undefined>;
  };
  apply_attr: (key: string, value: unknown) => void;
  add_cleanup: (cleanup?: void | (() => void)) => unknown;
}) {
  const { state, apply_attr } = options;
  bind_disabled({
    value: options.value,
    set_disabled(value) {
      state.disabled = value;
      state.attributes.inert = value ? "" : undefined;
      state.attributes["aria-disabled"] = value ? "true" : undefined;
      apply_attr("inert", value);
      apply_attr("aria-disabled", value ? "true" : undefined);
    },
    add_cleanup: options.add_cleanup,
  });
}
