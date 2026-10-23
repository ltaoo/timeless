import { refobj, computed, Button, Style, Logger } from "../core";
import {
  View,
  ViewProps,
  ViewChildren,
  Input as NativeInput,
  Portal as NativePortal,
  Popover,
  ScrollView,
  Fragment,
  Show,
  classNames,
  styleNames,
  ListenerManager,
} from "../core";
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
  const state = refobj(store.state);
  const listener = ListenerManager([state]);
  return Button(
    {
      ...rest,
      disabled: computed(state, (value) => value.disabled),
      attributes: {
        ...rest.attributes,
        role: "combobox",
        "aria-expanded": computed(state, (value) => String(value.open)),
        "aria-haspopup": "listbox",
      },
      onClick(event) {
        rest.onClick?.(event);
        if (event.defaultPrevented) return;
        const target = event.target as { tagName?: string; isContentEditable?: boolean };
        if (["INPUT", "TEXTAREA"].includes(target?.tagName ?? "") || target?.isContentEditable) return;
        store.handleClickTrigger();
      },
      onKeyDown(event) {
        rest.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          if (!store.open) store.show();
          else if (event.key === "ArrowDown") store.focusNextOption();
          else store.focusPrevOption();
        } else if ((event.key === "Enter" || event.key === " ") && store.open) {
          event.preventDefault();
          store.selectFocusedOption();
        } else if (event.key === "Escape") store.hide();
      },
      onMounted(event) {
        const element = event.target;
        store.focus = () => element.focus?.();
        store.blur = () => element.blur?.();
        store.popper$.setReference(
          {
            $el: element.get$elm(),
            getRect: () => element.getBoundingClientRect(),
          },
          { force: true },
        );
        listener.add(store.onStateChange((value) => state.as(value)));
        listener.add(rest.onMounted?.(event));
        return listener.destroy;
      },
    },
    children,
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
  const state = refobj(store.state);
  const listener = ListenerManager([state]);
  return Show({
    when: computed(state, (value) => value.open),
    onMounted(event) {
      listener.add(store.onStateChange((value) => state.as(value)));
      listener.add(onMounted?.(event));
      return listener.destroy;
    },
    ok: () =>
      Popover(
        {
          ...rest,
          open: true,
          anchor: () => store.popper$.reference?.$el,
          onClose: () => store.hide(),
          onKeyDown(event) {
            rest.onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              store.focusNextOption();
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              store.focusPrevOption();
            }
            if (event.key === "Enter") {
              event.preventDefault();
              store.selectFocusedOption();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              store.hide();
            }
          },
        },
        children,
      ),
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
          style: styleNames([
            rest.style,
            store.position === "item-aligned"
              ? {
                  "box-sizing": "border-box",
                  "max-height": "100%",
                  display: "flex",
                  "flex-direction": "column",
                }
              : undefined,
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
  return ScrollView(
    {
      ...rest,
      horizontal: "hidden",
      style: { maxHeight: "240px", ...rest.style },
    },
    children,
  );
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
      disabled: computed(state_, (value) => !!value.disabled),
      onFocus(event) {
        rest.onFocus?.(event);
        select$.focusOption(store.value);
      },
      onMounted(event) {
        const $elm = event.target.get$elm();
        select$.handleItemMounted({
          offsetTop: $elm.offsetTop ?? 0,
          height: $elm.offsetHeight ?? 32,
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
