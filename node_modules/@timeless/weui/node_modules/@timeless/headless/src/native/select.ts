import { Ref, isRef } from "@timeless/reactive";

import { View, ViewAttributes, ViewChildren, ViewProps } from "../primitive/view";

type NativeSelectValue = string | string[];

export interface NativeSelectProps extends Omit<ViewProps, "as"> {
  id?: string | Ref<string>;
  name?: string | Ref<string>;
  disabled?: boolean | Ref<boolean>;
  required?: boolean | Ref<boolean>;
  multiple?: boolean | Ref<boolean>;
  size?: number | Ref<number>;
  value?: NativeSelectValue | Ref<NativeSelectValue>;
  onChange?: (e: Event) => void;
  onInput?: (e: Event) => void;
}

function setSelectValue($select: HTMLSelectElement, v: NativeSelectValue) {
  if (Array.isArray(v)) {
    const values = new Set(v.map(String));
    for (const opt of Array.from($select.options)) {
      opt.selected = values.has(String(opt.value));
    }
    return;
  }
  $select.value = String(v);
}

export function NativeSelect(
  props: NativeSelectProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  const {
    id,
    name,
    disabled,
    required,
    multiple,
    size,
    value,
    onChange,
    onInput,
    onMounted,
    attributes,
    ...rest
  } = props;

  const mergedAttributes: ViewAttributes = {
    ...(attributes || {}),
    id,
    name,
    disabled,
    required,
    multiple,
    size,
  };

  return View(
    {
      ...rest,
      as: "select",
      attributes: mergedAttributes,
      onMounted(el) {
        const $select = el as HTMLSelectElement;

        const applyValue = (v: NativeSelectValue | undefined) => {
          if (v === undefined) return;
          setSelectValue($select, v);
        };

        if (value !== undefined) {
          if (isRef(value)) {
            value._subscribe({
              onChange(v) {
                applyValue(v);
              },
            });
            applyValue(value.value);
          } else {
            applyValue(value);
          }
        }

        const handleChange = (e: Event) => {
          if (value !== undefined && isRef(value)) {
            const isMulti = $select.multiple;
            const nextValue = isMulti
              ? Array.from($select.selectedOptions).map((o) => o.value)
              : $select.value;
            (value as any).as(nextValue);
          }
          if (onChange) onChange(e);
        };

        const handleInput = (e: Event) => {
          if (onInput) onInput(e);
        };

        if (onChange || (value !== undefined && isRef(value))) {
          $select.addEventListener("change", handleChange);
        }
        if (onInput) {
          $select.addEventListener("input", handleInput);
        }

        const cleanup = onMounted ? onMounted($select) : undefined;

        return () => {
          $select.removeEventListener("change", handleChange);
          $select.removeEventListener("input", handleInput);
          if (typeof cleanup === "function") cleanup();
        };
      },
    },
    children,
  );
}
