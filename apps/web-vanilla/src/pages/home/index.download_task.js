import { Section, Item } from "@/components/index.js";

// const API_HOSTNAME = "http://127.0.0.1:18686";
// const API_HOSTNAME = "https://remoteapi.weixin.qq.com";
const API_HOSTNAME = "http://100.78.198.69:2022";

const http_client = new Timeless.HttpClientCore({
  headers: { "Content-Type": "application/json" },
  hostname: API_HOSTNAME,
});
Timeless.web.provide_http_client(http_client);
const request = Timeless.kit.request_factory({
  headers: { "Content-Type": "application/json" },
  process(r) {
    if (r.error) {
      return Timeless.Result.Err(r.error);
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Timeless.Result.Err(msg, code, data);
    }
    return Timeless.Result.Ok(data);
  },
});

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
  const total = t.meta && t.meta.res ? t.meta.res.size : 0;
  const cur = t.progress ? t.progress.downloaded : 0;
  if (!total) return 0;
  return Math.min(100, Math.floor((cur * 100) / total));
}

function getTaskName(t) {
  if (t.meta && t.meta.opts && t.meta.opts.name) {
    return t.meta.opts.name;
  }
  if (t.meta && t.meta.res) {
    if (t.meta.res.name) return t.meta.res.name;
    if (t.meta.res.files && t.meta.res.files.length > 0)
      return t.meta.res.files[0].name;
  }
  return "unknown";
}

function DownloaderViewModel() {
  const ITEM_HEIGHT = 64;
  const GUTTER = 0;
  const PAGE_SIZE = 50;

  const taskListReq = new Timeless.kit.RequestCore(
    (params) => request.get("/api/task/list", params),
    {
      client: http_client,
      process(r) {
        if (r.error) return r.error;
        return Timeless.Result.Ok({
          list: (r.data.list || []).map((t) => methods.formatTask(t)),
          total: r.data.total || 0,
          page: r.data.page || 1,
          pageSize: r.data.page_size || PAGE_SIZE,
        });
      },
    },
  );
  const deleteReq = new Timeless.kit.RequestCore(
    (id) => request.post("/api/task/delete", { id }),
    { client: http_client },
  );
  const pauseReq = new Timeless.kit.RequestCore(
    (id) => request.post("/api/task/pause", { id }),
    { client: http_client },
  );
  const resumeReq = new Timeless.kit.RequestCore(
    (id) => request.post("/api/task/resume", { id }),
    { client: http_client },
  );
  const clearReq = new Timeless.kit.RequestCore(
    () => request.post("/api/task/clear"),
    { client: http_client },
  );

  const list$ = new Timeless.kit.ListCore(taskListReq, {
    pageSize: PAGE_SIZE,
  });

  const tasks_ = refarr([]);
  const task_count_ = ref(0);
  const running_count_ = computed(tasks_, (t) => {
    return t.filter((v) => v.status === "running").length;
  });

  const methods = {
    formatTask(task) {
      const isWin = /Windows|Win/i.test(navigator.userAgent || "");
      const sep = isWin ? "\\" : "/";
      return {
        height: ITEM_HEIGHT,
        ...task,
        ...(() => {
          if (!task.meta || !task.meta.opts) return {};
          const p = task.meta.opts.path || "";
          const n = task.meta.opts.name || "";
          if (!p || !n) return {};
          return {
            path: p,
            name: n,
            filepath: p.endsWith(sep) ? p + n : p + sep + n,
          };
        })(),
      };
    },
    async pauseTask(task) {
      const r = await pauseReq.run(task.id);
      if (r.error) return;
      list$.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "paused" } : t,
      );
      const matched = tasks_.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "paused" });
    },
    async resumeTask(task) {
      const r = await resumeReq.run(task.id);
      if (r.error) return;
      list$.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "running" } : t,
      );
      const matched = tasks_.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "running" });
    },
    async deleteTask(task) {
      const r = await deleteReq.run(task.id);
      if (r.error) return;
      const matched = tasks_.find((t) => t.id === task.id);
      if (!matched) return;
      tasks_.remove(matched);
      task_count_.as((prev) => prev - 1);
      ui.waterfall$.methods.deleteCell((t) => t.id === task.id);
      list$.deleteItem((t) => t.id === task.id);
    },
    async clearTasks() {
      await clearReq.run();
      list$.clear();
      tasks_.as([]);
      task_count_.as(0);
      ui.waterfall$.methods.cleanColumns();
    },
    connect() {
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost = new URL(API_HOSTNAME).host;
      const ws = new WebSocket(wsProtocol + "://" + wsHost + "/ws/downloader");
      ws.onmessage = (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.type === "batch_tasks") {
          const list = Array.isArray(msg.data) ? msg.data : [];
          methods.batchInsert(list.map((t) => methods.formatTask(t)));
          return;
        }
        if (msg.type === "event") {
          const data = msg && msg.data ? msg.data : null;
          if (!data || !data.Key) return;
          if (data.Key === "delete") return;
          const task = data.Task || data.task;
          if (!task) return;
          methods.upsert(methods.formatTask(task));
        }
      };
    },
    batchInsert(newTasks) {
      if (!newTasks || !newTasks.length) return;
      const toInsert = [];
      for (const t of newTasks) {
        if (!t || !t.id) continue;
        const matched = tasks_.find((v) => v.id === t.id);
        if (matched) {
          matched.assign(t);
        } else {
          toInsert.push(t);
        }
      }
      if (toInsert.length) {
        tasks_.unshift(...toInsert);
        task_count_.as((prev) => prev + toInsert.length);
        ui.waterfall$.methods.unshiftItems(toInsert);
        ui.scrollView$.addScrollTop(toInsert.length * (ITEM_HEIGHT + GUTTER));
      }
    },
    upsert(task) {
      if (!task || !task.id) return;
      const matched = tasks_.find((v) => v.id === task.id);
      if (!matched) {
        task_count_.as((prev) => prev + 1);
        tasks_.unshift(task);
        ui.waterfall$.methods.unshiftItems([task]);
        ui.scrollView$.addScrollTop(ITEM_HEIGHT + GUTTER);
        return;
      }
      matched.assign(task);
    },
  };

  list$.onDataSourceAdded((list) => {
    task_count_.as((prev) => prev + list.length);
    tasks_.push(...list);
    ui.waterfall$.methods.appendItems(list);
  });

  const ui = {
    scrollView$: new Timeless.ui.ScrollViewCore({
      onScroll(pos) {
        ui.waterfall$.methods.handleScroll({ scrollTop: pos.scrollTop });
      },
      async onReachBottom() {
        if (list$.response.loading) return;
        if (list$.response.noMore) {
          ui.scrollView$.finishLoadingMore();
          return;
        }
        await list$.loadMore();
        ui.scrollView$.finishLoadingMore();
      },
    }),
    waterfall$: Timeless.ui.WaterfallModel({
      column: 1,
      size: PAGE_SIZE,
      buffer: 10,
      gutter: GUTTER,
    }),
  };

  let _fakeId = 0;
  const fakeFileNames = [
    "project-archive.zip",
    "design-assets.psd",
    "video-tutorial.mp4",
    "database-backup.sql",
    "photo-gallery.jpg",
    "report-2024.pdf",
    "music-collection.mp3",
    "source-code.tar.gz",
  ];

  methods.fakeTask = function () {
    _fakeId++;
    const name = fakeFileNames[(_fakeId - 1) % fakeFileNames.length];
    const totalSize = Math.floor(Math.random() * 50000000) + 5000000;
    const speed = Math.floor(Math.random() * 2000000) + 500000;
    const id = "fake_" + _fakeId + "_" + Date.now();

    const task = {
      id,
      height: ITEM_HEIGHT,
      name,
      status: "running",
      meta: {
        res: { size: totalSize, files: [{ name }] },
        opts: { name, path: "/tmp/downloads" },
      },
      progress: { downloaded: 0, speed, uploaded: 0, uploadSpeed: 0 },
    };

    methods.upsert(task);

    let downloaded = 0;
    const timer = setInterval(() => {
      const matched = tasks_.find((t) => t.id === id);
      if (!matched) {
        clearInterval(timer);
        return;
      }
      const cur = matched.value || matched;
      if (cur.status === "paused") return;
      if (cur.status !== "running") {
        clearInterval(timer);
        return;
      }
      const curSpeed = speed + (Math.random() - 0.5) * speed * 0.4;
      downloaded += curSpeed * 0.3;
      if (downloaded >= totalSize) {
        downloaded = totalSize;
        matched.assign({
          status: "done",
          progress: { downloaded, speed: 0, uploaded: 0, uploadSpeed: 0 },
        });
        clearInterval(timer);
        return;
      }
      matched.assign({
        progress: {
          downloaded,
          speed: curSpeed,
          uploaded: 0,
          uploadSpeed: 0,
        },
      });
    }, 300);
  };

  let ready = false;
  return {
    ui,
    state: {
      tasks: tasks_,
      task_count: task_count_,
      running_count: running_count_,
    },
    methods,
    async ready() {
      if (ready) {
        return;
      }
      methods.connect();
      const r = await list$.init();
      if (r.error) {
        return;
      }
      const tasks = list$.response.dataSource;
      tasks_.as(tasks);
      task_count_.as(list$.response.total);
      console.log("before waterfall$.methods.appendItems", tasks);
      ui.waterfall$.methods.appendItems(tasks);
      ready = true;
    },
  };
}

/**
 * @param {{ task: any; vm$: any; }} props
 */
function DownloadTaskItem(props) {
  const task = props.task;
  const vm$ = props.vm$;

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
      const speed = formatSpeed(t.progress ? t.progress.speed : 0);
      statusText = `${speed} · ${pr}%`;
      statusClass = "text-blue-500";
    } else if (isCompleted) {
      const total = t.meta && t.meta.res ? t.meta.res.size : 0;
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

  const progressWidth_ = computed(state_, (s) => `width: ${s.pr}%;`);
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
            iconClass,
          ]),
        },
        [fileExt],
      ),
      // File info
      View({ class: "flex-1 min-w-0" }, [
        View(
          {
            class:
              "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
          },
          [computed(task, (t) => t.name || "unknown")],
        ),
        // Progress bar
        Show(
          {
            when: computed(state_, (s) => s.isRunning || s.isPaused),
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
      // Actions - returned as { node, bind }
      View({ class: "flex-shrink-0 flex items-center gap-1" }, [
        // Pause (when running)
        Show({ when: computed(state_, (s) => s.isRunning) }, [
          h(
            Button,
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
        // Resume (when paused or failed)
        Show({ when: computed(state_, (s) => s.canResume) }, [
          h(
            Button,
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
        // Completed label
        Show({ when: computed(state_, (s) => s.isCompleted) }, [
          View({ class: "text-xs text-emerald-500 font-medium px-2" }, [
            "Done",
          ]),
        ]),
        // Delete
        h(
          Button,
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

export default function DownloadTaskPageView() {
  const vm$ = DownloaderViewModel();
  const { task_count: task_count_ } = vm$.state;

  const view$ = new Timeless.ui.ScrollViewCore({});
  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View(
      {
        class: "space-y-8",
        onMounted() {
          vm$.ready();
        },
      },
      [
        Section("Download Task", [
          Item("Real API Download List", [
            View(
              {
                class: cn([
                  "w-[420px] rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden",
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
                        Txt(
                          computed(task_count_, (d) =>
                            d > 0 ? ` (${d})` : "",
                          ),
                        ),
                      ],
                    ),
                    View({ class: "flex items-center gap-1" }, [
                      Button(
                        {
                          store: new Timeless.ui.ButtonCore({
                            size: "sm",
                            variant: "outline",
                            onClick() {
                              vm$.methods.fakeTask();
                            },
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
                // List
                View({ class: "h-[400px]" }, [
                  ScrollView({ store: vm$.ui.scrollView$ }, [
                    Show(
                      {
                        when: computed(task_count_, (d) => d > 0),
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
                        Waterfall({
                          store: vm$.ui.waterfall$,
                          class: "!overflow-visible !h-auto",
                          render(task) {
                            return DownloadTaskItem({
                              task,
                              vm$,
                            });
                          },
                        }),
                      ],
                    ),
                  ]),
                ]),
              ],
            ),
          ]),
        ]),
      ],
    ),
  ]);
}
