import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Txt } from "../ui/text.js";
import { For } from "../ui/for.js";
import { Show } from "../ui/show.js";
import { Portal } from "../ui/portal.js";
import { Presence } from "../ui/presence.js";
import { Popper } from "../ui/popper.js";
import { ref, computed } from "../ui/core.js";
import { ChevronRightOutlined } from "../icons/chevron-right.js";

export function Menu(props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.menu), cn, st) }, children);
}

export function MenuItem(props, children) {
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
    if (hoverM.style) {
      const base = merge(tp(t?.item), cn, st);
      $el.style.cssText = base.style || "";
    }
    if (hoverM.class)
      $el.classList.remove(...hoverM.class.split(" ").filter(Boolean));
    store.handlePointerLeave();
  });
  if (store.menu) {
    store.onStateChange((v) => {
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

export function MenuLabel(props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.label), cn, st) }, children);
}

export function MenuSeparator(props) {
  const { theme: t, class: cn, style: st, ...rest } = props;
  return View({ ...rest, ...merge(tp(t?.separator), cn, st) });
}

function SubMenuContent(menu, child) {
  const $el = child.$elm;
  $el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  $el.addEventListener("mouseenter", () => {
    menu.popper.handleEnter();
  });
  $el.addEventListener("mouseleave", () => {
    menu.popper.handleLeave();
    menu.hide();
  });
  return child;
}

function MenuItemView(item, t) {
  if (!item.menu) return MenuItem({ store: item, theme: t }, [Txt(item.label)]);
  return View({}, [
    MenuItem({ store: item, theme: t }, [
      View({ style: "flex:1;" }, [Txt(item.label)]),
      View({ ...merge(tp(t?.submenuArrow)) }, [ChevronRightOutlined()]),
    ]),
    Portal({}, [
      Popper({ store: item.menu.popper }, [
        Presence(
          {
            store: item.menu.presence,
            animation: t?.subAnimation || t?.animation,
          },
          [SubMenuContent(item.menu, MenuContent(item.menu.items, t))],
        ),
      ]),
    ]),
  ]);
}

function MenuContent(items, t) {
  return View(
    { ...merge(tp(t?.menu)) },
    items.map((item) => MenuItemView(item, t)),
  );
}

export function DropdownMenu(props, children) {
  const { store, theme: t, ...rest } = props;
  const layer = store.menu.layer;
  const state = ref(store.state);
  const events = [];
  events.push(
    store.onStateChange(() => {
      state.value = store.state;
    }),
  );
  const menuitem$s = computed({ state }, (d) => d.state.items);

  let unDismiss, handlePointerDown;

  const $menucontent = For({
    ...merge(tp(t?.menu)),
    each: menuitem$s,
    render(item) {
      console.log("[]DropdownMenu render item", !!item.menu, item.label);
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
                          MenuContent(item.menu.items, t),
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
          layer.handlePointerDownOnTop();
        };
        document.addEventListener("pointerdown", handlePointerDown);
        $e.addEventListener("pointerdown", () => {
          layer.pointerDown();
          const rect = $e.getBoundingClientRect();
          // console.log("[DropdownMenu] pointerdown", $e, rect);
          // debugger;
          store.toggle({
            x: rect.x,
            y: rect.y,
            width: $e.clientWidth,
            height: $e.clientHeight + 8,
          });
        });
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
