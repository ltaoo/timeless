const { View, Text, Fragment, ref, refobj, computed, Show, For, Icon, Portal } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const dropdownOpen_ = ref(false);
  const tooltipVisible_ = ref(false);
  const contextMenuOpen_ = ref(false);
  const contextPos_ = ref({ x: 0, y: 0 });

  const menuItems = [
    { label: "New File", shortcut: "Ctrl+N" },
    { label: "Open Folder", shortcut: "Ctrl+O" },
    { separator: true },
    { label: "Settings", shortcut: "Ctrl+," },
    { label: "Delete", shortcut: "Del", disabled: true },
  ];

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Overlay Components"]),

    Section("Dropdown Menu", [
      View({ class: "relative inline-block" }, [
        View({
          class: "inline-flex items-center gap-1 rounded-md border border-input bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm cursor-pointer hover:bg-accent",
          onClick() { dropdownOpen_.as(!dropdownOpen_.value); },
        }, ["Actions", Icon({ name: "chevron-down", size: 14 })]),
        Show({ when: dropdownOpen_, ok() { return [
          View({
            class: "absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-lg border border-border bg-white dark:bg-zinc-900 shadow-md p-1",
            onClick() { dropdownOpen_.as(false); },
          }, menuItems.map((item) => {
            if (item.separator) return View({ class: "-mx-1 my-1 h-px bg-border" });
            return View({
              class: "flex items-center justify-between px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent " + (item.disabled ? "opacity-50 cursor-not-allowed" : ""),
            }, [
              Text({}, [item.label]),
              item.shortcut ? Text({ class: "text-xs text-muted-foreground" }, [item.shortcut]) : null,
            ]);
          })),
        ]; } }),
      ]),
    ]),

    Section("Tooltip", [
      View({
        class: "relative inline-block",
        onMouseEnter() { tooltipVisible_.as(true); },
        onMouseLeave() { tooltipVisible_.as(false); },
      }, [
        View({ class: "inline-flex rounded-md border border-input bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm" }, ["Hover me"]),
        Show({ when: tooltipVisible_, ok() { return [
          View({ class: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 rounded-md bg-foreground px-3 py-1.5 text-xs text-background whitespace-nowrap" }, [
            "Tooltip text here",
          ]),
        ]; } }),
      ]),
    ]),

    Section("Context Menu", [
      View({
        class: "inline-flex rounded-md border border-input bg-white dark:bg-zinc-900 px-4 py-2 text-sm cursor-context-menu",
        onContextMenu(e) {
          // In a real app this would use the actual event coordinates
          contextMenuOpen_.as(true);
        },
      }, ["Right-click me"]),
      Show({ when: contextMenuOpen_, ok() { return [
        Portal({}, [
          View({
            class: "fixed inset-0 z-[200]",
            onClick() { contextMenuOpen_.as(false); },
          }, [
            View({
              class: "fixed z-[201] min-w-[160px] rounded-lg border border-border bg-white dark:bg-zinc-900 shadow-md p-1",
              style: { left: "200px", top: "300px" },
            }, menuItems.map((item) => {
              if (item.separator) return View({ class: "-mx-1 my-1 h-px bg-border" });
              return View({
                class: "px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent" + (item.disabled ? " opacity-50 cursor-not-allowed" : ""),
              }, [item.label]);
            })),
          ]),
        ]),
      ]; } }),
    ]),
  ]);
}
