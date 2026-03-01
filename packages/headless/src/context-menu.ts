import { computed, ref, refobj, uncomputed } from "@timeless/reactive";
import { ContextMenuCore, MenuCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons/chevron-right";

import { Component, View, ViewChildren, ViewProps } from "./view";
import { DropdownMenu } from "./dropdown-menu";
import { Portal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";
import { For } from "./for";
import { merge, tp } from "./theme";
import { MenuItem, MenuItemView } from "./menu";
import { Show } from "./show";
import { Txt } from "./text";

export function ContextMenu(
  props: ViewProps & {
    store: ContextMenuCore;
    theme?: any;
  },
  children: ViewChildren,
) {
  const { store, theme: t, ...rest } = props;

  const layer = store.menu.layer;
  const state = refobj(store.state);
  const events: (void | (() => void))[] = [];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );
  const menuitem$s = computed(state, (d) => d.items);

  let unDismiss: undefined | Function;
  let handlePointerDown: undefined | (() => void);

  const $menucontent = For({
    ...merge(tp(t?.menu)),
    each: menuitem$s,
    render(item: { label: string; menu?: MenuCore }) {
      //       console.log("[]DropdownMenu render item", !!item.menu, item.label);
      const items = ref(item.menu ? item.menu.state.items : []);
      if (item.menu) {
        item.menu.onStateChange((v) => {
          // console.log("[]items change", v.items);
          items.as(v.items);
        });
      }
      return Show(
        {
          when: ref(!!item.menu),
          fallback: [MenuItem({ store: item, theme: t }, [Txt(item.label)])],
        },
        [
          MenuItem(
            {
              store: item,
              theme: t,
              onMouseEnter: () => {
                const menu = item.menu;
                if (menu) {
                  if (menu.hide_sub_timer) {
                    clearTimeout(menu.hide_sub_timer);
                    menu.hide_sub_timer = null;
                  }
                }
              },
              onMouseLeave: () => {
                const menu = item.menu;
                if (menu) {
                  menu.hide_sub_timer = setTimeout(() => {
                    menu.hide_sub_timer = null;
                    menu.hide();
                  }, 100);
                }
              },
            },
            [
              View({ style: "flex:1;" }, [Txt(item.label)]),
              View({ ...merge(tp(t?.submenuArrow)) }, [
                ChevronRightOutlined({}),
              ]),
              // 这里封装成组件，就不用判断 item.menu 了。因为现在是表达式，表达式肯定会执行 item.menu.presence，导致空指针
              item.menu
                ? Portal({}, [
                    Popper({ store: item.menu.popper }, [
                      Presence(
                        {
                          store: item.menu.presence,
                          animation: t?.subAnimation || t?.animation,
                        },
                        [
                          listenMenuContent(
                            item.menu,
                            (() => {
                              return For({
                                ...merge(tp(t?.menu)),
                                each: items,
                                render(sub) {
                                  return MenuItemView(sub, t);
                                },
                                onUnmounted() {
                                  uncomputed(items);
                                },
                              });
                            })(),
                          ),
                        ],
                      ),
                    ]),
                  ])
                : null,
            ],
          ),
        ],
      );
    },
  });
  $menucontent.$elm.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  return View(
    {
      ...rest,
      onMounted($el: HTMLDivElement) {
        if (rest.onMounted) {
          rest.onMounted($el);
        }
        store.setReference({
          getRect() {
            return $el.getBoundingClientRect();
          },
        });

        unDismiss = layer.onDismiss(() => {
          store.hide();
        });

        handlePointerDown = () => {
          if (store.menu.state.open) {
            layer.handlePointerDownOnTop();
          }
        };
        document.addEventListener("pointerdown", handlePointerDown);

        $el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const { pageX: x, pageY: y } = e;
          store.updateReference({
            getRect() {
              const rect = $el.getBoundingClientRect();
              const { top, left, right, bottom } = rect;
              return {
                width: 0,
                height: 0,
                top,
                left,
                right,
                bottom,
                x,
                y,
              };
            },
          });
          store.show({ x: x - 8, y: y - 4 });
        });
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (unDismiss) {
          unDismiss();
        }
        if (handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
        }
        store.destroy();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      ...children,
      Portal({}, [
        Popper({ store: store.menu.popper }, [
          Presence({ store: store.menu.presence, animation: t?.animation }, [
            $menucontent,
          ]),
        ]),
      ]),
    ],
  );
}

function listenMenuContent(menu: MenuCore, child: Component) {
  const $el = child.$elm;
  $el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  $el.addEventListener("mouseenter", () => {
    if (menu.hide_sub_timer) {
      clearTimeout(menu.hide_sub_timer);
      menu.hide_sub_timer = null;
    }
    menu.popper.handleEnter();
  });
  $el.addEventListener("mouseleave", () => {
    menu.popper.handleLeave();
    menu.hide_sub_timer = setTimeout(() => {
      menu.hide_sub_timer = null;
      menu.hide();
    }, 100);
  });
  return child;
}
