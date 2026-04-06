export function Section(title, children) {
  return View({ class: classNames(["space-y-3"]) }, [
    View(
      {
        class: classNames([
          "text-sm font-semibold text-zinc-500 uppercase tracking-wider",
        ]),
      },
      [Txt(title)],
    ),
    View({ class: classNames(["space-y-4 pl-1"]) }, children),
  ]);
}

export function Item(label, children) {
  return View({ class: classNames(["space-y-2"]) }, [
    View({ class: classNames(["text-sm text-zinc-400"]) }, [Txt(label)]),
    View(
      { class: classNames(["flex flex-wrap items-center gap-3"]) },
      children,
    ),
  ]);
}
