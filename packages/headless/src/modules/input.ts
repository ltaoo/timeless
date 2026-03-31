import { cn, ref, refobj, isRef } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "../primitive/view";

type Provider = Partial<{
  provide_ui_input: (store: InputCore<any>, $input: HTMLInputElement) => void;
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
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = document.createElement("input");

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
      $elm.type = type$.value;
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
      // if (m.style) $elm.style.cssText = m.style;

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
      type$._subscribe({
        onChange(v: any) {
          $elm.type = v;
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

export function Value(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
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
          $e.textContent = value$.value;
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
  props: ViewProps & { store: InputCore<any> },
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
  props: ViewProps & { store: InputCore<any> },
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
