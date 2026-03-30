import { request } from "@/biz/request.js";

const API_HOSTNAME = "http://100.78.198.69:2022";
const ITEM_HEIGHT = 64;
const GUTTER = 0;
const PAGE_SIZE = 50;

export const DownloadTaskViewModel = defineModel((props) => {
  const loading = ref(false);
  const tasks = refarr([]);
  const taskCount = ref(0);
  const runningCount = computed(
    tasks,
    (t) => t.filter((v) => v.status === "running").length,
  );

  function formatTask(task) {
    const isWin = /Windows|Win/i.test(navigator.userAgent || "");
    const sep = isWin ? "\\" : "/";
    return {
      height: ITEM_HEIGHT,
      ...task,
      ...(() => {
        if (!task.meta?.opts) return {};
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
  }

  const services = {
    list: new Timeless.kit.RequestCore(
      (params) => request.get("/api/task/list", params),
      {
        client: props.client,
        process(r) {
          if (r.error) return r.error;
          return Timeless.Result.Ok({
            list: (r.data.list || []).map(formatTask),
            total: r.data.total || 0,
            page: r.data.page || 1,
            pageSize: r.data.page_size || PAGE_SIZE,
          });
        },
      },
    ),
    delete: new Timeless.kit.RequestCore(
      (id) => props.request.post("/api/task/delete", { id }),
      { client: props.client },
    ),
    pause: new Timeless.kit.RequestCore(
      (id) => props.request.post("/api/task/pause", { id }),
      { client: props.client },
    ),
    resume: new Timeless.kit.RequestCore(
      (id) => props.request.post("/api/task/resume", { id }),
      { client: props.client },
    ),
    clear: new Timeless.kit.RequestCore(
      () => props.request.post("/api/task/clear"),
      { client: props.client },
    ),
  };

  const listCore = new Timeless.kit.ListCore(services.list, {
    pageSize: PAGE_SIZE,
  });

  const scrollView$ = new Timeless.ui.ScrollViewCore({
    onScroll(pos) {
      waterfall$.methods.handleScroll({ scrollTop: pos.scrollTop });
    },
    async onReachBottom() {
      if (listCore.response.loading) return;
      if (listCore.response.noMore) {
        scrollView$.finishLoadingMore();
        return;
      }
      await listCore.loadMore();
      scrollView$.finishLoadingMore();
    },
  });

  const waterfall$ = Timeless.ui.WaterfallModel({
    column: 1,
    size: PAGE_SIZE,
    buffer: 10,
    gutter: GUTTER,
  });

  const state = {
    loading,
    tasks,
    taskCount,
    runningCount,
  };
  const ui = {
    scrollView$,
    waterfall$,
  };

  const methods = {
    async pauseTask(task) {
      const r = await services.pause.run(task.id);
      if (r.error) return;
      listCore.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "paused" } : t,
      );
      const matched = tasks.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "paused" });
    },

    async resumeTask(task) {
      const r = await services.resume.run(task.id);
      if (r.error) return;
      listCore.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "running" } : t,
      );
      const matched = tasks.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "running" });
    },

    async deleteTask(task) {
      const r = await services.delete.run(task.id);
      if (r.error) return;
      tasks.remove((t) => t.id === task.id);
      taskCount.as((prev) => prev - 1);
      listCore.deleteItem((t) => t.id === task.id);
    },

    async clearTasks() {
      await services.clear.run();
      listCore.clear();
      tasks.as([]);
      taskCount.as(0);
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
          methods.batchInsert(list.map(formatTask));
          return;
        }
        if (msg.type === "event") {
          const data = msg?.data;
          if (!data?.Key) return;
          if (data.Key === "delete") return;
          const task = data.Task || data.task;
          if (!task) return;
          methods.upsert(formatTask(task));
        }
      };
    },

    batchInsert(newTasks) {
      if (!newTasks?.length) return;
      const toInsert = [];
      for (const t of newTasks) {
        if (!t?.id) continue;
        const matched = tasks.find((v) => v.id === t.id);
        if (matched) {
          matched.assign(t);
        } else {
          toInsert.push(t);
        }
      }
      if (toInsert.length) {
        tasks.unshift(...toInsert);
        taskCount.as((prev) => prev + toInsert.length);
      }
    },

    upsert(task) {
      if (!task?.id) return;
      const matched = tasks.find((v) => v.id === task.id);
      if (!matched) {
        taskCount.as((prev) => prev + 1);
        tasks.unshift(task);
        return;
      }
      matched.assign(task);
    },

    async init() {
      methods.connect();
      const r = await listCore.init();
      if (r.error) return;
      const taskList = listCore.response.dataSource;
      tasks.as(taskList);
      taskCount.as(listCore.response.total);
    },
  };

  return { state, methods, ui, services };
});
