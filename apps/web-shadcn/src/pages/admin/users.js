import { PageContent } from "@/components/layout.js";

import { mockUsers } from "./data.js";

export default function AdminUsersView(props) {
  return PageContent({ class: "p-6" }, [
    View({ class: "space-y-4" }, [
      View({ class: "space-y-2" }, [
        View({ class: "text-xl font-semibold" }, ["用户管理"]),
        View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
          "点击一行打开用户详情（会在顶部创建 Tab）；用户 1 / 用户 2 的详情 Tab 可同时存在并切换。",
        ]),
      ]),
      View(
        {
          class:
            "border rounded-lg overflow-hidden bg-white dark:bg-zinc-950 dark:border-zinc-800",
        },
        [
          View(
            {
              class:
                "px-4 py-2 text-xs font-semibold text-zinc-500 bg-zinc-50 border-b dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400",
            },
            ["Mock Users (10)"],
          ),
          For({
            each: mockUsers,
            render(user) {
              return View(
                {
                  class:
                    "px-4 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b last:border-b-0 dark:border-zinc-800",
                  onClick() {
                    const routeName = "root.admin_layout.user_detail";
                    props.history.push(routeName, { id: user.id });
                  },
                },
                [
                  View({ class: "min-w-0 flex-1" }, [
                    View({ class: "text-sm font-medium truncate" }, [
                      `${user.name} (${user.username})`,
                    ]),
                    View(
                      { class: "text-xs text-zinc-500 dark:text-zinc-400" },
                      [user.email],
                    ),
                  ]),
                  View({ class: "shrink-0 text-xs text-zinc-500" }, [
                    `${user.role} · ${user.status}`,
                  ]),
                ],
              );
            },
          }),
        ],
      ),
    ]),
  ]);
}
