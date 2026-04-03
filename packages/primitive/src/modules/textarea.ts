import { computed, ref, refobj } from "@timeless/reactive";
import { InputCore } from "@timeless/ui";

import { View, ViewProps, ViewChildren } from "@/primitive/view";
import { NativeTextarea } from "@/native/textarea";
import { getHost } from "@/host";

export function Root(
  props: ViewProps & { store?: InputCore<any> },
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Textarea(
  props: ViewProps & { id?: string | undefined; store: InputCore<any> },
) {
  return NativeTextarea(props);
}

export function Value(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
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
          host.setTextContent($e, value$.value);
        };
        value$._subscribe({ onChange: updateText });
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
  const host = getHost();
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted(event) {
        const $e = (event as any).target as any;
        const handleClick = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          store.clear();
        };
        host.addEventListener($e, "click", handleClick);
        if (rest.onMounted) rest.onMounted(event);
        return () => {
          host.removeEventListener($e, "click", handleClick);
        };
      },
    },
    children,
  );
}

export function Loading(
  props: ViewProps & { store: InputCore<any> },
  children?: ViewChildren,
) {
  const host = getHost();
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
        const $elm = (event as any).target as HTMLDivElement;
        const updateDisplay = () => {
          host.patchStyle?.($elm, { display: loading$.value ? "" : "none" });
        };
        loading$._subscribe({ onChange: updateDisplay });
        updateDisplay();
        if (rest.onMounted) rest.onMounted(event);
      },
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
  const host = getHost();
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
          if (disabled$.value) {
            host.setAttribute($elm, "data-disabled", "true");
          } else {
            host.removeAttribute($elm, "data-disabled");
          }
        };
        disabled$._subscribe({ onChange: updateState });
        updateState();
        if (rest.onMounted) rest.onMounted(event);
      },
    },
    children,
  );
}
