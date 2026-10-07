import {
  ErrorBoundary,
  Fragment,
  Icon,
  Match,
  View,
  vm,
} from "@timeless/timeless";
import { Button, Toaster } from "@timeless/shadcn";

import { AuthPage } from "@/pages/auth.js";
import { HomePage } from "@/pages/home.js";
import { NotFoundPage } from "@/pages/notfound.js";
import { PreviewPage } from "@/pages/preview.js";
import { SettingsPage } from "@/pages/settings.js";
import {
  navigate,
  profile_,
  route_,
  set_profile,
  toaster$,
  toggle_theme,
} from "@/store/app.js";

function NavigationItem(route_name, icon, label) {
  const active = route_.value === route_name;
  return View(
    {
      as: "button",
      class: active
        ? "flex min-h-10 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-foreground"
        : "flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      attributes: {
        type: "button",
        "aria-current": active ? "page" : undefined,
      },
      onClick() {
        navigate(route_name);
      },
    },
    [Icon({ name: icon, size: 17 }), label],
  );
}

function current_page(route_name) {
  if (route_name === "home") return HomePage();
  if (route_name === "settings") return SettingsPage();
  if (route_name === "preview") return PreviewPage();
  return NotFoundPage();
}

function WorkspaceShell(route_name) {
  const theme$ = new vm.ButtonCore({
    variant: "ghost",
    size: "icon",
    onClick: toggle_theme,
  });
  const account$ = new vm.ButtonCore({
    variant: "outline",
    onClick() {
      if (profile_.value) {
        set_profile(null);
        navigate("login");
        return;
      }
      navigate("login");
    },
  });

  return View({ class: "flex h-full min-h-0 flex-col bg-background" }, [
    View(
      {
        as: "header",
        class:
          "z-10 flex h-16 shrink-0 items-center border-b border-border/80 bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8",
      },
      [
        View(
          {
            class: "flex cursor-pointer items-center gap-2.5",
            attributes: { role: "link", tabindex: "0" },
            onClick: () => navigate("home"),
          },
          [
            View(
              {
                class:
                  "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
              },
              [Icon({ name: "clipboard", size: 18 })],
            ),
            View({}, [
              View({ class: "text-sm font-semibold leading-none" }, [
                "Fit Hub",
              ]),
              View(
                {
                  class: "mt-1 text-[11px] leading-none text-muted-foreground",
                },
                ["Timeless workspace"],
              ),
            ]),
          ],
        ),
        View(
          {
            as: "nav",
            class: "ml-6 hidden items-center gap-1 sm:flex",
            attributes: { "aria-label": "主导航" },
          },
          [
            NavigationItem("home", "library", "内容库"),
            NavigationItem("settings", "settings", "设置"),
          ],
        ),
        View({ class: "ml-auto flex items-center gap-2" }, [
          Button(
            {
              store: theme$,
              attributes: { "aria-label": "切换主题", title: "切换主题" },
            },
            [
              Icon({
                name: document.documentElement.classList.contains("dark")
                  ? "sun"
                  : "moon",
                size: 17,
              }),
            ],
          ),
          Button(
            {
              store: account$,
              prefix: [
                Icon({ name: profile_.value ? "log-out" : "user", size: 16 }),
              ],
            },
            [profile_.value ? "退出" : "登录"],
          ),
        ]),
      ],
    ),
    View(
      {
        as: "main",
        attributes: { id: "main-content" },
        class: "min-h-0 flex-1",
      },
      [current_page(route_name)],
    ),
    View(
      {
        as: "nav",
        class:
          "grid h-16 shrink-0 grid-cols-2 border-t border-border bg-background px-3 sm:hidden",
        attributes: { "aria-label": "移动端主导航" },
      },
      [
        NavigationItem("home", "library", "内容库"),
        NavigationItem("settings", "settings", "设置"),
      ],
    ),
  ]);
}

function ErrorFallback(error) {
  return View(
    {
      class: "flex h-full flex-col items-center justify-center p-8 text-center",
    },
    [
      Icon({ name: "triangle-alert", size: 36 }),
      View({ class: "mt-4 text-lg font-semibold" }, ["页面渲染失败"]),
      View({ class: "mt-2 max-w-lg text-sm text-muted-foreground" }, [
        error?.message || String(error),
      ]),
      View({ class: "mt-5" }, [
        Button(
          { store: new vm.ButtonCore({ onClick: () => navigate("home") }) },
          ["返回内容库"],
        ),
      ]),
    ],
  );
}

export function ApplicationView() {
  return Fragment({}, [
    ErrorBoundary({ fallback: ErrorFallback }, () => [
      Match({
        when: route_,
        cases: {
          login() {
            return AuthPage("login");
          },
          register() {
            return AuthPage("register");
          },
          else(route_name) {
            return WorkspaceShell(route_name);
          },
        },
      }),
    ]),
    View({}, [
      Toaster({
        store: toaster$,
        position: "top-center",
        theme: document.documentElement.classList.contains("dark")
          ? "dark"
          : "light",
      }),
    ]),
  ]);
}
