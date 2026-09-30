import { Section, Item } from "@/components/index.js";

/**
 * 文件树。
 *
 * 引擎（虚拟滚动 / 拖拽落点 / 折叠搬运 / 父子联动勾选）已经提升到共享层：
 *   - 逻辑：`Timeless.vm.TreeCore`（packages/ui-vm/src/tree/）
 *   - DOM：`ui.TreePrimitive`，本页面用的是它的 shadcn 包装 `Timeless.shadcn.Tree`
 *     （UMD 的 `Object.assign(window, Timeless.shadcn)` 已经把它挂成裸全局）。
 *
 * 留在本页面的只有**业务字段**：`type: "file" | "directory"`、文件名后缀图标、
 * 体积格式化 —— 这些通过 `renderIcon` / `renderMeta` 注入，共享层不认识它们。
 */

// ---------------------------------------------------------------------------
// 应用层：文件图标 + 体积格式化
// ---------------------------------------------------------------------------

/** 按后缀挑图标（覆盖图片 / 视频 / 音频 / 代码 / 压缩包 / 兜底）。 */
function resource_file_icon(name) {
  const ext = String(name || "")
    .split(".")
    .pop()
    .toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext))
    return "file-image";
  if (["mp4", "mov", "webm"].includes(ext)) return "file-video-camera";
  if (["mp3", "wav", "flac"].includes(ext)) return "file-volume";
  if (["js", "ts", "html", "css", "json", "md"].includes(ext)) return "file-code";
  if (["zip", "tar", "gz", "7z"].includes(ext)) return "file-box";
  return "file-text";
}

function format_file_size(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function render_icon(node, is_dir) {
  return [
    Icon({
      name: is_dir ? "folder" : resource_file_icon(node.title || node.name),
      size: 15,
    }),
  ];
}

function render_meta(node, is_dir) {
  if (is_dir) return [`${(node.children || []).length} 项`];
  return [node.size ? format_file_size(node.size) : ""];
}

// ---------------------------------------------------------------------------
// 示例数据
// ---------------------------------------------------------------------------

function file(name, size) {
  return { type: "file", title: name, size };
}

function dir(name, children) {
  return { type: "directory", title: name, children };
}

/** 覆盖 resource_file_icon 的每个分支：图片 / 视频 / 音频 / 代码 / 兜底。 */
function make_demo_tree() {
  return [
    dir("Documents", [
      file("report.pdf", 2457600),
      file("notes.txt", 1240),
      file("README.md", 512),
    ]),
    dir("Images", [
      file("photo.jpg", 3145728),
      file("logo.svg", 4096),
      dir("icons", [file("hero.png", 88000), file("badge.webp", 15360)]),
    ]),
    dir("Videos", [file("clip.mp4", 104857600), file("demo.mov", 52428800)]),
    dir("Audio", [file("song.mp3", 8388608), file("podcast.wav", 33554432)]),
    dir("Code", [
      file("app.js", 20480),
      file("index.html", 3072),
      file("style.css", 8192),
      file("data.json", 65536),
    ]),
    file("archive.zip", 134217728),
    file("unknown.bin", 733),
  ];
}

function make_resources() {
  return [
    { name: "videos/2024/spring/clip-01.mp4", kind: "video", size: 10485760 },
    { name: "videos/2024/spring/clip-02.mov", kind: "video", size: 8388608 },
    { name: "images/cover.jpg", kind: "image", size: 524288 },
    { name: "images/thumb.png", kind: "image", size: 98304 },
    { name: "audio/theme.mp3", kind: "audio", size: 4194304 },
    { name: "docs/spec.pdf", kind: "document", size: 1048576 },
    { name: "index.html", kind: "document", size: 2048 },
  ];
}

// ---------------------------------------------------------------------------
// 压力测试：10000 个文件
// ---------------------------------------------------------------------------

const big_dir_count = 100;
const big_files_per_dir = 100;
const big_exts = ["mp4", "jpg", "png", "mp3", "pdf", "txt", "js", "json", "zip", "bin"];

function pad3(n) {
  return String(n).padStart(3, "0");
}

/**
 * 100 个目录 × 100 个文件 = 10100 行。
 *
 * 用来验证虚拟滚动：挂载的行数只跟可视高度有关，跟总行数无关。
 */
function make_big_tree() {
  const dirs = [];
  for (let d = 0; d < big_dir_count; d += 1) {
    const files = [];
    for (let f = 0; f < big_files_per_dir; f += 1) {
      const ext = big_exts[f % big_exts.length];
      files.push(file(`file-${pad3(f)}.${ext}`, 1024 * ((f % 97) + 1)));
    }
    dirs.push(dir(`folder-${pad3(d)}`, files));
  }
  return dirs;
}

/** 行数 = 目录数 + 文件数（压力测试面板只关心这个数）。 */
function count_rows(nodes) {
  let total = 0;
  for (const node of nodes || []) {
    total += 1;
    if (Array.isArray(node.children)) total += count_rows(node.children);
  }
  return total;
}

// ---------------------------------------------------------------------------

export default function TreeDemoView() {
  const view$ = new Timeless.vm.ScrollViewCore({});

  // 主示例：写死的树。
  const demo_log$ = ref([]);

  const demo$ = new Timeless.vm.TreeCore({
    nodes: make_demo_tree(),
    draggable: true,
    checkable: true,
    multiple: true,
    onMove({ node, from, to }) {
      const dst = to.parentKey || "根级";
      push_log(demo_log$, `《${node.title}》${from.parentKey || "根级"} → ${dst} #${to.index}`);
      refresh();
    },
    onCheck(_key, checked, info) {
      push_log(
        demo_log$,
        `${checked ? "勾选" : "取消"} 1 项 · 总计 ${info.checkedKeys.size} 项，半选 ${info.halfCheckedKeys.size} 项`,
      );
      refresh();
    },
    onExpand(key, expanded) {
      push_log(demo_log$, `${expanded ? "展开" : "折叠"} #${key}`);
    },
  });

  // 拖动 / 勾选 / 排序之后手动 +1，用来重算右侧 JSON 快照。
  const rev_ = ref(0);
  const json_ = derive([rev_], () => JSON.stringify(demo$.toJSON(), null, 2));

  // 扁平资源示例：name 里带 `/`，由 buildTreeFromPaths 拆名建树。
  const resources$ = refarr(make_resources());
  const resource_log$ = ref([]);
  const resource_store$ = new Timeless.vm.TreeCore({
    draggable: true,
    onMove({ node, to }) {
      push_log(resource_log$, `《${node.title}》→ ${to.parentKey || "根级"} #${to.index}`);
    },
  });
  resource_store$.setResources(resources$.toArray());

  // 压力测试：10000 文件的大树。刻意不接 JSON 面板 —— 10100 个节点的 JSON 会把
  // 右侧拖死，而这棵树要证明的正是「不管多大，挂载的行数都是有界的」。
  const big_note$ = ref(`尚未生成（${big_dir_count} 目录 × ${big_files_per_dir} 文件）`);
  const big_store$ = new Timeless.vm.TreeCore({ draggable: true });

  function refresh() {
    rev_.as(rev_.value + 1);
  }

  function push_log(target, line) {
    const stamp = new Date().toLocaleTimeString();
    target.as([`${stamp}  ${line}`, ...target.value].slice(0, 60));
  }

  function text_button(label, onClick) {
    return Button(
      {
        store: new Timeless.vm.ButtonCore({
          variant: "outline",
          size: "sm",
          onClick,
        }),
      },
      [label],
    );
  }

  function log_panel(target) {
    const has_ = derive([target], (lines) => lines.length > 0);
    return View(
      {
        class:
          "max-h-[200px] overflow-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-800",
      },
      [
        Show({
          when: has_,
          ok() {
            return View({ class: "space-y-1" }, [
              For({
                each: target,
                render(line) {
                  return View(
                    {
                      class:
                        "text-xs leading-5 font-mono text-zinc-500 dark:text-zinc-400",
                    },
                    [line],
                  );
                },
              }),
            ]);
          },
          else() {
            return View({ class: "text-xs text-zinc-400" }, ["还没有操作"]);
          },
        }),
      ],
    );
  }

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "flex flex-wrap items-start gap-6" }, [
      View({ class: "flex-1 min-w-[420px] space-y-8" }, [
        Section("树形拖拽 · 多选", [
          Item("工具", [
            text_button("按名称排序", () => {
              const copy = Timeless.vm.sortTree(
                Timeless.vm.cloneKeepIds(demo$.nodes.children),
              );
              demo$.setNodes(copy);
              push_log(demo_log$, "按名称排序（目录在前，文件名自然序）");
              refresh();
            }),
            text_button("展开全部", () => demo$.expandAll()),
            text_button("折叠全部", () => demo$.collapseAll()),
            text_button("清空勾选", () => {
              demo$.uncheckAll();
              push_log(demo_log$, "清空勾选");
            }),
            text_button("重置", () => {
              demo$.setNodes(make_demo_tree());
              push_log(demo_log$, "重置为初始结构");
              refresh();
            }),
          ]),
          Item("文件树", [
            View({ class: "w-full" }, [
              Tree({
                store: demo$,
                maxHeight: 420,
                renderIcon: render_icon,
                renderMeta: render_meta,
              }),
            ]),
          ]),
        ]),

        Section("扁平资源数组（setResources）", [
          Item("操作", [
            text_button("添加一个文件", () => {
              const count = resources$.toArray().length;
              resources$.push({
                name: `downloads/extra-${count + 1}.mp4`,
                kind: "video",
                size: 1024 * (count + 1),
              });
              resource_store$.setResources(resources$.toArray());
              push_log(resource_log$, `push 一个资源（共 ${count + 1} 个）`);
            }),
            text_button("移除最后一个", () => {
              resources$.pop();
              resource_store$.setResources(resources$.toArray());
              push_log(resource_log$, "pop 一个资源");
            }),
          ]),
          Item("资源树", [
            View({ class: "w-full" }, [
              Tree({
                store: resource_store$,
                maxHeight: 260,
                emptyText: "没有资源",
                renderIcon: render_icon,
                renderMeta: render_meta,
              }),
            ]),
          ]),
        ]),

        Section("压力测试：10000 个文件", [
          Item("工具", [
            text_button("生成 10000 个文件", () => {
              const t0 = performance.now();
              const nodes = make_big_tree();
              const build_ms = (performance.now() - t0).toFixed(1);
              big_store$.setNodes(nodes);
              big_store$.expandAll();
              // 等一帧再量：同步测到的是「还没挂行的那个时刻」，不是用户看到首屏的时间。
              requestAnimationFrame(() => {
                const mounted = document.querySelectorAll(
                  '[n="tree-scroll"] [data-tree-row-id]',
                ).length;
                big_note$.as(
                  `${count_rows(nodes)} 行（${big_dir_count} 目录 + ${
                    big_dir_count * big_files_per_dir
                  } 文件）· 建树 ${build_ms}ms · 当前 DOM 里挂了 ${mounted} 行`,
                );
              });
              push_log(demo_log$, `生成 10000 文件大树（建树 ${build_ms}ms）`);
            }),
            text_button("大树折叠全部", () => big_store$.collapseAll()),
            text_button("大树展开全部", () => big_store$.expandAll()),
            text_button("清空大树", () => {
              big_store$.setNodes([]);
              big_note$.as("已清空");
              push_log(demo_log$, "清空大树");
            }),
          ]),
          Item("大树", [
            View({ class: "w-full space-y-2" }, [
              Tree({
                store: big_store$,
                maxHeight: 420,
                emptyText: "还没有生成大树",
                renderIcon: render_icon,
                renderMeta: render_meta,
              }),
              View(
                {
                  class: "text-xs font-mono text-zinc-500 dark:text-zinc-400",
                  attributes: { n: "big-note" },
                },
                [big_note$],
              ),
            ]),
          ]),
        ]),
      ]),

      View({ class: "w-[380px] shrink-0 space-y-6" }, [
        Section("操作日志", [log_panel(demo_log$)]),
        Section("资源树日志", [log_panel(resource_log$)]),
        Section("当前树结构", [
          View(
            {
              // `as: "pre"` 在当前版本的 DOM host 里不生效，用 whitespace-pre 等效。
              class:
                "max-h-[420px] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] leading-4 font-mono whitespace-pre text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
              attributes: { n: "tree-json" },
            },
            [json_],
          ),
        ]),
      ]),
    ]),
  ]);
}
