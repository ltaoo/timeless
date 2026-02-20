import { Menu as HMenu, MenuItem as HItem, MenuLabel as HLabel, MenuSeparator as HSep, DropdownMenu as HDrop } from "../headless/menu.js";

const t = {
  menu: { style: "background:var(--weui-BG-2);border-radius:8px;box-shadow:0 0 6px rgb(0 0 0 / 20%);padding:8px;color:var(--weui-FG-0);" },
  item: { style: "position:relative;display:flex;align-items:center;padding:8px;border-radius:4px;font-size:14px;color:var(--weui-FG-0);cursor:pointer;min-width:6em;transition:background .15s ease-in-out;" },
  itemHover: { style: "background:var(--weui-STATELAYER-PRESSED);" },
  label: { style: "padding:8px;font-size:12px;font-weight:600;color:var(--weui-FG-0);" },
  separator: { style: "height:1px;margin:4px 0;background:var(--weui-SEPARATOR-0);" },
  submenuArrow: { style: "position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;align-items:center;color:var(--weui-FG-2);" },
};

export function Menu(p, c) { return HMenu({ ...p, theme: t }, c); }
export function MenuItem(p, c) { return HItem({ ...p, theme: t }, c); }
export function MenuLabel(p, c) { return HLabel({ ...p, theme: t }, c); }
export function MenuSeparator(p) { return HSep({ ...p, theme: t }); }
export function DropdownMenu(p, c) { return HDrop({ ...p, theme: t }, c); }
