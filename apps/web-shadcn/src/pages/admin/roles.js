import { PageContent } from "@/components/layout.js";

export default function AdminRolesView() {
  return PageContent(
    { class: "p-6" },
    [
      View({ class: "space-y-2" }, [
        View({ class: "text-xl font-semibold" }, ["角色权限"]),
        View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
          "这里可以放角色列表、权限树、授权弹窗等。",
        ]),
      ]),
    ],
  );
}

