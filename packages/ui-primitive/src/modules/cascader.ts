import { refobj, computed } from "@timeless/timeless";
import { Logger } from "@timeless/timeless";
import {
  classNames,
  View,
  ViewProps,
  Portal as NativePortal,
  ViewChildren,
  Input as NativeInput,
  Fragment,
  Show,
  ListenerManager,
} from "@timeless/timeless";
import { CascaderCore, CascaderOption } from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";

const logger = Logger({ prefix: "primitive", scope: "modules/cascader" });

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
  const listener$ = ListenerManager();

  const _input$ = NativeInput({
    id: props.id || props.store.id,
    attributes: rest.attributes,
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
        function handlePointerDown(e: PointerEvent) {
          e.preventDefault();
          e.stopPropagation();
          // logger.log("handlePointerDown", e.target?.tagName);
          // @ts-ignore
          if (e.target.tagName === "INPUT") {
            return;
          }
          if (store.disabled) {
            return;
          }
          if (store.open) {
            props.store.hide();
            return;
          }
          props.store.show();
        }
        // @ts-ignore
        listener$.add($elm.addEventListener("pointerdown", handlePointerDown));
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        // return listener$.destroy;
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
  const state_ = refobj(store.state);

  const listener$ = ListenerManager([]);

  return View(
    {
      ...rest,
      onMounted(event) {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        // return listener$.clean;
      },
    },
    [
      computed(state_, (d) => {
        if (d.displayText) {
          return d.displayText;
        }
        return d.placeholder || "请选择";
      }),
    ],
  );
}

export function Icon(
  props: ViewProps & { store?: CascaderCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props as any;
  return View(rest, children);
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
  children: ViewChildren | (() => ViewChildren),
) {
  const { store, animation, onMounted, ...rest } = props;

  let _was_exiting = false;
  const presence_ = refobj(store.presence.state);
  const listener$ = ListenerManager([presence_]);

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
    onMounted(event) {
      listener$.add(
        store.presence.onStateChange((v) => {
          presence_.as(v);
        }),
      );
      if (onMounted) {
        listener$.add(onMounted(event));
      }
      // return listener$.destroy;
    },
    ok() {
      const resolvedChildren =
        typeof children === "function" ? children() : children;
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
                  onKeyDown: handleKeyDown,
                  onAnimationEnd(e: AnimationEvent) {
                    if (e.target === e.currentTarget) {
                      store.presence.handleAnimationEnd();
                    }
                    if (rest.onAnimationEnd) {
                      // @ts-ignore
                      rest.onAnimationEnd(e);
                    }
                  },
                },
                resolvedChildren,
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
        logger.log("[]Item - onMouseEnter", panelIndex, option);
        store.hoverOption(panelIndex, option);
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View({ ...props }, children);
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
  const { store, ...rest } = props;
  const state_ = refobj(store.state);
  const listener$ = ListenerManager();

  return Show({
    when: computed(state_, (s) => Boolean(s.search)),
    onMounted() {
      listener$.add(
        store.onStateChange((v) => {
          state_.as(v);
        }),
      );
    },
    ok() {
      return [
        NativeInput({
          ...rest,
          placeholder: computed(state_, (s) => s.searchPlaceholder),
          value: computed(state_, (s) => s.searchKeyword),
          onInput(e: Event) {
            const target = e.target;
            // @ts-ignore
            store.setSearchKeyword(target.value);
          },
          onMounted(event) {
            const $elm = event.target;
            setTimeout(() => {
              // @ts-ignore
              $elm.focus();
            }, 0);
            if (rest.onMounted) {
              listener$.add(rest.onMounted(event));
            }
            return listener$.clean;
          },
          onClick(e: Event) {
            e.stopPropagation();
          },
          onKeyDown(e: KeyboardEvent) {
            e.stopPropagation();
          },
        }),
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
