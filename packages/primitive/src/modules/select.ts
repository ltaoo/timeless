import { refobj, computed, combine, sn, cn } from "@timeless/reactive";
import { SelectCore } from "@timeless/ui";

import { View, ViewChildren, ViewProps } from "@/primitive/view";
import { Show } from "@/primitive/show";
import { NativeInput } from "@/native/input";
import { h } from "@/util/h";
import { getHost } from "@/host";

import { Portal as NativePortal } from "./portal";
import * as PopperPrimitive from "./popper";

export function Root(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren = [],
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
  props: ViewProps & { store: SelectCore<any>; id?: string },
  children: ViewChildren = [],
) {
  const host = getHost();
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const events: any[] = [];

  // 创建隐藏的 input 用于可访问性
  const _input$ = View(
    {
      as: "input",
      attributes: {
        ...(rest.attributes || {}),
        id: props.id || rest.attributes?.id || props.store.id,
      },
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
      onClick(e) {
        e.stopPropagation();
        // if (store.disabled) {
        //   return;
        // }
        // store.layer.pointerDown();
        // if (store.open) {
        //   store.hide();
        // } else {
        //   store.presence.show();
        //   store.show();
        // }
      },
      onMounted(event) {
        const $elm = (event as any).target as HTMLInputElement;
        host.setProperty?.($elm, "value", store.state.value || "");
        events.push(
          store.onStateChange(() => {
            host.setProperty?.($elm, "value", store.state.value || "");
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
        // 使用整个 trigger 元素作为 reference，而不是 firstElementChild
        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return host.getBoundingClientRect?.($elm) as any;
            },
          },
          { force: true },
        );
        console.log(
          "[]Select Trigger Mounted",
          host.getBoundingClientRect?.($elm),
        );
        // const rect = $elm.getBoundingClientRect();
        // store.setPosition({
        //   width: rect.width,
        //   height: rect.height,
        //   x: rect.x,
        //   y: rect.y,
        //   left: rect.left,
        //   right: rect.right,
        //   top: rect.top,
        //   bottom: rect.bottom,
        // });
        const handlePointerDown = (e: any) => {
          e.preventDefault();
          e.stopPropagation();
          // 如果点击的是隐藏的 input，不要再次触发
          if (e.target.tagName === "INPUT") {
            return;
          }
          if (store.disabled) {
            return;
          }
          // 阻止事件冒泡到 document，避免 LayerManager 立即关闭
          // e.stopPropagation();
          // if (store.open) {
          //   props.store.blur();
          // } else {
          //   props.store.focus();
          // }
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
  props: ViewProps & { store: SelectCore<any> },
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
        const opt = (d.options || []).find((o) => o.value === d.value);
        if (opt) {
          return opt.label;
        }
        return d.placeholder || "Select...";
      }),
    ],
  );
}

export function Icon(
  props: ViewProps & { store?: SelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props as any;
  return View(rest, children);
}

export function Clear(
  props: ViewProps & { store: SelectCore<any> },
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

export function Portal(
  props: ViewProps & {
    store: SelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren = [],
) {
  return NativePortal({}, children);
}

export function Content(
  props: ViewProps & {
    store: SelectCore<any>;
    animation?: { in: string; out: string };
  },
  children: ViewChildren,
) {
  const host = getHost();
  const { store, animation, ...rest } = props;

  const presence_ = refobj(store.presence.state);
  let _was_exiting = false;

  store.presence.onStateChange((v) => {
    // console.log("[]Select Content Presence State Change", v);
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
                  tabindex: 0,
                },
                class: cn([
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
                onMounted(event) {
                  const $elm = (event as any).target as HTMLElement;
                  host.setTimeout(() => {
                    if (store.state.search) {
                      const input = host.querySelector?.($elm, "input");
                      if (input instanceof HTMLInputElement) {
                        host.focus?.(input);
                        return;
                      }
                    }
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

export function Viewport(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Search(
  props: ViewProps & { store: SelectCore<any> },
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
      when: computed(state_, (s) => s.search),
    },
    [
      NativeInput({
        ...rest,
        type: "text",
        placeholder: computed(state_, (s) => s.searchPlaceholder),
        value: computed(state_, (s) => s.searchKeyword),
        onInput(e: Event) {
          const target = e.target as HTMLInputElement;
          store.setSearchKeyword(target.value);
        },
        onMounted(event) {
          const $elm = (event as any).target as HTMLInputElement;
          // 自动聚焦搜索框
          host.setTimeout(() => {
            host.focus?.($elm);
          }, 0);
          if (rest.onMounted) {
            rest.onMounted(event);
          }
        },
        onClick(e: Event) {
          // 阻止点击搜索框时关闭下拉菜单
          e.stopPropagation();
        },
        onKeyDown(e: KeyboardEvent) {
          // 阻止按键事件冒泡，避免影响 Select 的键盘导航
          e.stopPropagation();
        },
      }),
    ],
  );
}

export function Item(
  props: ViewProps & { store: SelectCore<any>; value: any; disabled?: boolean },
  children: ViewChildren,
) {
  const { store, value, disabled = false, ...rest } = props as any;

  return View(
    {
      ...rest,
      "data-disabled": disabled ? "" : undefined,
      onClick() {
        if (disabled) {
          return;
        }
        store.select(value);
        store.hide();
      },
      onMouseEnter() {
        if (disabled) {
          return;
        }
        store.focusOption(value);
      },
      onMouseLeave() {
        if (disabled) {
          return;
        }
        store.blurOption(value);
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View({ ...props, as: "span" }, children);
}

export function ItemIndicator(
  props: ViewProps & { store: SelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;
  const state = refobj(store.state);

  store.onStateChange((v) => {
    state.as(v);
  });

  const selected = computed(state, (d) => d.value === value);

  return View(
    {
      ...rest,
      style: {
        ...(rest.style || {}),
        display: computed(selected, (d) => (d ? undefined : "none")),
      },
    },
    children,
  );
}
