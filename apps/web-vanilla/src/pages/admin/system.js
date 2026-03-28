import { PageContent } from "@/components/layout.js";

export default function AdminSystemSettingsView() {
  return PageContent(
    { class: "p-6" },
    [
      View({ class: "space-y-2" }, [
        View({ class: "text-xl font-semibold" }, ["系统设置"]),
        View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
          "这里可以放站点配置、开关项、字典管理等。",
        ]),
      ]),
    ],
  );
}

