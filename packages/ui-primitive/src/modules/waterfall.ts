import { ref, computed } from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  TimelessElement,
} from "../core";
import {
  WaterfallModel,
  WaterfallColumnModel,
  WaterfallCellModel,
} from "@timeless/inner-vm";

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
      style: {
        height: computed(innerHeight, (h) => `${h}px`),
        position: "relative",
      },
    },
    children,
  );

  const view$ = View(
    {
      ...rest,
      style: { position: "relative", "overflow-y": "auto", height: "100%" },
    },
    // @ts-ignore
    [inner$],
  );

  return {
    t: "view",
    $elm: view$.$elm,
    state: {},
    children: [],
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
      if (view$.onUnmounted) {
        view$.onUnmounted();
      }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    // render() {
    //   const $elm = view$.render();
    //   if (props.onMounted) {
    //     props.onMounted({ target: $elm });
    //   }
    //   return $elm;
    // },
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
      style: {
        position: "relative",
        height: computed(columnHeight, (h) => `${h}px`),
      },
    },
    children,
  );

  return {
    t: "view",
    $elm: view$.$elm,
    state: {},
    children: [],
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
      if (view$.onUnmounted) {
        view$.onUnmounted();
      }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    // render() {
    //   const $elm = view$.render();
    //   if (props.onMounted) {
    //     props.onMounted({ target: $elm });
    //   }
    //   return $elm;
    // },
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

  const view$ = View(
    {
      ...rest,
      style: {
        display: computed(cellStyle, (s) => (s.bound ? undefined : "none")),
        position: "absolute",
        top: computed(cellStyle, (s) => `${s.top}px`),
        height: computed(cellStyle, (s) => `${s.height}px`),
        width: "100%",
      },
    },
    children,
  );

  return {
    t: "view",
    $elm: view$.$elm,
    state: {},
    children: [],
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
      if (view$.onUnmounted) {
        view$.onUnmounted();
      }
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
    // render() {
    //   const $elm = view$.render();
    //   if (props.onMounted) {
    //     props.onMounted({ target: $elm });
    //   }
    //   return $elm;
    // },
  };
}
