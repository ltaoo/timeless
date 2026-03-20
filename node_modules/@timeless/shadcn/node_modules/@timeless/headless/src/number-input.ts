import { cn, ref, refobj } from "@timeless/reactive";
import { NumberInputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "./view";

export function Root(
  props: ViewProps & { store?: NumberInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: ViewProps & { store: NumberInputCore; id?: string },
) {
  const { store, style: st, class: cls, dataset = {}, id, ...rest } = props;

  const $elm = document.createElement("input");
  $elm.type = "text";
  $elm.inputMode = "decimal";

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
      if (id) {
        $elm.id = id;
      }

      $elm.value = displayValue$.value;
      $elm.placeholder = placeholder$.value;
      $elm.disabled = disabled$.value;
      $elm.setAttribute("autocomplete", "off");
      $elm.setAttribute("autocorrect", "off");

      Object.keys(dataset || {}).forEach((k) => {
        $elm.setAttribute(`data-${k}`, dataset[k]);
      });

      class$._subscribe({
        onChange(v: any) {
          $elm.className = v.join(" ");
        },
      });
      $elm.className = class$.toString();

      displayValue$._subscribe({
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

export function IncreaseButton(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
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
      onMounted($e: HTMLDivElement) {
        const updateState = () => {
          const canIncrease = canIncrease$.value;
          const disabled = disabled$.value;
          if (disabled || !canIncrease) {
            $e.setAttribute("data-disabled", "true");
            $e.setAttribute("aria-disabled", "true");
          } else {
            $e.removeAttribute("data-disabled");
            $e.removeAttribute("aria-disabled");
          }
        };
        canIncrease$._subscribe({ onChange: updateState });
        disabled$._subscribe({ onChange: updateState });
        updateState();

        $e.addEventListener("mousedown", (e: any) => {
          e.preventDefault();
        });
        $e.addEventListener("click", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.increase();
        });

        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}

export function DecreaseButton(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
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
      onMounted($e: HTMLDivElement) {
        const updateState = () => {
          const canDecrease = canDecrease$.value;
          const disabled = disabled$.value;
          if (disabled || !canDecrease) {
            $e.setAttribute("data-disabled", "true");
            $e.setAttribute("aria-disabled", "true");
          } else {
            $e.removeAttribute("data-disabled");
            $e.removeAttribute("aria-disabled");
          }
        };
        canDecrease$._subscribe({ onChange: updateState });
        disabled$._subscribe({ onChange: updateState });
        updateState();

        $e.addEventListener("mousedown", (e: any) => {
          e.preventDefault();
        });
        $e.addEventListener("click", (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.decrease();
        });

        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}

export function Value(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const value$ = ref(store.value);

  store.onStateChange(() => {
    value$.as(store.value);
  });

  return View(
    {
      ...rest,
      onMounted($e) {
        const updateText = () => {
          $e.textContent = value$.value !== null ? String(value$.value) : "";
        };
        value$._subscribe({ onChange: updateText });
        updateText();
        if (rest.onMounted) rest.onMounted($e);
      },
    },
    children,
  );
}

export function Disabled(
  props: ViewProps & { store: NumberInputCore },
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
