const { View } = Timeless;
import { findMockUserById } from "./data.js";

export default function AdminUserDetailView(props) {
  const user = findMockUserById(props.view?.query?.id);
  const nextId = (() => {
    const cur = Number(user?.id || "0");
    if (!cur) return "1";
    return String(((cur % 10) || 0) + 1);
  })();

  return View({ class: "p-6" }, [
    View({ class: "space-y-4" }, [
      View({ class: "flex items-center justify-between gap-3" }, [
        View({ class: "space-y-1" }, [
          View({ class: "text-xl font-semibold" }, ["User Detail"]),
          View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
            user ? `Current user: ${user.name}` : "User not found",
          ]),
        ]),
        View({ class: "flex items-center gap-2" }, [
          View(
            {
              class: "rounded-md border border-input px-3 py-1.5 text-sm cursor-pointer hover:bg-accent",
              onClick() {
                props.history.push("root.admin_layout.users");
              },
            },
            ["Back to Users"],
          ),
          View(
            {
              class: "rounded-md border border-input px-3 py-1.5 text-sm cursor-pointer hover:bg-accent",
              onClick() {
                props.history.push("root.admin_layout.user_detail", { id: nextId });
              },
            },
            [`Open User ${nextId}`],
          ),
        ]),
      ]),
      View(
        {
          class: "border rounded-lg bg-white dark:bg-zinc-950 dark:border-zinc-800",
        },
        [
          View({ class: "p-4 space-y-2" }, [
            View({ class: "text-sm" }, [
              View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, ["ID"]),
              View({ class: "font-medium" }, [user?.id || "-"]),
            ]),
            View({ class: "text-sm" }, [
              View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, ["Username"]),
              View({ class: "font-medium" }, [user?.username || "-"]),
            ]),
            View({ class: "text-sm" }, [
              View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, ["Email"]),
              View({ class: "font-medium" }, [user?.email || "-"]),
            ]),
            View({ class: "text-sm" }, [
              View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, ["Role / Status"]),
              View({ class: "font-medium" }, [
                user ? `${user.role} / ${user.status}` : "-",
              ]),
            ]),
            View({ class: "text-sm" }, [
              View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, ["Created"]),
              View({ class: "font-medium" }, [user?.createdAt || "-"]),
            ]),
          ]),
        ],
      ),
    ]),
  ]);
}
