import { cn, ref, refobj, isRef } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "@/primitive/view";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";

type Provider = Partial<{
  provide_ui_input: (store: InputCore<any>, $input: any) => void;
}>;

let global_provider: Provider | undefined;

export function setInputProvider(provider?: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: InputCore<any>; id?: string },
) {
  const host = getHost();
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = safeCreateElement("input");
  let rendered = false;
  const listenerCleanups: (() => void)[] = [];

  const value$ = refobj(store.value || "");
  const placeholder$ = ref(store.placeholder || "");
  const disabled$ = ref(store.disabled || false);
  const type$ = ref(store.type || "text");

  const events: any[] = [];

  // Subscribe to store state changes
  const unsub = store.onStateChange
    ? store.onStateChange((state) => {
        value$.as(state.value || "");
        placeholder$.as(state.placeholder || "");
        disabled$.as(state.disabled || false);
        type$.as(state.tmpType || state.type || "text");
      })
    : null;
  if (unsub) events.push(unsub);

  const class$ = cn([props.class]);

  return {
    t: "view",
    $elm,
    render() {
      if (rendered) {
        return $elm;
      }
      rendered = true;

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
      setProp("type", type$.value);
      host.setAttribute($elm, "autocomplete", store.autoComplete ? "on" : "off");
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
      // if (m.style) $elm.style.cssText = m.style;

      if (typeof st === "string") {
        host.setStyleText($elm, st);
      } else if (isRef(st)) {
        host.setStyleText($elm, st.value);
        st._subscribe({
          onChange(v: any) {
            host.setStyleText($elm, v);
          },
        });
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
      type$._subscribe({
        onChange(v: any) {
          setProp("type", v);
        },
      });

      // Event handlers
      const handleInput = (e: any) => {
        store.handleChange(e);
      };

      const handleKeyDown = (e: any) => {
        store.handleKeyDown({
          key: e.key,
          preventDefault: () => e.preventDefault(),
        });
      };

      const handleFocus = () => {
        store.handleFocus();
      };

      const handleBlur = () => {
        store.handleBlur();
      };

      host.addEventListener($elm, "input", handleInput);
      host.addEventListener($elm, "keydown", handleKeyDown);
      host.addEventListener($elm, "focus", handleFocus);
      host.addEventListener($elm, "blur", handleBlur);

      listenerCleanups.push(() => host.removeEventListener($elm, "input", handleInput));
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "keydown", handleKeyDown),
      );
      listenerCleanups.push(() => host.removeEventListener($elm, "focus", handleFocus));
      listenerCleanups.push(() => host.removeEventListener($elm, "blur", handleBlur));

      // Connect store focus method to element
      store.focus = () => {
        host.focus?.($elm);
      };

      return $elm;
    },
    onMounted() {
      if (props.onMounted) props.onMounted(this.$elm);
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
      for (const fn of listenerCleanups) fn();
      listenerCleanups.length = 0;
      if (props.onUnmounted) props.onUnmounted();

      // Reset state for potential re-render
      rendered = false;
    },
  };
}

export function Value(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;
  const value$ = refobj(store.value || "");

  store.onStateChange(() => {
    value$.as(store.value || "");
  });

  return View(
    {
      ...rest,
      onMounted($e) {
        const updateText = () => {
          host.setTextContent($e, value$.value);
        };
        value$._subscribe({ onChange: updateText });
        updateText();
        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}

export function Clear(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted($e) {
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
          host.setTimeout(() => {
            store.focus();
          }, 0);
        };
        host.addEventListener($e, "click", handleClick);
        if (rest.onMounted) rest.onMounted($e);
        return () => {
          host.removeEventListener($e, "click", handleClick);
        };
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;
  const loading$ = ref(store.loading || false);

  if (store.onStateChange) {
    store.onStateChange(() => {
      loading$.as(store.loading || false);
    });
  }

  return View(
    {
      ...rest,
      onMounted($elm: HTMLDivElement) {
        const updateDisplay = () => {
          host.patchStyle?.($elm, { display: loading$.value ? "" : "none" });
        };
        loading$._subscribe({ onChange: updateDisplay });
        updateDisplay();
        if (rest.onMounted) rest.onMounted($elm);
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;
  const disabled$ = ref(store.disabled || false);

  if (store.onStateChange) {
    store.onStateChange(() => {
      disabled$.as(store.disabled || false);
    });
  }

  return View(
    {
      ...rest,
      onMounted($elm: HTMLDivElement) {
        const updateState = () => {
          if (disabled$.value) {
            host.setAttribute($elm, "data-disabled", "true");
          } else {
            host.removeAttribute($elm, "data-disabled");
          }
        };
        disabled$._subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted($elm);
      },
    },
    children,
  );
}
