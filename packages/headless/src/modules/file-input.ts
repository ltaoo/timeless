import { cn, ref, refobj } from "@timeless/reactive";
import { FileInputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "../primitive/view";

export function Root(
  props: ViewProps & { store?: FileInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: FileInputCore; id?: string },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = document.createElement("input");

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
      $elm.type = "file";
      $elm.disabled = disabled$.value;
      if (accept$.value) {
        $elm.setAttribute("accept", accept$.value);
      }
      if (multiple$.value) {
        $elm.setAttribute("multiple", "");
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
          $elm.className = v.join(" ");
        },
      });
      $elm.className = class$.toString();

      // Subscribe to reactive state changes
      accept$._subscribe({
        onChange(v: any) {
          if (v) {
            $elm.setAttribute("accept", v);
          } else {
            $elm.removeAttribute("accept");
          }
        },
      });
      multiple$._subscribe({
        onChange(v: any) {
          if (v) {
            $elm.setAttribute("multiple", "");
          } else {
            $elm.removeAttribute("multiple");
          }
        },
      });
      disabled$._subscribe({
        onChange(v: any) {
          $elm.disabled = v;
        },
      });

      // Event handlers
      $elm.addEventListener("change", (e: Event) => {
        store.handleChange(e);
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

export function Clear(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted($e) {
        $e.addEventListener("click", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
          setTimeout(() => {
            store.focus();
          }, 0);
        });
        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
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
          $elm.style.display = loading$.value ? "" : "none";
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
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
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
            $elm.setAttribute("data-disabled", "true");
          } else {
            $elm.removeAttribute("data-disabled");
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
