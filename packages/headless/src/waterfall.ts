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

  const cellStyle = ref({
    top: store.state.top,
    height: store.state.height,
    bound: store.state.bound ?? true,
  });
  store.onStateChange((v) => {
    cellStyle.as({
      top: v.top,
      height: v.height,
      bound: v.bound ?? true,
    });
  });

  const style = computed(cellStyle, (s) => {
    if (!s.bound) return 'display: none;';
    return `position: absolute; top: ${s.top}px; height: ${s.height}px; width: 100%;`;
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
