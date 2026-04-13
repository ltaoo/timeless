import { refobj, computed, isRef } from "@timeless/reactive";
import { SelectCore } from "@timeless/ui";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { Portal as NativePortal } from "@/content/portal";
import { Fragment } from "@/content/fragment";
import { Show } from "@/reactive/show";
import { Input as NativeInput } from "@/input/input";
import { isStyleRef, classNames, styleNames } from "@/style/index";

import * as PopperPrimitive from "./popper";
import { ListenerManager } from "@/util/listener";

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
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager();

  // 创建隐藏的 input 用于可访问性
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

        // 使用整个 trigger 元素作为 reference，而不是 firstElementChild
        store.popper.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );
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
        listener$.add($elm.addEventListener("pointerdown", handlePointerDown));
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.clean;
      },
    },
    [_input$, Fragment({}, children)],
  );
}

export function Value(props: ViewProps & { store: SelectCore<any> }) {
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
        return listener$.clean;
      },
    },
    [
      computed(state_, (d) => {
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
      return listener$.clean;
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
                    tabindex: 0,
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
                children,
              ),
            ],
          ),
        ]),
      ];
    },
  });
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
  const { store, ...rest } = props;
  const state_ = refobj(store.state);
  const listener$ = ListenerManager();

  return Show({
    when: computed(state_, (s) => s.search),
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
            // 自动聚焦搜索框
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
            // 阻止点击搜索框时关闭下拉菜单
            e.stopPropagation();
          },
          onKeyDown(e: KeyboardEvent) {
            // 阻止按键事件冒泡，避免影响 Select 的键盘导航
            e.stopPropagation();
          },
        }),
      ];
    },
  });
}

export function Item(
  props: ViewProps & { store: SelectCore<any>; value: any; disabled?: boolean },
  children: ViewChildren,
) {
  const { store, value, disabled = false, ...rest } = props as any;

  return View(
    {
      ...rest,
      dataset: {
        disabled: computed(disabled, (d) => (d ? "" : undefined)),
      },
      onClick() {
        if (disabled) {
          return;
        }
        store.select(value);
        store.hide();
      },
      onMouseEnter() {
        console.log("[select] - onMouseEnter", value);
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

  const state_ = refobj(store.state);
  const selected_ = computed(state_, (d) => d.value === value);
  const listener$ = ListenerManager([state_, selected_]);

  return View(
    {
      ...rest,
      style: styleNames([
        rest.style,
        {
          display: computed(selected_, (d) => (d ? undefined : "none")),
        },
      ]),
      onMounted(event) {
        console.log("[primitive]Select - item indicator mounted", value);
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
      onUnmounted() {
        console.log("[primitive]Select - item indicator unmounted", value);
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    children,
  );
}
