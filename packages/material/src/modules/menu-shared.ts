import { vm } from "@timeless/timeless";

/**
 * 共享补丁 + 菜单类名常量（Material 3 版）。
 *
 * 1) Patch: vm.MenuCore.listen_item 在注册子菜单 onEnter 时没有保存 unsubscribe，
 *    导致每次进入子菜单都会叠加一个监听器（内存/行为泄漏）。
 *    这里包一层 onEnter，保证同一时刻只保留最后一个 handler。
 *    补丁打在 vm 层并带 __tt_listen_item_patched 幂等标记，与 bootstrap 版本
 *    共存时只会生效一次（先加载者胜出）。
 *    menu.ts / dropdown-menu.ts / context-menu.ts 通过 side-effect 导入本文件。
 *
 * 2) t: 菜单各部位的 Material 类名，供三个菜单组件复用。全部挂在 `.m3-menu`
 *    命名空间下；条目 hover/pressed 由 CSS 的 state layer（::before）表达。
 */
{
  const proto = vm.MenuCore.prototype as any;
  const orig = proto.listen_item;
  if (typeof orig === "function" && !proto.__tt_listen_item_patched) {
    proto.listen_item = function (this: any, e: any) {
      if (e && e.menu) {
        const origOnEnter = e.menu.onEnter.bind(e.menu);
        let unsub: any = null;
        e.menu.onEnter = function (handler: any) {
          if (unsub) unsub();
          unsub = origOnEnter(handler);
          return unsub;
        };
      }
      return orig.call(this, e);
    };
    proto.__tt_listen_item_patched = true;
  }
}

export const t = {
  /** 浮层动画时长（CSS 里面对应 .is-enter / .is-exit 的关键帧） */
  animation: {
    in: "is-enter",
    out: "is-exit",
  },
  subAnimation: {
    in: "is-enter",
    out: "is-exit",
  },
  menu: { class: "m3-menu" },
  submenu: { class: "m3-menu m3-menu--submenu" },
  item: { class: "m3-menu__item" },
  itemHover: { class: "is-focused" },
  itemDisabled: { class: "is-disabled" },
  label: { class: "m3-menu__label" },
  separator: { class: "m3-menu__separator" },
  submenuArrow: { class: "m3-menu__item-arrow" },
  icon: { class: "m3-menu__item-icon" },
  shortcut: { class: "m3-menu__item-shortcut" },
  check: { class: "m3-menu__item-check" },
};
