import { Action, Section, Stack, TextView } from "../components.js";
import { Input, Modal, Popover, Tooltip } from "@timeless/timeless";

export function InteractionPageView(model) {
  const popoverTrigger = Action(
    "popover-trigger",
    "通知设置",
    () => model.togglePopover(),
    "button outline",
    {
      attributes: {
        "aria-expanded": model.popoverOpen,
        "aria-haspopup": "dialog",
      },
    },
  );
  return [
    ...(model.floatingSupported
      ? [
          Section(
            "modal-demo",
            "Modal / 模态窗口",
            "打开后焦点进入窗口；可通过保存、取消、Esc 或点击遮罩关闭。",
            [
              Action(
                "modal-trigger",
                "编辑个人资料",
                () => model.openModal(),
                "button",
                { attributes: { "aria-haspopup": "dialog" } },
              ),
              Modal(
                {
                  class: "modal-surface",
                  open: model.modalOpen,
                  onClose: () => model.closeModal(),
                  attributes: {
                    n: "modal-surface",
                    "aria-label": "编辑个人资料",
                  },
                },
                [
                  TextView("modal-title", "编辑个人资料", "section-title"),
                  TextView(
                    "modal-description",
                    "修改显示名称，保存后会显示操作结果。",
                    "muted",
                  ),
                  TextView("modal-name-label", "显示名称", "field-label"),
                  Input({
                    class: "field",
                    value: model.modalName,
                    attributes: { n: "modal-name", "aria-label": "显示名称" },
                    onInput: (event) => model.setModalName(event.target.value),
                  }),
                  Stack(
                    "modal-actions",
                    [
                      Action(
                        "modal-cancel",
                        "取消",
                        () => model.closeModal(),
                        "button outline",
                      ),
                      Action("modal-save", "保存", () => model.saveModal()),
                    ],
                    "wrap",
                  ),
                ],
              ),
            ],
          ),
          Section(
            "popover-demo",
            "Popover / 气泡面板",
            "面板跟随触发按钮定位；点击外部或按 Esc 关闭。",
            [
              popoverTrigger,
              Popover(
                {
                  class: "popover-surface",
                  anchor: popoverTrigger,
                  open: model.popoverOpen,
                  onClose: () => model.closePopover(),
                  side: "bottom",
                  align: "start",
                  attributes: {
                    n: "popover-surface",
                    "aria-label": "通知设置",
                  },
                },
                [
                  TextView("popover-title", "通知设置", "section-title"),
                  TextView("popover-description", "设置通知文案。", "muted"),
                  Input({
                    class: "field",
                    value: model.popoverMessage,
                    attributes: {
                      n: "popover-message",
                      "aria-label": "通知文案",
                    },
                    onInput: (event) =>
                      model.setPopoverMessage(event.target.value),
                  }),
                  Action("popover-save", "保存设置", () => model.savePopover()),
                ],
              ),
            ],
          ),
          Section(
            "tooltip-demo",
            "Tooltip / 文字提示",
            "鼠标悬停或键盘聚焦按钮可查看提示；移开、失焦或按 Esc 隐藏。",
            [
              Tooltip(
                {
                  class: "tooltip-surface",
                  visible: model.tooltipVisible,
                  side: "top",
                  align: "center",
                  onClose: () => model.closeTooltip(),
                  attributes: {
                    n: "tooltip-surface",
                    "aria-label": "保存说明",
                  },
                  content: [
                    TextView(
                      "tooltip-text",
                      "保存当前设置，修改会保留在本次运行中。",
                      "tooltip-text",
                    ),
                  ],
                },
                [
                  Action(
                    "tooltip-trigger",
                    "悬停或聚焦查看提示",
                    () => {},
                    "button outline",
                    {
                      attributes: { "aria-describedby": "tooltip-surface" },
                      onMouseEnter: () => model.setTooltipState("hover", true),
                      onMouseLeave: () => model.setTooltipState("hover", false),
                      onFocus: () => model.setTooltipState("focus", true),
                      onBlur: () => model.setTooltipState("focus", false),
                    },
                  ),
                ],
              ),
            ],
          ),
        ]
      : []),
    Section(
      "accordion-demo",
      "Accordion / 折叠面板",
      "点击标题展开或收起内容。",
      [
        Action(
          "accordion-trigger",
          model.accordionLabel,
          () => model.toggleAccordion(),
          "button outline",
        ),
        Stack(
          "accordion-content",
          [
            TextView(
              "accordion-answer",
              "可以。路由切换只改变当前页面，Model 中的计数、输入内容与交互状态会保留。",
            ),
          ],
          model.accordionClass,
        ),
      ],
    ),
    Section("tabs-demo", "Tabs / 标签页", "两个标签共享一个内容容器。", [
      Stack(
        "tabs-triggers",
        [
          Action(
            "tab-preview",
            "预览",
            () => model.selectTab("preview"),
            model.previewButton,
          ),
          Action(
            "tab-details",
            "说明",
            () => model.selectTab("details"),
            model.detailsButton,
          ),
        ],
        "wrap",
      ),
      Stack(
        "tab-preview-panel",
        [TextView("tab-preview-text", "这是预览面板。你可以切换到说明标签。")],
        model.previewClass,
      ),
      Stack(
        "tab-details-panel",
        [
          TextView(
            "tab-details-text",
            "标签、选中样式和面板可见性由 Model 的同一份状态驱动。",
          ),
        ],
        model.detailsClass,
      ),
    ]),
    Section(
      "feedback-demo",
      "Alert / Toast / 操作确认",
      "显示与关闭消息，并通过二次确认执行示例操作。",
      [
        Stack(
          "alert-message",
          [
            TextView("alert-text", "提示：本页面中的操作均为本地示例。"),
            Action(
              "alert-dismiss",
              "关闭提示",
              () => model.dismissAlert(),
              "button ghost small",
            ),
          ],
          model.alertClass,
        ),
        Stack(
          "feedback-actions",
          [
            Action(
              "alert-restore",
              "显示 Alert",
              () => model.restoreAlert(),
              "button outline",
            ),
            Action(
              "toast-show",
              "显示通知",
              () => model.showToast(),
              "button outline",
            ),
            Action(
              "confirm-open",
              "需要确认的操作",
              () => model.askConfirm(),
              "button destructive",
            ),
          ],
          "wrap",
        ),
        Stack(
          "confirmation",
          [
            TextView("confirmation-text", "确定执行这次示例操作吗？"),
            Stack(
              "confirmation-actions",
              [
                Action("confirm-accept", "确认", () => model.confirm()),
                Action(
                  "confirm-cancel",
                  "取消",
                  () => model.cancelConfirm(),
                  "button outline",
                ),
              ],
              "wrap",
            ),
          ],
          model.confirmClass,
        ),
        TextView("interaction-result", model.result, "muted"),
      ],
    ),
  ];
}
