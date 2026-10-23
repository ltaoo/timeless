import { View } from "@timeless/timeless";
import {
  Accordion,
  Alert,
  AlertTitle,
  AlertDescription,
  Avatar,
  Badge,
  Button,
  Progress,
  Separator,
  Skeleton,
  Steps,
  Tabs,
} from "@timeless/shadcn";

function Section(name, title, children) {
  return View(
    {
      class: "flex w-full flex-col gap-3",
      attributes: { n: `components-${name}` },
    },
    [
      View(
        {
          class: "text-lg font-semibold",
          attributes: { n: `components-${name}-title` },
        },
        [title],
      ),
      ...children,
    ],
  );
}

export function NavigationComponentsView(model) {
  return View(
    {
      class: "flex w-full max-w-2xl flex-col gap-6",
      attributes: { n: "components-navigation" },
    },
    [
      Section("tabs-section", "Tabs / 标签页", [
        Tabs({
          store: model.tabs,
          attributes: { n: "components-tabs" },
          items: model.tabs.tabs.map((tab) => ({
            ...tab,
            content: [
              View(
                {
                  class: "rounded-lg tt-bg-muted p-4 text-sm",
                  attributes: { n: `components-panel-${tab.value}` },
                },
                [tab.description],
              ),
            ],
          })),
        }),
      ]),
      Section("accordion-section", "Accordion / 单项展开", [
        Accordion({
          store: model.accordion,
          attributes: { n: "components-accordion" },
          items: [
            {
              title: ["页面切换会保留状态吗？"],
              content: ["会保留当前展开项与标签选择。"],
            },
            {
              title: ["这些是实际 shadcn 组件吗？"],
              content: ["是，使用包内组件与共享样式，由宿主渲染。"],
            },
          ],
        }),
      ]),
      Section("multiple-section", "Accordion / 多项展开", [
        Accordion({
          store: model.multiple,
          attributes: { n: "components-multiple" },
          items: [
            { title: ["第一项"], content: ["第一项可以独立展开。"] },
            { title: ["第二项"], content: ["第二项可以同时保持展开。"] },
          ],
        }),
      ]),
      Section("steps-section", "Steps / 步骤", [
        Steps({
          store: model.steps,
          attributes: { n: "components-steps" },
          items: [{ title: "账户" }, { title: "资料" }, { title: "完成" }],
        }),
        View(
          { attributes: { n: "components-step-value", "aria-live": "polite" } },
          [model.stepText],
        ),
        View(
          {
            class: "flex flex-row gap-3",
            attributes: { n: "components-step-actions" },
          },
          [
            Button(
              {
                store: model.previous,
                attributes: { n: "components-step-prev" },
              },
              ["上一步"],
            ),
            Button(
              { store: model.next, attributes: { n: "components-step-next" } },
              ["下一步"],
            ),
          ],
        ),
      ]),
    ],
  );
}

export function DisplayComponentsView(model) {
  return View(
    {
      class: "flex w-full max-w-2xl flex-col gap-6",
      attributes: { n: "components-display" },
    },
    [
      Section("badges", "Badge / 变体", [
        View(
          {
            class: "flex flex-row flex-wrap gap-3",
            attributes: { n: "components-badge-row" },
          },
          ["default", "secondary", "outline", "destructive"].map((variant) =>
            Badge(
              { variant, attributes: { n: `components-badge-${variant}` } },
              [variant],
            ),
          ),
        ),
      ]),
      Section("avatars", "Avatar / 兜底与尺寸", [
        View(
          {
            class: "flex flex-row items-center gap-3",
            attributes: { n: "components-avatar-row" },
          },
          ["sm", "default", "lg"].map((size, index) =>
            Avatar({
              src: "",
              fallback: ["S", "M", "L"][index],
              size,
              attributes: {
                n: `components-avatar-${size}`,
                "aria-label": `${size} 头像`,
              },
            }),
          ),
        ),
      ]),
      Section("separators", "Separator / 两个方向", [
        Separator({ attributes: { n: "components-separator-horizontal" } }),
        View(
          {
            class: "flex h-6 flex-row items-center gap-3",
            attributes: { n: "components-separator-row" },
          },
          [
            "左侧",
            Separator({
              orientation: "vertical",
              attributes: { n: "components-separator-vertical" },
            }),
            "右侧",
          ],
        ),
      ]),
      Section("alerts", "Alert / 提示与错误", [
        Alert({ attributes: { n: "components-alert" } }, [
          AlertTitle({ attributes: { n: "components-alert-title" } }, [
            "Heads up!",
          ]),
          AlertDescription(
            { attributes: { n: "components-alert-description" } },
            ["使用真实 shadcn Alert，继承整个应用的明暗主题。"],
          ),
        ]),
        Alert(
          {
            variant: "destructive",
            attributes: { n: "components-alert-error" },
          },
          [
            AlertTitle({ attributes: { n: "components-alert-error-title" } }, [
              "Error",
            ]),
            AlertDescription(
              { attributes: { n: "components-alert-error-description" } },
              ["这是错误样式示例，不会发起网络请求。"],
            ),
          ],
        ),
      ]),
      Section("progress-section", "Progress / Ref 与 Store", [
        View({ attributes: { n: "components-progress-value" } }, [
          model.progressText,
        ]),
        Progress({
          value: model.progress,
          attributes: { n: "components-progress" },
        }),
        View({ attributes: { n: "components-store-value" } }, [
          model.storeText,
        ]),
        Progress({
          store: model.progressStore,
          attributes: { n: "components-progress-store" },
        }),
        View(
          {
            class: "flex flex-row gap-3",
            attributes: { n: "components-progress-actions" },
          },
          [
            Button(
              {
                store: model.decrease,
                attributes: { n: "components-progress-decrease" },
              },
              ["-10"],
            ),
            Button(
              {
                store: model.increase,
                attributes: { n: "components-progress-increase" },
              },
              ["+10"],
            ),
          ],
        ),
      ]),
      Section("skeletons", "Skeleton / 占位布局", [
        Skeleton({
          class: "h-24 w-full rounded-xl",
          attributes: { n: "components-skeleton-card", "aria-hidden": "true" },
        }),
        Skeleton({
          class: "h-4 w-full",
          attributes: { n: "components-skeleton-line", "aria-hidden": "true" },
        }),
      ]),
    ],
  );
}
