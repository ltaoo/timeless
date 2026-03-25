import { ref, refobj, computed } from "@timeless/reactive";
import { ScrollViewCore } from "@timeless/ui";

import {
  View,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "../primitive/view";

declare const Timeless: {
  web: {
    provide_ui_scroll_view_indicator: (
      store: ScrollViewCore,
      $elm: HTMLElement,
    ) => void;
    provide_ui_scroll_view_scroll: (
      store: ScrollViewCore,
      $elm: HTMLElement,
    ) => void;
  };
};

export function Root(
  props: ViewProps & { store: ScrollViewCore },
  children: ViewChildren,
): TimelessElement {
  const { store, class: cls, ...rest } = props;

  const view$ = View(
    {
      ...rest,
      class: cls,
      // "data-scroll-view-root": "",
    },
    children,
  );

  return {
    t: "view",
    $elm: view$.$elm,
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      view$.onUnmounted();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    render() {
      const $elm = view$.render();
      store.setRect({
        width: view$.$elm.clientWidth,
        height: view$.$elm.clientHeight,
      });
      if (typeof Timeless !== "undefined" && Timeless.web) {
        Timeless.web.provide_ui_scroll_view_scroll(store, view$.$elm);
      }
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
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
      if (typeof Timeless !== "undefined" && Timeless.web) {
        Timeless.web.provide_ui_scroll_view_indicator(store, indicator$.$elm);
      }
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
