import { View } from "@timeless/timeless";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@timeless/shadcn";

export function OverviewPageView() {
  return View(
    { class: "flex flex-col gap-6", attributes: { n: "overview-page" } },
    [
      View(
        { class: "text-2xl font-bold", attributes: { n: "overview-title" } },
        ["共享组件示例"],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "overview-description" },
        },
        ["从左侧选择页面。菜单、路由和组件内容共用同一份 Model、View 与 CSS。"],
      ),
      Card({ attributes: { n: "navigation-guide" } }, [
        CardHeader({ attributes: { n: "navigation-guide-header" } }, [
          CardTitle({ attributes: { n: "navigation-guide-title" } }, [
            "浏览页面",
          ]),
          CardDescription(
            { attributes: { n: "navigation-guide-description" } },
            ["侧边菜单与内容区同步切换，工具栏可前进、后退。"],
          ),
        ]),
        CardContent({ attributes: { n: "navigation-guide-content" } }, [
          "在基础组件页点击按钮，再切换页面返回，点击计数会保留。明暗主题作用于整个应用。",
        ]),
      ]),
    ],
  );
}

export function LayoutPageView() {
  return View(
    { class: "flex flex-col gap-6", attributes: { n: "layout-page" } },
    [
      View({ class: "text-2xl font-bold", attributes: { n: "layout-title" } }, [
        "布局与容器",
      ]),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "layout-description" },
        },
        ["固定侧栏、弹性内容区和可换行卡片，均使用共享样式。"],
      ),
      View(
        {
          class: "flex flex-row flex-wrap gap-4",
          attributes: { n: "layout-cards" },
        },
        ["共享布局", "独立滚动", "状态保留"].map((title, index) =>
          Card(
            {
              class: "w-56 shrink-0",
              attributes: { n: `layout-card-${index + 1}` },
            },
            [
              CardHeader(
                { attributes: { n: `layout-card-header-${index + 1}` } },
                [
                  CardTitle(
                    { attributes: { n: `layout-card-title-${index + 1}` } },
                    [title],
                  ),
                ],
              ),
              CardContent(
                { attributes: { n: `layout-card-content-${index + 1}` } },
                [
                  [
                    "Flex 容器随窗口宽度换行。",
                    "内容区滚动时菜单保持可见。",
                    "页面切换后保留组件状态。",
                  ][index],
                ],
              ),
            ],
          ),
        ),
      ),
    ],
  );
}
