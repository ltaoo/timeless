import { MenuCore } from "@timeless/ui";

const MENU_CONTENT_CLASS =
  "min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-700 shadow-md dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50";

// Patch: fix item.menu.onEnter listener leak in MenuCore.listen_item
{
  const proto = MenuCore.prototype;
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

export const t = {
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
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-50",
  },
  itemHover: { class: "bg-gray-100 dark:bg-gray-800" },
  label: {
    class: "px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50",
  },
  separator: { class: "-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-800" },
  submenuArrow: {
    class: "ml-auto pl-2 text-xs text-gray-400 dark:text-gray-500",
  },
};
