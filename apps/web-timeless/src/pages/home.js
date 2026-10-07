import {
  For,
  Icon,
  Show,
  View,
  combine,
  computed,
  ref,
  vm,
} from "@timeless/timeless";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from "@timeless/shadcn";

import { api } from "@/services/api.js";
import { normalize_page } from "@/services/pagination.js";
import { navigate, notify } from "@/store/app.js";

function item_types(item) {
  const values = Array.isArray(item.types) ? item.types : [];
  return Array.from(new Set([item.type, ...values].filter(Boolean)));
}

function format_date(value) {
  if (!value) {
    return "时间未知";
  }
  const date = new Date(
    typeof value === "number" && value < 1e12 ? value * 1000 : value,
  );
  if (Number.isNaN(date.valueOf())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function icon_for_item(item) {
  const types = item_types(item);
  if (item.type === "file") return "files";
  if (types.includes("url")) return "link";
  if (types.includes("image")) return "image";
  if (types.includes("color")) return "palette";
  if (types.includes("JSON") || item.language) return "code-2";
  return "clipboard";
}

function preview_text(item) {
  if (item.type === "file") {
    return (item.files || [])
      .map((file) => file.name || file.absolute_path)
      .join("\n");
  }
  return item.origin_text || item.text || item.content || "暂无可预览内容";
}

function ActionButton({ label, icon, variant = "ghost", on_click }) {
  return Button(
    {
      attributes: { "aria-label": label, title: label },
      store: new vm.ButtonCore({
        variant,
        size: "icon-sm",
        onClick: on_click,
      }),
    },
    [Icon({ name: icon, size: 16 })],
  );
}

function PasteCard(item, items_) {
  const types = item_types(item);
  const text = preview_text(item);

  async function copy_item() {
    try {
      if (item.id) {
        await api.paste.copy(item.id);
      } else if (navigator.clipboard && text) {
        await navigator.clipboard.writeText(text);
      }
      notify("内容已复制", "success");
    } catch (error) {
      if (navigator.clipboard && text) {
        try {
          await navigator.clipboard.writeText(text);
          notify("内容已复制", "success");
          return;
        } catch {}
      }
      notify(error.message || "复制失败", "error");
    }
  }

  function open_item() {
    if (types.includes("url") && item.text) {
      window.open(item.text, "_blank", "noopener,noreferrer");
      return;
    }
    navigate("preview", {
      id: item.id,
      type: item.type || types[0] || "text",
      url: item.image_url || item.url,
    });
  }

  async function delete_item() {
    if (!item.id) return;
    try {
      await api.paste.remove(item.id);
      items_.as(items_.value.filter((record) => record.id !== item.id));
      notify("内容已移除", "success");
    } catch (error) {
      notify(error.message || "删除失败", "error");
    }
  }

  return Card(
    {
      class:
        "group/content-card overflow-hidden border-border/80 bg-card shadow-sm transition-[box-shadow] duration-150 hover:shadow-md",
    },
    [
      CardContent({ class: "flex flex-col gap-4 p-4" }, [
        View({ class: "flex items-start justify-between gap-3" }, [
          View({ class: "flex min-w-0 items-center gap-3" }, [
            View(
              {
                class:
                  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
              },
              [Icon({ name: icon_for_item(item), size: 18 })],
            ),
            View({ class: "min-w-0" }, [
              View({ class: "truncate text-sm font-medium" }, [
                item.title || types[0] || "剪贴内容",
              ]),
              View({ class: "mt-0.5 text-xs text-muted-foreground" }, [
                format_date(
                  item.created_at || item.createdAt || item.updated_at,
                ),
              ]),
            ]),
          ]),
          View({ class: "flex shrink-0 items-center gap-1" }, [
            ActionButton({
              label: "查看详情",
              icon: "eye",
              on_click: open_item,
            }),
            ActionButton({ label: "复制", icon: "copy", on_click: copy_item }),
            ActionButton({
              label: "删除",
              icon: "trash-2",
              variant: "ghost",
              on_click: delete_item,
            }),
          ]),
        ]),
        View(
          {
            class:
              "content-card__preview min-h-12 whitespace-pre-wrap text-sm leading-6 text-foreground/90",
            onClick: open_item,
          },
          [text],
        ),
        Show({
          when: types.length > 0,
          ok() {
            return View(
              { class: "flex flex-wrap gap-1.5" },
              types.map((type) =>
                Badge({ variant: "secondary" }, [String(type)]),
              ),
            );
          },
        }),
      ]),
    ],
  );
}

function LoadingGrid() {
  return View(
    { class: "grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3" },
    Array.from({ length: 6 }, (_, index) =>
      Card({ key: index, class: "border-border/80" }, [
        CardContent({ class: "space-y-4 p-4" }, [
          View({ class: "flex items-center gap-3" }, [
            Skeleton({ class: "size-9" }),
            View({ class: "flex-1 space-y-2" }, [
              Skeleton({ class: "h-4 w-28" }),
              Skeleton({ class: "h-3 w-40" }),
            ]),
          ]),
          Skeleton({ class: "h-16 w-full" }),
        ]),
      ]),
    ),
  );
}

export function HomePage() {
  const items_ = ref([]);
  const query_ = ref("");
  const status_ = ref("loading");
  const error_ = ref("");
  let abort_controller;
  let current_page = 0;
  const exhausted_ = ref(false);
  const loading_more_ = ref(false);

  const visible_items_ = combine(
    { items: items_, query: query_ },
    ({ items, query }) => {
      const keyword = query.trim().toLocaleLowerCase();
      if (!keyword) return items;
      return items.filter((item) => {
        const haystack = [
          item.title,
          item.text,
          item.origin_text,
          ...(item_types(item) || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return haystack.includes(keyword);
      });
    },
  );

  const search$ = new vm.InputCore({
    defaultValue: "",
    placeholder: "搜索内容、类型或标签",
    allowClear: true,
    onChange(value) {
      query_.as(String(value || ""));
    },
  });

  async function load_items() {
    abort_controller?.abort();
    abort_controller = new AbortController();
    const controller = abort_controller;
    status_.as("loading");
    loading_more_.as(false);
    error_.as("");
    try {
      const payload = await api.paste.list(
        { page: 1, page_size: 20 },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      const result = normalize_page(payload, 1, 20);
      current_page = result.page;
      exhausted_.as(result.exhausted);
      items_.as(result.items);
      status_.as("ready");
    } catch (error) {
      if (controller.signal.aborted || error.name === "AbortError") return;
      error_.as(error.message || "内容加载失败");
      status_.as("error");
    }
  }

  const refresh$ = new vm.ButtonCore({
    variant: "outline",
    onClick: load_items,
  });
  const more$ = new vm.ButtonCore({
    variant: "outline",
    async onClick() {
      if (loading_more_.value || exhausted_.value) return;
      const controller = abort_controller;
      loading_more_.as(true);
      more$.setLoading(true);
      try {
        const result = normalize_page(
          await api.paste.list(
            { page: current_page + 1, page_size: 20 },
            controller.signal,
          ),
          current_page + 1,
          20,
        );
        if (controller.signal.aborted) return;
        const existing_ids = new Set(
          items_.value.map((item) => item.id).filter(Boolean),
        );
        items_.as([
          ...items_.value,
          ...result.items.filter(
            (item) => !item.id || !existing_ids.has(item.id),
          ),
        ]);
        current_page = result.page;
        exhausted_.as(result.exhausted);
      } catch (error) {
        if (error.name !== "AbortError")
          notify(error.message || "加载更多失败", "error");
      } finally {
        more$.setLoading(false);
        loading_more_.as(false);
      }
    },
  });

  return View(
    {
      as: "section",
      class:
        "mx-auto flex h-full w-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8",
      onMounted() {
        load_items();
        return () => abort_controller?.abort();
      },
    },
    [
      View(
        {
          class:
            "mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        },
        [
          View({}, [
            View(
              {
                as: "h1",
                class: "text-2xl font-semibold tracking-tight text-balance",
              },
              ["内容库"],
            ),
            View({ as: "p", class: "mt-1 text-sm text-muted-foreground" }, [
              computed(items_, (items) => `${items.length} 条已同步内容`),
            ]),
          ]),
          View({ class: "flex w-full items-center gap-2 sm:w-auto" }, [
            View({ class: "min-w-0 flex-1 sm:w-80" }, [
              Input({
                store: search$,
                attributes: { "aria-label": "搜索内容" },
              }),
            ]),
            Button(
              {
                store: refresh$,
                prefix: [Icon({ name: "refresh-cw", size: 16 })],
              },
              ["刷新"],
            ),
          ]),
        ],
      ),
      View({ class: "min-h-0 flex-1 overflow-y-auto pb-8" }, [
        Show({
          when: computed(status_, (status) => status === "loading"),
          ok: LoadingGrid,
        }),
        Show({
          when: computed(status_, (status) => status === "error"),
          ok() {
            return View(
              {
                class:
                  "flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center",
              },
              [
                Icon({ name: "circle-alert", size: 32 }),
                View({ class: "mt-4 font-medium" }, ["无法加载内容"]),
                View({ class: "mt-1 max-w-md text-sm text-muted-foreground" }, [
                  error_,
                ]),
                View({ class: "mt-5" }, [
                  Button({ store: refresh$ }, ["重新加载"]),
                ]),
              ],
            );
          },
        }),
        Show({
          when: combine(
            { status: status_, items: visible_items_ },
            ({ status, items }) => status === "ready" && items.length === 0,
          ),
          ok() {
            return View(
              {
                class:
                  "flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center",
              },
              [
                View(
                  {
                    class:
                      "flex size-12 items-center justify-center rounded-xl bg-muted",
                  },
                  [Icon({ name: "inbox", size: 24 })],
                ),
                View({ class: "mt-4 font-medium" }, [
                  computed(query_, (query) =>
                    query ? "没有匹配内容" : "还没有剪贴内容",
                  ),
                ]),
                View({ class: "mt-1 max-w-sm text-sm text-muted-foreground" }, [
                  computed(query_, (query) =>
                    query
                      ? "尝试更短的关键词或清除搜索条件。"
                      : "复制的文本、链接和文件会显示在这里。",
                  ),
                ]),
              ],
            );
          },
        }),
        Show({
          when: computed(status_, (status) => status === "ready"),
          ok() {
            return View(
              {
                class: "grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3",
              },
              [
                For({
                  key: "id",
                  each: visible_items_,
                  render(item) {
                    return PasteCard(item, items_);
                  },
                }),
              ],
            );
          },
        }),
        Show({
          when: combine(
            { status: status_, exhausted: exhausted_ },
            ({ status, exhausted }) => status === "ready" && !exhausted,
          ),
          ok() {
            return View({ class: "mt-6 flex justify-center" }, [
              Button({ store: more$ }, ["加载更多"]),
            ]);
          },
        }),
      ]),
    ],
  );
}
