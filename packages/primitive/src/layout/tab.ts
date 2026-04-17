import { ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";

export type TabPosition = "top" | "bottom" | "left" | "right";

export type TabViewProps = ViewProps & {
  activeIndex?: number;
  position?: TabPosition;
  onChange?: (index: number) => void;
};

type TabViewState = {
  activeIndex: number;
  position: TabPosition;
  children: any[];
};

export function TabView(props: TabViewProps, children?: ViewChildren) {
  const { activeIndex = 0, position = "top", onChange, ...rest } = props;

  let $elm: any = null;
  const state: TabViewState = {
    activeIndex,
    position,
    children: [],
  };

  if (children) {
    if (typeof children === "function") {
      const result = children();
      state.children = Array.isArray(result) ? result : [result];
    } else if (Array.isArray(children)) {
      state.children = children;
    } else {
      state.children = [children];
    }
  }

  return {
    t: "tab-view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    children: state.children,
  };
}

export type TabPaneProps = ViewProps & {
  label?: string;
  icon?: string;
};

type TabPaneState = {
  label: string;
  icon?: string;
  children: any[];
};

export function TabPane(props: TabPaneProps, children?: ViewChildren) {
  const { label = "", icon, ...rest } = props;

  let $elm: any = null;
  const state: TabPaneState = {
    label,
    icon,
    children: [],
  };

  if (children) {
    if (typeof children === "function") {
      const result = children();
      state.children = Array.isArray(result) ? result : [result];
    } else if (Array.isArray(children)) {
      state.children = children;
    } else {
      state.children = [children];
    }
  }

  return {
    t: "tab-pane",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    children: state.children,
  };
}
