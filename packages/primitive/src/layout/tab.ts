import { View, ViewProps } from "@/content/view";
import {
  isElement,
  resolve_children,
  TimelessElement,
  ViewChildren,
} from "@/content/type";
import { Show } from "@/reactive/show";
import { computed, DerivedRef, isRef, ref, Ref } from "@timeless/inner-reactive";
import { Text } from "@/content/text";

export type TabPosition = "top" | "bottom" | "left" | "right";

export type TabViewProps = ViewProps & {
  tab?: string | Ref<string> | DerivedRef<string>;
  position?: TabPosition;
  panels: {
    tab: string;
    label: string;
    content: ViewChildren;
  }[];
  onChange?: (index: number) => void;
};

type TabViewState = {
  tab: null | string;
  tabs: {
    tab: string;
    label: string;
  }[];
  position: TabPosition;
  children: (TimelessElement | null)[];
};

export function TabView(props: TabViewProps, children?: ViewChildren) {
  const { tab, panels, position = "top", onChange, ...rest } = props;

  let $elm: any = null;

  const state: TabViewState = {
    tab: null,
    position,
    tabs: [],
    children: [],
  };

  const methods = {
    subscribe_props() {
      if (tab !== undefined) {
        if (isRef(tab)) {
          state.tab = tab.value;
          tab.subscribe({
            onChange(v) {
              state.tab = v;
            },
          });
        } else {
          state.tab = tab;
        }
      }
      state.tabs = panels.map((p) => {
        return {
          tab: p.tab,
          label: p.label,
        };
      });
    },
    resolve_children() {
      if (state.tab === null) {
        return;
      }
      const matched = panels.find((p) => p.tab === state.tab);
      if (!matched) {
        return;
      }
      const resolved = resolve_children(matched.content);
      if (!resolved) {
        return;
      }
      for (let i = 0; i < resolved.length; i++) {
        const child = resolved[i];
        // console.log("for children", child);
        (() => {
          if (child === null) {
            state.children[i] = null;
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (child) {
            state.children[i] = Text(String(child));
            return;
          }
          state.children[i] = null;
        })();
      }
    },
  };

  methods.subscribe_props();
  methods.resolve_children();

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
    handleClickTab(tab: { tab: string; label: string }) {
      if (state.tab === tab.tab) {
        return;
      }
      if (!$elm) {
        return;
      }
      const fromIndex = panels.findIndex((p) => p.tab === state.tab);
      const toIndex = panels.findIndex((p) => p.tab === tab.tab);
      state.tab = tab.tab;
      methods.resolve_children();
      $elm.switchPanel(state.children, { from: fromIndex, to: toIndex });
    },
  };
}

function resolve_tab_panes(children?: ViewChildren): any[] {
  if (!children) return [];
  if (typeof children === "function") {
    const result = children();
    return Array.isArray(result) ? result : [result];
  }
  if (Array.isArray(children)) return children;
  return [children];
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
