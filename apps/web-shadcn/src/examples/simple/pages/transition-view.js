import { ui, View } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";

export function TransitionPageView(model) {
  return View(
    {
      class: "flex w-full max-w-2xl flex-col gap-6",
      attributes: { n: "transition-page" },
    },
    [
      View(
        { class: "text-2xl font-bold", attributes: { n: "transition-title" } },
        ["Transition / 过渡动画"],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "transition-description" },
        },
        [
          "参考 shadcn 示例：淡入淡出、滑动和缩放。前四项退场后移除内容；最后一项保留消失动画的最后一帧。",
        ],
      ),
      ...model.effects.map((effect) =>
        View(
          {
            class: "flex flex-col gap-3",
            attributes: { n: `transition-${effect.key}-section` },
          },
          [
            View(
              {
                class: "font-semibold",
                attributes: { n: `transition-${effect.key}-title` },
              },
              [effect.title],
            ),
            View(
              {
                class: "flex flex-row gap-3",
                attributes: { n: `transition-${effect.key}-actions` },
              },
              [
                Button(
                  {
                    store: effect.show,
                    attributes: { n: `transition-${effect.key}-show` },
                  },
                  ["显示"],
                ),
                Button(
                  {
                    store: effect.hide,
                    attributes: { n: `transition-${effect.key}-hide` },
                  },
                  ["隐藏"],
                ),
              ],
            ),
            View(
              {
                class: "min-h-16",
                attributes: { n: `transition-${effect.key}-stage` },
              },
              [
                ui.Transition(
                  {
                    store: effect.presence,
                    class: "rounded-lg tt-bg-muted p-4 text-sm",
                    animation: {
                      in: `tt-animate-in ${effect.enter} tt-duration-300 tt-fill-mode-both`,
                      out: `tt-animate-out ${effect.exit} tt-duration-300 tt-fill-mode-both`,
                    },
                    attributes: { n: `transition-${effect.key}-content` },
                  },
                  [effect.title],
                ),
              ],
            ),
          ],
        ),
      ),
      View(
        {
          class: "flex flex-col gap-3",
          attributes: { n: "transition-sticky-section" },
        },
        [
          View(
            {
              class: "font-semibold",
              attributes: { n: "transition-sticky-title" },
            },
            ["Forwards / 消失后保持最后一帧"],
          ),
          View(
            {
              class: "flex flex-row gap-3",
              attributes: { n: "transition-sticky-actions" },
            },
            [
              Button(
                {
                  store: model.hideSticky,
                  attributes: { n: "transition-sticky-hide" },
                },
                ["消失并保持"],
              ),
              Button(
                {
                  store: model.restoreSticky,
                  attributes: { n: "transition-sticky-restore" },
                },
                ["恢复显示"],
              ),
            ],
          ),
          View(
            {
              class: model.stickyClass,
              style: { "animation-fill-mode": "forwards" },
              attributes: { n: "transition-sticky-content" },
              onAnimationEnd(event) {
                if (event.target === event.currentTarget) model.stickyEnded();
              },
            },
            ["消失后保留节点和布局；点击恢复显示。"],
          ),
          View(
            {
              class: "text-sm tt-text-muted-foreground",
              attributes: {
                n: "transition-sticky-status",
                "aria-live": "polite",
              },
            },
            [model.stickyStatus],
          ),
        ],
      ),
    ],
  );
}
