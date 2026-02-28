import { ui } from "@timeless/domains";
import { ref, refobj, refarr, computed, uncomputed } from "@timeless/reactive";
import { ChevronRightOutlined } from "@timeless/icons";

import { For } from "./for";
import { merge, tp } from "./theme";
import { Show } from "./show";
import { MenuItem, MenuItemView } from "./menu";
import { Component, View, ViewChildren } from "./view";
import { Txt } from "./text";
import { Portal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";

export function DropdownMenu(
  props: {
    store: ui.DropdownMenuCore;
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
  let handlePointerDown: undefined | (() => void);
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

  const $menucontent = For({
    ...merge(tp(t?.menu)),
    each: menuitem$s,
    render(item: { label: string; menu?: ui.MenuCore }) {
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
          MenuItem({ store: item, theme: t }, [
            View({ style: "flex:1;" }, [Txt(item.label)]),
            View({ ...merge(tp(t?.submenuArrow)) }, [ChevronRightOutlined()]),
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
          ]),
        ],
      );
    },
  });
  $menucontent.$elm.addEventListener("pointerdown", (e) => {
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
        handlePointerDown = () => {
          // console.log("[DropdownMenu]click", store.menu.state.open);
          if (store.menu.state.open) {
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
            layer.pointerDown();
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
        Popper({ store: store.menu.popper }, [
          Presence({ store: store.menu.presence }, [$menucontent]),
        ]),
      ]),
    ],
  );
}

function listenMenuContent(menu: ui.MenuCore, child: Component) {
  const $el = child.$elm;
  $el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  $el.addEventListener("mouseenter", () => {
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
