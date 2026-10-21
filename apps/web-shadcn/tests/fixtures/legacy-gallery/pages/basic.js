import { Action, Section, Stack, TextView } from "../components.js";

export function BasicPageView(model) {
  return [
    Section(
      "button-variants",
      "Button / 按钮",
      "保留 shadcn 的六种视觉变体，支持鼠标与键盘操作。",
      [
        Stack(
          "variant-actions",
          [
            ...[
              ["default", "Default", ""],
              ["secondary", "Secondary", "secondary"],
              ["outline", "Outline", "outline"],
              ["ghost", "Ghost", "ghost"],
              ["destructive", "Destructive", "destructive"],
              ["link", "Link", "link"],
            ].map(([key, title, variant]) =>
              Action(
                `button-${key}`,
                title,
                () => model.increment(),
                `button ${variant}`,
              ),
            ),
          ],
          "wrap",
        ),
        Stack(
          "button-states",
          [
            Action(
              "button-small",
              "Small",
              () => model.increment(),
              "button small",
            ),
            Action(
              "button-large",
              "Large",
              () => model.increment(),
              "button large",
            ),
            Action(
              "button-disabled",
              "Disabled",
              () => model.increment(),
              "button",
              { disabled: true },
            ),
            Action(
              "button-loading",
              model.loadingLabel,
              () => model.load(),
              "button outline",
              { disabled: model.loading },
            ),
          ],
          "wrap",
        ),
        Stack(
          "counter-demo",
          [
            TextView("macos-count", model.count, "counter"),
            Action("macos-increment", "增加计数", () => model.increment()),
          ],
          "wrap",
        ),
      ],
    ),
    Section("badge-demo", "Badge / 徽标", "用于状态、标签与数量的轻量展示。", [
      Stack(
        "badge-variants",
        [
          ...[
            ["default", "Default", ""],
            ["secondary", "Secondary", "secondary"],
            ["outline", "Outline", "outline"],
            ["destructive", "Destructive", "destructive"],
          ].map(([key, text, variant]) =>
            TextView(`badge-${key}`, text, `badge ${variant}`),
          ),
        ],
        "wrap",
      ),
    ]),
    Section(
      "typography-demo",
      "Typography / 文本",
      "标题、正文与辅助说明共享同一套颜色与字体层级。",
      [
        TextView(
          "typography-heading",
          "Build once. Feel at home.",
          "display-title",
        ),
        TextView(
          "typography-body",
          "以 Timeless Primitive 组合视图，在 macOS 上呈现熟悉的 shadcn 风格。",
        ),
        TextView(
          "typography-muted",
          "切换页面后，计数与表单内容仍然保留。",
          "muted",
        ),
      ],
    ),
  ];
}
