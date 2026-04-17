/**
 * 首页 - 对应 web-vanilla 的 home layout
 * 测试: 路由导航、基础渲染、localStorage 读取
 */
import {
  View,
  Show,
  For,
  ref,
  computed,
  Link,
  Portal,
} from "@timeless/timeless";
import { Button, DropdownMenu, ui } from "@timeless/shadcn";
import { Badge } from "@timeless/shadcn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@timeless/shadcn";
import { Separator } from "@timeless/shadcn";
import { ButtonCore } from "@timeless/ui-vm";

import { NavBar } from "../components/index.js";
import { history$, storage$, user$ } from "../store/index.js";

export async function load() {
  return {
    greeting: "Welcome to Timeless SSR",
    isLogin: true,
    features: [
      {
        title: "路由",
        desc: "SSR file-based routing，支持页面间导航",
        icon: "🔗",
      },
      {
        title: "本地存储",
        desc: "StorageCore 持久化，SSR-safe 封装",
        icon: "💾",
      },
      {
        title: "接口请求",
        desc: "HttpClientCore + request_factory",
        icon: "🌐",
      },
      {
        title: "组件库",
        desc: "shadcn 组件 SSR 渲染 + client 水合",
        icon: "🧩",
      },
    ],
  };
}

export function head() {
  return {
    title: "Timeless SSR — Home",
    meta: [
      { name: "description", content: "Timeless SSR shadcn test - home page" },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

export default function Page({ data }) {
  // ---- 测试 localStorage：读取 user 信息 ----
  const isLogin = ref(data.isLogin);
  const username = user$.profile?.username || "anonymous";

  return View({ class: "min-h-screen bg-background" }, [
    NavBar({ current: "home" }),

    View({ as: "main", class: "max-w-4xl mx-auto px-6 py-10 space-y-10" }, [
      // Hero
      View({ class: "space-y-3" }, [
        View(
          {
            as: "h1",
            class: "text-3xl font-bold tracking-tight text-foreground",
          },
          [data.greeting],
        ),
        View({ as: "p", class: "text-muted-foreground text-lg" }, [
          "复刻 web-vanilla 核心功能，验证 SSR 兼容性",
        ]),
      ]),

      // User Status Card (测试 localStorage)
      Card({}, [
        CardHeader({}, [
          CardTitle({}, ["用户状态（localStorage）"]),
          CardDescription({}, [
            isLogin
              ? `已登录: ${username}`
              : "未登录 - 前往登录页测试 localStorage 持久化",
          ]),
        ]),
        CardContent({}, [
          View({ class: "flex items-center gap-3" }, [
            Badge({ variant: isLogin ? "default" : "secondary" }, [
              isLogin ? "已登录" : "未登录",
            ]),
            Badge({ variant: "outline" }, [username]),
            DropdownMenu(
              {
                store: new ui.DropdownMenuCore({
                  defaultVisible: true,
                  items: [
                    new ui.MenuItemCore({
                      label: isLogin ? "切换账号" : "去登录",
                      onClick() {
                        console.log("切换账号");
                      },
                    }),
                  ],
                }),
              },
              [
                View(
                  {
                    as: "a",
                    href: "/login",
                    class:
                      "text-sm text-primary underline underline-offset-4 hover:opacity-80",
                  },
                  [isLogin ? "切换账号" : "去登录"],
                ),
              ],
            ),
          ]),
        ]),
      ]),

      Separator({}),

      // Feature Cards
      View({ as: "h2", class: "text-xl font-semibold text-foreground" }, [
        "核心功能",
      ]),
      View({ class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, [
        ...data.features.map((f) =>
          Card({}, [
            CardHeader({}, [
              CardTitle({}, [`${f.icon} ${f.title}`]),
              CardDescription({}, [f.desc]),
            ]),
          ]),
        ),
      ]),

      Separator({}),

      // Navigation Links
      View({ as: "h2", class: "text-xl font-semibold text-foreground" }, [
        "页面导航（测试路由）",
      ]),
      View({ class: "flex flex-wrap gap-3" }, [
        Button(
          {
            store: new ButtonCore({}),
          },
          [Link({}, ["组件库 →"])],
        ),
        Button(
          {
            store: new ButtonCore({ variant: "secondary" }),
            onClick() {
              globalThis.location.href = "/settings";
            },
          },
          ["设置 →"],
        ),
        Button(
          {
            store: new ButtonCore({ variant: "outline" }),
            onClick() {
              globalThis.location.href = "/login";
            },
          },
          ["登录 →"],
        ),
        Button(
          {
            store: new ButtonCore({ variant: "ghost" }),
            onClick() {
              globalThis.location.href = "/nonexistent";
            },
          },
          ["404 测试 →"],
        ),
      ]),
    ]),

    // Footer
    View({ as: "footer", class: "border-t border-border mt-12" }, [
      View(
        {
          class:
            "max-w-4xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground",
        },
        ["Powered by Timeless Framework — SSR Shadcn Test"],
      ),
    ]),
  ]);
}
