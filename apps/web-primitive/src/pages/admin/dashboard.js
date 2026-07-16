const { View } = Timeless;

export default function AdminDashboardView() {
  return View({ class: "p-6" }, [
    View({ class: "space-y-2" }, [
      View({ class: "text-xl font-semibold" }, ["Dashboard"]),
      View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
        "Click a function from the left sidebar to open a tab at the top; click tabs to quickly switch.",
      ]),
    ]),
  ]);
}
