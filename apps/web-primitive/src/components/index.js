const { View, Text } = Timeless;

export function Section(title, children) {
  return View(
    { class: "mb-8" },
    [
      Text({ class: "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3" }, [title]),
      View({ class: "space-y-4" }, Array.isArray(children) ? children : [children]),
    ],
  );
}

export function Item(label, children) {
  return View(
    { class: "flex flex-wrap items-center gap-2" },
    [
      Text({ class: "text-sm font-medium text-foreground w-24 shrink-0" }, [label]),
      View({ class: "flex flex-wrap items-center gap-2" }, Array.isArray(children) ? children : [children]),
    ],
  );
}
