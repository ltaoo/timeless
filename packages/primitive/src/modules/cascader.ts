import { refobj, computed, ref } from "@timeless/reactive";
import { CascaderCore, CascaderOption } from "@timeless/ui";

import { classNames } from "@/style/index";
import { View, ViewProps } from "@/content/view";
import { Portal as NativePortal } from "@/content/portal";
import { ViewChildren } from "@/content/type";
import { Input as NativeInput } from "@/input/input";
import { Fragment } from "@/content/fragment";
import { Show } from "@/reactive/show";

import * as PopperPrimitive from "./popper";
import { ListenerManager } from "@/util/listener";

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
  const value_ = ref(store.state.value);

  const listener$ = ListenerManager();

  const _input$ = NativeInput({
    ...rest,
    // value: value_,
    style: {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: 0,
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      "white-space": "nowrap",
      "border-width": 0,
    },
    onFocus() {
      if (props.store.presence.state.visible) {
        return;
      }
      props.store.show();
    },
    onClick(e: Event) {
      e.stopPropagation();
    },
  });

  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = event.target;

        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );

        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );

        const handlePointerDown = (e: PointerEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if ((e.target as HTMLElement).tagName === "INPUT") {
            return;
          }
          if (store.disabled) {
            return;
          }
          if (props.store.presence.state.visible) {
            props.store.hide();
            return;
          }
          props.store.show();
        };
        // @ts-ignore
        $elm.addEventListener("pointerdown", handlePointerDown);

        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return () => {
          // @ts-ignore
          $elm.removeEventListener("pointerdown", handlePointerDown);
        };
      },
      onUnmounted() {
        listener$.clear();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [_input$, Fragment({}, children)],
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

export function Clear(
  props: ViewProps & { store: CascaderCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  return View(
    {
      ...rest,
      onPointerDown(e: PointerEvent) {
        e.preventDefault();
        e.stopPropagation();
      },
      onClick(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        store.clear();
        store.hide();
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & {
    store: CascaderCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  // const host = getHost();
  const { store, animation, ...rest } = props;

  let _was_exiting = false;
  const presence_ = refobj(store.presence.state);
  const listener$ = ListenerManager([presence_.destroy]);

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

  return Show({
    when: computed(presence_, (t) => {
      return t.mounted;
    }),
    onMounted() {
      listener$.add(
        store.presence.onStateChange((v) => {
          presence_.as(v);
        }),
      );
    },
    ok() {
      return [
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
                  attributes: {
                    ...(rest.attributes || {}),
                    "tab-index": 0,
                  },
                  class: classNames([
                    // rest.class,
                    computed(presence_, (t) => {
                      if (t.exit) {
                        _was_exiting = true;
                      }
                      if (!t.mounted && _was_exiting) {
                        _was_exiting = false;
                        return animation?.out || "";
                      }
                      if (t.mounted) {
                        _was_exiting = false;
                      }
                      return [
                        t.enter && animation?.in ? animation.in : "",
                        t.exit && animation?.out ? animation.out : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                    }),
                  ]),
                  onAnimationEnd(e: AnimationEvent) {
                    if (e.target === e.currentTarget) {
                      store.presence.handleAnimationEnd();
                    }
                    if (rest.onAnimationEnd) {
                      rest.onAnimationEnd(e);
                    }
                  },
                  onKeyDown: handleKeyDown,
                  onMounted(event) {
                    const $elm = event.target;
                    setTimeout(() => {
                      // @ts-ignore
                      if (typeof $elm.focus === "function") {
                        // @ts-ignore
                        $elm.focus();
                      }
                    }, 0);
                    if (rest.onMounted) {
                      listener$.add(rest.onMounted(event));
                    }
                    return listener$.clean;
                  },
                },
                children,
              ),
            ],
          ),
        ]),
      ];
    },
  });
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

  return Show({
    when: hasChildren,
    ok() {
      return [View(rest, children)];
    },
  });
}

export function Search(
  props: ViewProps & { store: CascaderCore<any> },
  children?: ViewChildren,
) {
  // const host = getHost();
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return Show({
    when: computed(state_, (s) => Boolean(s.search)),
    ok() {
      return [
        View(
          {
            ...rest,
            as: "input",
            onMounted(event) {
              const $elm = event.target;
              $elm.setAttribute("placeholder", store.state.searchPlaceholder);
              $elm.setAttribute("value", store.state.searchKeyword);

              const handleInput = (e: any) => {
                const target = e.target as HTMLInputElement;
                store.setSearchKeyword(target.value);
              };
              $elm.addEventListener("input", handleInput);

              store.onStateChange((s) => {
                $elm.setAttribute("placeholder", s.searchPlaceholder);
                $elm.setAttribute("value", s.searchKeyword);
              });

              setTimeout(() => {
                // @ts-ignore
                $elm.focus();
              }, 0);

              if (rest.onMounted) {
                rest.onMounted(event);
              }
              return () => {
                $elm.removeEventListener("input", handleInput);
              };
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
      ];
    },
  });
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

  return Show({
    when: computed(state_, (s) =>
      Boolean(s.search && s.searchKeyword && s.searchResults.length > 0),
    ),
    ok() {
      return [View(rest, children)];
    },
  });
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
