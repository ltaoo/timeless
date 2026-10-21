import { Icon, ScrollView, View } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";
import "@timeless/shadcn/globals.css";
import { ButtonPageView } from "./pages/buttons-view.js";
import { FormPageView } from "./pages/forms-view.js";
import { OverviewPageView, LayoutPageView } from "./pages/navigation-view.js";

export function SimplePageView(model) {
  const pages = {
    overview: () => OverviewPageView(),
    general: () => ButtonPageView(model.buttons),
    data_entry: () => FormPageView(model.form),
    layout: () => LayoutPageView(),
  };
  return View(
    {
      class: model.rootClass,
      attributes: { n: "shared-application" },
      onUnmounted: () => model.destroy(),
    },
    [
      View(
        {
          class: "flex h-full w-48 shrink-0 flex-col gap-6 tt-bg-muted p-4",
          attributes: { n: "sider" },
        },
        [
          View(
            {
              class: "text-xl font-bold",
              attributes: { n: "application-name" },
            },
            ["Timeless"],
          ),
          View(
            {
              class: "text-sm tt-text-muted-foreground",
              attributes: { n: "library-name" },
            },
            ["shadcn / components"],
          ),
          View(
            {
              class: "flex flex-col gap-2",
              attributes: {
                n: "sider-menu",
                role: "navigation",
                "aria-label": "示例页面",
              },
            },
            model.pages.map((page) =>
              Button(
                {
                  store: page.store,
                  class: page.navigationClass,
                  attributes: {
                    n: `nav-${page.key}`,
                    "aria-current": page.current,
                  },
                },
                [
                  Icon({
                    name: page.icon,
                    size: 16,
                    attributes: {
                      n: `nav-${page.key}-icon`,
                      "aria-hidden": "true",
                    },
                  }),
                  page.title,
                ],
              ),
            ),
          ),
        ],
      ),
      View(
        {
          class: "flex h-full min-w-0 flex-1 flex-col",
          attributes: { n: "main" },
        },
        [
          View(
            {
              class: "flex shrink-0 flex-row flex-wrap items-center gap-3 p-4",
              attributes: { n: "route-toolbar" },
            },
            [
              Button(
                {
                  store: model.back,
                  disabled: model.backDisabled,
                  attributes: { n: "route-back", "aria-label": "后退" },
                },
                ["后退"],
              ),
              Button(
                {
                  store: model.forward,
                  disabled: model.forwardDisabled,
                  attributes: { n: "route-forward", "aria-label": "前进" },
                },
                ["前进"],
              ),
              View(
                {
                  class: "text-sm tt-text-muted-foreground",
                  attributes: { n: "route-path" },
                },
                [model.path],
              ),
              Button(
                { store: model.theme, attributes: { n: "theme-toggle" } },
                ["切换明暗主题"],
              ),
            ],
          ),
          View(
            {
              class: "px-6 text-sm font-semibold",
              attributes: { n: "route-title", "aria-live": "polite" },
            },
            [model.title],
          ),
          ScrollView(
            {
              class: "min-h-0 flex-1",
              horizontal: "hidden",
              attributes: { n: "route-scroll" },
              onMounted: (event) => model.attachViewport(event.target),
            },
            [
              View(
                {
                  class: "p-6",
                  attributes: { n: "route-outlet", role: "main" },
                },
                // shortcut: Keep these small pages mounted; add route caching when the gallery grows.
                model.pages.map((page) =>
                  View(
                    {
                      class: page.pageClass,
                      attributes: { n: `page-${page.key}` },
                    },
                    [pages[page.key]()],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
