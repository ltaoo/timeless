import { cn, ref, isRef, isStyleRef } from "@timeless/reactive";
import { FileInputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "@/content/view";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";
import { viewStyleToCssText } from "@/style/index";

export function Root(
  props: ViewProps & { store?: FileInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: FileInputCore; id?: string },
) {
  const host = getHost();
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = safeCreateElement("input");
  let rendered = false;
  const listenerCleanups: (() => void)[] = [];

  const accept$ = ref(store.accept || "");
  const multiple$ = ref(store.multiple || false);
  const disabled$ = ref(store.disabled || false);

  const events: any[] = [];

  // Subscribe to store state changes
  const unsub = store.onStateChange
    ? store.onStateChange(
        (state: {
          accept?: string;
          multiple?: boolean;
          disabled?: boolean;
        }) => {
          accept$.as(state.accept || "");
          multiple$.as(state.multiple || false);
          disabled$.as(state.disabled || false);
        },
      )
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
      setProp("type", "file");
      setProp("disabled", disabled$.value);
      if (accept$.value) {
        host.setAttribute($elm, "accept", accept$.value);
      }
      if (multiple$.value) {
        host.setAttribute($elm, "multiple", "");
      }

      // Apply dataset attributes
      Object.keys(dataset || {}).forEach((k) => {
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (vv && typeof vv === "object" && "_subscribe" in vv) {
          (vv as any)._subscribe({
            onChange(v: any) {
              applyAttr(attrName, v);
            },
          });
          applyAttr(attrName, (vv as any).value);
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
      accept$._subscribe({
        onChange(v: any) {
          if (v) {
            host.setAttribute($elm, "accept", v);
          } else {
            host.removeAttribute($elm, "accept");
          }
        },
      });
      multiple$._subscribe({
        onChange(v: any) {
          if (v) {
            host.setAttribute($elm, "multiple", "");
          } else {
            host.removeAttribute($elm, "multiple");
          }
        },
      });
      disabled$._subscribe({
        onChange(v: any) {
          setProp("disabled", v);
        },
      });

      // Event handlers
      const handleChange = (e: any) => {
        store.handleChange(e);
      };

      const handleFocus = () => {
        store.handleFocus();
      };

      const handleBlur = () => {
        store.handleBlur();
      };

      host.addEventListener($elm, "change", handleChange);
      host.addEventListener($elm, "focus", handleFocus);
      host.addEventListener($elm, "blur", handleBlur);

      listenerCleanups.push(() =>
        host.removeEventListener($elm, "change", handleChange),
      );
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "focus", handleFocus),
      );
      listenerCleanups.push(() =>
        host.removeEventListener($elm, "blur", handleBlur),
      );

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
      for (const fn of listenerCleanups) fn();
      listenerCleanups.length = 0;
      if (props.onUnmounted) props.onUnmounted();

      // Reset state for potential re-render
      rendered = false;
    },
  };
}

export function Clear(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const host = getHost();
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target;
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
          host.setTimeout(() => {
            store.focus();
          }, 0);
        };
        host.addEventListener($e, "click", handleClick);
        if (rest.onMounted) rest.onMounted(event);
        return () => {
          host.removeEventListener($e, "click", handleClick);
        };
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: FileInputCore },
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
      onMounted(event) {
        const $elm = (event as any).target as any;
        const updateDisplay = () => {
          host.patchStyle?.($elm, { display: loading$.value ? "" : "none" });
        };
        loading$._subscribe({ onChange: updateDisplay });
        updateDisplay();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: FileInputCore },
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
