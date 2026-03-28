import { PageContent } from "@/components/layout.js";

export default function AdminDashboardView() {
  return PageContent(
    { class: "p-6" },
    [
      View({ class: "space-y-2" }, [
        View({ class: "text-xl font-semibold" }, ["仪表盘"]),
        View({ class: "text-sm text-zinc-500 dark:text-zinc-400" }, [
          "从左侧点击功能，会在顶部生成一个 Tab；点击 Tab 可快速切换。",
        ]),
      ]),
    ],
  );
}

