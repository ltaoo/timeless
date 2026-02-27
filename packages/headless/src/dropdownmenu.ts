import { ui } from "@timeless/domains";
import { ref, refobj, computed } from "@timeless/reactive";
import { ChevronRightOutlined } from "@timeless/icons";

import { For } from "./for";
import { merge, tp } from "./theme";
import { Show } from "./show";
import { MenuItem, MenuItemView, SubMenuContent } from "./menu";
import { View } from "./view";
import { Txt } from "./text";
import { Portal } from "./portal";
import { Popper } from "./popper";
import { Presence } from "./presence";

export function DropdownMenu(
  props: {
    store: ui.DropdownMenuCore;
    theme: any;
    onMounted?: ($elm: any) => void;
  },
  children: any[],
) {
  const { store, theme: t, ...rest } = props;
  const layer = store.menu.layer;
  const state = refobj(store.state);
  const events = [];
  events.push(
    store.onStateChange(() => {
      state.as(store.state);
    }),
  );
  const menuitem$s = computed(state, (d) => d.items);

  let unDismiss, handlePointerDown;
  let _hoverHideTimer = null;
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
    render(item) {
      //       console.log("[]DropdownMenu render item", !!item.menu, item.label);
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
                        SubMenuContent(
                          item.menu,
                          (() => {
                            const subState = ref(item.menu.state);
                            item.menu.onStateChange((v) => {
                              subState.value = v;
                            });
                            const subItems = computed(
                              { subState },
                              (d) => d.subState.items,
                            );
                            return For({
                              ...merge(tp(t?.menu)),
                              each: subItems,
                              render(sub) {
                                return MenuItemView(sub, t);
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

  // const popperState = ref(store.menu.popper.state);
  // events.push(
  //   store.menu.popper.onStateChange(() => {
  //     popperState.value = store.menu.popper.state;
  //   }),
  // );
  // const presenceState = ref(store.menu.presence.state);
  // events.push(
  //   store.menu.presence.onStateChange(() => {
  //     presenceState.value = store.menu.presence.state;
  //   }),
  // );
  // const showWhen = computed({ presenceState }, (d) => {
  //   const s = d.presenceState;
  //   return s.mounted && (s.visible || s.enter || s.exit);
  // });

  return View(
    {
      ...rest,
      onMounted($e) {
        console.log("[]menu onMounted", $e);
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
          if (store.menu.state.open) {
            layer.handlePointerDownOnTop();
          }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        if (store.trigger === "hover") {
          let hoverTimer = null;
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
        if (unDismiss) unDismiss();
        if (handlePointerDown)
          document.removeEventListener("pointerdown", handlePointerDown);
        store.unmount();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    [
      ...children,
      Portal({}, [
        Popper({ store: store.menu.popper }, [
          Presence({ store: store.menu.presence }, [$menucontent]),
        ]),
        // Show({ when: showWhen }, [
        //   View(
        //     {
        //       style: computed({ popperState }, (d) => {
        //         const s = d.popperState;
        //         return [
        //           "position:fixed;left:0;top:0;z-index:1000;",
        //           `opacity:${s.isPlaced ? 1 : 0};`,
        //           s.isPlaced
        //             ? `transform:translate3d(${Math.round(s.x)}px,${Math.round(s.y)}px,0);`
        //             : "transform:translate3d(0,0,0);",
        //         ].join("");
        //       }),
        //       onMounted($e) {
        //         store.menu.popper.setFloating({
        //           $el: $e,
        //           getRect() {
        //             return $e.getBoundingClientRect();
        //           },
        //         });
        //       },
        //       onUnmounted() {
        //         store.menu.popper.setFloating(null);
        //       },
        //     },
        //     [
        //       View(
        //         {
        //           class: computed({ presenceState }, (d) => {
        //             const s = d.presenceState;
        //             return [
        //               s.enter ? t?.animation?.in || "" : "",
        //               s.exit ? t?.animation?.out || "" : "",
        //             ]
        //               .filter(Boolean)
        //               .join(" ");
        //           }),
        //         },
        //         [$menucontent],
        //       ),
        //     ],
        //   ),
        // ]),
      ]),
    ],
  );
}
