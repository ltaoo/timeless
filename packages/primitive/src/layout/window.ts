import { ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Box } from "@/content/box";

export type WindowViewProps = ViewProps & {
  width?: number | "100%";
  height?: number | "100%";
};

type WindowViewState = {
  width: number | "100%";
  height: number | "100%";
};

export function WindowView(props: WindowViewProps, children?: ViewChildren) {
  const { width = "100%", height = "100%", ...rest } = props;

  let $elm: any = null;
  const box$ = Box<WindowViewState>(rest, {
    width,
    height,
  } as WindowViewState);
  const state = box$.state;

  const methods = {
    // subscribe_props() {
    //   box$.methods.subscribe_props();
    //   state.width = width;
    //   state.height = height;
    // },
  };

  // methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "window",
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
