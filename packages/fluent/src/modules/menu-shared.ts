import { vm } from "@timeless/timeless";

/**
 * 共享补丁 + 菜单类名常量（Fluent 2 · fl- BEM）。
 *
 * 1) Patch: vm.MenuCore.listen_item 在注册子菜单 onEnter 时没有保存 unsubscribe，
 *    导致每次进入子菜单都会叠加一个监听器（内存/行为泄漏）。
 *    这里包一层 onEnter，保证同一时刻只保留最后一个 handler。
 *    与 packages/bootstrap/src/modules/menu-shared.ts 保持一致；
 *    menu.ts / dropdown-menu.ts / context-menu.ts 通过 side-effect 导入本文件。
 *
 * 2) t: 菜单各部位的 Fluent 类名，供三个菜单组件复用。
 *    Fluent 的 Menu 用「左侧 3px --compound-brand 竖条」表达选中/聚焦。
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
  menu: { class: "fl-menu" },
  submenu: { class: "fl-menu fl-menu--submenu" },
  item: { class: "fl-menu__item" },
  itemHover: { class: "is-focused" },
  itemDisabled: { class: "is-disabled" },
  label: { class: "fl-menu__label" },
  separator: { class: "fl-menu__separator" },
  submenuArrow: { class: "fl-menu__arrow" },
  icon: { class: "fl-menu__icon" },
  shortcut: { class: "fl-menu__shortcut" },
  check: { class: "fl-menu__check" },
};
