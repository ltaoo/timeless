import { Ref, isRef } from "@timeless/reactive";

import {
  View,
  ViewAttributes,
  ViewChildren,
  ViewProps,
} from "@/primitive/view";
import { getHost } from "@/host";

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

function getOptionValue(option: any) {
  if (option == null) return "";
  if (option.value != null) return String(option.value);
  return String(option.getAttribute?.("value") ?? "");
}

function getSelectOptions(host: ReturnType<typeof getHost>, select: any) {
  const opts = (select as any)?.options;
  if (opts) {
    return Array.from(opts);
  }

  const result: any[] = [];
  const walk = (node: any) => {
    const name = String(node?.nodeName ?? "").toUpperCase();
    if (name === "OPTION") {
      result.push(node);
      return;
    }
    const children = host.getChildNodes(node);
    for (const c of children) walk(c);
  };

  walk(select);
  return result;
}

function setSelectValue(
  host: ReturnType<typeof getHost>,
  $select: any,
  v: NativeSelectValue,
) {
  if (Array.isArray(v)) {
    const values = new Set(v.map(String));
    const options = getSelectOptions(host, $select);
    for (const opt of options) {
      host.setProperty?.(opt, "selected", values.has(getOptionValue(opt)));
    }
    return;
  }
  host.setProperty?.($select, "value", String(v));
}

export function NativeSelect(
  props: NativeSelectProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  const host = getHost();
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
        const $select = el as any;

        const applyValue = (v: NativeSelectValue | undefined) => {
          if (v === undefined) return;
          setSelectValue(host, $select, v);
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
            const isMulti = !!($select as any).multiple;
            let nextValue: any;
            if (isMulti) {
              const options = getSelectOptions(host, $select);
              nextValue = options
                .filter((o) => !!(o as any).selected)
                .map((o) => getOptionValue(o));
            } else {
              nextValue = String(($select as any).value ?? "");
            }
            (value as any).as(nextValue);
          }
          if (onChange) onChange(e);
        };

        const handleInput = (e: Event) => {
          if (onInput) onInput(e);
        };

        if (onChange || (value !== undefined && isRef(value))) {
          host.addEventListener($select, "change", handleChange);
        }
        if (onInput) {
          host.addEventListener($select, "input", handleInput);
        }

        const cleanup = onMounted ? onMounted($select) : undefined;

        return () => {
          host.removeEventListener($select, "change", handleChange);
          host.removeEventListener($select, "input", handleInput);
          if (typeof cleanup === "function") cleanup();
        };
      },
    },
    children,
  );
}
