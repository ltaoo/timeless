import { refobj, computed, Button, Style, Logger } from "@timeless/timeless";
import {
  View,
  ViewProps,
  ViewChildren,
  Input as NativeInput,
  Portal as NativePortal,
  Fragment,
  Show,
  classNames,
  styleNames,
  ListenerManager,
} from "@timeless/timeless";
import { SelectCore, SelectItemCore } from "@timeless/inner-vm";

import * as PopperPrimitive from "./popper";

const logger = Logger({ prefix: "ui-primitive", scope: "select" });

export function Root(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren = [],
) {
  return PopperPrimitive.Root(
    {
      ...props,
      store: props.store.popper$,
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
  const listener$ = ListenerManager([state_]);

  // 创建隐藏的 input 用于可访问性
  const _input$ = NativeInput({
    id: props.id || props.store.id,
    attributes: rest.attributes,
    // focused: computed(state_, (t) => t.focused),
    tabindex: -1,
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
  });

  return Button(
    {
      ...rest,
      attributes: {
        role: "combobox",
        "aria-expanded": computed(state_, (t) => (t.open ? "true" : "false")),
        "aria-haspopup": "listbox",
        // 'aria-controls': computed(state_, (t) => t.open ? t.id : undefined),
        // 'aria-labelledby': computed(state_, (t) => t.id),
        // 'aria-readonly': computed(state_, (t) => t.readOnly || undefined),
        "aria-required": computed(state_, (t) => t.required || undefined),
      },
      onFocus() {
        logger.log("Trigger Button handle focus");
        store.show();
      },
      onBlur() {
        store.hide();
      },
      onMounted(event) {
        const $elm = event.target.get$elm();
        store.focus = function () {
          $elm.focus();
        };
        store.blur = function () {
          $elm.blur();
        };
        // 使用整个 trigger 元素作为 reference，而不是 firstElementChild
        // logger.log("Trigger Mounted", $elm);
        store.popper$.setReference(
          {
            $el: $elm,
            getRect() {
              return $elm.getBoundingClientRect();
            },
          },
          { force: true },
        );
        const handlePointerDown = (e: any) => {
          const target = e.target as HTMLElement | null;
          console.log("[DEBUG] Select Trigger pointerdown FIRED", store.disabled, store.open);
          logger.log("Trigger handlePointerDown", target?.isContentEditable);
          if (
            target &&
            (target.tagName === "INPUT" ||
              target.tagName === "TEXTAREA" ||
              target.isContentEditable)
          ) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          store.handleClickTrigger();
        };
        listener$.add($elm.addEventListener("pointerdown", handlePointerDown));
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    [_input$, Fragment({}, children)],
  );
}

export function Value(props: ViewProps & { store: SelectCore<any> }) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  return View(
    {
      ...rest,
      style: {
        "pointer-events": "none",
      },
      onMounted(event) {
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    [
      computed(state_, (d) => {
        const opt = d.selectedOption;
        if (opt && opt instanceof SelectItemCore) {
          return opt.label ?? opt.value ?? "Select...";
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
  props: {
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

  const presence_ = refobj(store.presence$.state);

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
        store.presence$.onStateChange((v) => {
          presence_.as(v);
        }),
      );
      if (onMounted) {
        listener$.add(onMounted(event));
      }
      return listener$.destroy;
    },
    ok() {
      return [
        NativePortal({}, [
          PopperPositionContent(
            { ...rest, store, animation, onKeyDown: handleKeyDown },
            children,
          ),
        ]),
      ];
    },
  });
}

export function PopperPositionContent(
  props: ViewProps & {
    store: SelectCore<any>;
    animation?: { in: string; out: string };
  },
  children?: ViewChildren,
) {
  const { store, animation, ...rest } = props;

  let _was_exiting = false;
  const presence_ = refobj(store.presence$.state);

  return PopperPrimitive.Content(
    {
      store: store.popper$,
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
          // onKeyDown: handleKeyDown,
          onAnimationEnd(e: AnimationEvent) {
            if (e.target === e.currentTarget) {
              store.presence$.handleAnimationEnd();
            }
            if (rest.onAnimationEnd) {
              rest.onAnimationEnd(e);
            }
          },
        },
        children,
      ),
    ],
  );
}

export function AlignedPositionContent(
  props: ViewProps & { store: SelectCore<any> },
  children?: ViewChildren,
) {
  return View(
    {
      style: {
        display: "flex",
        "flex-direction": "column",
        position: "fixed",
      },
    },
    children,
  );
}

export function Viewport(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  return Fragment({}, [
    Style(
      {},
      `.__t_no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.__t_no-scrollbar::-webkit-scrollbar{
  display: none;
}`,
    ),
    PopperPrimitive.Viewport(
      {
        ...rest,
        dataset: {
          "radix-select-viewport": "",
        },
        class: classNames([rest.class, "__t_no-scrollbar"]),
        style: {
          position: "relative",
          flex: "1 1 0%",
          overflow: "hidden auto",
        },
        store: store.popper$,
      },
      children,
    ),
  ]);
}

export function Item(
  props: ViewProps & {
    select$: SelectCore<any>;
    item$: SelectItemCore<any>;
  },
  children: ViewChildren,
) {
  const { select$, item$: store, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);

  return Button(
    {
      ...rest,
      onMounted(event) {
        const $elm = event.target.get$elm();
        select$.handleItemMounted({
          offsetTop: $elm.offsetTop,
          height: $elm.offsetHeight,
          store,
        });
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
      onClick() {
        select$.handleClickItem(store);
      },
      onMouseEnter() {
        select$.handleMouseEnterItem(store);
      },
      onMouseLeave() {
        select$.handleMouseLeaveItem(store);
      },
    },
    children,
  );
}

export function ItemText(props: ViewProps, children: ViewChildren) {
  return View(
    {
      ...props,
      style: styleNames([
        props.style,
        {
          "font-weight": "400",
        },
      ]),
    },
    children,
  );
}

export function ItemIndicator(
  props: ViewProps & { store: SelectItemCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const selected_ = computed(state_, (t) => t.selected);
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
        listener$.add(
          store.onStateChange((v) => {
            state_.as(v);
          }),
        );
        if (rest.onMounted) {
          listener$.add(rest.onMounted(event));
        }
        return listener$.destroy;
      },
    },
    children,
  );
}

export function ScrollUpButton(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  return PopperPrimitive.ScrollUpButton(
    { ...rest, store: store.popper$ },
    children,
  );
}

export function ScrollDownButton(
  props: ViewProps & { store: SelectCore<any> },
  children: ViewChildren,
) {
  const { store, ...rest } = props;
  return PopperPrimitive.ScrollDownButton(
    { ...rest, store: store.popper$ },
    children,
  );
}

export function Search(props: ViewProps & { store: SelectCore<any> }) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const input_ = refobj(store.search_input$.state);

  const listener$ = ListenerManager([state_, input_]);

  return Show({
    when: computed(state_, (s) => s.search),
    onMounted() {
      listener$.add(
        store.onStateChange((v) => {
          state_.as(v);
        }),
      );
      listener$.add(
        store.search_input$.onStateChange((v) => {
          input_.as(v);
        }),
      );
      return listener$.destroy;
    },
    ok() {
      return [
        NativeInput({
          ...rest,
          placeholder: computed(input_, (t) => t.placeholder),
          disabled: computed(input_, (t) => t.disabled),
          value: computed(input_, (t) => {
            // return t.value2?.label || "";
            return t.value;
          }),
          onMounted(event) {
            const $elm = event.target.get$elm();
            store.search_input$.focus = function () {
              $elm.focus();
            };
            store.search_input$.blur = function () {
              $elm.blur();
            };
          },
          onPointerDown(e) {
            // logger.log("Search onPointerDown");
            store.enableSearch();
            if (store.selected_item$) {
              store.search_input$.setValue("", { silence: true });
            }
            logger.log("onPointerDown", store.disabled, store.open);
            if (!store.disabled && !store.open) {
              store.show();
            }
            e.stopPropagation();
          },
          onInput(e) {
            const target = e.target;
            // @ts-ignore
            logger.log("onInput", e.target?.value);
            const value =
              target && typeof target === "object" && "value" in target
                ? target.value
                : "";
            store.search_input$.setValue(String(value));
            // if (!store.open) {
            //   store.show();
            // }
          },
          onKeyDown(e) {
            e.stopPropagation();
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
          },
        }),
      ];
    },
  });
}
