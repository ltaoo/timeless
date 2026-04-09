import { ref, isRef } from "@timeless/reactive";
import { FileInputCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Input as NativeInput } from "@/input/input";

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
  return NativeInput(props);
}

export function Clear(
  props: ViewProps & { store: FileInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = event.target;
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
          setTimeout(() => {
            store.focus();
          }, 0);
        };
        $e.addEventListener("click", handleClick);
        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          $e.removeEventListener("click", handleClick);
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
        const $elm = event.target;
        const updateDisplay = () => {
          $elm.setStyleValue("display", loading$.value ? "" : "none");
        };
        loading$.subscribe({ onChange: updateDisplay });
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
        const $elm = event.target;
        const updateState = () => {
          if (disabled$.value) {
            $elm.setAttribute("data-disabled", "true");
          } else {
            $elm.removeAttribute("data-disabled");
          }
        };
        disabled$.subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}
