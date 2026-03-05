import { cn, ref, refobj } from "@timeless/reactive";

import { tp, merge } from "./theme";
import { View, ViewProps, ViewChildren } from "./view";
import { InputCore } from "@timeless/ui";

export function Root(
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: InputCore<any>; id?: string; theme?: any },
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
        $elm.setAttribute(`data-${k}`, dataset[k]);
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
      onMounted($e) {
        const updateDisplay = () => {
          $e.style.display = loading$.value ? "" : "none";
        };
        loading$._subscribe({ onChange: updateDisplay });
        updateDisplay();
        if (rest.onMounted) rest.onMounted($e);
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
      onMounted($e) {
        const updateState = () => {
          if (disabled$.value) {
            $e.setAttribute("data-disabled", "true");
          } else {
            $e.removeAttribute("data-disabled");
          }
        };
        disabled$._subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}
