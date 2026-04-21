import { ref, computed } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Show,
  TimelessElement,
} from "@timeless/timeless";
import { ScrollViewCore } from "@timeless/ui-vm";

type Provider = Partial<{
  provide_ui_scroll_view_indicator: (
    store: ScrollViewCore,
    $elm: HTMLElement,
  ) => void;
  provide_ui_scroll_view_scroll: (
    store: ScrollViewCore,
    $elm: HTMLElement,
  ) => void;
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
      dataset: {
        scrollview: "",
      },
      onMounted(event) {
        const $elm = event.target.get$elm() as HTMLDivElement;
        const { width, height } = $elm.getBoundingClientRect();

        const scrollWidth = $elm.scrollWidth;
        const scrollHeight = $elm.scrollHeight;
        const clientWidth = $elm.clientWidth;
        const clientHeight = $elm.clientHeight;
        const offsetWidth = $elm.offsetWidth;
        const offsetHeight = $elm.offsetHeight;
        const offsetTop = $elm.offsetTop;
        const offsetLeft = $elm.offsetLeft;
        const scrollTop = $elm.scrollTop;
        const scrollLeft = $elm.scrollLeft;

        store.handleMounted({
          width,
          height,
          scrollWidth,
          scrollHeight,
          clientWidth,
          clientHeight,
          offsetWidth,
          offsetHeight,
          offsetTop,
          offsetLeft,
          scrollTop,
          scrollLeft,
        });
        const provide = global_provider?.provide_ui_scroll_view_scroll;
        if (typeof provide === "function") {
          provide(store, $elm);
        }
        if (props.onMounted) {
          return props.onMounted(event);
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
      dataset: {
        "scroll-view-indicator": "",
      },
    },
    children,
  );

  return {
    t: "view",
    $elm: indicator$.$elm,
    state: {},
    onMounted(event) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
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
      style: { display: computed(visible, (v) => (v ? "block" : "none")) },
    },
    [
      Show({
        when: !!children,
        ok() {
          return [
            View({
              class: "inline-flex justify-center items-center w-full h-full",
              style: { transition: "all 300ms" },
            }),
          ];
        },
      }),
    ],
  );

  return {
    t: "view",
    $elm: progress$.$elm,
    state: {},
    onMounted(event) {
      if (props.onMounted) {
        return props.onMounted(event);
      }
    },
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
  };
}
