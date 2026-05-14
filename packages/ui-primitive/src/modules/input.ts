import { ref, refobj, isRef, computed, ShowProps } from "@timeless/timeless";
import {
  View,
  ViewProps,
  Show,
  ViewChildren,
  Input as NativeInput,
  InputProps,
  styleNames,
  ListenerManager,
} from "@timeless/timeless";
import { InputCore } from "@timeless/ui-vm";

type Provider = {
  provide_ui_input: (store: InputCore<any>, $input: any) => void;
};

let global_provider: Provider | undefined;

export function setInputProvider(provider: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMouseEnter() {
        store.handleMouseEnter();
      },
      onMouseLeave() {
        store.handleMouseLeave();
      },
    },
    children,
  );
}

export function Input(
  props: InputProps & { store: InputCore<any>; id?: string },
) {
  const { store } = props;

  const value_ = refobj(store.value || "");
  const placeholder_ = ref(store.placeholder || "");
  const disabled_ = ref(store.disabled || false);

  const listener$ = ListenerManager([value_, placeholder_, disabled_]);

  return NativeInput({
    ...props,
    placeholder: placeholder_,
    disabled: disabled_,
    value: value_,
    onMounted(event) {
      listener$.push(
        store.onStateChange((state) => {
          value_.as(state.value || "");
          placeholder_.as(state.placeholder || "");
          disabled_.as(state.disabled || false);
        }),
      );
      const $elm = event.target;
      // console.log("check has global_provider", global_provider);
      if (global_provider) {
        global_provider.provide_ui_input(store, $elm.get$elm());
      }
      if (props.onMounted) {
        listener$.add(props.onMounted(event));
      }
      return listener$.destroy;
    },
    onInput(e) {
      // console.log("onInput", e.target.value);
      if (e.target) {
        // @ts-ignore
        store.setValue(e.target.value);
      }
    },
    onFocus() {
      store.handleFocus();
    },
    onBlur() {
      store.handleBlur();
    },
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
  const { store, ...rest } = props;

  const visible_ = ref(store.state.hovering);

  // return Show({
  //   when: visible_,
  //   onMounted(event) {
  //     store.onStateChange((v) => {
  //       visible_.as(v.hovering);
  //     });
  //     if (rest.onMounted) {
  //       rest.onMounted(event);
  //     }
  //   },
  //   ok() {
  //     return View(
  //       {
  //         onMouseDown(event) {
  //           event.preventDefault();
  //         },
  //         onClick(event) {
  //           event.stopPropagation();
  //           store.clear();
  //           store.focus();
  //         },
  //       },
  //       children,
  //     );
  //   },
  // });
  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          opacity: computed(visible_, (t) => (t ? 1 : 0)),
          "pointer-events": computed(visible_, (t) => (t ? "auto" : "none")),
        },
      ]),
      onMounted(event) {
        store.onStateChange((v) => {
          visible_.as(v.hovering);
        });
        if (rest.onMounted) {
          return rest.onMounted(event);
        }
      },
      onMouseDown(event) {
        event.preventDefault();
      },
      onClick(event) {
        event.stopPropagation();
        store.clear();
        store.focus();
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
    },
    children,
  );
}
