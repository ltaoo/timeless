const { View, Text, Fragment, For, Show, computed, ref, refobj, Icon, Portal } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const dialogOpen_ = ref(false);
  const sheetOpen_ = ref(false);
  const sheetSide_ = ref("right");
  const popoverOpen_ = ref(false);

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Feedback Components"]),

    Section("Dialog", [
      btn({ label: "Open Dialog", onClick() { dialogOpen_.as(true); } }),
      Show({ when: dialogOpen_, ok() { return [
        Portal({}, [
          View({
            class: "fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[10vh]",
          }, [
            // Overlay
            View({
              class: "fixed inset-0 bg-black/50",
              onClick() { dialogOpen_.as(false); },
            }),
            // Content
            View({ class: "relative z-10 w-full max-w-md rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-lg p-6" }, [
              Text({ class: "text-lg font-semibold mb-2" }, ["Dialog Title"]),
              Text({ class: "text-sm text-muted-foreground mb-4" }, ["This is a dialog built with primitive floating components."]),
              View({ class: "flex justify-end gap-2" }, [
                btn({ label: "Cancel", class: "border", onClick() { dialogOpen_.as(false); } }),
                btn({ label: "Confirm", class: "bg-primary text-primary-foreground", onClick() { dialogOpen_.as(false); } }),
              ]),
              View({
                class: "absolute right-3 top-3 rounded p-1 hover:bg-accent cursor-pointer",
                onClick() { dialogOpen_.as(false); },
              }, [Icon({ name: "x", size: 16 })]),
            ]),
          ]),
        ]),
      ]; } }),
    ]),

    Section("Sheet/Drawer", [
      View({ class: "flex gap-2" }, [
        ...[{ s: "right", l: "Right" }, { s: "left", l: "Left" }, { s: "top", l: "Top" }, { s: "bottom", l: "Bottom" }].map(({ s, l }) =>
          btn({ label: l, onClick() { sheetSide_.as(s); sheetOpen_.as(true); } }),
        ),
      ]),
      Show({ when: sheetOpen_, ok() { return [
        Portal({}, [
          View({ class: "fixed inset-0 z-[200]" }, [
            View({
              class: "fixed inset-0 bg-black/50",
              onClick() { sheetOpen_.as(false); },
            }),
            View({ class: {
              right: "fixed right-0 top-0 bottom-0 w-80 border-l border-border bg-white dark:bg-zinc-900 shadow-lg p-6",
              left: "fixed left-0 top-0 bottom-0 w-80 border-r border-border bg-white dark:bg-zinc-900 shadow-lg p-6",
              top: "fixed top-0 left-0 right-0 h-60 border-b border-border bg-white dark:bg-zinc-900 shadow-lg p-6",
              bottom: "fixed bottom-0 left-0 right-0 h-60 border-t border-border bg-white dark:bg-zinc-900 shadow-lg p-6",
            }[sheetSide_.value] }, [
              Text({ class: "text-lg font-semibold mb-4" }, ["Sheet " + sheetSide_.value]),
              Text({ class: "text-sm text-muted-foreground mb-4" }, ["This is a sheet built with primitive floating components."]),
              View({
                class: "absolute right-4 top-4 rounded p-1 hover:bg-accent cursor-pointer",
                onClick() { sheetOpen_.as(false); },
              }, [Icon({ name: "x", size: 16 })]),
            ]),
          ]),
        ]),
      ]; } }),
    ]),

    Section("Popover", [
      View({ class: "relative inline-block" }, [
        btn({
          label: "Toggle Popover",
          onClick() { popoverOpen_.as(!popoverOpen_.value); },
        }),
        Show({ when: popoverOpen_, ok() { return [
          View({
            class: "absolute top-full left-0 mt-2 z-50 w-64 rounded-lg border border-border bg-white dark:bg-zinc-900 shadow-md p-4",
          }, [
            Text({ class: "text-sm font-medium mb-2" }, ["Popover Content"]),
            Text({ class: "text-xs text-muted-foreground" }, ["This popover uses absolute positioning with primitive components."]),
          ]),
        ]; } }),
      ]),
    ]),
  ]);
}

function btn(opts) {
  return View({
    class: "inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 cursor-pointer transition-colors " + (opts.class || "border border-input bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"),
    onClick: opts.onClick,
  }, [opts.label]);
}
