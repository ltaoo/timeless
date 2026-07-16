const { View } = Timeless;

export default function AdminLogsView() {
  return View({ class: "p-6" }, [
    View({ class: "space-y-2" }, [
      View({ class: "text-xl font-semibold" }, ["Audit Logs"]),
      View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
        "Audit logs, filter conditions, export, etc. can go here.",
      ]),
    ]),
  ]);
}
