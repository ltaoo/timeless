import { PageContent } from "@/components/layout.js";
import { findMockUserById } from "./data.js";

export default function AdminUserDetailView(props) {
  const user = findMockUserById(props.view?.query?.id);
  const nextId = (() => {
    const cur = Number(user?.id || "0");
    if (!cur) {
      return "1";
    }
    return String(((cur % 10) || 0) + 1);
  })();

  return PageContent(
    { class: "p-6" },
    [
      View({ class: "space-y-4" }, [
        View({ class: "flex items-center justify-between gap-3" }, [
          View({ class: "space-y-1" }, [
            View({ class: "text-xl font-semibold" }, ["用户详情"]),
            View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
              user ? `当前用户：${user.name}` : "未找到用户",
            ]),
          ]),
          View({ class: "flex items-center gap-2" }, [
            Button(
              {
                store: new Timeless.vm.ButtonCore({
                  variant: "outline",
                  onClick() {
                    props.history.push("root.admin_layout.users");
                  },
                }),
              },
              ["返回用户管理"],
            ),
            Button(
              {
                store: new Timeless.vm.ButtonCore({
                  variant: "outline",
                  onClick() {
                    props.history.push("root.admin_layout.user_detail", {
                      id: nextId,
                    });
                  },
                }),
              },
              [`打开用户 ${nextId}`],
            ),
          ]),
        ]),
        View(
          {
            class:
              "border rounded-lg bg-white dark:bg-zinc-950 dark:border-zinc-800",
          },
          [
            View({ class: "p-4 space-y-2" }, [
              View({ class: "text-sm" }, [
                View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, [
                  "ID",
                ]),
                View({ class: "font-medium" }, [user?.id || "-"]),
              ]),
              View({ class: "text-sm" }, [
                View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, [
                  "用户名",
                ]),
                View({ class: "font-medium" }, [user?.username || "-"]),
              ]),
              View({ class: "text-sm" }, [
                View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, [
                  "邮箱",
                ]),
                View({ class: "font-medium" }, [user?.email || "-"]),
              ]),
              View({ class: "text-sm" }, [
                View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, [
                  "角色 / 状态",
                ]),
                View({ class: "font-medium" }, [
                  user ? `${user.role} / ${user.status}` : "-",
                ]),
              ]),
              View({ class: "text-sm" }, [
                View({ class: "text-xs text-zinc-500 dark:text-zinc-400" }, [
                  "创建时间",
                ]),
                View({ class: "font-medium" }, [user?.createdAt || "-"]),
              ]),
            ]),
          ],
        ),
      ]),
    ],
  );
}

