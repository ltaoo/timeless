import { Section, Item } from "@/components/index.js";

function createMockTasks() {
  return [
    {
      id: 1,
      name: "project-archive.zip",
      size: 156000000,
      status: "completed",
      progress: 100,
    },
    {
      id: 2,
      name: "design-assets.psd",
      size: 89000000,
      status: "running",
      progress: 67,
      speed: 2400000,
    },
    {
      id: 3,
      name: "video-tutorial.mp4",
      size: 524000000,
      status: "running",
      progress: 34,
      speed: 1800000,
    },
    {
      id: 4,
      name: "database-backup.sql",
      size: 230000000,
      status: "paused",
      progress: 45,
    },
    {
      id: 5,
      name: "photo-gallery.jpg",
      size: 12000000,
      status: "completed",
      progress: 100,
    },
    {
      id: 6,
      name: "report-2024.pdf",
      size: 4500000,
      status: "failed",
      progress: 12,
    },
    {
      id: 7,
      name: "music-collection.mp3",
      size: 78000000,
      status: "pending",
      progress: 0,
    },
    {
      id: 8,
      name: "source-code.tar.gz",
      size: 34000000,
      status: "running",
      progress: 89,
      speed: 3200000,
    },
    {
      id: 9,
      name: "presentation.pptx",
      size: 18000000,
      status: "completed",
      progress: 100,
    },
    {
      id: 10,
      name: "firmware-update.bin",
      size: 67000000,
      status: "pending",
      progress: 0,
    },
  ];
}

function formatSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatSpeed(bytesPerSec) {
  if (bytesPerSec >= 1048576)
    return (bytesPerSec / 1048576).toFixed(1) + " MB/s";
  if (bytesPerSec >= 1024) return (bytesPerSec / 1024).toFixed(0) + " KB/s";
  return bytesPerSec + " B/s";
}

/**
 *
 * @param {object} props
 * @param {{ name: string; status: string; size: number; speed?: number; progress: number }} props.task
 * @returns
 */
function DownloadTaskItem(props) {
  const task = props.task;

  const statusText_ = computed(task, (t) => {
    if (t.status === "completed") {
      return formatSize(t.size);
    }
    if (t.status === "running") {
      return `${formatSpeed(t.speed)} · ${t.progress}%`;
    }
    if (t.status === "paused") {
      return `Paused · ${t.progress}%`;
    }
    if (t.status === "failed") {
      return "Failed";
    }
    if (t.status === "pending") {
      return "Waiting...";
    }
    return t.status;
  });
  const statusColor_ = computed(task, (t) => {
    if (t.status === "completed") {
      return "text-emerald-500";
    }
    if (t.status === "running") {
      return "text-blue-500";
    }
    if (t.status === "paused") {
      return "text-amber-500";
    }
    if (t.status === "failed") {
      return "text-red-500";
    }
    return "text-zinc-400";
  });
  const progressWidth_ = computed(task, (t) => {
    return `width: ${t.progress}%;`;
  });
  const progressBg_ = computed(task, (t) => {
    if (t.status === "completed") {
      return "bg-emerald-500";
    }
    if (t.status === "running") {
      return "bg-blue-500";
    }
    if (t.status === "paused") {
      return "bg-amber-400";
    }
    if (t.status === "failed") {
      return "bg-red-500";
    }
    return "bg-zinc-300 dark:bg-zinc-600";
  });

  return View(
    {
      class: cn([
        "flex items-center gap-3 px-3 py-2.5",
        "border-b border-zinc-100 dark:border-zinc-800 last:border-b-0",
      ]),
    },
    [
      // File icon
      View(
        {
          class: cn([
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
            computed(task, (t) => {
              if (t.status === "completed") {
                return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";
              }
              if (t.status === "running") {
                return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
              }
              if (t.status === "failed") {
                return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400";
              }
              return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
            }),
          ]),
        },
        [
          computed(task, (t) => {
            const ext = t.name.split(".").pop().toUpperCase();
            return ext.length <= 4 ? ext : "FILE";
          }),
        ],
      ),
      // File info
      View({ class: "flex-1 min-w-0" }, [
        View(
          {
            class:
              "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
          },
          [computed(task, (t) => t.name)],
        ),
        // Progress bar (for non-completed, non-pending)
        Show(
          {
            when: computed(
              task,
              (t) => t.status === "running" || t.status === "paused",
            ),
          },
          [
            View(
              {
                class:
                  "mt-1 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden",
              },
              [
                View({
                  class: cn([
                    "h-full rounded-full transition-all",
                    progressBg_,
                  ]),
                  style: progressWidth_,
                }),
              ],
            ),
          ],
        ),
        View({ class: cn(["mt-0.5 text-xs", statusColor_]) }, [statusText_]),
      ]),
      // Action button
      View(
        {
          class: "flex-shrink-0",
        },
        [
          Show(
            {
              when: computed(task, (t) => t.status === "running"),
              fallback: [
                h(
                  Show,
                  {
                    when: computed(
                      task,
                      (t) => t.status === "paused" || t.status === "failed",
                    ),
                    fallback: [
                      h(
                        Show,
                        {
                          when: computed(task, (t) => t.status === "completed"),
                        },
                        [
                          View(
                            {
                              class:
                                "done_text text-xs text-emerald-500 font-medium",
                            },
                            ["Done"],
                          ),
                        ],
                      ),
                    ],
                  },
                  [
                    h(
                      Button,
                      {
                        class: "retry_or_resume",
                        size: "sm",
                        variant: "ghost",
                        store: new Timeless.ui.ButtonCore({
                          onClick() {
                            getobj(task).assign({
                              status: "running",
                              speed: 1500000,
                            });
                          },
                        }),
                      },
                      [
                        computed(task, (t) =>
                          t.status === "failed" ? "Retry" : "Resume",
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            },
            [
              h(
                Button,
                {
                  class: "pause",
                  size: "sm",
                  variant: "ghost",
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      getobj(task).assign({ status: "paused", speed: 0 });
                    },
                  }),
                },
                ["Pause"],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default function HomeIndexScrollViewExampleView() {
  return View({ class: "space-y-8" }, [
    Section("ScrollView", [
      Item("Basic", [
        View({ class: cn(["w-[300px] h-[200px]"]) }, [
          ScrollView(
            {
              store: new Timeless.ui.ScrollViewCore(),
              class: cn([
                "rounded-md border border-zinc-200 dark:border-zinc-800",
              ]).toString(),
            },
            [
              View({ class: cn(["p-4 space-y-4"]) }, [
                ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
                  View(
                    {
                      class: cn([
                        "py-2 border-b border-zinc-100 dark:border-zinc-800 text-sm",
                      ]),
                    },
                    [Txt(`Item ${i} — Scrollable content`)],
                  ),
                ),
              ]),
            ],
          ),
        ]),
      ]),
      Item("Pull to Refresh", [
        (() => {
          const store = new Timeless.ui.ScrollViewCore({
            onPullToRefresh() {
              setTimeout(() => {
                store.finishPullToRefresh();
              }, 1500);
            },
          });
          return View({ class: cn(["w-[300px] h-[200px]"]) }, [
            ScrollView(
              {
                store,
                class: cn([
                  "rounded-md border border-zinc-200 dark:border-zinc-800",
                ]).toString(),
              },
              [
                View({ class: cn(["p-4 space-y-4"]) }, [
                  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
                    View(
                      {
                        class: cn([
                          "py-2 border-b border-zinc-100 dark:border-zinc-800 text-sm",
                        ]),
                      },
                      [Txt(`Pull down to refresh — Item ${i}`)],
                    ),
                  ),
                ]),
              ],
            ),
          ]);
        })(),
      ]),
      Item("Reach Bottom", [
        (() => {
          const items = refarr(
            Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`),
          );
          const store = new Timeless.ui.ScrollViewCore({
            onReachBottom() {
              const cur = items.value.length;
              const more = Array.from(
                { length: 5 },
                (_, i) => `Item ${cur + i + 1}`,
              );
              items.as([...items.value, ...more]);
              store.finishLoadingMore();
            },
          });
          return View({ class: cn(["w-[300px] h-[200px]"]) }, [
            ScrollView(
              {
                store,
                class: cn([
                  "rounded-md border border-zinc-200 dark:border-zinc-800",
                ]).toString(),
              },
              [
                View({ class: cn(["p-4"]) }, [
                  For({
                    each: items,
                    render(item) {
                      return View(
                        {
                          class: cn([
                            "py-2 border-b border-zinc-100 dark:border-zinc-800 text-sm",
                          ]),
                        },
                        [Txt(item)],
                      );
                    },
                  }),
                  View(
                    {
                      class: cn(["py-3 text-center text-xs text-zinc-400"]),
                    },
                    [Txt("Scroll to bottom to load more")],
                  ),
                ]),
              ],
            ),
          ]);
        })(),
      ]),
      Item("Scroll Events", [
        (() => {
          const scrollTop = ref(0);
          const store = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              scrollTop.as(Math.round(pos.scrollTop));
            },
          });
          return View({ class: cn(["space-y-2"]) }, [
            View({ class: cn(["text-xs text-zinc-400"]) }, [
              Txt(computed(scrollTop, (v) => `scrollTop: ${v}px`)),
            ]),
            View({ class: cn(["w-[300px] h-[200px]"]) }, [
              ScrollView(
                {
                  store,
                  class: cn([
                    "rounded-md border border-zinc-200 dark:border-zinc-800",
                  ]).toString(),
                },
                [
                  View({ class: cn(["p-4 space-y-4"]) }, [
                    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                      (i) =>
                        View(
                          {
                            class: cn([
                              "py-2 border-b border-zinc-100 dark:border-zinc-800 text-sm",
                            ]),
                          },
                          [Txt(`Scroll me — Item ${i}`)],
                        ),
                    ),
                  ]),
                ],
              ),
            ]),
          ]);
        })(),
      ]),
    ]),
    Section("Virtual List (Waterfall)", [
      Item("Infinite Scroll — Completed Downloads", [
        (() => {
          const ITEM_HEIGHT = 56;
          let nextId = 1;

          const fileNames = [
            "project-archive.zip",
            "design-assets.psd",
            "video-tutorial.mp4",
            "database-backup.sql",
            "photo-gallery.jpg",
            "report-2024.pdf",
            "music-collection.mp3",
            "source-code.tar.gz",
            "presentation.pptx",
            "firmware-update.bin",
            "app-installer.dmg",
            "font-pack.otf",
            "dataset-train.csv",
            "wallpaper-4k.png",
            "ebook-guide.epub",
          ];

          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: 0,
          });

          // Initial data
          let totalItemCount = 30;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          return View(
            {
              class: cn([
                "w-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
              ]),
            },
            [
              // Header
              View(
                {
                  class: cn([
                    "flex items-center justify-between px-3 py-2.5",
                    "border-b border-zinc-200 dark:border-zinc-800",
                    "bg-zinc-50 dark:bg-zinc-900",
                  ]),
                },
                [
                  View(
                    {
                      class: cn([
                        "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                      ]),
                    },
                    [
                      Txt("Completed Downloads"),
                      Txt(computed(totalCount, (c) => ` (${c})`)),
                    ],
                  ),
                ],
              ),
              // ScrollView + Waterfall
              View({ class: "h-[300px]" }, [
                ScrollView({ store: scrollStore }, [
                  Waterfall({
                    store: waterfall,
                    class: "!overflow-visible !h-auto",
                    /** @param {{name: string; size: number}} task  */
                    render(task) {
                      return View(
                        {
                          class: cn([
                            "flex items-center gap-3 px-3 py-2.5",
                            "border-b border-zinc-100 dark:border-zinc-800",
                          ]),
                        },
                        [
                          View(
                            {
                              class: cn([
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                              ]),
                            },
                            [
                              (() => {
                                if (task.name) {
                                  const ext = task.name
                                    .split(".")
                                    .pop()
                                    .toUpperCase();
                                  return ext.length <= 4 ? ext : "FILE";
                                }
                                return "FILE";
                              })(),
                            ],
                          ),
                          View({ class: "flex-1 min-w-0" }, [
                            View(
                              {
                                class:
                                  "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                              },
                              [task.name],
                            ),
                            View(
                              {
                                class: "mt-0.5 text-xs text-emerald-500",
                              },
                              [formatSize(task.size)],
                            ),
                          ]),
                          View(
                            {
                              class:
                                "flex-shrink-0 text-xs text-emerald-500 font-medium",
                            },
                            ["Done"],
                          ),
                        ],
                      );
                    },
                  }),
                  View(
                    {
                      class: cn(["py-3 text-center text-xs text-zinc-400"]),
                    },
                    [Txt("Scroll to bottom to load more")],
                  ),
                ]),
              ]),
            ],
          );
        })(),
      ]),
      Item("Unshift Items — Prepend Downloads", [
        (() => {
          const ITEM_HEIGHT = 56;
          let nextId = 1;

          const fileNames = [
            "backup-daily.zip",
            "logs-server.txt",
            "snapshot-db.sql",
            "metrics-export.csv",
            "config-prod.yaml",
            "cert-renewal.pem",
            "audit-trail.json",
            "cache-dump.bin",
          ];

          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: 0,
          });

          let totalItemCount = 20;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          function handleUnshift() {
            const count = 5;
            const newItems = generateDownloads(count);
            const cells = waterfall.methods.unshiftItems(newItems);
            totalItemCount += count;
            totalCount.as(totalItemCount);
            // Adjust scroll position to keep current view stable
            const addedHeight = count * ITEM_HEIGHT;
            scrollStore.addScrollTop(addedHeight);
          }

          return View(
            {
              class: cn([
                "w-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
              ]),
            },
            [
              // Header
              View(
                {
                  class: cn([
                    "flex items-center justify-between px-3 py-2.5",
                    "border-b border-zinc-200 dark:border-zinc-800",
                    "bg-zinc-50 dark:bg-zinc-900",
                  ]),
                },
                [
                  View(
                    {
                      class: cn([
                        "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                      ]),
                    },
                    [
                      Txt("Download History"),
                      Txt(computed(totalCount, (c) => ` (${c})`)),
                    ],
                  ),
                  Button(
                    {
                      size: "sm",
                      variant: "outline",
                      store: new Timeless.ui.ButtonCore({
                        onClick() {
                          handleUnshift();
                        },
                      }),
                    },
                    ["+ Prepend 5"],
                  ),
                ],
              ),
              // ScrollView + Waterfall
              View({ class: "h-[300px]" }, [
                ScrollView({ store: scrollStore }, [
                  Waterfall({
                    store: waterfall,
                    class: "!overflow-visible !h-auto",
                    /** @param {{id: number; name: string; size: number}} task */
                    render(task) {
                      return View(
                        {
                          class: cn([
                            "flex items-center gap-3 px-3 py-2.5",
                            "border-b border-zinc-100 dark:border-zinc-800",
                          ]),
                        },
                        [
                          View(
                            {
                              class: cn([
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                              ]),
                            },
                            [
                              (() => {
                                if (task.name) {
                                  const ext = task.name
                                    .split(".")
                                    .pop()
                                    .toUpperCase();
                                  return ext.length <= 4 ? ext : "FILE";
                                }
                                return "FILE";
                              })(),
                            ],
                          ),
                          View({ class: "flex-1 min-w-0" }, [
                            View(
                              {
                                class:
                                  "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                              },
                              [`#${task.id} ${task.name}`],
                            ),
                            View(
                              {
                                class: "mt-0.5 text-xs text-emerald-500",
                              },
                              [formatSize(task.size)],
                            ),
                          ]),
                          View(
                            {
                              class:
                                "flex-shrink-0 text-xs text-emerald-500 font-medium",
                            },
                            ["Done"],
                          ),
                        ],
                      );
                    },
                  }),
                  View(
                    {
                      class: cn(["py-3 text-center text-xs text-zinc-400"]),
                    },
                    [Txt("Scroll to bottom to load more")],
                  ),
                ]),
              ]),
            ],
          );
        })(),
      ]),
      Item("Unshift Items with Gutter — Test Jitter", [
        (() => {
          const ITEM_HEIGHT = 56;
          const GUTTER = 8;
          let nextId = 1;

          const fileNames = [
            "backup-daily.zip",
            "logs-server.txt",
            "snapshot-db.sql",
            "metrics-export.csv",
            "config-prod.yaml",
            "cert-renewal.pem",
            "audit-trail.json",
            "cache-dump.bin",
          ];

          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: GUTTER,
          });

          let totalItemCount = 20;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          let loadedMore = false;

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              if (loadedMore) {
                scrollStore.finishLoadingMore();
                return;
              }
              loadedMore = true;
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          function handleUnshift() {
            const count = 5;
            const newItems = generateDownloads(count);
            waterfall.methods.unshiftItems(newItems);
            totalItemCount += count;
            totalCount.as(totalItemCount);
            // Adjust scroll position: each prepended item adds its height + gutter
            const addedHeight = count * (ITEM_HEIGHT + GUTTER);
            scrollStore.addScrollTop(addedHeight);
          }

          return View(
            {
              class: cn([
                "w-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
              ]),
            },
            [
              // Header
              View(
                {
                  class: cn([
                    "flex items-center justify-between px-3 py-2.5",
                    "border-b border-zinc-200 dark:border-zinc-800",
                    "bg-zinc-50 dark:bg-zinc-900",
                  ]),
                },
                [
                  View(
                    {
                      class: cn([
                        "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                      ]),
                    },
                    [
                      Txt("Gutter Test"),
                      Txt(computed(totalCount, (c) => ` (${c})`)),
                    ],
                  ),
                  Button(
                    {
                      size: "sm",
                      variant: "outline",
                      store: new Timeless.ui.ButtonCore({
                        onClick() {
                          handleUnshift();
                        },
                      }),
                    },
                    ["+ Prepend 5"],
                  ),
                ],
              ),
              // ScrollView + Waterfall
              View({ class: "h-[300px]" }, [
                ScrollView(
                  {
                    store: scrollStore,
                    class: "bg-zinc-100 dark:bg-zinc-900",
                  },
                  [
                    Waterfall({
                      store: waterfall,
                      class:
                        "bg-zinc-100 dark:bg-zinc-900 !overflow-visible !h-auto px-2 pt-2",
                      /** @param {{id: number; name: string; size: number}} task */
                      render(task) {
                        return View(
                          {
                            class: cn([
                              "flex items-center gap-3 px-3 py-2.5",
                              "rounded-lg",
                              "shadow-sm",
                            ]),
                          },
                          [
                            View(
                              {
                                class: cn([
                                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                  "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
                                ]),
                              },
                              [
                                (() => {
                                  if (task.name) {
                                    const ext = task.name
                                      .split(".")
                                      .pop()
                                      .toUpperCase();
                                    return ext.length <= 4 ? ext : "FILE";
                                  }
                                  return "FILE";
                                })(),
                              ],
                            ),
                            View({ class: "flex-1 min-w-0" }, [
                              View(
                                {
                                  class:
                                    "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                                },
                                [`#${task.id} ${task.name}`],
                              ),
                              View(
                                {
                                  class: "mt-0.5 text-xs text-zinc-400",
                                },
                                [formatSize(task.size)],
                              ),
                            ]),
                            View(
                              {
                                class: "flex-shrink-0 flex items-center gap-2",
                              },
                              [
                                View(
                                  {
                                    class:
                                      "text-xs text-emerald-500 font-medium",
                                  },
                                  ["Done"],
                                ),
                                h(
                                  Button,
                                  {
                                    size: "sm",
                                    variant: "ghost",
                                    class:
                                      "text-xs text-red-400 hover:text-red-600",
                                    store: new Timeless.ui.ButtonCore({
                                      onClick() {
                                        waterfall.methods.deleteCell(
                                          (v) => v.id === task.id,
                                        );
                                        totalItemCount -= 1;
                                        totalCount.as(totalItemCount);
                                      },
                                    }),
                                  },
                                  ["Delete"],
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    }),
                  ],
                ),
              ]),
            ],
          );
        })(),
      ]),
      Item("Clear Downloads", [
        (() => {
          const ITEM_HEIGHT = 56;
          let nextId = 1;

          const fileNames = [
            "project-archive.zip",
            "design-assets.psd",
            "video-tutorial.mp4",
            "database-backup.sql",
            "photo-gallery.jpg",
            "report-2024.pdf",
            "music-collection.mp3",
            "source-code.tar.gz",
          ];

          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: 0,
          });

          let totalItemCount = 20;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          function handleClear() {
            waterfall.methods.cleanColumns();
            totalItemCount = 0;
            totalCount.as(0);
          }

          function handleReload() {
            waterfall.methods.cleanColumns();
            nextId = 1;
            totalItemCount = 20;
            waterfall.methods.appendItems(generateDownloads(totalItemCount));
            totalCount.as(totalItemCount);
          }

          return View(
            {
              class: cn([
                "w-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
              ]),
            },
            [
              // Header
              View(
                {
                  class: cn([
                    "flex items-center justify-between px-3 py-2.5",
                    "border-b border-zinc-200 dark:border-zinc-800",
                    "bg-zinc-50 dark:bg-zinc-900",
                  ]),
                },
                [
                  View(
                    {
                      class: cn([
                        "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                      ]),
                    },
                    [
                      Txt("Downloads"),
                      Txt(computed(totalCount, (c) => ` (${c})`)),
                    ],
                  ),
                  View({ class: "flex items-center gap-1" }, [
                    Button(
                      {
                        size: "sm",
                        variant: "outline",
                        store: new Timeless.ui.ButtonCore({
                          onClick() {
                            handleReload();
                          },
                        }),
                      },
                      ["Reload"],
                    ),
                    Button(
                      {
                        size: "sm",
                        variant: "ghost",
                        store: new Timeless.ui.ButtonCore({
                          onClick() {
                            handleClear();
                          },
                        }),
                      },
                      ["Clear"],
                    ),
                  ]),
                ],
              ),
              // ScrollView + Waterfall
              View({ class: "h-[300px]" }, [
                ScrollView({ store: scrollStore }, [
                  Waterfall({
                    store: waterfall,
                    class: "!overflow-visible !h-auto",
                    /** @param {{id: number; name: string; size: number}} task */
                    render(task) {
                      return View(
                        {
                          class: cn([
                            "flex items-center gap-3 px-3 py-2.5",
                            "border-b border-zinc-100 dark:border-zinc-800",
                          ]),
                        },
                        [
                          View(
                            {
                              class: cn([
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                              ]),
                            },
                            [
                              (() => {
                                if (task.name) {
                                  const ext = task.name
                                    .split(".")
                                    .pop()
                                    .toUpperCase();
                                  return ext.length <= 4 ? ext : "FILE";
                                }
                                return "FILE";
                              })(),
                            ],
                          ),
                          View({ class: "flex-1 min-w-0" }, [
                            View(
                              {
                                class:
                                  "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                              },
                              [`#${task.id} ${task.name}`],
                            ),
                            View(
                              {
                                class: "mt-0.5 text-xs text-emerald-500",
                              },
                              [formatSize(task.size)],
                            ),
                          ]),
                          View(
                            {
                              class:
                                "flex-shrink-0 text-xs text-emerald-500 font-medium",
                            },
                            ["Done"],
                          ),
                        ],
                      );
                    },
                  }),
                  View(
                    {
                      class: cn(["py-3 text-center text-xs text-zinc-400"]),
                    },
                    [Txt("Scroll to bottom to load more")],
                  ),
                ]),
              ]),
            ],
          );
        })(),
      ]),
    ]),
    Section("Popover + Virtual List", [
      Item("State Preservation on Reopen", [
        (() => {
          const ITEM_HEIGHT = 56;
          let nextId = 1;

          const fileNames = [
            "project-archive.zip",
            "design-assets.psd",
            "video-tutorial.mp4",
            "database-backup.sql",
            "photo-gallery.jpg",
            "report-2024.pdf",
            "music-collection.mp3",
            "source-code.tar.gz",
            "presentation.pptx",
            "firmware-update.bin",
          ];

          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: 0,
          });

          let totalItemCount = 20;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          const popoverStore = new Timeless.ui.PopoverCore({
            side: "bottom",
            align: "start",
            destroyOnClose: false,
          });

          return Popover(
            {
              store: popoverStore,
              content: [
                View(
                  {
                    class: cn(["w-[340px] rounded-lg overflow-hidden"]),
                  },
                  [
                    // Header
                    View(
                      {
                        class: cn([
                          "flex items-center justify-between px-3 py-2.5",
                          "border-b border-zinc-200 dark:border-zinc-800",
                          "bg-zinc-50 dark:bg-zinc-900",
                        ]),
                      },
                      [
                        View(
                          {
                            class: cn([
                              "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                            ]),
                          },
                          [
                            Txt("Downloads"),
                            Txt(computed(totalCount, (c) => ` (${c})`)),
                          ],
                        ),
                      ],
                    ),
                    // ScrollView + Waterfall
                    View({ class: "h-[300px]" }, [
                      ScrollView({ store: scrollStore }, [
                        Waterfall({
                          store: waterfall,
                          class: "!overflow-visible !h-auto",
                          /** @param {{id: number; name: string; size: number}} task */
                          render(task) {
                            return View(
                              {
                                class: cn([
                                  "flex items-center gap-3 px-3 py-2.5",
                                  "border-b border-zinc-100 dark:border-zinc-800",
                                ]),
                              },
                              [
                                View(
                                  {
                                    class: cn([
                                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                                    ]),
                                  },
                                  [
                                    (() => {
                                      if (task.name) {
                                        const ext = task.name
                                          .split(".")
                                          .pop()
                                          .toUpperCase();
                                        return ext.length <= 4 ? ext : "FILE";
                                      }
                                      return "FILE";
                                    })(),
                                  ],
                                ),
                                View({ class: "flex-1 min-w-0" }, [
                                  View(
                                    {
                                      class:
                                        "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                                    },
                                    [`#${task.id} ${task.name}`],
                                  ),
                                  View(
                                    {
                                      class: "mt-0.5 text-xs text-emerald-500",
                                    },
                                    [formatSize(task.size)],
                                  ),
                                ]),
                                View(
                                  {
                                    class:
                                      "flex-shrink-0 text-xs text-emerald-500 font-medium",
                                  },
                                  ["Done"],
                                ),
                              ],
                            );
                          },
                        }),
                        View(
                          {
                            class: cn([
                              "py-3 text-center text-xs text-zinc-400",
                            ]),
                          },
                          [Txt("Scroll to bottom to load more")],
                        ),
                      ]),
                    ]),
                  ],
                ),
              ],
            },
            [
              Button(
                {
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({}),
                },
                ["Open Downloads"],
              ),
            ],
          );
        })(),
      ]),
      Item("Destroy on Close (default)", [
        (() => {
          const ITEM_HEIGHT = 56;
          const INITIAL_COUNT = 20;

          const fileNames = [
            "project-archive.zip",
            "design-assets.psd",
            "video-tutorial.mp4",
            "database-backup.sql",
            "photo-gallery.jpg",
            "report-2024.pdf",
            "music-collection.mp3",
            "source-code.tar.gz",
            "presentation.pptx",
            "firmware-update.bin",
          ];

          let nextId = 1;
          function generateDownloads(count) {
            return Array.from({ length: count }, () => {
              const id = nextId++;
              return {
                id,
                name: fileNames[(id - 1) % fileNames.length],
                size: Math.floor(Math.random() * 500000000) + 1000000,
                status: "completed",
                progress: 100,
                height: ITEM_HEIGHT,
              };
            });
          }

          const waterfall = Timeless.ui.WaterfallModel({
            column: 1,
            size: 10,
            buffer: 3,
            gutter: 0,
          });

          let totalItemCount = INITIAL_COUNT;
          waterfall.methods.appendItems(generateDownloads(totalItemCount));

          const totalCount = ref(totalItemCount);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onScroll(pos) {
              waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
            },
            onReachBottom() {
              const newItems = generateDownloads(10);
              waterfall.methods.appendItems(newItems);
              totalItemCount += 10;
              totalCount.as(totalItemCount);
              scrollStore.finishLoadingMore();
            },
          });

          const popoverStore = new Timeless.ui.PopoverCore({
            side: "bottom",
            align: "start",
          });

          // 每次打开都重置为初始状态
          popoverStore.onShow(() => {
            waterfall.methods.cleanColumns();
            nextId = 1;
            totalItemCount = INITIAL_COUNT;
            waterfall.methods.appendItems(generateDownloads(totalItemCount));
            totalCount.as(totalItemCount);
          });

          return Popover(
            {
              store: popoverStore,
              content: [
                View(
                  {
                    class: cn(["w-[340px] rounded-lg overflow-hidden"]),
                  },
                  [
                    // Header
                    View(
                      {
                        class: cn([
                          "flex items-center justify-between px-3 py-2.5",
                          "border-b border-zinc-200 dark:border-zinc-800",
                          "bg-zinc-50 dark:bg-zinc-900",
                        ]),
                      },
                      [
                        View(
                          {
                            class: cn([
                              "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                            ]),
                          },
                          [
                            Txt("Downloads"),
                            Txt(computed(totalCount, (c) => ` (${c})`)),
                          ],
                        ),
                      ],
                    ),
                    // ScrollView + Waterfall
                    View({ class: "h-[300px]" }, [
                      ScrollView({ store: scrollStore }, [
                        Waterfall({
                          store: waterfall,
                          class: "!overflow-visible !h-auto",
                          /** @param {{id: number; name: string; size: number}} task */
                          render(task) {
                            return View(
                              {
                                class: cn([
                                  "flex items-center gap-3 px-3 py-2.5",
                                  "border-b border-zinc-100 dark:border-zinc-800",
                                ]),
                              },
                              [
                                View(
                                  {
                                    class: cn([
                                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                      "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                                    ]),
                                  },
                                  [
                                    (() => {
                                      if (task.name) {
                                        const ext = task.name
                                          .split(".")
                                          .pop()
                                          .toUpperCase();
                                        return ext.length <= 4 ? ext : "FILE";
                                      }
                                      return "FILE";
                                    })(),
                                  ],
                                ),
                                View({ class: "flex-1 min-w-0" }, [
                                  View(
                                    {
                                      class:
                                        "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                                    },
                                    [`#${task.id} ${task.name}`],
                                  ),
                                  View(
                                    {
                                      class: "mt-0.5 text-xs text-emerald-500",
                                    },
                                    [formatSize(task.size)],
                                  ),
                                ]),
                                View(
                                  {
                                    class:
                                      "flex-shrink-0 text-xs text-emerald-500 font-medium",
                                  },
                                  ["Done"],
                                ),
                              ],
                            );
                          },
                        }),
                        View(
                          {
                            class: cn([
                              "py-3 text-center text-xs text-zinc-400",
                            ]),
                          },
                          [Txt("Scroll to bottom to load more")],
                        ),
                      ]),
                    ]),
                  ],
                ),
              ],
            },
            [
              Button(
                {
                  variant: "outline",
                  store: new Timeless.ui.ButtonCore({}),
                },
                ["Open Downloads (Reset)"],
              ),
            ],
          );
        })(),
      ]),
    ]),
    Section("Download List", [
      Item("Real-world Scenario", [
        (() => {
          const mockData = createMockTasks();
          const tasks_ = refarr(mockData);
          const taskCount_ = ref(mockData.length);

          const scrollStore = new Timeless.ui.ScrollViewCore({
            onPullToRefresh() {
              // Simulate refreshing task statuses
              setTimeout(() => {
                const updated = tasks_.value.map((t) => {
                  if (t.status === "running") {
                    const newProgress = Math.min(
                      100,
                      t.progress + Math.floor(Math.random() * 15),
                    );
                    // t.progress = newProgress;
                    // t.status = newProgress >= 100 ? "completed" : "running";
                    return {
                      ...t,
                      progress: newProgress,
                      status: newProgress >= 100 ? "completed" : "running",
                    };
                  }
                  return t;
                });
                tasks_.as(updated);
                scrollStore.finishPullToRefresh();
              }, 1000);
            },
          });

          // Simulate running downloads
          let timer = null;
          timer = setInterval(() => {
            const updated = tasks_.value.map((t) => {
              if (t.status === "running") {
                const newProgress = Math.min(
                  100,
                  t.progress + Math.floor(Math.random() * 3) + 1,
                );
                return {
                  ...t,
                  progress: newProgress,
                  speed: t.speed + (Math.random() - 0.5) * 500000,
                  status: newProgress >= 100 ? "completed" : "running",
                };
              }
              return t;
            });
            tasks_.as(updated);
            // Start pending tasks if no running tasks
            const runningCount = updated.filter(
              (t) => t.status === "running",
            ).length;
            if (runningCount < 2) {
              const pending = updated.find((t) => t.status === "pending");
              if (pending) {
                const started = updated.map((t) =>
                  t.id === pending.id
                    ? { ...t, status: "running", speed: 1200000 }
                    : t,
                );
                tasks_.as(started);
              }
            }
          }, 800);

          return View(
            {
              class: cn([
                "w-[380px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
              ]),
            },
            [
              // Header
              View(
                {
                  class: cn([
                    "flex items-center justify-between px-3 py-2.5",
                    "border-b border-zinc-200 dark:border-zinc-800",
                    "bg-zinc-50 dark:bg-zinc-900",
                  ]),
                },
                [
                  View({ class: cn(["flex items-center gap-2"]) }, [
                    View(
                      {
                        class: cn([
                          "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                        ]),
                      },
                      [
                        Txt("Downloads"),
                        Txt(
                          computed(taskCount_, (d) => (d > 0 ? ` (${d})` : "")),
                        ),
                      ],
                    ),
                  ]),
                  Button(
                    {
                      size: "sm",
                      variant: "ghost",
                      store: new Timeless.ui.ButtonCore({
                        onClick() {
                          if (timer) clearInterval(timer);
                          tasks_.as([]);
                          taskCount_.as(0);
                        },
                      }),
                    },
                    ["Clear"],
                  ),
                ],
              ),
              // Scrollable task list
              View({ class: "max-h-[400px] min-h-[120px] overflow-hidden" }, [
                ScrollView({ store: scrollStore }, [
                  Show(
                    {
                      when: computed(taskCount_, (d) => d > 0),
                      fallback: [
                        View(
                          {
                            class:
                              "flex items-center justify-center h-[200px] text-sm text-zinc-400",
                          },
                          ["No download tasks"],
                        ),
                      ],
                    },
                    [
                      For({
                        key: "id",
                        each: tasks_,
                        render(task) {
                          return DownloadTaskItem({
                            task,
                          });
                        },
                      }),
                    ],
                  ),
                ]),
              ]),
            ],
          );
        })(),
      ]),
    ]),
  ]);
}
