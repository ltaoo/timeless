import { For, Icon, Show, View, computed, ref, vm } from "@timeless/timeless";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
} from "@timeless/shadcn";

import { api } from "@/services/api.js";
import { notify, set_theme, theme_ } from "@/store/app.js";

function normalize_fields(value) {
  if (Array.isArray(value?.fields)) return value.fields;
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).map(([label, text]) => ({
    label,
    text: typeof text === "object" ? JSON.stringify(text) : String(text ?? ""),
  }));
}

function flatten_categories(items, depth = 0) {
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => [
    { ...item, depth },
    ...flatten_categories(item.children, depth + 1),
  ]);
}

function DetailRows(fields) {
  return View(
    { class: "divide-y divide-border rounded-lg border border-border" },
    fields.map((field, index) =>
      View(
        {
          key: field.id || field.label || index,
          class:
            "grid gap-1 px-3 py-3 text-sm sm:grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] sm:gap-4",
        },
        [
          View({ class: "font-medium text-muted-foreground" }, [
            String(field.label || field.name || "—"),
          ]),
          View({ class: "break-words text-foreground sm:text-right" }, [
            String(field.text ?? field.value ?? "—"),
          ]),
        ],
      ),
    ),
  );
}

function SyncField(label, id, store, type = "text") {
  return View({ class: "space-y-2" }, [
    Label({ for: id }, [label]),
    Input({ id, store, attributes: { type } }),
  ]);
}

export function SettingsPage() {
  const status_ = ref("loading");
  const settings_ = ref({});
  const categories_ = ref([]);
  const system_ = ref([]);
  const database_dirs_ = ref([]);
  let abort_controller;

  const webdav_url$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "https://dav.example.com",
    type: "url",
  });
  const webdav_username$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "用户名",
  });
  const webdav_password$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "密码",
    type: "password",
  });
  const webdav_root$ = new vm.InputCore({
    defaultValue: "/devboard",
    placeholder: "/devboard",
  });

  function sync_values() {
    return {
      url: String(webdav_url$.value || "").trim(),
      username: String(webdav_username$.value || ""),
      password: String(webdav_password$.value || ""),
      root_dir: String(webdav_root$.value || "").trim(),
    };
  }

  function validate_sync_values() {
    const values = sync_values();
    if (!values.url) {
      notify("请输入 WebDAV 地址", "warning");
      return null;
    }
    if (!values.root_dir) {
      notify("请输入远端目录", "warning");
      return null;
    }
    return values;
  }

  async function load_settings() {
    abort_controller?.abort();
    abort_controller = new AbortController();
    status_.as("loading");
    const signal = abort_controller.signal;
    const results = await Promise.allSettled([
      api.settings.read(signal),
      api.settings.categories(signal),
      api.settings.system(signal),
      api.settings.database_dirs(signal),
    ]);
    if (signal.aborted) return;

    if (results[0].status === "fulfilled") settings_.as(results[0].value || {});
    if (results[1].status === "fulfilled") {
      const value = results[1].value;
      categories_.as(
        flatten_categories(
          Array.isArray(value) ? value : value?.items || value?.children || [],
        ),
      );
    }
    if (results[2].status === "fulfilled")
      system_.as(normalize_fields(results[2].value));
    if (results[3].status === "fulfilled")
      database_dirs_.as(normalize_fields(results[3].value));

    const rejected = results.filter((result) => result.status === "rejected");
    status_.as(rejected.length === results.length ? "error" : "ready");
    if (rejected.length > 0 && rejected.length < results.length) {
      notify("部分设置数据暂时无法加载", "warning");
    }
  }

  async function run_sync(action, button$, success_message) {
    const values = validate_sync_values();
    if (!values) return;
    button$.setLoading(true);
    try {
      await action(values);
      notify(success_message, "success");
    } catch (error) {
      notify(error.message || "操作失败", "error");
    } finally {
      button$.setLoading(false);
    }
  }

  const save_settings$ = new vm.ButtonCore({
    async onClick() {
      save_settings$.setLoading(true);
      try {
        await api.settings.update(settings_.value);
        notify("设置已保存", "success");
      } catch (error) {
        notify(error.message || "保存失败", "error");
      } finally {
        save_settings$.setLoading(false);
      }
    },
  });
  const ping$ = new vm.ButtonCore({ variant: "outline" });
  ping$.onClick(() =>
    run_sync(api.settings.ping_webdav, ping$, "WebDAV 连接正常"),
  );
  const upload$ = new vm.ButtonCore({});
  upload$.onClick(() =>
    run_sync(api.settings.sync_to_remote, upload$, "数据已同步到 WebDAV"),
  );
  const download$ = new vm.ButtonCore({ variant: "outline" });
  download$.onClick(() =>
    run_sync(api.settings.sync_from_remote, download$, "已从 WebDAV 同步数据"),
  );

  return View(
    {
      as: "section",
      class:
        "mx-auto h-full w-full max-w-5xl overflow-y-auto px-4 py-5 sm:px-6 lg:px-8",
      onMounted() {
        load_settings();
        return () => abort_controller?.abort();
      },
    },
    [
      View({ class: "mb-6" }, [
        View({ as: "h1", class: "text-2xl font-semibold tracking-tight" }, [
          "设置",
        ]),
        View({ as: "p", class: "mt-1 text-sm text-muted-foreground" }, [
          "管理界面、账户数据与 WebDAV 同步。",
        ]),
      ]),
      Show({
        when: computed(status_, (status) => status === "loading"),
        ok() {
          return View({ class: "space-y-4" }, [
            Skeleton({ class: "h-48 w-full" }),
            Skeleton({ class: "h-64 w-full" }),
            Skeleton({ class: "h-48 w-full" }),
          ]);
        },
      }),
      Show({
        when: computed(status_, (status) => status === "error"),
        ok() {
          return View(
            {
              class:
                "rounded-xl border border-dashed border-border p-10 text-center",
            },
            [
              Icon({ name: "wifi-off", size: 28 }),
              View({ class: "mt-3 font-medium" }, ["设置数据暂时不可用"]),
              View({ class: "mt-1 text-sm text-muted-foreground" }, [
                "请确认后端服务已启动，然后重试。",
              ]),
              View({ class: "mt-4" }, [
                Button(
                  { store: new vm.ButtonCore({ onClick: load_settings }) },
                  ["重新加载"],
                ),
              ]),
            ],
          );
        },
      }),
      Show({
        when: computed(status_, (status) => status === "ready"),
        ok() {
          return View({ class: "space-y-5 pb-10" }, [
            Card({ class: "border-border/80" }, [
              CardHeader({}, [
                CardTitle({ class: "text-lg" }, ["外观"]),
                CardDescription({}, ["主题会在首屏渲染前恢复，避免明暗闪烁。"]),
              ]),
              CardContent({ class: "flex flex-wrap gap-2 pt-0" }, [
                ...[
                  ["light", "sun", "浅色"],
                  ["dark", "moon", "深色"],
                  ["system", "monitor", "跟随系统"],
                ].map(([value, icon, label]) =>
                  Button(
                    {
                      store: new vm.ButtonCore({
                        variant: theme_.value === value ? "default" : "outline",
                        onClick() {
                          set_theme(value);
                          notify(`已切换为${label}主题`, "success");
                        },
                      }),
                      prefix: [Icon({ name: icon, size: 16 })],
                    },
                    [label],
                  ),
                ),
              ]),
            ]),
            Card({ class: "border-border/80" }, [
              CardHeader({}, [
                CardTitle({ class: "text-lg" }, ["账户设置"]),
                CardDescription({}, [
                  "保留后端返回的设置结构，并按原接口提交。",
                ]),
              ]),
              CardContent({ class: "space-y-4 pt-0" }, [
                normalize_fields(settings_.value).length
                  ? DetailRows(normalize_fields(settings_.value))
                  : View({ class: "text-sm text-muted-foreground" }, [
                      "当前没有可显示的账户设置。",
                    ]),
                Button({ store: save_settings$ }, ["保存设置"]),
              ]),
            ]),
            Card({ class: "border-border/80" }, [
              CardHeader({}, [
                CardTitle({ class: "text-lg" }, ["分类"]),
                CardDescription({}, ["用于搜索与整理剪贴内容的分类树。"]),
              ]),
              CardContent({ class: "pt-0" }, [
                categories_.value.length
                  ? View(
                      { class: "flex flex-wrap gap-2" },
                      categories_.value.map((category) =>
                        Badge(
                          {
                            variant: "secondary",
                            style: {
                              marginInlineStart: `${category.depth * 8}px`,
                            },
                          },
                          [
                            category.label ||
                              category.name ||
                              category.title ||
                              String(category.id),
                          ],
                        ),
                      ),
                    )
                  : View({ class: "text-sm text-muted-foreground" }, [
                      "暂无分类。",
                    ]),
              ]),
            ]),
            Card({ class: "border-border/80" }, [
              CardHeader({}, [
                CardTitle({ class: "text-lg" }, ["WebDAV 同步"]),
                CardDescription({}, [
                  "连接测试与同步操作沿用旧应用的后端接口。",
                ]),
              ]),
              CardContent({ class: "space-y-5 pt-0" }, [
                View({ class: "grid gap-4 sm:grid-cols-2" }, [
                  SyncField("地址", "webdav-url", webdav_url$, "url"),
                  SyncField("远端目录", "webdav-root", webdav_root$),
                  SyncField("用户名", "webdav-username", webdav_username$),
                  SyncField(
                    "密码",
                    "webdav-password",
                    webdav_password$,
                    "password",
                  ),
                ]),
                View({ class: "flex flex-wrap gap-2" }, [
                  Button(
                    {
                      store: ping$,
                      prefix: [Icon({ name: "plug-zap", size: 16 })],
                    },
                    ["测试连接"],
                  ),
                  Button(
                    {
                      store: upload$,
                      prefix: [Icon({ name: "cloud-upload", size: 16 })],
                    },
                    ["同步到 WebDAV"],
                  ),
                  Button(
                    {
                      store: download$,
                      prefix: [Icon({ name: "cloud-download", size: 16 })],
                    },
                    ["从 WebDAV 同步"],
                  ),
                ]),
                Show({
                  when: computed(database_dirs_, (fields) => fields.length > 0),
                  ok() {
                    return View({}, [
                      Separator({ class: "mb-4" }),
                      View({ class: "mb-2 text-sm font-medium" }, [
                        "本地数据目录",
                      ]),
                      DetailRows(database_dirs_.value),
                    ]);
                  },
                }),
              ]),
            ]),
            Card({ class: "border-border/80" }, [
              CardHeader({}, [
                CardTitle({ class: "text-lg" }, ["系统信息"]),
                CardDescription({}, ["当前客户端与运行环境信息。"]),
              ]),
              CardContent({ class: "pt-0" }, [
                system_.value.length
                  ? DetailRows(system_.value)
                  : View({ class: "text-sm text-muted-foreground" }, [
                      "暂无系统信息。",
                    ]),
              ]),
            ]),
          ]);
        },
      }),
    ],
  );
}
