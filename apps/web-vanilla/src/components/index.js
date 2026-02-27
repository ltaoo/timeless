export function Section(title, children) {
  return View({ class: classnames(["space-y-3"]) }, [
    View(
      {
        class: classnames([
          "text-sm font-semibold text-zinc-500 uppercase tracking-wider",
        ]),
      },
      [Txt(title)],
    ),
    View({ class: classnames(["space-y-4 pl-1"]) }, children),
  ]);
}

export function Item(label, children) {
  return View({ class: classnames(["space-y-2"]) }, [
    View({ class: classnames(["text-sm text-zinc-400"]) }, [Txt(label)]),
    View(
      { class: classnames(["flex flex-wrap items-center gap-3"]) },
      children,
    ),
  ]);
}

