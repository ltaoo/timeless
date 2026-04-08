import { ref, refobj, isRef, computed } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { InputProps, Input as NativeInput } from "@/input/input";
import { styleNames } from "@/style/index";
import { ListenerManager } from "@/util/listener";

type Provider = {
  provide_ui_input: (store: InputCore<any>, $input: any) => void;
};

let global_provider: Provider | undefined;

export function setInputProvider(provider: Provider) {
  console.log("set setInputProvider", provider);
  global_provider = provider;
}

export function Root(
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: InputProps & { store: InputCore<any>; id?: string },
) {
  const { store } = props;

  let $elm: any = null;
  let rendered = false;

  const value$ = refobj(store.value || "");
  const placeholder$ = ref(store.placeholder || "");
  const disabled$ = ref(store.disabled || false);

  const listener$ = ListenerManager();

  listener$.push(
    store.onStateChange((state) => {
      value$.as(state.value || "");
      placeholder$.as(state.placeholder || "");
      disabled$.as(state.disabled || false);
    }),
  );

  return NativeInput({
    ...props,
    placeholder: placeholder$,
    disabled: disabled$,
    value: value$,
    onMounted(event) {
      if (props.onMounted) {
        props.onMounted(event);
      }
      const $elm = event.target;
      if (global_provider) {
        console.log("inject provider", $elm);
        global_provider.provide_ui_input(store, $elm);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      listener$.clean();
    },
    onInput(e) {
      if (e.target) {
        // @ts-ignore
        store.setValue(e.target.value as string);
      }
    },
    // onChange(event) {
    //   // console.log("input something");
    //   if (event.target) {
    //     // @ts-ignore
    //     store.setValue(event.target.value as string);
    //   }
    // },
  });
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
      onMounted(event) {
        const $e = (event as any).target as any;
        const updateText = () => {
          // host.setTextContent($e, value$.value);
        };
        value$.subscribe({ onChange: updateText });
        updateText();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}

export function Clear(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  // const host = getHost();
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      // onMounted(event) {
      //   const $e = event.target;
      //   const handleClick = (e: any) => {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     store.clear();
      //     setTimeout(() => {
      //       store.focus();
      //     }, 0);
      //   };
      //   // host.addEventListener($e, "click", handleClick);
      //   $e.addEventListener("click", handleClick);
      //   if (rest.onMounted) rest.onMounted(event);
      // },
      onClick(event) {
        event.preventDefault();
        event.stopPropagation();
        store.focus();
        store.clear();
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
  const loading_ = ref(store.loading || false);

  store.onStateChange(() => {
    loading_.as(store.loading || false);
  });

  return View(
    {
      ...rest,
      style: styleNames([
        props.style,
        computed(loading_, (t) => {
          return t ? { display: "block" } : { display: "none" };
        }),
      ]),
      // onMounted(event) {
      //   const $elm = event.target;
      //   const updateDisplay = () => {
      //     $elm.setStyleValue("display", loading$.value ? "block" : "none");
      //   };
      //   loading$.subscribe({ onChange: updateDisplay });
      //   updateDisplay();
      //   if (rest.onMounted) {
      //     rest.onMounted(event);
      //   }
      // },
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
      onMounted(event) {
        const $elm = (event as any).target as HTMLDivElement;
        const updateState = () => {
          // if (disabled$.value) {
          //   host.setAttribute($elm, "data-disabled", "true");
          // } else {
          //   host.removeAttribute($elm, "data-disabled");
          // }
        };
        disabled$.subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}
