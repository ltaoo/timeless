import { ref, refobj, isRef } from "@timeless/reactive";
import { NumberInputCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Input as NativeInput } from "@/input/input";

export function Root(
  props: ViewProps & { store?: NumberInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(props: ViewProps & { store: NumberInputCore }) {
  return NativeInput(props);
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
      onMounted(event) {
        const $e = event.target;
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
        canIncrease$.subscribe({ onChange: updateState });
        disabled$.subscribe({ onChange: updateState });
        updateState();

        const handleMouseDown = (e: any) => {
          e.preventDefault();
        };
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.increase();
        };
        $e.addEventListener("mousedown", handleMouseDown);
        $e.addEventListener("click", handleClick);

        if (rest.onMounted) rest.onMounted(event);
        return () => {
          $e.removeEventListener("mousedown", handleMouseDown);
          $e.removeEventListener("click", handleClick);
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
        const $e = event.target;
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
        canDecrease$.subscribe({ onChange: updateState });
        disabled$.subscribe({ onChange: updateState });
        updateState();

        const handleMouseDown = (e: any) => {
          e.preventDefault();
        };
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.decrease();
        };
        $e.addEventListener("mousedown", handleMouseDown);
        $e.addEventListener("click", handleClick);

        if (rest.onMounted) rest.onMounted(event);
        return () => {
          $e.removeEventListener("mousedown", handleMouseDown);
          $e.removeEventListener("click", handleClick);
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
  const { store, ...rest } = props;
  const value$ = ref(store.value);

  store.onStateChange(() => {
    value$.as(store.value);
  });

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = event.target;
        const updateText = () => {
          // host.setTextContent(
          //   $e,
          //   value$.value !== null ? String(value$.value) : "",
          // );
        };
        value$.subscribe({ onChange: updateText });
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
  // const host = getHost();
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
