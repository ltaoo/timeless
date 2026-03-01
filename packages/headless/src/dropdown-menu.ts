import { ref, refobj, refarr, computed, uncomputed } from "@timeless/reactive";
import { DropdownMenuCore, MenuCore } from "@timeless/ui";
import { ChevronRightOutlined } from "@timeless/icons/chevron-right";

import { For } from "./for";
import { merge, tp } from "./theme";
import { Show } from "./show";
import { MenuItem, MenuItemView } from "./menu";
import { TimelessElement, View, ViewChildren } from "./view";
import { Txt } from "./text";
import { Portal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";

export function DropdownMenu(
  props: {
    store: DropdownMenuCore;
    theme: any;
    onMounted?: ($elm: any) => void;
    onUnmounted?: () => void;
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
  let handlePointerDown: undefined | ((event: any) => void);
  let _hoverHideTimer: null | number = null;
  function _hoverClearHide() {
    if (_hoverHideTimer) {
      clearTimeout(_hoverHideTimer);
      _hoverHideTimer = null;
    }
  }
  function _hoverScheduleHide() {
    _hoverClearHide();
    _hoverHideTimer = setTimeout(() => {
      store.hide();
    }, 100);
  }

  const $menucontent = View(
    {
      ...merge(tp(t?.menu)),
    },
    [
      For({
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
              fallback: [
                MenuItem({ store: item, theme: t }, [Txt(item.label)]),
              ],
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
                      }, 200);
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
                        Presence(
                          {
                            store: item.menu.presence,
                            animation: t?.subAnimation || t?.animation,
                          },
                          [
                            Popper({ store: item.menu.popper }, [
                              listenMenuContent(
                                item.menu,
                                (() => {
                                  return View(
                                    {
                                      ...merge(tp(t?.menu)),
                                    },
                                    [
                                      For({
                                        each: items,
                                        render(sub) {
                                          return MenuItemView(sub, t);
                                        },
                                        onUnmounted() {
                                          uncomputed(items);
                                        },
                                      }),
                                    ],
                                  );
                                })(),
                                () => {
                                  if (store.trigger === "hover") {
                                    _hoverClearHide();
                                  }
                                },
                                () => {
                                  if (store.trigger === "hover") {
                                    _hoverScheduleHide();
                                  }
                                },
                              ),
                            ]),
                          ],
                        ),
                      ])
                    : null,
                ],
              ),
            ],
          );
        },
      }),
    ],
  );
  $menucontent.$elm.addEventListener("pointerdown", (e: Event) => {
    e.stopPropagation();
  });
  if (store.trigger === "hover") {
    $menucontent.$elm.addEventListener("mouseenter", () => {
      _hoverClearHide();
    });
    $menucontent.$elm.addEventListener("mouseleave", () => {
      _hoverScheduleHide();
    });
  }

  return View(
    {
      ...rest,
      onMounted($e) {
        if (rest.onMounted) {
          rest.onMounted($e);
        }
        const $ref = $e.firstElementChild || $e;
        store.menu.popper.setReference(
          {
            $el: $ref,
            getRect() {
              return $ref.getBoundingClientRect();
            },
          },
          { force: true },
        );
        unDismiss = layer.onDismiss(() => {
          store.hide();
        });
        handlePointerDown = (event: any) => {
          // console.log("[DropdownMenu]click", store.menu.state.open);
          if (store.menu.state.open) {
            const $target = event.target as Node;
            if ($e.contains($target)) {
              return;
            }
            layer.handlePointerDownOnTop();
          }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        if (store.trigger === "hover") {
          let hoverTimer: null | number = null;
          $e.addEventListener("mouseenter", () => {
            _hoverClearHide();
            hoverTimer = setTimeout(() => {
              const rect = $e.getBoundingClientRect();
              store.show({
                x: rect.x,
                y: rect.y,
                width: $e.clientWidth,
                height: $e.clientHeight + 8,
              });
            }, 100);
          });
          $e.addEventListener("mouseleave", () => {
            if (hoverTimer) {
              clearTimeout(hoverTimer);
              hoverTimer = null;
            }
            _hoverScheduleHide();
          });
        } else if (store.trigger !== "manual") {
          $e.addEventListener("pointerdown", () => {
            // layer.pointerDown();
            const rect = $e.getBoundingClientRect();
            store.toggle({
              x: rect.x,
              y: rect.y,
              width: $e.clientWidth,
              height: $e.clientHeight + 8,
            });
          });
        }
      },
      onUnmounted() {
        for (const fn of events) if (typeof fn === "function") fn();
        if (unDismiss) {
          unDismiss();
        }
        if (handlePointerDown) {
          document.removeEventListener("pointerdown", handlePointerDown);
        }
        store.unmount();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      ...children,
      Portal({}, [
        Presence({ store: store.menu.presence }, [
          Popper({ store: store.menu.popper }, [$menucontent]),
        ]),
      ]),
    ],
  );
}

function listenMenuContent(
  menu: MenuCore,
  child: TimelessElement,
  onEnter?: () => void,
  onLeave?: () => void,
) {
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
    if (onEnter) {
      onEnter();
    }
  });
  $el.addEventListener("mouseleave", () => {
    menu.popper.handleLeave();
    menu.hide_sub_timer = setTimeout(() => {
      menu.hide_sub_timer = null;
      menu.hide();
    }, 200);
    if (onLeave) {
      onLeave();
    }
  });
  return child;
}
