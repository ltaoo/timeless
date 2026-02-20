import { tp, merge } from "./theme.js";
import { View } from "../ui/view.js";
import { Txt } from "../ui/text.js";
import { For } from "../ui/for.js";
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
  const hoverM = merge(tp(t?.itemHover));
  $el.addEventListener("mouseenter", () => {
    if (hoverM.style) $el.style.cssText += hoverM.style;
    if (hoverM.class)
      $el.classList.add(...hoverM.class.split(" ").filter(Boolean));
    if (store.menu) {
      store.menu.popper.placement = "right-start";
      store.menu.popper.setReference({
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
        if (hoverM.style) $el.style.cssText += hoverM.style;
        if (hoverM.class)
          $el.classList.add(...hoverM.class.split(" ").filter(Boolean));
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
    if (store.menu) store.menu.popper.removeReference();
    if (_origUnmounted) _origUnmounted();
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
      Presence({ store: item.menu.presence }, [
        Popper({ store: item.menu.popper }, [
          SubMenuContent(item.menu, MenuContent(item.menu.items, t)),
        ]),
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
                  Presence({ store: item.menu.presence }, [
                    Popper({ store: item.menu.popper }, [
                      SubMenuContent(
                        item.menu,
                        MenuContent(item.menu.items, t),
                      ),
                    ]),
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

  return View(
    {
      ...rest,
      onMounted($e) {
        if (rest.onMounted) {
          rest.onMounted($e);
        }
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
        Presence({ store: store.menu.presence }, [
          Popper({ store: store.menu.popper }, [$menucontent]),
        ]),
      ]),
    ],
  );
}
