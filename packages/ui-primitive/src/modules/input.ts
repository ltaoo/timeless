import { ref, refobj, isRef, computed } from "@timeless/timeless";
import {
  View,
  ViewProps,
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
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Input(
  props: InputProps & { store: InputCore<any>; id?: string },
) {
  const { store } = props;

  const value$ = refobj(store.value || "");
  const placeholder$ = ref(store.placeholder || "");
  const disabled$ = ref(store.disabled || false);

  const listener$ = ListenerManager();
  return NativeInput({
    ...props,
    placeholder: placeholder$,
    disabled: disabled$,
    value: value$,
    onMounted(event) {
      listener$.push(
        store.onStateChange((state) => {
          value$.as(state.value || "");
          placeholder$.as(state.placeholder || "");
          disabled$.as(state.disabled || false);
        }),
      );
      const $elm = event.target;
      if (global_provider) {
        global_provider.provide_ui_input(store, $elm.get$elm());
      }
      if (props.onMounted) {
        listener$.add(props.onMounted(event));
      }
      return listener$.destroy;
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
