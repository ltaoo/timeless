import {
  refobj,
  computed,
  classNames,
  sn,
  combine,
} from "@timeless/reactive";
import { CascaderCore, CascaderOption } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "./view";
import { Portal as NativePortal } from "./portal";
import { Presence } from "./presence";
import * as PopperPrimitive from "./popper";
import { h } from "./h";
import { Show } from "./show";
import { For } from "./for";

export function Root(
  props: ViewProps & { store: CascaderCore<any> },
  children?: ViewChildren,
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.popper,
    },
    children,
  );
}

export function Trigger(
  props: ViewProps & { store: CascaderCore<any>; id?: string },
  children: ViewChildren = [],
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const events: any[] = [];

  const _input$ = View(
    {
      as: "input",
      type: "text",
      id: props.store.id || rest.id,
      style:
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
      onFocus() {
        if (props.store.presence.state.visible) {
          return;
        }
        props.store.presence.show();
        props.store.popper.place();
      },
      onClick(e: Event) {
        e.stopPropagation();
      },
      onMounted($elm: HTMLInputElement) {
        const value = store.state.value;
        $elm.value = value ? value.join(",") : "";
        events.push(
          store.onStateChange(() => {
            const v = store.state.value;
            $elm.value = v ? v.join(",") : "";
          }),
        );
      },
    },
    [],
  );

  return View(
    {
      ...rest,
      onMounted($elm: HTMLDivElement) {
        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );

        $elm.addEventListener("pointerdown", (e: PointerEvent) => {
          e.stopPropagation();
          if ((e.target as HTMLElement).tagName === "INPUT") {
            return;
          }
          if (store.disabled) {
            return;
          }
          if (props.store.presence.state.visible) {
            props.store.presence.hide();
            return;
          }
          props.store.presence.show();
          props.store.popper.place();
        });

        if (rest.onMounted) {
          rest.onMounted($elm);
        }
      },
      onUnmounted() {
        for (const fn of events) {
          if (typeof fn === "function") fn();
        }
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [_input$, ...children],
  );
}

export function Value(
  props: ViewProps & { store: CascaderCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  return View(
    {
      ...rest,
      as: "span",
    },
    [
      computed(state, (d) => {
        if (d.displayText) {
          return d.displayText;
        }
        return d.placeholder || "请选择";
      }),
    ],
  );
}

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
}

export function Content(
  props: ViewProps & {
    store: CascaderCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.presence.state);

  store.presence.onStateChange((v) => {
    presence_.as(v);
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        store.focusNextOption();
        break;
      case "ArrowUp":
        e.preventDefault();
        store.focusPrevOption();
        break;
      case "ArrowRight":
        e.preventDefault();
        store.focusNextPanel();
        break;
      case "ArrowLeft":
        e.preventDefault();
        store.focusPrevPanel();
        break;
      case "Enter":
        e.preventDefault();
        store.selectFocusedOption();
        break;
      case "Escape":
        e.preventDefault();
        store.hide();
        break;
    }
  };

  return h(
    Show,
    {
      when: computed(presence_, (t) => {
        return t.mounted;
      }),
    },
    [
      NativePortal({}, [
        PopperPrimitive.Content(
          {
            store: store.popper,
            onDismiss() {
              store.hide();
            },
          },
          [
            View(
              {
                ...rest,
                "tab-index": 0,
                class: classNames([
                  rest.class,
                  computed(presence_, (t) => {
                    return [
                      t.enter && animation?.in ? animation.in : "",
                      t.exit && animation?.out ? animation.out : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }),
                ]),
                onKeyDown: handleKeyDown,
                onMounted($elm: HTMLElement) {
                  setTimeout(() => {
                    $elm.focus();
                  }, 0);
                  if (rest.onMounted) {
                    rest.onMounted($elm);
                  }
                },
              },
              children,
            ),
          ],
        ),
      ]),
    ],
  );
}

export function Panels(
  props: ViewProps & { store: CascaderCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Panel(
  props: ViewProps & {
    store: CascaderCore<any>;
    panelIndex: number;
    options: (CascaderOption<any> & { selected: boolean; focused: boolean })[];
  },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Item(
  props: ViewProps & {
    store: CascaderCore<any>;
    panelIndex: number;
    option: CascaderOption<any>;
  },
  children: ViewChildren,
) {
  const { store, panelIndex, option, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.clickOption(panelIndex, option);
      },
      onMouseEnter() {
        store.hoverOption(panelIndex, option);
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View({ ...props, as: "span" }, children);
}

export function ItemIndicator(
  props: ViewProps & {
    store: CascaderCore<any>;
    hasChildren: boolean;
  },
  children: ViewChildren,
) {
  const { store, hasChildren, ...rest } = props;

  return h(
    Show,
    {
      when: hasChildren,
    },
    [View(rest, children)],
  );
}

export function Search(
  props: ViewProps & { store: CascaderCore<any> },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return h(
    Show,
    {
      when: computed(state_, (s) => Boolean(s.search)),
    },
    [
      View(
        {
          ...rest,
          as: "input",
          type: "text",
          onMounted($elm: HTMLInputElement) {
            $elm.placeholder = store.state.searchPlaceholder;
            $elm.value = store.state.searchKeyword;

            $elm.addEventListener("input", (e: Event) => {
              const target = e.target as HTMLInputElement;
              store.setSearchKeyword(target.value);
            });

            store.onStateChange((s) => {
              $elm.placeholder = s.searchPlaceholder;
              if ($elm.value !== s.searchKeyword) {
                $elm.value = s.searchKeyword;
              }
            });

            setTimeout(() => {
              $elm.focus();
            }, 0);

            if (rest.onMounted) {
              rest.onMounted($elm);
            }
          },
          onClick(e: Event) {
            e.stopPropagation();
          },
          onKeyDown(e: KeyboardEvent) {
            e.stopPropagation();
          },
        },
        children,
      ),
    ],
  );
}

export function SearchResults(
  props: ViewProps & { store: CascaderCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return h(
    Show,
    {
      when: computed(
        state_,
        (s) => Boolean(s.search && s.searchKeyword && s.searchResults.length > 0),
      ),
    },
    [View(rest, children)],
  );
}

export function SearchResultItem(
  props: ViewProps & {
    store: CascaderCore<any>;
    result: { path: CascaderOption<any>[]; value: any[] };
  },
  children: ViewChildren,
) {
  const { store, result, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.selectSearchResult(result);
      },
    },
    children,
  );
}
