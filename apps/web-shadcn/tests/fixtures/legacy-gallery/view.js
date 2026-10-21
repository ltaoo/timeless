import { ScrollView, View } from "@timeless/timeless";
import { Action, Stack, TextView } from "./components.js";
import { BasicPageView } from "./pages/basic.js";
import { FormPageView } from "./pages/forms.js";
import { InteractionPageView } from "./pages/interaction.js";
import { LayoutPageView } from "./pages/layout.js";

export function MacOSApplicationView(model) {
  const pages = {
    general: () => BasicPageView(model.basic),
    data_entry: () => FormPageView(model.form),
    interaction: () => InteractionPageView(model.interaction),
    layout: () => LayoutPageView(),
  };
  return Stack(
    "macos-application",
    [
      Stack(
        "sidebar",
        [
          TextView("application-name", "Timeless", "brand"),
          TextView("application-library", "shadcn / components", "muted"),
          TextView("navigation-label", "组件示例", "nav-label"),
          ...model.pages.map((page) =>
            Action(
              `nav-${page.key}`,
              page.title,
              () => model.navigate(page.path),
              page.navigationClass,
            ),
          ),
          TextView("platform-label", model.platform, "platform-label"),
        ],
        "sidebar",
      ),
      Stack(
        "main",
        [
          Stack(
            "route-toolbar",
            [
              Action(
                "route-back",
                "←",
                () => model.back(),
                "button ghost small",
                {
                  disabled: model.backDisabled,
                  attributes: { "aria-label": "后退" },
                },
              ),
              Action(
                "route-forward",
                "→",
                () => model.forward(),
                "button ghost small",
                {
                  disabled: model.forwardDisabled,
                  attributes: { "aria-label": "前进" },
                },
              ),
              TextView("route-path", model.path, "route-path"),
            ],
            "toolbar",
          ),
          ScrollView(
            {
              class: "main-scroll",
              horizontal: "hidden",
              attributes: { n: "page-scroll" },
              onMounted: (event) => model.attachViewport(event.target),
            },
            [
              Stack(
                "page-document",
                [
                  TextView("page-title", model.title, "page-title"),
                  TextView("page-description", model.description, "muted"),
                  // shortcut: Keep four pages mounted for state retention; add route caching when the gallery grows.
                  ...model.pages.map((page) =>
                    View(
                      {
                        class: page.pageClass,
                        attributes: { n: `page-${page.key}` },
                      },
                      pages[page.key](),
                    ),
                  ),
                ],
                "page-document",
              ),
            ],
          ),
        ],
        "main",
      ),
      View(
        {
          class: model.interaction.toastClass,
          attributes: { n: "toast-message", role: "status" },
        },
        [
          TextView("toast-text", "操作成功，通知已送达。"),
          Action(
            "toast-close",
            "关闭通知",
            () => model.interaction.closeToast(),
            "button outline small",
          ),
        ],
      ),
    ],
    "application",
  );
}
