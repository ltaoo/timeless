import {
  refobj,
  computed,
  isRef,
  classNames,
  sn,
  combine,
} from "@timeless/reactive";
import { SelectCore } from "@timeless/ui";

import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { Portal as NativePortal } from "./portal";
import { Presence } from "./presence";
import * as PopperPrimitive from "./popper";

export function Root(
  props: ViewProps & { store: SelectCore<any> },
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
  props: ViewProps & { store: SelectCore<any>; id?: string },
  children: ViewChildren = [],
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const events: any[] = [];

  store.onFocus(() => {
    if (store.open) {
      store.hide();
      return;
    }
    store.presence.show();
    store.show();
  });
  store.onBlur(() => {
    store.hide();
  });

  // 创建隐藏的 input 用于可访问性
  const _input$ = View(
    {
      as: "input",
      type: "text",
      id,
      style:
        "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;",
      onFocus() {
        if (store.open) {
          return;
        }
        store.presence.show();
        store.show();
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
      onMounted(el) {
        el.value = store.state.value || "";
        events.push(
          store.onStateChange(() => {
            el.value = store.state.value || "";
          }),
        );
      },
    },
    [],
  );

  return View(
    {
      ...rest,
      onMounted($e) {
        // 使用整个 trigger 元素作为 reference，而不是 firstElementChild
        store.popper.setReference(
          {
            $el: $e,
            getRect() {
              return $e.getBoundingClientRect();
            },
          },
          { force: true },
        );
        setTimeout(() => {
          console.log("[]Select Trigger Mounted", $e.getBoundingClientRect());
          const rect = $e.getBoundingClientRect();
          store.setPosition({
            width: rect.width,
            height: rect.height,
            x: rect.x,
            y: rect.y,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          });
        }, 0);
        $e.addEventListener("pointerdown", (e: any) => {
          // 如果点击的是隐藏的 input，不要再次触发
          if (e.target.tagName === "INPUT") return;
          if (store.disabled) {
            return;
          }
          // 阻止事件冒泡到 document，避免 LayerManager 立即关闭
          e.stopPropagation();
          if (store.open) {
            props.store.blur();
          } else {
            props.store.focus();
          }
        });

        if (rest.onMounted) {
          rest.onMounted($e);
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
      type: "span",
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

export function Icon(props: ViewProps, children: ViewChildren) {
  return View(props, children);
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
  const { store, animation, ...rest } = props;
  const presenceState = refobj(store.presence.state);

  store.presence.onStateChange((v) => {
    presenceState.as(v);
  });

  return Presence({ store: store.presence }, [
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
            class: classNames([
              rest.class,
              computed(presenceState, (t) => {
                return [
                  t.enter && animation?.in ? animation.in : "",
                  t.exit && animation?.out ? animation.out : "",
                ]
                  .filter(Boolean)
                  .join(" ");
              }),
            ]),
          },
          children,
        ),
      ],
    ),
  ]);
}

export function Viewport(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  return View(props, children);
}

export function Item(
  props: ViewProps & { store: SelectCore<any>; value: any },
  children: ViewChildren,
) {
  const { store, value, ...rest } = props;

  return View(
    {
      ...rest,
      onClick() {
        store.select(value);
        store.hide();
      },
      onMouseEnter() {
        store.focusOption(value);
      },
      onMouseLeave() {
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
      style: sn([
        rest.style,
        combine({ ss: rest.style, selected }, ({ ss, selected }) => {
          return selected ? ss || "" : "display:none;";
        }),
      ]),
    },
    children,
  );
}
