import { Drawer, Modal, Popover, Tooltip, View } from "@timeless/timeless";
import {
  Button,
  ContextMenu,
  DropdownMenu,
  Input,
  Label,
} from "@timeless/shadcn";

export function FloatingPageView(model) {
  const popoverTrigger = Button(
    {
      store: model.togglePopover,
      attributes: {
        n: "floating-popover-trigger",
        "aria-haspopup": "dialog",
        "aria-expanded": model.popoverExpanded,
        "aria-controls": "floating-popover",
      },
    },
    ["打开 Popover"],
  );
  return View(
    {
      class: "flex w-full max-w-2xl flex-col gap-6",
      attributes: { n: "floating-page" },
    },
    [
      View(
        { class: "text-2xl font-bold", attributes: { n: "floating-title" } },
        ["浮层组件"],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "floating-description" },
        },
        [
          "Modal、Popover、Tooltip、Drawer 使用共享 Primitive；DropdownMenu 和 ContextMenu 使用真实 shadcn 组件。",
        ],
      ),
      View(
        {
          class: "flex flex-row flex-wrap gap-3",
          attributes: { n: "floating-triggers" },
        },
        [
          Button(
            {
              store: model.openModal,
              attributes: {
                n: "floating-modal-trigger",
                "aria-haspopup": "dialog",
              },
            },
            ["打开 Modal"],
          ),
          popoverTrigger,
          DropdownMenu(
            {
              store: model.dropdown,
              attributes: { n: "floating-dropdown-content" },
            },
            [
              Button(
                {
                  store: model.dropdownTrigger,
                  attributes: { n: "floating-dropdown-trigger" },
                },
                ["打开 DropdownMenu"],
              ),
            ],
          ),
          Button(
            {
              store: model.openDrawer,
              attributes: {
                n: "floating-drawer-trigger",
                "aria-haspopup": "dialog",
              },
            },
            ["打开 Drawer"],
          ),
          Tooltip(
            {
              visible: model.tooltipVisible,
              content: "保存的名称会保留在本次运行中。",
              side: "top",
              align: "center",
              onClose: model.closeTooltip,
              class:
                "w-fit max-w-xs rounded-md tt-bg-foreground px-3 py-1.5 text-xs tt-text-background",
              id: "floating-tooltip",
              attributes: {
                n: "floating-tooltip-surface",
                "aria-label": "保存说明",
              },
            },
            [
              Button(
                {
                  store: model.tooltip,
                  attributes: {
                    n: "floating-tooltip-trigger",
                    "aria-describedby": "floating-tooltip",
                  },
                  onMouseEnter: () => model.setTooltipState("hover", true),
                  onMouseLeave: () => model.setTooltipState("hover", false),
                  onFocus: () => model.setTooltipState("focus", true),
                  onBlur: () => model.setTooltipState("focus", false),
                },
                ["悬停或聚焦 Tooltip"],
              ),
            ],
          ),
        ],
      ),
      ContextMenu(
        {
          store: model.contextMenu,
          attributes: { n: "floating-context-content" },
        },
        [
          View(
            {
              class:
                "flex h-24 items-center justify-center rounded-lg border border-dashed tt-border-border text-sm tt-text-muted-foreground",
              attributes: {
                n: "floating-context-trigger",
                tabindex: 0,
                "aria-haspopup": "menu",
                "aria-label": "右键打开上下文菜单，也可按 Shift+F10",
              },
            },
            ["在此区域右键打开 ContextMenu（Shift+F10）"],
          ),
        ],
      ),
      Drawer(
        {
          visible: model.drawerOpen,
          side: "right",
          onClose: model.closeDrawer,
          class:
            "flex w-80 flex-col gap-4 tt-bg-popover p-6 tt-text-popover-foreground shadow-lg",
          attributes: {
            n: "floating-drawer",
            "aria-labelledby": "floating-drawer-title",
            "aria-describedby": "floating-drawer-description",
          },
        },
        [
          View(
            {
              id: "floating-drawer-title",
              class: "text-lg font-semibold",
              attributes: { n: "floating-drawer-title" },
            },
            ["Drawer / 详情抽屉"],
          ),
          View(
            {
              id: "floating-drawer-description",
              class: "text-sm tt-text-muted-foreground",
              attributes: { n: "floating-drawer-description" },
            },
            [
              "抽屉固定在窗口右侧。按 Esc、点击背景或下方按钮关闭；Tab 焦点保持在抽屉内。",
            ],
          ),
          Button(
            {
              store: model.drawerClose,
              attributes: { n: "floating-drawer-close" },
            },
            ["关闭抽屉"],
          ),
        ],
      ),
      Modal(
        {
          open: model.modalOpen,
          onClose: model.closeModal,
          class:
            "m-auto flex w-96 max-w-full flex-col gap-4 rounded-xl tt-bg-popover p-6 tt-text-popover-foreground shadow-md tt-ring-1 tt-ring-foreground/10",
          attributes: {
            n: "floating-modal",
            "aria-labelledby": "floating-modal-title",
            "aria-describedby": "floating-modal-description",
          },
        },
        [
          View(
            {
              id: "floating-modal-title",
              class: "text-lg font-semibold",
              attributes: { n: "floating-modal-title" },
            },
            ["编辑显示名称"],
          ),
          View(
            {
              id: "floating-modal-description",
              class: "text-sm tt-text-muted-foreground",
              attributes: { n: "floating-modal-description" },
            },
            ["保存或取消、按 Esc、点击背景均可关闭。Tab 在窗口内移动焦点。"],
          ),
          Label(
            { for: "floating-name", attributes: { n: "floating-name-label" } },
            ["显示名称"],
          ),
          Input({
            store: model.name,
            id: "floating-name",
            attributes: { n: "floating-name" },
          }),
          View(
            {
              class: "text-sm tt-text-destructive",
              attributes: { n: "floating-modal-error", "aria-live": "polite" },
            },
            [model.error],
          ),
          View(
            {
              class: "flex flex-row justify-end gap-3",
              attributes: { n: "floating-modal-actions" },
            },
            [
              Button(
                {
                  store: model.cancelModal,
                  attributes: { n: "floating-modal-cancel" },
                },
                ["取消"],
              ),
              Button(
                {
                  store: model.saveModal,
                  attributes: { n: "floating-modal-save" },
                },
                ["保存"],
              ),
            ],
          ),
        ],
      ),
      Popover(
        {
          open: model.popoverOpen,
          anchor: popoverTrigger,
          side: "bottom",
          align: "start",
          onClose: model.dismissPopover,
          id: "floating-popover",
          class:
            "flex w-72 flex-col gap-3 rounded-lg tt-bg-popover p-4 text-sm tt-text-popover-foreground shadow-md tt-ring-1 tt-ring-foreground/10",
          attributes: {
            n: "floating-popover",
            "aria-labelledby": "floating-popover-title",
          },
        },
        [
          View(
            {
              id: "floating-popover-title",
              class: "font-semibold",
              attributes: { n: "floating-popover-title" },
            },
            ["Popover / 气泡面板"],
          ),
          View({ attributes: { n: "floating-popover-description" } }, [
            "面板跟随按钮定位，点击外部或按 Esc 关闭，内容不受滚动容器裁剪。",
          ]),
          Button(
            {
              store: model.closePopover,
              attributes: { n: "floating-popover-close" },
            },
            ["关闭面板"],
          ),
        ],
      ),
      View(
        {
          class: "rounded-lg tt-bg-muted p-4 text-sm",
          attributes: { n: "floating-result", "aria-live": "polite" },
        },
        [model.result],
      ),
    ],
  );
}
