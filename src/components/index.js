export function Section(title, children) {
  return View({ class: cn(["space-y-3"]) }, [
    View(
      {
        class: cn([
          "text-sm font-semibold text-zinc-500 uppercase tracking-wider",
        ]),
      },
      [Txt(title)],
    ),
    View({ class: cn(["space-y-4 pl-1"]) }, children),
  ]);
}

export function Item(label, children) {
  return View({ class: cn(["space-y-2"]) }, [
    View({ class: cn(["text-sm text-zinc-400"]) }, [Txt(label)]),
    View(
      { class: cn(["flex flex-wrap items-center gap-3"]) },
      children,
    ),
  ]);
}

