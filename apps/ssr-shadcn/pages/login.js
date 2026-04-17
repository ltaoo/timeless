/**
 * 登录页 - 复刻 web-vanilla 登录流程
 * 测试: InputCore, ButtonCore, localStorage 写入, 页面跳转
 */
import { View, ref, computed } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";
import { Input } from "@timeless/shadcn";
import { Label } from "@timeless/shadcn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@timeless/shadcn";
import { ButtonCore, InputCore } from "@timeless/ui-vm";

import { user$ } from "../store/index.js";

export async function load({ query }) {
  return {
    redirect: query.redirect || "",
    redirect_query: query.redirect_query || "",
  };
}

export function head() {
  return {
    title: "Timeless SSR — Login",
    meta: [
      { name: "description", content: "Login page - test localStorage write" },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

export default function Page({ data }) {
  const error_msg = ref("");

  const input_username = new InputCore({
    defaultValue: "",
    placeholder: "Enter your username",
  });
  const input_pwd = new InputCore({
    defaultValue: "",
    placeholder: "Enter your password",
    type: "password",
  });

  function handleLogin() {
    const username = input_username.value;
    const password = input_pwd.value;

    if (username === "admin" && password === "123456") {
      // 写入 localStorage
      user$.login({
        id: "1",
        username,
        email: "admin@example.com",
        token: "mock-jwt-token-" + Date.now(),
      });
      // 跳转
      const redirect = data.redirect;
      if (redirect) {
        globalThis.location.href = redirect;
      } else {
        globalThis.location.href = "/";
      }
      return;
    }
    error_msg.as("Invalid username or password");
  }

  const btn_login = new ButtonCore({
    onClick: handleLogin,
  });
  const btn_logout = new ButtonCore({
    variant: "destructive",
    onClick() {
      user$.logout();
      globalThis.location.reload();
    },
  });

  return View(
    {
      class:
        "flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4",
    },
    [
      View({ class: "w-full max-w-md space-y-6" }, [
        // Header
        View({ class: "text-center space-y-2" }, [
          View(
            {
              as: "h1",
              class: "text-3xl font-bold tracking-tight text-foreground",
            },
            ["Timeless"],
          ),
          View({ as: "p", class: "text-sm text-muted-foreground" }, [
            "Sign in to your account",
          ]),
        ]),

        // Login Form Card
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Login"]),
            CardDescription({}, [
              user$.isLogin
                ? `Currently logged in as: ${user$.profile?.username}`
                : "Use admin / 123456 to test",
            ]),
          ]),
          CardContent({}, [
            View({ class: "space-y-4" }, [
              // Username
              View({ class: "space-y-2" }, [
                Label({}, ["Username"]),
                Input({ store: input_username }),
              ]),

              // Password
              View({ class: "space-y-2" }, [
                Label({}, ["Password"]),
                Input({ store: input_pwd }),
              ]),

              // Error message
              View(
                {
                  class: computed(error_msg, (v) =>
                    v ? "text-sm text-destructive" : "hidden",
                  ),
                },
                [computed(error_msg, (v) => v)],
              ),
            ]),
          ]),
          CardFooter({ class: "flex-col gap-3" }, [
            Button({ store: btn_login, class: "w-full" }, ["Sign in"]),
            // 如果已登录，显示登出按钮
            ...(user$.isLogin
              ? [Button({ store: btn_logout, class: "w-full" }, ["Sign out"])]
              : []),
          ]),
        ]),

        // Hint
        View({ class: "text-center text-xs text-muted-foreground" }, [
          "Hint: username ",
          View(
            {
              as: "code",
              class: "font-mono bg-muted px-1 py-0.5 rounded text-foreground",
            },
            ["admin"],
          ),
          " / password ",
          View(
            {
              as: "code",
              class: "font-mono bg-muted px-1 py-0.5 rounded text-foreground",
            },
            ["123456"],
          ),
        ]),

        // Back link
        View({ class: "text-center" }, [
          View(
            {
              as: "a",
              href: "/",
              class:
                "text-sm text-primary underline underline-offset-4 hover:opacity-80",
            },
            ["← Back to Home"],
          ),
        ]),
      ]),
    ],
  );
}
