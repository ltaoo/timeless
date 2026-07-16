const { View, Text, Fragment, ref, computed, Show, For, Portal, Icon } = Timeless;

export default function Page(props) {
  const open_ = ref(false);
  const keyword_ = ref("");

  const commands = [
    { label: "New File", shortcut: "Ctrl+N", action: "Create a new file" },
    { label: "Open Folder", shortcut: "Ctrl+O", action: "Open a folder" },
    { label: "Save", shortcut: "Ctrl+S", action: "Save current file" },
    { label: "Find", shortcut: "Ctrl+F", action: "Find in file" },
    { label: "Command Palette", shortcut: "Ctrl+P", action: "Open command palette" },
    { label: "Toggle Theme", shortcut: "Ctrl+T", action: "Switch light/dark" },
  ];

  const filtered = computed(keyword_, (kw) =>
    kw ? commands.filter((c) => c.label.toLowerCase().includes(kw.toLowerCase())) : commands,
  );

  // Listen for Ctrl+P
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        open_.as(!open_.value);
        keyword_.as("");
      }
      if (e.key === "Escape") {
        open_.as(false);
      }
    });
  }

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Command Palette"]),
    Text({ class: "text-sm text-muted-foreground mb-4" }, ["Press Ctrl+P to open the command palette."]),

    Show({ when: open_, ok() { return [
      Portal({}, [
        View({
          class: "fixed inset-0 z-[300] flex items-start justify-center p-4 pt-[20vh]",
        }, [
          View({
            class: "fixed inset-0 bg-black/50",
            onClick() { open_.as(false); },
          }),
          View({ class: "relative z-10 w-full max-w-lg rounded-xl border border-border bg-white dark:bg-zinc-900 shadow-lg overflow-hidden" }, [
            View({ class: "flex items-center gap-2 px-4 py-3 border-b border-border" }, [
              Icon({ name: "search", size: 16, class: "text-muted-foreground" }),
              View({ as: "input", class: "flex-1 bg-transparent outline-none text-sm", placeholder: "Type a command...", autofocus: true, value: keyword_.value }),
            ]),
            View({ class: "max-h-64 overflow-auto p-1" }, [
              ...filtered.value.map((cmd) =>
                View({
                  class: "flex items-center justify-between px-3 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent",
                  onClick() { open_.as(false); },
                }, [
                  Text({}, [cmd.label]),
                  Text({ class: "text-xs text-muted-foreground" }, [cmd.shortcut]),
                ]),
              ),
            ]),
          ]),
        ]),
      ]),
    ]; } }),
  ]);
}
