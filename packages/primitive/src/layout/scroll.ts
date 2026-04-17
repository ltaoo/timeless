import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Box } from "@/content/box";

export type ScrollBarVisibility = "auto" | "hidden" | "visible" | "scroll";

export type ScrollViewProps = ViewProps & {
  horizontal?: ScrollBarVisibility;
  vertical?: ScrollBarVisibility;
  contentWidth?: number | string;
  contentHeight?: number | string;
};

type ScrollViewState = {
  horizontal: ScrollBarVisibility;
  vertical: ScrollBarVisibility;
};

export function ScrollView(props: ScrollViewProps, children?: ViewChildren) {
  const {
    horizontal = "auto",
    vertical = "auto",
    contentWidth,
    contentHeight,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<ScrollViewState>(rest, {
    horizontal,
    vertical,
  } as ScrollViewState);
  const state = box$.state;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      state.horizontal = horizontal;
      state.vertical = vertical;
    },
    scrollTo(x?: number, y?: number) {
      if ($elm) {
        if (x !== undefined) $elm.scrollLeft = x;
        if (y !== undefined) $elm.scrollTop = y;
      }
    },
    scrollToTop() {
      if ($elm) $elm.scrollTop = 0;
    },
    scrollToBottom() {
      if ($elm) $elm.scrollTop = $elm.scrollHeight;
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "scroll-view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    methods,
  };
}
