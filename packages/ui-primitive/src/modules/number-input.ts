import { ref, combine } from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  NumberInput as NativeNumberInput,
  ListenerManager,
  VNodeEvent,
} from "../core";
import { NumberInputCore } from "@timeless/inner-vm";

export function Root(
  props: ViewProps & { store?: NumberInputCore },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(props: ViewProps & { store: NumberInputCore }) {
  const { store, ...rest } = props;

  const listener$ = ListenerManager();

  const value_ = ref(store.value);
  const placeholder_ = ref(store.placeholder || "");
  const disabled_ = ref(store.disabled || false);

  listener$.add(
    store.onStateChange((state) => {
      console.log("the value is changed", state.value);
      value_.as(state.value);
      placeholder_.as(state.placeholder || "");
      disabled_.as(state.disabled || false);
    }),
  );

  return NativeNumberInput({
    ...rest,
    value: value_,
    placeholder: placeholder_,
    disabled: disabled_,
    onMounted(event) {
      if (rest.onMounted) {
        listener$.add(rest.onMounted(event));
      }
    },
    onUnmounted() {
      value_.destroy();
      placeholder_.destroy();
      disabled_.destroy();
      listener$.clean();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  });
}

export function IncreaseButton(
  props: ViewProps & { store: NumberInputCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  const can_increase_ = ref(store.canIncrease());
  const disabled_ = ref(store.disabled || false);
  const disabled_derived_ = combine(
    { disabled: disabled_, can_increase: can_increase_ },
    (t) => {
      return t.disabled || !t.can_increase;
    },
  );
  const listener$ = ListenerManager();

  return View(
    {
      ...rest,
      dataset: {
        disabled: disabled_derived_,
      },
      attributes: {
        "aria-disabled": disabled_derived_,
      },
      onMounted(event) {
        const $e = event.target;
        listener$.add(
          store.onStateChange(() => {
            can_increase_.as(store.canIncrease());
            disabled_.as(store.disabled || false);
          }),
        );
        // const handleMouseDown = (e: VNodeEvent) => {
        //   e.preventDefault();
        // };
        // const handleClick = (e: VNodeEvent) => {
        //   e.preventDefault();
        //   e.stopPropagation();
        //   store.increase();
        // };
        // listener$.add($e.addEventListener("mousedown", handleMouseDown));
        // listener$.add($e.addEventListener("click", handleClick));
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.clean;
      },
      onMouseDown(e) {
        e.preventDefault();
      },
      onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        store.increase();
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

  const can_decrease_ = ref(store.canDecrease());
  const disabled_ = ref(store.disabled || false);
  const disabled_derived_ = combine(
    { disabled: disabled_, can_decrease: can_decrease_ },
    (t) => {
      return t.disabled || !t.can_decrease;
    },
  );
  const listener$ = ListenerManager();

  return View(
    {
      ...rest,
      dataset: {
        disabled: disabled_derived_,
      },
      attributes: {
        "aria-disabled": disabled_derived_,
      },
      onMounted(event) {
        const $e = event.target;
        listener$.add(
          store.onStateChange(() => {
            can_decrease_.as(store.canDecrease());
            disabled_.as(store.disabled || false);
          }),
        );
        const handleMouseDown = (e: VNodeEvent) => {
          e.preventDefault();
        };
        const handleClick = (e: VNodeEvent) => {
          e.preventDefault();
          e.stopPropagation();
          store.decrease();
        };
        listener$.append([
          $e.addEventListener("mousedown", handleMouseDown),
          $e.addEventListener("click", handleClick),
        ]);
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        listener$.clean;
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
  const value_ = ref(store.value);

  const listener$ = ListenerManager();

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = event.target;

        listener$.add(
          store.onStateChange(() => {
            value_.as(store.value);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        listener$.clean;
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
