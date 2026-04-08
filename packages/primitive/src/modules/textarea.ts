import { computed, ref, refobj } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Textarea as NativeTextarea } from "@/input/textarea";
import { styleNames } from "@/style";
import { ListenerManager } from "@/util/listener";

type Provider = {
  provide_ui_input: (store: InputCore<any>, $input: any) => void;
};

let global_provider: Provider | undefined;

export function setTextareaProvider(provider: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Textarea(
  props: ViewProps & { id?: string | undefined; store: InputCore<any> },
) {
  const { store } = props;

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

  return NativeTextarea({
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
  });
}

export function Value(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  // const host = getHost();
  const { store, ...rest } = props;
  const value$ = refobj(store.value || "");

  store.onStateChange(() => {
    value$.as(store.value || "");
  });

  return View(
    {
      ...rest,
      // onMounted(event) {
      //   const $e = (event as any).target as any;
      //   const updateText = () => {
      //     host.setTextContent($e, value$.value);
      //   };
      //   value$.subscribe({ onChange: updateText });
      //   updateText();
      //   if (rest.onMounted) rest.onMounted(event);
      // },
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
  // const host = getHost();
  const { store, ...rest } = props;
  const loading_ = ref(store.loading || false);

  if (store.onStateChange) {
    store.onStateChange(() => {
      loading_.as(store.loading || false);
    });
  }

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
      //   const $elm = (event as any).target as HTMLDivElement;
      //   const updateDisplay = () => {
      //     host.patchStyle?.($elm, { display: loading$.value ? "" : "none" });
      //   };
      //   loading$.subscribe({ onChange: updateDisplay });
      //   updateDisplay();
      //   if (rest.onMounted) rest.onMounted(event);
      // },
    },
    children,
  );
}

export function Count(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const count_ = computed(state_, (t) =>
    t.value ? String(t.value).length : 0,
  );
  // const max_ = computed(state_, (t) => t.max);

  store.onStateChange(() => {
    state_.as(store.state);
  });

  return View({ ...rest }, [count_]);
}

export function Disabled(
  props: ViewProps & { store: InputCore<any> },
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
    },
    children,
  );
}
