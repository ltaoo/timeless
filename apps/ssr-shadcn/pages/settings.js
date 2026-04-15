/**
 * 设置页 - 复刻 web-vanilla 设置页
 * 测试: localStorage 读写、theme 切换、用户信息展示
 */
import { View, ref, computed, Show } from "@timeless/timeless";
import { Button } from "@timeless/shadcn/src/modules/button";
import { Badge } from "@timeless/shadcn/src/modules/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@timeless/shadcn/src/modules/card";
import { Separator } from "@timeless/shadcn/src/modules/separator";
import { Label } from "@timeless/shadcn/src/modules/label";
import { Alert, AlertTitle, AlertDescription } from "@timeless/shadcn/src/modules/alert";
import { ButtonCore } from "@timeless/ui-vm";
import { NavBar } from "../components/index.js";
import { storage$, user$, client$ } from "../store/index.js";

export async function load() {
  return {};
}

export function head() {
  return {
    title: "Timeless SSR — Settings",
    meta: [{ name: "description", content: "Settings page - test localStorage read/write" }],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

export default function Page({ data }) {
  const profile = user$.profile || {};
  const theme = storage$.get("theme") || "system";
  const storageSnapshot = ref(JSON.stringify(storage$.values, null, 2));

  return View({ class: "min-h-screen bg-background" }, [
    NavBar({ current: "settings" }),

    View({ as: "main", class: "max-w-3xl mx-auto px-6 py-8 space-y-8" }, [
      // Header
      View({ class: "space-y-2" }, [
        View(
          { as: "h1", class: "text-3xl font-bold tracking-tight text-foreground" },
          ["Settings"],
        ),
        View({ as: "p", class: "text-lg text-muted-foreground leading-relaxed" }, [
          "测试 StorageCore 读写和用户状态管理",
        ]),
      ]),

      Separator({}),

      // User Profile Card
      Card({}, [
        CardHeader({}, [
          CardTitle({}, ["User Profile"]),
          CardDescription({}, ["从 localStorage 读取的用户信息"]),
        ]),
        CardContent({}, [
          View({ class: "space-y-3" }, [
            View({ class: "flex items-center gap-3" }, [
              Label({}, ["Status:"]),
              Badge(
                { variant: user$.isLogin ? "default" : "secondary" },
                [user$.isLogin ? "Logged In" : "Not Logged In"],
              ),
            ]),
            View({ class: "flex items-center gap-3" }, [
              Label({}, ["Username:"]),
              View({ class: "text-sm text-foreground" }, [profile.username || "—"]),
            ]),
            View({ class: "flex items-center gap-3" }, [
              Label({}, ["Email:"]),
              View({ class: "text-sm text-foreground" }, [profile.email || "—"]),
            ]),
            View({ class: "flex items-center gap-3" }, [
              Label({}, ["Token:"]),
              View({ class: "text-sm text-foreground font-mono truncate max-w-[300px]" }, [
                profile.token || "—",
              ]),
            ]),
          ]),
        ]),
        CardFooter({ class: "gap-3" }, [
          ...(user$.isLogin
            ? [
                Button(
                  {
                    store: new ButtonCore({
                      variant: "destructive",
                      onClick() {
                        user$.logout();
                        globalThis.location.reload();
                      },
                    }),
                  },
                  ["Logout"],
                ),
              ]
            : [
                Button(
                  {
                    store: new ButtonCore({
                      onClick() {
                        globalThis.location.href = "/login";
                      },
                    }),
                  },
                  ["Go to Login"],
                ),
              ]),
        ]),
      ]),

      // Theme Card
      Card({}, [
        CardHeader({}, [
          CardTitle({}, ["Theme"]),
          CardDescription({}, ["切换主题 - 写入 localStorage"]),
        ]),
        CardContent({}, [
          View({ class: "flex items-center gap-3" }, [
            Label({}, ["Current:"]),
            Badge({ variant: "outline" }, [theme]),
          ]),
        ]),
        CardFooter({ class: "gap-3" }, [
          Button(
            {
              store: new ButtonCore({
                variant: "outline",
                onClick() {
                  storage$.set("theme", "light");
                  globalThis.document?.documentElement?.classList?.remove("dark");
                  globalThis.location.reload();
                },
              }),
            },
            ["Light"],
          ),
          Button(
            {
              store: new ButtonCore({
                variant: "outline",
                onClick() {
                  storage$.set("theme", "dark");
                  globalThis.document?.documentElement?.classList?.add("dark");
                  globalThis.location.reload();
                },
              }),
            },
            ["Dark"],
          ),
          Button(
            {
              store: new ButtonCore({
                variant: "outline",
                onClick() {
                  storage$.set("theme", "system");
                  globalThis.location.reload();
                },
              }),
            },
            ["System"],
          ),
        ]),
      ]),

      // Storage Debug Card
      Card({}, [
        CardHeader({}, [
          CardTitle({}, ["Storage Debug"]),
          CardDescription({}, ["localStorage 当前快照"]),
        ]),
        CardContent({}, [
          View(
            {
              as: "pre",
              class:
                "text-xs font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[200px]",
            },
            [storageSnapshot],
          ),
        ]),
        CardFooter({ class: "gap-3" }, [
          Button(
            {
              store: new ButtonCore({
                variant: "secondary",
                onClick() {
                  storageSnapshot.as(JSON.stringify(storage$.values, null, 2));
                },
              }),
            },
            ["Refresh Snapshot"],
          ),
          Button(
            {
              store: new ButtonCore({
                variant: "destructive",
                onClick() {
                  storage$.clear("user");
                  storage$.set("theme", "system");
                  globalThis.location.reload();
                },
              }),
            },
            ["Clear All Storage"],
          ),
        ]),
      ]),

      // About
      Alert({}, [
        AlertTitle({}, ["About Timeless"]),
        AlertDescription({}, [
          "定位为「可以写出具有长久生命力代码」的一套前端框架。核心功能端、框架无关：接口请求、数据持久化、路由、常用 UI 组件。",
        ]),
      ]),
    ]),
  ]);
}
