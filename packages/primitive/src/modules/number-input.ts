import { cn, ref, refobj, isRef } from "@timeless/reactive";
import { NumberInputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "@/content/view";
import { isStyleRef } from "@timeless/reactive";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";
import { viewStyleToCssText } from "@/style/index";

export function Root(
  props: ViewProps & { store?: NumberInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: NumberInputCore; id?: string },
) {
  const host = getHost();
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = safeCreateElement("input");
  let rendered = false;
  const listenerCleanups: (() => void)[] = [];

  const displayValue$ = ref(store.displayValue || "");
  const placeholder$ = ref(store.placeholder || "");
  const disabled$ = ref(store.disabled || false);

  const events: any[] = [];

  const unsub = store.onStateChange
    ? store.onStateChange((state) => {
        displayValue$.as(state.displayValue || "");
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

      setProp("type", "text");
      setProp("inputMode", "decimal");
      setProp("value", displayValue$.value);
      setProp("placeholder", placeholder$.value);
      setProp("disabled", disabled$.value);
      host.setAttribute($elm, "autocomplete", "off");
      host.setAttribute($elm, "autocorrect", "off");

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

      class$._subscribe({
        onChange(v: any) {
          host.setClassName($elm, v.join(" "));
        },
      });
      host.setClassName($elm, class$.toString());

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

      displayValue$._subscribe({
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

      listenerCleanups.push(() =>
        host.removeEventListener($elm, "input", handleInput),
      );
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "keydown", handleKeyDown),
      );
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "focus", handleFocus),
      );
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "blur", handleBlur),
      );

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
      for (const fn of listenerCleanups) fn();
      listenerCleanups.length = 0;
      if (props.onUnmounted) props.onUnmounted();

      // Reset state for potential re-render
      rendered = false;
    },
  };
}

export function IncreaseButton(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;

  const canIncrease$ = ref(store.canIncrease());
  const disabled$ = ref(store.disabled || false);

  store.onStateChange(() => {
    canIncrease$.as(store.canIncrease());
    disabled$.as(store.disabled || false);
  });

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target as any;
        const updateState = () => {
          const canIncrease = canIncrease$.value;
          const disabled = disabled$.value;
          if (disabled || !canIncrease) {
            host.setAttribute($e, "data-disabled", "true");
            host.setAttribute($e, "aria-disabled", "true");
          } else {
            host.removeAttribute($e, "data-disabled");
            host.removeAttribute($e, "aria-disabled");
          }
        };
        canIncrease$._subscribe({ onChange: updateState });
        disabled$._subscribe({ onChange: updateState });
        updateState();

        const handleMouseDown = (e: any) => {
          e.preventDefault();
        };
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.increase();
        };
        host.addEventListener($e, "mousedown", handleMouseDown);
        host.addEventListener($e, "click", handleClick);

        if (rest.onMounted) rest.onMounted(event);
        return () => {
          host.removeEventListener($e, "mousedown", handleMouseDown);
          host.removeEventListener($e, "click", handleClick);
        };
      },
    },
    children,
  );
}

export function DecreaseButton(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;

  const canDecrease$ = ref(store.canDecrease());
  const disabled$ = ref(store.disabled || false);

  store.onStateChange(() => {
    canDecrease$.as(store.canDecrease());
    disabled$.as(store.disabled || false);
  });

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target as any;
        const updateState = () => {
          const canDecrease = canDecrease$.value;
          const disabled = disabled$.value;
          if (disabled || !canDecrease) {
            host.setAttribute($e, "data-disabled", "true");
            host.setAttribute($e, "aria-disabled", "true");
          } else {
            host.removeAttribute($e, "data-disabled");
            host.removeAttribute($e, "aria-disabled");
          }
        };
        canDecrease$._subscribe({ onChange: updateState });
        disabled$._subscribe({ onChange: updateState });
        updateState();

        const handleMouseDown = (e: any) => {
          e.preventDefault();
        };
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.decrease();
        };
        host.addEventListener($e, "mousedown", handleMouseDown);
        host.addEventListener($e, "click", handleClick);

        if (rest.onMounted) rest.onMounted(event);
        return () => {
          host.removeEventListener($e, "mousedown", handleMouseDown);
          host.removeEventListener($e, "click", handleClick);
        };
      },
    },
    children,
  );
}

export function Value(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;
  const value$ = ref(store.value);

  store.onStateChange(() => {
    value$.as(store.value);
  });

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target as any;
        const updateText = () => {
          host.setTextContent(
            $e,
            value$.value !== null ? String(value$.value) : "",
          );
        };
        value$._subscribe({ onChange: updateText });
        updateText();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: NumberInputCore },
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
      onMounted(event) {
        const $elm = (event as any).target as any;
        const updateState = () => {
          if (disabled$.value) {
            host.setAttribute($elm, "data-disabled", "true");
          } else {
            host.removeAttribute($elm, "data-disabled");
          }
        };
        disabled$._subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}
