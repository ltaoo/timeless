import { PageContent } from "@/components/layout.js";

export default function AdminLogsView() {
  return PageContent(
    { class: "p-6" },
    [
      View({ class: "space-y-2" }, [
        View({ class: "text-xl font-semibold" }, ["操作日志"]),
        View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
          "这里可以放审计日志、筛选条件、导出等。",
        ]),
      ]),
    ],
  );
}

