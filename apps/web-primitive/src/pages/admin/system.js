const { View } = Timeless;

export default function AdminSystemSettingsView() {
  return View({ class: "p-6" }, [
    View({ class: "space-y-2" }, [
      View({ class: "text-xl font-semibold" }, ["System Settings"]),
      View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
        "Site config, feature toggles, dictionary management, etc. can go here.",
      ]),
    ]),
  ]);
}
