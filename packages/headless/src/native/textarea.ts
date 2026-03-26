import { ViewProps } from "@/primitive/view";
import { cn, ref, refobj, isRef } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

export function NativeTextarea(
  props: ViewProps & { store: InputCore<any>; id?: string },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = document.createElement("textarea");

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
      const applyAttr = (k: string, v: any) => {
        if (v === undefined || v === null || v === false) {
          $elm.removeAttribute(k);
          return;
        }
        if (v === true) {
          $elm.setAttribute(k, "");
          return;
        }
        $elm.setAttribute(k, String(v));
      };

      if (id) {
        $elm.id = id;
      }

      // Set initial attributes
      $elm.value = value$.value;
      $elm.placeholder = placeholder$.value;
      $elm.disabled = disabled$.value;
      $elm.setAttribute("autocomplete", store.autoComplete ? "on" : "off");
      $elm.setAttribute("autocorrect", "off");

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
          $elm.className = v.join(" ");
        },
      });
      $elm.className = class$.toString();

      // Apply style
      if (st && typeof st === "string") {
        $elm.style.cssText = st;
      }

      // Subscribe to reactive state changes
      value$._subscribe({
        onChange(v: any) {
          if ($elm.value !== String(v)) {
            $elm.value = v;
          }
        },
      });
      placeholder$._subscribe({
        onChange(v: any) {
          $elm.placeholder = v;
        },
      });
      disabled$._subscribe({
        onChange(v: any) {
          $elm.disabled = v;
        },
      });

      // Event handlers
      $elm.addEventListener("input", (e: Event) => {
        store.handleChange(e);
      });

      $elm.addEventListener("keydown", (e: KeyboardEvent) => {
        store.handleKeyDown({
          key: e.key,
          preventDefault: () => e.preventDefault(),
        });
      });

      $elm.addEventListener("focus", () => {
        store.handleFocus();
      });

      $elm.addEventListener("blur", () => {
        store.handleBlur();
      });

      // Connect store focus method to element
      store.focus = () => {
        $elm.focus();
      };

      return $elm;
    },
    onMounted() {
      if (props.onMounted) props.onMounted(this.$elm);
      store.setMounted();
      if (store.autoFocus) {
        this.$elm.focus();
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
