import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { MountedEvent } from "@/event";
import { ViewProps } from "@/content/view";
import { ListenerManager } from "@/util/listener";
import { isClassNameRef } from "@/style";

type CheckboxState = {
  checked: boolean;
};
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
    checked: false,
  };
  const events = {
    onChange,
  };

  const manager$ = ListenerManager();

  const methods = {
    listen(type: string, handler: (event: any) => void, options?: any) {
      $elm.addEventListener(type, handler, options);
      return function () {
        $elm.removeEventListener(type, handler, options);
      };
    },
    setProp(key: string, value: any) {
      if ($elm) {
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
    setup_value_subscribe() {
      if (id !== undefined) {
        if (isRef(id)) {
          id.subscribe({
            onChange(v) {
              methods.setProp("id", String(v));
            },
          });
          methods.setProp("id", id.value);
        } else {
          methods.setProp("id", id);
        }
      }

      // Handle value attribute
      if (checked !== undefined) {
        if (isRef(checked)) {
          checked.subscribe({
            onChange(v) {
              state.checked = v as boolean;
              methods.setProp("checked", v);
            },
          });
          state.checked = checked.value;
          methods.setProp("checked", checked.value);
        } else {
          state.checked = checked;
          methods.setProp("checked", checked);
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
          methods.setProp("disabled", disabled.value);
        } else {
          methods.setProp("disabled", disabled as boolean);
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
          methods.setProp("readOnly", readonly.value);
        } else {
          methods.setProp("readOnly", readonly as boolean);
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
          methods.setProp("required", required.value);
        } else {
          methods.setProp("required", required as boolean);
        }
      }
      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name.subscribe({
            onChange(v) {
              methods.setProp("name", v);
            },
          });
          methods.setProp("name", name.value);
        } else {
          methods.setProp("name", name as string);
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
      if (cls) {
        if (typeof cls === "string") {
          // host.setClassName($elm, cls);
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v) {
              // host.setClassName($elm, String(v));
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setClassName($elm, String(cls.value));
          if ($elm) {
            $elm.setStyleSet(String(cls.value));
          }
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              // host.setClassName(
              //   $elm,
              //   Array.isArray(v) ? v.join(" ") : String(v ?? ""),
              // );
              if ($elm) {
                $elm.setStyleSet(
                  Array.isArray(v) ? v.join(" ") : String(v ?? ""),
                );
              }
            },
          });
          // host.setClassName($elm, cls.toString());
          if ($elm) {
            $elm.setStyleSet(cls.toString());
          }
        }
      }

      // Handle style
      if (style) {
        if (isRef(style)) {
          const st = style;
          st.subscribe({
            onChange(v) {
              // host.setStyleText($elm, viewStyleToCssText(v ?? {}));
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setStyleText($elm, viewStyleToCssText(st.value));
          if ($elm) {
            $elm.setStyleSet(st.value);
          }
        } else if (isRef(style)) {
          const st = style;
          const apply = () => {
            // host.setStyleText($elm, viewStyleToCssText(st.value || {}));
            $elm.setStyleSet(st.value || {});
          };
          st.subscribe({
            onChange() {
              apply();
            },
          });
          apply();
        } else {
          const applyStyle = () => {
            // host.setStyleText($elm, viewStyleToCssText(style as any));
            $elm.setStyleSet(style);
          };
          Object.keys(style as any).forEach((k) => {
            const vv = style[k];
            if (isRef(vv)) {
              vv.subscribe({
                onChange() {
                  applyStyle();
                },
              });
            }
          });
          applyStyle();
        }
      }
    },
  };

  methods.setup_value_subscribe();

  return {
    t: "checkbox",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    get value() {
      return state.checked;
    },
    events,
    render() {
      return $elm;
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
