// import { MenuCore } from "@timeless/ui";
// import {
//   Menu as HMenu,
//   MenuItem as HItem,
//   MenuLabel as HLabel,
//   MenuSeparator as HSep,
//   DropdownMenu as HDrop,
// } from "@timeless/timeless";

// {
//   const proto = MenuCore.prototype;
//   const orig = proto.listen_item;
//   proto.listen_item = function (this: any, e: any) {
//     if (e.menu) {
//       const origOnEnter = e.menu.onEnter.bind(e.menu);
//       let unsub: any = null;
//       e.menu.onEnter = function (handler: any) {
//         if (unsub) unsub();
//         unsub = origOnEnter(handler);
//         return unsub;
//       };
//     }
//     return orig.call(this, e);
//   };
// }



// const t = {
//   animation: {
//     in: "weui-animate-menu-in",
//     out: "weui-animate-menu-out",
//   },
//   subAnimation: {
//     // in: "weui-animate-menu-sub-in",
//     // out: "weui-animate-menu-sub-out",
//     in: "animate-in fade-in-0",
//     out: "animate-out fade-out-0",
//   },
//   menu: {
//     style:
//       "background:var(--weui-BG-2);border-radius:8px;box-shadow:0 0 6px rgb(0 0 0 / 20%);padding:8px;color:var(--weui-FG-0);",
//   },
//   item: {
//     style:
//       "position:relative;display:flex;align-items:center;padding:8px;border-radius:4px;font-size:14px;color:var(--weui-FG-0);cursor:pointer;min-width:6em;transition:background .15s ease-in-out;",
//   },
//   itemHover: { style: "background:var(--weui-STATELAYER-PRESSED);" },
//   label: {
//     style: "padding:8px;font-size:12px;font-weight:600;color:var(--weui-FG-0);",
//   },
//   separator: {
//     style: "height:1px;margin:4px 0;background:var(--weui-SEPARATOR-0);",
//   },
//   submenuArrow: {
//     style:
//       "position:absolute;right:4px;top:50%;transform:translateY(-50%);display:flex;align-items:center;color:var(--weui-FG-2);",
//   },
// };

// export function Menu(p: Parameters<typeof HMenu>[0], c?: any) {
//   return HMenu({ ...p, theme: t }, c);
// }
// export function MenuItem(p: Parameters<typeof HItem>[0], c?: any) {
//   return HItem({ ...p, theme: t }, c);
// }
// export function MenuLabel(p: Parameters<typeof HLabel>[0], c?: any) {
//   return HLabel({ ...p, theme: t }, c);
// }
// export function MenuSeparator(p: Parameters<typeof HSep>[0]) {
//   return HSep({ ...p, theme: t });
// }
// export function DropdownMenu(p: Parameters<typeof HDrop>[0], c?: any) {
//   return HDrop({ ...p, theme: t }, c);
// }
