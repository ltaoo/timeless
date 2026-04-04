import { cn, ref, refobj, isRef } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { ViewProps } from "@/content/view";
import { isStyleRef } from "@timeless/reactive";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";
import { viewStyleToCssText } from "@/style/index";

export function Textarea(
  props: ViewProps & { store: InputCore<any>; id?: string },
) {
  const host = getHost();
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = safeCreateElement("textarea");

  const value$ = refobj(store.value || "");
  const placeholder$ = ref(store.placeholder || "");
  const disabled$ = ref(store.disabled || false);

  const events: any[] = [];

  // Subscribe to store state changes
  const unsub = store.onStateChange
    ? store.onStateChange((state) => {
        value$.as(state.value || "");
        placeholder$.as(state.placeholder || "");
        disabled$.as(state.disabled || false);
      })
    : null;
  if (unsub) events.push(unsub);

  const class$ = cn([props.class]);

  return {
    t: "view",
    $elm,
    render() {
      const setProp = (key: string, value: any) => {
        if (host.setProperty) {
          host.setProperty($elm, key, value);
          return;
        }
        ($elm as any)[key] = value;
      };
      const applyAttr = (k: string, v: any) => {
        if (v === undefined || v === null || v === false) {
          host.removeAttribute($elm, k);
          return;
        }
        if (v === true) {
          host.setAttribute($elm, k, "");
          return;
        }
        host.setAttribute($elm, k, String(v));
      };

      if (id) {
        setProp("id", id);
      }

      // Set initial attributes
      setProp("value", value$.value);
      setProp("placeholder", placeholder$.value);
      setProp("disabled", disabled$.value);
      host.setAttribute(
        $elm,
        "autocomplete",
        store.autoComplete ? "on" : "off",
      );
      host.setAttribute($elm, "autocorrect", "off");

      // Apply dataset attributes
      Object.keys(dataset || {}).forEach((k) => {
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (isRef(vv)) {
          vv._subscribe({
            onChange(v: any) {
              applyAttr(attrName, v);
            },
          });
          applyAttr(attrName, vv.value);
          return;
        }
        applyAttr(attrName, vv);
      });

      // Apply classes
      class$._subscribe({
        onChange(v: any) {
          host.setClassName($elm, v.join(" "));
        },
      });
      host.setClassName($elm, class$.toString());

      // Apply style
      if (st) {
        if (isStyleRef(st as any)) {
          const s = st as any;
          s._subscribe({
            onChange(v: any) {
              host.setStyleText($elm, viewStyleToCssText(v ?? {}));
            },
          });
          host.setStyleText($elm, viewStyleToCssText(s.value));
        } else if (isRef(st as any)) {
          const s = st as any;
          const apply = () =>
            host.setStyleText($elm, viewStyleToCssText(s.value || {}));
          s._subscribe({
            onChange() {
              apply();
            },
          });
          apply();
        } else {
          const applyStyle = () => {
            host.setStyleText($elm, viewStyleToCssText(st as any));
          };
          Object.keys(st as any).forEach((k) => {
            const vv = (st as any)[k];
            if (isRef(vv)) {
              (vv as any)._subscribe({
                onChange() {
                  applyStyle();
                },
              });
            }
          });
          applyStyle();
        }
      }

      // Subscribe to reactive state changes
      value$._subscribe({
        onChange(v: any) {
          setProp("value", v);
        },
      });
      placeholder$._subscribe({
        onChange(v: any) {
          setProp("placeholder", v);
        },
      });
      disabled$._subscribe({
        onChange(v: any) {
          setProp("disabled", v);
        },
      });

      // Event handlers
      host.addEventListener($elm, "input", (e: any) => {
        store.handleChange(e);
      });

      host.addEventListener($elm, "keydown", (e: any) => {
        store.handleKeyDown({
          key: e.key,
          preventDefault: () => e.preventDefault(),
        });
      });

      host.addEventListener($elm, "focus", () => {
        store.handleFocus();
      });

      host.addEventListener($elm, "blur", () => {
        store.handleBlur();
      });

      // Connect store focus method to element
      store.focus = () => {
        host.focus?.($elm);
      };

      return $elm;
    },
    onMounted() {
      if (props.onMounted) props.onMounted({ target: this.$elm });
      store.setMounted();
      if (store.autoFocus) {
        host.focus?.(this.$elm);
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) props.beforeUnmounted();
    },
    onUnmounted() {
      for (const fn of events) if (typeof fn === "function") fn();
      if (props.onUnmounted) props.onUnmounted();
    },
  };
}
