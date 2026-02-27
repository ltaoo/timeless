const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md";

// Patch: fix item.menu.onEnter listener leak in MenuCore.listen_item
{
  const proto = Timeless.ui.MenuCore.prototype;
  const orig = proto.listen_item;
  proto.listen_item = function (this: any, e: any) {
    if (e.menu) {
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
}

import {
  Menu as HMenu,
  DropdownMenu as HDropdownMenu,
  MenuItem as HItem,
  MenuLabel as HLabel,
  MenuSeparator as HSep,
} from "@timeless/headless";

const t = {
  animation: {
    in: "animate-in fade-in-0 zoom-in-95",
    out: "animate-out fade-out-0 zoom-out-95",
  },
  subAnimation: {
    in: "animate-in fade-in-0",
    out: "animate-out fade-out-0",
  },
  menu: { class: MENU_CONTENT_CLASS },
  item: {
    class:
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  },
  itemHover: { class: "bg-gray-100" },
  label: { class: "px-2 py-1.5 text-sm font-semibold text-gray-900" },
  separator: { class: "-mx-1 my-1 h-px bg-gray-100" },
  submenuArrow: { class: "ml-auto pl-2 text-xs text-gray-400" },
};

export function Menu(p: any, c?: any) {
  return HMenu({ ...p, theme: t }, c);
}
export function MenuItem(p: any, c?: any) {
  return HItem({ ...p, theme: t }, c);
}
export function MenuLabel(p: any, c?: any) {
  return HLabel({ ...p, theme: t }, c);
}
export function MenuSeparator(p: any) {
  return HSep({ ...p, theme: t });
}
export function DropdownMenu(p: any, c?: any) {
  return HDropdownMenu({ ...p, theme: t }, c);
}
