import { Section, Item } from "@/components/index.js";

import { DownloadTaskViewModel } from "./index.download_task.model.js";

function formatSpeed(bps) {
  if (!bps) return "0 B/s";
  if (bps >= 1048576) return (bps / 1048576).toFixed(2) + " MB/s";
  if (bps >= 1024) return (bps / 1024).toFixed(2) + " KB/s";
  return bps + " B/s";
}

function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

function formatPercent(t) {
  const total = t.meta?.res?.size || 0;
  const cur = t.progress?.downloaded || 0;
  if (!total) return 0;
  return Math.min(100, Math.floor((cur * 100) / total));
}

function DownloadTaskItem({ task, vm$ }) {
  const state_ = computed(task, (t) => {
    const pr = formatPercent(t);
    const isCompleted =
      t.status === "done" ||
      t.status === "completed" ||
      t.status === "success" ||
      t.status === "finished" ||
      (pr === 100 && t.status !== "running");
    const isPaused = t.status === "paused" || t.status === "pause";
    const isRunning = t.status === "running";
    const isFailed = t.status === "failed" || t.status === "error";
    const isPending = t.status === "pending";

    let statusText = t.status;
    let statusClass = "text-zinc-400";
    if (isRunning) {
      const speed = formatSpeed(t.progress?.speed || 0);
      statusText = `${speed} · ${pr}%`;
      statusClass = "text-blue-500";
    } else if (isCompleted) {
      const total = t.meta?.res?.size || 0;
      statusText = total ? formatSize(total) : "Done";
      statusClass = "text-emerald-500";
    } else if (isFailed) {
      statusText = "Failed";
      statusClass = "text-red-500";
    } else if (isPending) {
      statusText = "Waiting...";
      statusClass = "text-zinc-400";
    } else if (isPaused) {
      statusText = `Paused · ${pr}%`;
      statusClass = "text-amber-500";
    }
    return {
      pr,
      isCompleted,
      isPaused,
      isRunning,
      isFailed,
      isPending,
      canResume: isFailed || isPaused,
      statusText,
      statusClass,
    };
  });

  const progressWidth_ = computed(state_, (s) => `width: ${s.pr}%`);
  const progressBg_ = computed(state_, (s) => {
    if (s.isCompleted) return "bg-emerald-500";
    if (s.isRunning) return "bg-blue-500";
    if (s.isPaused) return "bg-amber-400";
    if (s.isFailed) return "bg-red-500";
    return "bg-zinc-300 dark:bg-zinc-600";
  });

  const fileExt = computed(task, (t) => {
    const name = t.name || "";
    if (!name) return "FILE";
    const ext = name.split(".").pop().toUpperCase();
    return ext.length <= 4 ? ext : "FILE";
  });

  const iconClass = computed(state_, (s) => {
    if (s.isCompleted)
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400";
    if (s.isRunning)
      return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
    if (s.isFailed)
      return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400";
    return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  });

  return View(
    {
      class:
        "flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0",
    },
    [
      View(
        {
          class: cn([
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
            iconClass,
          ]),
        },
        [fileExt],
      ),
      View({ class: "flex-1 min-w-0" }, [
        View(
          {
            class:
              "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
          },
          [computed(task, (t) => t.name || "unknown")],
        ),
        Show({ when: computed(state_, (s) => s.isRunning || s.isPaused) }, [
          View(
            {
              class:
                "mt-1 h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden",
            },
            [
              View({
                class: cn(["h-full rounded-full transition-all", progressBg_]),
                style: progressWidth_,
              }),
            ],
          ),
        ]),
        View(
          {
            class: cn([
              "mt-0.5 text-xs",
              computed(state_, (s) => s.statusClass),
            ]),
          },
          [computed(state_, (s) => s.statusText)],
        ),
      ]),
      View({ class: "flex-shrink-0 flex items-center gap-1" }, [
        Show({ when: computed(state_, (s) => s.isRunning) }, [
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                variant: "ghost",
                onClick() {
                  vm$.methods.pauseTask(task);
                },
              }),
            },
            ["Pause"],
          ),
        ]),
        Show({ when: computed(state_, (s) => s.canResume) }, [
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                variant: "ghost",
                onClick() {
                  vm$.methods.resumeTask(task);
                },
              }),
            },
            [computed(state_, (s) => (s.isFailed ? "Retry" : "Resume"))],
          ),
        ]),
        Show({ when: computed(state_, (s) => s.isCompleted) }, [
          View({ class: "text-xs text-emerald-500 font-medium px-2" }, [
            "Done",
          ]),
        ]),
        Button(
          {
            class: "text-zinc-400 hover:text-red-500",
            store: new Timeless.ui.ButtonCore({
              size: "sm",
              variant: "ghost",
              onClick() {
                vm$.methods.deleteTask(task);
              },
            }),
          },
          ["Del"],
        ),
      ]),
    ],
  );
}

export default function DownloadTaskPageView(props) {
  const vm$ = DownloadTaskViewModel(props);

  return ScrollView({ class: "p-6 h-screen", store: vm$.ui.view_page$ }, [
    View(
      {
        class: "h-full",
        onMounted() {
          vm$.methods.init();
        },
      },
      [
        // Section("Download Task", [Item("Download List", [,])]),
        View(
          {
            class:
              "flex flex-col w-full h-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
          },
          [
            View(
              {
                class:
                  "flex items-center justify-between h-[50px] px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900",
              },
              [
                View(
                  {
                    class:
                      "text-sm font-semibold text-zinc-700 dark:text-zinc-300",
                  },
                  [
                    "Downloads",
                    computed(vm$.state.taskCount, (d) =>
                      d > 0 ? ` (${d})` : "",
                    ),
                  ],
                ),
                View({ class: "flex items-center gap-1" }, [
                  Button(
                    {
                      store: new Timeless.ui.ButtonCore({
                        size: "sm",
                        variant: "outline",
                      }),
                    },
                    ["+ Fake"],
                  ),
                  Button(
                    {
                      store: new Timeless.ui.ButtonCore({
                        size: "sm",
                        variant: "ghost",
                        onClick() {
                          vm$.methods.clearTasks();
                        },
                      }),
                    },
                    ["Clear"],
                  ),
                ]),
              ],
            ),
            View({ class: "flex-1 h-0" }, [
              ScrollView({ class: "", store: vm$.ui.view_downloadtask$ }, [
                Show(
                  {
                    when: computed(vm$.state.taskCount, (d) => d > 0),
                    fallback: [
                      h(
                        View,
                        {
                          class:
                            "flex items-center justify-center h-[200px] text-sm text-zinc-400",
                        },
                        ["No download tasks"],
                      ),
                    ],
                  },
                  [
                    h(Waterfall, {
                      store: vm$.ui.waterfall$,
                      class: "!overflow-visible !h-auto",
                      render(task) {
                        return DownloadTaskItem({
                          task,
                          vm$: props.model,
                        });
                      },
                    }),
                  ],
                ),
              ]),
            ]),
          ],
        ),
      ],
    ),
  ]);
}
