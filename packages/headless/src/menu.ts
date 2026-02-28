import { ref, refobj, computed } from "@timeless/reactive";
import { ui } from "@timeless/domains";
import { ChevronRightOutlined } from "@timeless/icons";

import { tp, merge } from "./theme.js";
import { Component, View, ViewChildren } from "./view.js";
import { Txt } from "./text.js";
import { For } from "./for.js";
import { Show } from "./show.js";
import { Portal } from "./portal.js";
import { Presence } from "./presence.js";
import { Popper } from "./popper.js";

export function Menu(props: any, children?: ViewChildren) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.menu), cn, st) }, children);
}

export function MenuItem(props: any, children?: ViewChildren) {
  const { store, theme: t, class: cn, style: st, ...rest } = props;
  const view$ = View(
    {
      ...rest,
      ...merge(tp(t?.item), cn, st),
      onClick() {
        store.handleClick();
      },
      onFocus() {
        store.handleFocus();
      },
      onBlur() {
        store.handleBlur();
      },
    },
    children,
  );
  const $el = view$.$elm;
  if (props.store.menu && props.store.menu.popper) {
    props.store.menu.popper.setReference({
      $el,
    });
  }
  const hoverM = merge(tp(t?.itemHover));
  $el.addEventListener("mouseenter", () => {
    if (props.onMouseEnter) props.onMouseEnter();
    if (hoverM.style) $el.style.cssText += hoverM.style;
    if (hoverM.class)
      $el.classList.add(...hoverM.class.split(" ").filter(Boolean));
    if (store.menu) {
      store.menu.popper.placement = "right-start";
      store.menu.popper.setReference({
        $el,
        getRect() {
          return $el.getBoundingClientRect();
        },
      });
    }
    store.handlePointerEnter();
  });
  $el.addEventListener("mouseleave", () => {
    if (props.onMouseLeave) props.onMouseLeave();
    if (hoverM.style) {
      const base = merge(tp(t?.item), cn, st);
      $el.style.cssText = base.style || "";
    }
    if (hoverM.class)
      $el.classList.remove(...hoverM.class.split(" ").filter(Boolean));
    store.handlePointerLeave();
  });
  if (store.menu) {
    store.onStateChange((v: any) => {
      if (v.open) {
        if (hoverM.style) {
          $el.style.cssText += hoverM.style;
        }
        if (hoverM.class) {
          $el.classList.add(...hoverM.class.split(" ").filter(Boolean));
        }
      } else {
        if (hoverM.style) {
          const base = merge(tp(t?.item), cn, st);
          $el.style.cssText = base.style || "";
        }
        if (hoverM.class)
          $el.classList.remove(...hoverM.class.split(" ").filter(Boolean));
      }
    });
  }
  const _origUnmounted = view$.onUnmounted;
  view$.onUnmounted = () => {
    if (store.menu) {
      store.menu.popper.removeReference();
    }
    if (_origUnmounted) {
      _origUnmounted();
    }
  };
  return view$;
}

export function MenuLabel(props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.label), cn, st) }, children);
}

export function MenuSeparator(props: any) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.separator), cn, st) });
}

export function SubMenuContent(
  props: { store: ui.MenuCore },
  children: ViewChildren,
) {
  return Portal({}, [
    Popper({ store: props.store.popper }, [
      Presence({ store: props.store.presence }, [
        Show({ when: computed(props.store.state, (d) => d.open) }, children),
      ]),
    ]),
  ]);
}

export function MenuItemView(item: any, t: any): Component {
  return MenuItem({ store: item, theme: t }, [
    View(
      {
        class: "flex items-center w-full",
      },
      [
        item.icon
          ? View(
              {
                class: "mr-2 h-4 w-4",
              },
              [item.icon],
            )
          : null,
        Txt(item.label),
        item.shortcut
          ? View(
              {
                class: "ml-auto text-xs tracking-widest opacity-60",
              },
              [Txt(item.shortcut)],
            )
          : null,
        item.children
          ? View(
              {
                class: "ml-auto h-4 w-4",
              },
              [ChevronRightOutlined()],
            )
          : null,
        item.children
          ? Portal(
              {
                onUnmounted() {
                  if (item.menu) {
                    item.menu.dispose();
                  }
                },
              },
              [
                Popper({ store: item.menu.popper }, [
                  Presence(
                    {
                      store: item.menu.presence,
                      animation: t?.subAnimation || t?.animation,
                    },
                    [
                      (() => {
                        const subState = refobj(item.menu.state);
                        item.menu.onStateChange((v: any) => {
                          subState.as(v);
                        });
                        const subItems = computed(subState, (d) => d.items);
                        return For({
                          ...merge(tp(t?.menu)),
                          each: subItems,
                          render(sub) {
                            return MenuItemView(sub, t);
                          },
                        });
                      })(),
                    ],
                  ),
                ]),
              ],
            )
          : null,
      ],
    ),
  ]);
}
