import { ref, computed } from "@timeless/reactive";
import { WaterfallModel, WaterfallColumnModel, WaterfallCellModel } from "@timeless/ui";

import { View, ViewChildren, ViewProps, TimelessElement } from "./view";

export function Root(
  props: ViewProps & { store: WaterfallModel<any> },
  children: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;

  const innerHeight = ref(store.state.height);
  store.onStateChange((v) => {
    innerHeight.as(v.height);
  });

  const inner$ = View(
    {
      style: computed(innerHeight, (h) => `height: ${h}px; position: relative;`),
    },
    children,
  );

  const view$ = View(
    {
      ...rest,
      style: "position: relative; overflow-y: auto; height: 100%;",
    },
    [inner$],
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
      store.methods.setClientHeight(view$.$elm.clientHeight);
      (view$.$elm as HTMLElement).addEventListener("scroll", () => {
        store.methods.handleScroll({ scrollTop: (view$.$elm as HTMLElement).scrollTop });
      });
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}

export function Column(
  props: ViewProps & { store: WaterfallColumnModel<any> },
  children?: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;

  const columnHeight = ref(store.state.height);
  store.onStateChange((v) => {
    columnHeight.as(v.height);
  });

  const view$ = View(
    {
      ...rest,
      style: computed(columnHeight, (h) => `position: relative; height: ${h}px;`),
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
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}

export function Cell(
  props: ViewProps & { store: WaterfallCellModel<any> },
  children?: ViewChildren,
): TimelessElement {
  const { store, ...rest } = props;

  const top = ref(store.state.top);
  const height = ref(store.state.height);
  store.onStateChange((v) => {
    top.as(v.top);
    height.as(v.height);
  });

  const style = computed(top, (t) => {
    const h = height.value;
    return `position: absolute; top: ${t}px; height: ${h}px; width: 100%;`;
  });

  const view$ = View(
    {
      ...rest,
      style,
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
      if (props.onMounted) {
        props.onMounted($elm);
      }
      return $elm;
    },
  };
}
