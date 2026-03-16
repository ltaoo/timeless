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
                            registryGet(task).assign({
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
                      registryGet(task).assign({ status: "paused", speed: 0 });
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
              View({ class: "h-[300px]" }, [
                ScrollView(
                  {
                    store: scrollStore,
                    class: "bg-white dark:bg-zinc-950",
                  },
                  [
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
                  ],
                ),
              ]),
            ],
          );
        })(),
      ]),
    ]),
  ]);
}
