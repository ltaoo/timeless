import { ref, refobj, computed } from "@timeless/reactive";
import { MenuCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons";

import { tp, merge } from "./theme";
import { TimelessElement, View, ViewChildren, ViewProps } from "./view";
import { Txt } from "./text";
import { For } from "./for";
import { Show } from "./show";
import { Portal } from "./portal";
import { Presence } from "./presence";
import { Popper } from "./popper";

export function Menu(
  props: ViewProps & { theme?: any },
  children?: ViewChildren,
) {
  const { theme: t, class: cls, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.menu), cls, st) }, children);
}

export function MenuItem(props: any, children?: ViewChildren) {
  const { store, theme: t, class: cls, style: st, ...rest } = props;
  const view$ = View(
    {
      ...rest,
      ...merge(tp(t?.item), cls, st),
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
      const base = merge(tp(t?.item), cls, st);
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
          const base = merge(tp(t?.item), cls, st);
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
  props: { store: MenuCore },
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

export function MenuItemView(item: any, t: any): TimelessElement {
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
              [ChevronRightOutlined({})],
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
                Presence(
                  {
                    store: item.menu.presence,
                    animation: t?.subAnimation || t?.animation,
                  },
                  [
                    Popper({ store: item.menu.popper }, [
                      (() => {
                        const subState = refobj(item.menu.state);
                        item.menu.onStateChange((v: any) => {
                          subState.as(v);
                        });
                        const subItems = computed(subState, (d) => d.items);
                        return View(
                          {
                            ...merge(tp(t?.menu)),
                          },
                          [
                            For({
                              each: subItems,
                              render(sub) {
                                return MenuItemView(sub, t);
                              },
                            }),
                          ],
                        );
                      })(),
                    ]),
                  ],
                ),
              ],
            )
          : null,
      ],
    ),
  ]);
}
