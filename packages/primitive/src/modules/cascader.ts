import { refobj, computed } from "@timeless/reactive";
import { CascaderCore, CascaderOption } from "@timeless/ui";

import { ClassNameRef, classNames, isClassName } from "@/vnode/class-names";
import { isStyleRef, styleNames } from "@/vnode/style-names";
import { View, ViewChildren, ViewProps } from "@/content/view";
import { Show } from "@/reactive/show";
import { getHost } from "@/host";
import { h } from "@/util/h";

import { Portal as NativePortal } from "./portal";
import * as PopperPrimitive from "./popper";

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
  const host = getHost();
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const events: any[] = [];

  const mergedInputAttributes = {
    ...(rest.attributes || {}),
    id: props.store.id || props.id || rest.attributes?.id,
  };

  const _input$ = View(
    {
      as: "input",
      attributes: mergedInputAttributes,
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
      onMounted(event) {
        const $elm = (event as any).target as HTMLInputElement;
        const value = store.state.value;
        host.setProperty?.($elm, "value", value ? value.join(",") : "");
        events.push(
          store.onStateChange(() => {
            const v = store.state.value;
            host.setProperty?.($elm, "value", v ? v.join(",") : "");
          }),
        );
      },
    },
    [],
  );

  return View(
    {
      ...rest,
      onMounted(event) {
        const $elm = (event as any).target as HTMLDivElement;
        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return host.getBoundingClientRect?.($elm) as any;
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
        host.addEventListener($elm, "pointerdown", handlePointerDown);

        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          host.removeEventListener($elm, "pointerdown", handlePointerDown);
        };
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
  const host = getHost();
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.presence.state);
  let _was_exiting = false;

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
                attributes: {
                  ...(rest.attributes || {}),
                  "tab-index": 0,
                },
                class: classNames([
                  rest.class,
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
                  const $elm = (event as any).target as HTMLElement;
                  host.setTimeout(() => {
                    host.focus?.($elm);
                  }, 0);
                  if (rest.onMounted) {
                    rest.onMounted(event);
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
  const host = getHost();
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
          onMounted(event) {
            const $elm = (event as any).target as HTMLInputElement;
            host.setProperty?.(
              $elm,
              "placeholder",
              store.state.searchPlaceholder,
            );
            host.setProperty?.($elm, "value", store.state.searchKeyword);

            const handleInput = (e: any) => {
              const target = e.target as HTMLInputElement;
              store.setSearchKeyword(target.value);
            };
            host.addEventListener($elm, "input", handleInput);

            store.onStateChange((s) => {
              host.setProperty?.($elm, "placeholder", s.searchPlaceholder);
              host.setProperty?.($elm, "value", s.searchKeyword);
            });

            host.setTimeout(() => {
              host.focus?.($elm);
            }, 0);

            if (rest.onMounted) {
              rest.onMounted(event);
            }
            return () => {
              host.removeEventListener($elm, "input", handleInput);
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
      when: computed(state_, (s) =>
        Boolean(s.search && s.searchKeyword && s.searchResults.length > 0),
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
