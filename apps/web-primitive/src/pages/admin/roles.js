const { View } = Timeless;

export default function AdminRolesView() {
  return View({ class: "p-6" }, [
    View({ class: "space-y-2" }, [
      View({ class: "text-xl font-semibold" }, ["Roles & Permissions"]),
      View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
        "Role list, permission tree, authorization dialogs, etc. can go here.",
      ]),
    ]),
  ]);
}
