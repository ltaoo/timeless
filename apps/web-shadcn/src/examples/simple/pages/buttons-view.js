import { View } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";

export function ButtonPageView(model) {
  return View(
    { class: "flex flex-col gap-6", attributes: { n: "shared-button-page" } },
    [
      View({ class: "text-2xl font-bold", attributes: { n: "page-title" } }, [
        "共享 shadcn Button",
      ]),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "page-description" },
        },
        ["同一份 Model、View 和 CSS，由 Web、macOS、Windows 宿主渲染。"],
      ),
      View(
        {
          class: "flex flex-row flex-wrap items-center gap-3",
          attributes: { n: "button-variants" },
        },
        model.buttons.map(({ variant, label, store }) =>
          Button(
            {
              store,
              attributes: { n: `button-${variant}`, "aria-label": label },
            },
            [label],
          ),
        ),
      ),
      View({ class: "text-lg", attributes: { n: "counter" } }, [
        "点击次数：",
        View({ attributes: { n: "count" } }, [model.count]),
      ]),
      View(
        {
          class: "flex flex-row flex-wrap items-center gap-3",
          attributes: { n: "page-actions" },
        },
        [
          Button({ store: model.reset, attributes: { n: "reset-count" } }, [
            "重置计数",
          ]),
          Button(
            {
              store: model.disabled,
              disabled: true,
              attributes: { n: "button-disabled" },
            },
            ["Disabled"],
          ),
        ],
      ),
    ],
  );
}
