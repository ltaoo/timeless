import { AspectRatio, Grid, ScrollView, View } from "@timeless/timeless";
import { Section, Stack, TextView } from "../components.js";

export function LayoutPageView() {
  return [
    Section(
      "flex-demo",
      "Flex / 弹性布局",
      "横向排列与纵向堆叠，窗口缩放时自动分配空间。",
      [
        Stack(
          "flex-row",
          ["Left", "Center", "Right"].map((label) =>
            TextView(`flex-${label.toLowerCase()}`, label, "tile grow"),
          ),
          "row",
        ),
        Stack("flex-column", [
          TextView("column-top", "Column / 上", "tile"),
          TextView("column-bottom", "Column / 下", "tile"),
        ]),
      ],
    ),
    Section("grid-demo", "Grid / 网格", "三列等宽的网格容器。", [
      Grid(
        {
          cols: 3,
          gap: 10,
          class: "demo-grid",
          attributes: { n: "layout-grid" },
        },
        [1, 2, 3, 4, 5, 6].map((index) =>
          TextView(`grid-cell-${index}`, `Item ${index}`, "tile"),
        ),
      ),
    ]),
    Section(
      "card-demo",
      "Card / 容器",
      "标题、内容和分隔线组成一张信息卡片。",
      [
        Stack(
          "example-card",
          [
            TextView("card-title", "项目概览", "section-title"),
            TextView("card-description", "Timeless Shadcn for macOS", "muted"),
            View({ class: "separator", attributes: { n: "card-separator" } }),
            TextView(
              "card-content",
              "同一份组件形状，多平台宿主实现。页面使用 class 定义布局与视觉样式。",
            ),
          ],
          "panel",
        ),
        AspectRatio(
          {
            ratio: 16 / 9,
            class: "ratio-box",
            attributes: { n: "aspect-ratio" },
          },
          [TextView("ratio-label", "AspectRatio · 16 : 9", "ratio-label")],
        ),
      ],
    ),
    Section(
      "scroll-demo",
      "ScrollView / 滚动容器",
      "在固定高度的容器中滚动，侧边导航保持可见。",
      [
        ScrollView(
          {
            class: "demo-scroll",
            attributes: { n: "layout-scroll" },
            horizontal: "hidden",
            vertical: "auto",
          },
          [
            Stack(
              "scroll-items",
              Array.from({ length: 16 }, (_, index) =>
                TextView(
                  `scroll-item-${index + 1}`,
                  `组件条目 ${String(index + 1).padStart(2, "0")}`,
                  "scroll-item",
                ),
              ),
            ),
          ],
        ),
      ],
    ),
  ];
}
