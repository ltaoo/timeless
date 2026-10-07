import { Icon, View, ref, vm } from "@timeless/timeless";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@timeless/shadcn";

import { api } from "@/services/api.js";
import { navigate, notify, profile_, set_profile } from "@/store/app.js";

function FormField(label, id, input$, type) {
  return View({ class: "space-y-2" }, [
    Label({ for: id }, [label]),
    Input({
      id,
      store: input$,
      attributes: {
        type,
        autocomplete: type === "password" ? "current-password" : "email",
      },
    }),
  ]);
}

export function AuthPage(mode = "login") {
  const is_register = mode === "register";
  const error_ = ref("");
  const email$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "name@example.com",
    type: "email",
    autoComplete: true,
    onKeyDown(event) {
      if (event.key === "Enter") submit$.click();
    },
  });
  const password$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "至少 3 个字符",
    type: "password",
    onKeyDown(event) {
      if (event.key === "Enter") submit$.click();
    },
  });

  const submit$ = new vm.ButtonCore({
    async onClick() {
      const email = String(email$.value || "").trim();
      const password = String(password$.value || "");
      if (!email || !email.includes("@")) {
        error_.as("请输入有效邮箱地址");
        return;
      }
      if (password.length < 3) {
        error_.as("密码至少需要 3 个字符");
        return;
      }

      submit$.setLoading(true);
      error_.as("");
      try {
        const profile = is_register
          ? await api.auth.register({ email, password })
          : await api.auth.login({ email, password });
        set_profile({ ...profile, email });
        notify(is_register ? "账号已创建" : "欢迎回来", "success");
        navigate("home", {}, { replace: true });
      } catch (error) {
        error_.as(error.message || (is_register ? "注册失败" : "登录失败"));
      } finally {
        submit$.setLoading(false);
      }
    },
  });

  const switch$ = new vm.ButtonCore({
    variant: "link",
    onClick() {
      navigate(is_register ? "login" : "register");
    },
  });
  const home$ = new vm.ButtonCore({
    variant: "outline",
    onClick() {
      navigate("home");
    },
  });

  return View(
    {
      class:
        "flex h-full min-h-[560px] items-center justify-center overflow-y-auto bg-muted/30 p-4",
    },
    [
      Card({ class: "w-full max-w-md border-border/80 shadow-lg" }, [
        CardHeader({ class: "space-y-3 pb-4 text-center" }, [
          View(
            {
              class:
                "mx-auto flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground",
            },
            [Icon({ name: is_register ? "user-plus" : "log-in", size: 20 })],
          ),
          CardTitle({ class: "text-2xl" }, [
            is_register ? "创建账号" : "登录 Fit Hub",
          ]),
          CardDescription({}, [
            is_register
              ? "创建账号并同步你的内容库。"
              : "继续访问你的剪贴板与文件内容。",
          ]),
        ]),
        CardContent({ class: "space-y-5" }, [
          FormField("邮箱", "account-email", email$, "email"),
          FormField("密码", "account-password", password$, "password"),
          View(
            {
              class: "min-h-5 text-sm text-destructive",
              attributes: { role: "alert" },
            },
            [error_],
          ),
          Button({ class: "w-full", store: submit$ }, [
            is_register ? "创建账号" : "登录",
          ]),
          View({ class: "flex flex-col items-center gap-1 text-sm" }, [
            Button({ store: switch$ }, [
              is_register ? "已有账号？前往登录" : "没有账号？立即注册",
            ]),
            profile_.value
              ? Button({ store: home$ }, ["返回内容库"])
              : View(
                  {
                    class:
                      "cursor-pointer text-muted-foreground hover:text-foreground",
                    onClick: () => navigate("home"),
                  },
                  ["暂不登录"],
                ),
          ]),
        ]),
      ]),
    ],
  );
}
