import { Icon, Show, View, computed, ref, vm } from "@timeless/timeless";
import { Button, Card, CardContent, Skeleton } from "@timeless/shadcn";

import { api } from "@/services/api.js";
import { navigate, notify, route_query_ } from "@/store/app.js";

function render_content(profile, query) {
  const type = profile?.type || query.type || "text";
  const url = profile?.image_url || profile?.url || query.url;

  if ((type === "image" || profile?.types?.includes?.("image")) && url) {
    return View(
      {
        class:
          "flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-muted/40 p-4",
      },
      [
        View({
          as: "img",
          class:
            "max-h-full max-w-full rounded-lg object-contain outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
          attributes: { src: url, alt: profile?.title || "图片预览" },
        }),
      ],
    );
  }
  if (type === "video" && url) {
    return View(
      {
        class:
          "flex min-h-0 flex-1 items-center justify-center rounded-xl bg-black p-3",
      },
      [
        View({
          as: "video",
          class: "max-h-full max-w-full",
          attributes: { src: url, controls: true, playsinline: true },
        }),
      ],
    );
  }
  if (type === "pdf" && url) {
    return View({
      as: "iframe",
      class: "min-h-0 flex-1 rounded-xl border border-border bg-white",
      attributes: { src: url, title: "PDF 预览" },
    });
  }
  if (type === "file" && Array.isArray(profile?.files)) {
    return View(
      { class: "space-y-2" },
      profile.files.map((file) =>
        Card({ class: "border-border/80" }, [
          CardContent({ class: "flex items-center gap-3 p-4" }, [
            Icon({
              name: file.mime_type === "folder" ? "folder" : "file",
              size: 18,
            }),
            View({ class: "min-w-0" }, [
              View({ class: "truncate text-sm font-medium" }, [
                file.name || "未命名文件",
              ]),
              View({ class: "break-all text-xs text-muted-foreground" }, [
                file.absolute_path || "",
              ]),
            ]),
          ]),
        ]),
      ),
    );
  }

  return View(
    {
      as: "pre",
      class:
        "min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/40 p-5 font-mono text-sm leading-6",
    },
    [profile?.text || profile?.content || "暂无可预览内容"],
  );
}

export function PreviewPage() {
  const query = route_query_.value;
  const profile_ = ref(null);
  const status_ = ref(query.url ? "ready" : "loading");
  const error_ = ref("");
  let abort_controller;

  async function load_profile() {
    if (!query.id) {
      status_.as(query.url ? "ready" : "error");
      if (!query.url) error_.as("缺少内容标识");
      return;
    }
    abort_controller = new AbortController();
    try {
      const profile = await api.paste.preview(query.id);
      profile_.as(profile || {});
      status_.as("ready");
    } catch (error) {
      error_.as(error.message || "预览加载失败");
      status_.as(query.url ? "ready" : "error");
    }
  }

  const back$ = new vm.ButtonCore({
    variant: "outline",
    onClick() {
      navigate("home");
    },
  });

  return View(
    {
      as: "section",
      class:
        "mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8",
      onMounted() {
        load_profile();
        return () => abort_controller?.abort();
      },
    },
    [
      View({ class: "mb-4 flex items-center justify-between gap-3" }, [
        View({}, [
          View({ as: "h1", class: "text-xl font-semibold" }, ["内容预览"]),
          View({ class: "mt-1 text-xs text-muted-foreground" }, [
            query.id ? `ID · ${query.id}` : "本地资源",
          ]),
        ]),
        Button(
          { store: back$, prefix: [Icon({ name: "arrow-left", size: 16 })] },
          ["返回内容库"],
        ),
      ]),
      Show({
        when: computed(status_, (status) => status === "loading"),
        ok() {
          return Skeleton({ class: "min-h-0 flex-1" });
        },
      }),
      Show({
        when: computed(status_, (status) => status === "error"),
        ok() {
          return View(
            {
              class:
                "flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center",
            },
            [
              Icon({ name: "file-warning", size: 32 }),
              View({ class: "mt-3 font-medium" }, ["无法预览内容"]),
              View({ class: "mt-1 text-sm text-muted-foreground" }, [error_]),
            ],
          );
        },
      }),
      Show({
        when: computed(status_, (status) => status === "ready"),
        ok() {
          return render_content(profile_.value || {}, query);
        },
      }),
    ],
  );
}
