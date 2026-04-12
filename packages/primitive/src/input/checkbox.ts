import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";
import { ViewProps } from "@/content/view";
import { ListenerManager } from "@/util/listener";
import { isClassNameRef, isStyleRef, RawViewStyleProperties } from "@/style";
import { Logger } from "@/util/logger";

const logger = Logger({ prefix: "primitive", scope: "input/checkbox" });

export interface CheckboxProps {
  id?: string;
  name?: string | DerivedRef<string> | Ref<string>;
  class?: ViewProps["class"];
  style?: ViewProps["style"];
  attributes?: ViewProps["attributes"];
  dataset?: ViewProps["dataset"];
  checked?: boolean | DerivedRef<boolean> | Ref<boolean>;
  indeterminate?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  onChange?: (event: Event) => void;
  onClick?: (event: MouseEvent) => void;
  onMounted?: ViewProps["onMounted"];
  beforeUnmounted?: ViewProps["beforeUnmounted"];
  onUnmounted?: ViewProps["onUnmounted"];
}

type CheckboxState = {
  id: string;
  name: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  style: RawViewStyleProperties;
  styleSet: string[];
};

export function Checkbox(props: CheckboxProps) {
  const {
    id,
    name,
    style,
    class: cls,
    checked,
    indeterminate,
    disabled,
    readonly,
    required,
    onMounted,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  const state: CheckboxState = {
    id: "",
    name: "",
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    style: {},
    styleSet: [],
  };
  const events = {
    onChange(event: any) {
      // logger.log("handle change", event);
      if (props.onChange) {
        props.onChange(event);
      }
    },
    onClick(event: any) {
      if (props.onClick) {
        props.onClick(event);
      }
    },
  };

  const listener$ = ListenerManager();

  const methods = {
    setProp(key: string, value: any) {
      console.log("set prop", key, value, $elm, $elm.setAttribute);
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(key, value);
      }
      // state.props[key] = value;
    },
    applyAttr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm) {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm) {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm) {
        $elm.setAttribute(k, String(v));
      }
    },
    subscribe_props() {
      if (id !== undefined) {
        if (isRef(id)) {
          id.subscribe({
            onChange(v) {
              state.id = String(v);
              methods.setProp("id", String(v));
            },
          });
          // methods.setProp("id", id.value);
          state.id = id.value;
        } else {
          // methods.setProp("id", id);
          state.id = id;
        }
      }

      // Handle value attribute
      if (checked !== undefined) {
        if (isRef(checked)) {
          checked.subscribe({
            onChange(v) {
              state.checked = v;
              if ($elm && typeof $elm.setChecked === "function") {
                setTimeout(() => {
                  $elm.setChecked(v);
                }, 0);
              }
            },
          });
          state.checked = checked.value;
        } else {
          state.checked = checked;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled.subscribe({
            onChange(v) {
              methods.setProp("disabled", v);
            },
          });
          // methods.setProp("disabled", disabled.value);
          state.disabled = disabled.value;
        } else {
          // methods.setProp("disabled", disabled as boolean);
          state.disabled = disabled as boolean;
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          readonly.subscribe({
            onChange(v) {
              methods.setProp("readOnly", v);
            },
          });
          // methods.setProp("readOnly", readonly.value);
          // state.readonly = readonly.value;
        } else {
          // methods.setProp("readOnly", readonly as boolean);
          // state.readonly = readonly as boolean;
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          required.subscribe({
            onChange(v) {
              methods.setProp("required", v);
            },
          });
          // methods.setProp("required", required.value);
          state.required = required.value;
        } else {
          // methods.setProp("required", required as boolean);
          state.required = required as boolean;
        }
      }
      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name.subscribe({
            onChange(v) {
              state.name = String(v);
              methods.setProp("name", v);
            },
          });
          state.name = name.value;
          // methods.setProp("name", name.value);
        } else {
          state.name = name;
          // methods.setProp("name", name as string);
        }
      }

      // Handle dataset
      // Object.keys(dataset).forEach((k) => {
      //   if (!dataset) return;
      //   const vv = dataset[k];
      //   const attrName = `data-${k}`;
      //   if (isRef(vv)) {
      //     vv.subscribe({
      //       onChange(v: any) {
      //         methods.applyAttr(attrName, v);
      //       },
      //     });
      //     methods.applyAttr(attrName, vv.value);
      //     return;
      //   }
      //   methods.applyAttr(attrName, vv);
      // });

      // Handle class
      if (cls !== undefined) {
        if (typeof cls === "string") {
          state.styleSet = [cls];
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v) {
              // host.setClassName($elm, String(v));
              state.styleSet = [v as string];
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setClassName($elm, String(cls.value));
          state.styleSet = [cls.value];
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v) {
              state.styleSet = v;
              if ($elm) {
                $elm.setStyleSet(Array.isArray(v) ? v : [v]);
              }
            },
          });
          if ($elm) {
            $elm.setStyleSet(cls.toString());
          }
          state.styleSet = [cls.toString()];
        } else {
          state.styleSet = [cls];
        }
      }

      // Handle style
      if (style) {
        if (isRef(style)) {
          const st = style;
          st.subscribe({
            onChange(v) {
              state.style = v as RawViewStyleProperties;
              // host.setStyleText($elm, viewStyleToCssText(v ?? {}));
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          Object.keys(st.value).forEach((k) => {
            const vv = st.value[k];
            if (isRef(vv)) {
              vv.subscribe({
                onChange() {
                  // applyStyle();
                },
              });
            } else {
              state.style[k] = vv;
            }
          });
          // host.setStyleText($elm, viewStyleToCssText(st.value));
          // state.style = st.value;
        } else if (isStyleRef(style)) {
          style.subscribe({
            onChange(v) {
              $elm.setStyleSet(v as RawViewStyleProperties);
            },
          });
          state.style = style.value;
        } else {
          Object.keys(style as any).forEach((k) => {
            const vv = style[k];
            if (isRef(vv)) {
              vv.subscribe({
                onChange(v) {
                  $elm.setStyleSet(v);
                },
              });
              state.style[k] = vv.value;
            } else {
              state.style[k] = vv;
            }
          });
        }
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "checkbox",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}
