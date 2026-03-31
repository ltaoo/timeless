import { ref, refobj, computed } from "@timeless/reactive";
import { ScrollViewCore } from "@timeless/ui";

import {
  View,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "../primitive/view";

type Provider = Partial<{
  provide_ui_scroll_view_indicator: (store: ScrollViewCore, $elm: HTMLElement) => void;
  provide_ui_scroll_view_scroll: (store: ScrollViewCore, $elm: HTMLElement) => void;
}>;

let global_provider: Provider | undefined;

export function setScrollViewProvider(provider?: Provider) {
  global_provider = provider;
}

export function Root(
  props: ViewProps & { store: ScrollViewCore },
  children: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onMounted($elm: HTMLElement) {
        store.setRect({
          width: $elm.clientWidth,
          height: $elm.clientHeight,
        });
        const provide = global_provider?.provide_ui_scroll_view_scroll;
        if (typeof provide === "function") provide(store, $elm);
        if (props.onMounted) {
          props.onMounted($elm);
        }
      },
    },
    children,
  );
}

export function Indicator(
  props: ViewProps & { store: ScrollViewCore },
  children: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;

  const indicator$ = View(
    {
      ...rest,
      // "data-scroll-view-indicator": "",
    },
    children,
  );

  return {
    t: "view",
    $elm: indicator$.$elm,
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      indicator$.onUnmounted();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    render() {
      const $elm = indicator$.render();
      const provide = global_provider?.provide_ui_scroll_view_indicator;
      if (typeof provide === "function") provide(store, indicator$.$elm);
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}

export function Progress(
  props: ViewProps & { store: ScrollViewCore },
  children?: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;
  const rotate = ref(false);
  const visible = ref(true);

  store.inDownOffset(() => {
    rotate.as(false);
    visible.as(true);
  });

  store.outDownOffset(() => {
    rotate.as(true);
    visible.as(false);
  });

  const progress$ = View(
    {
      ...rest,
      // "data-scroll-view-progress": "",
      style: computed(visible, (v) =>
        v ? "display: block;" : "display: none;",
      ),
    },
    children ??
      View({
        class: "inline-flex justify-center items-center w-full h-full",
        style: "transition: all 300ms;",
      }),
  );

  return {
    t: "view",
    $elm: progress$.$elm,
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      progress$.onUnmounted();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    render() {
      const $elm = progress$.render();
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}
