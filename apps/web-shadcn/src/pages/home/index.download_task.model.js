export const API_HOSTNAME = "http://100.78.198.69:2022";
const client = new Timeless.HttpClientCore({
  hostname: API_HOSTNAME,
});
Timeless.web.provide_http_client(client);
const request = Timeless.request_factory({
  hostnames: {
    dev: API_HOSTNAME,
    prod: API_HOSTNAME,
  },
  headers: { "Content-Type": "application/json" },
  process(r) {
    if (r.error) {
      return r;
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Timeless.Result.Err(msg || "Unknown error");
    }
    return Timeless.Result.Ok(data);
  },
});

// const client = new Timeless
const ITEM_HEIGHT = 64;
const GUTTER = 0;
const PAGE_SIZE = 50;

export function DownloadTaskViewModel(props) {
  const loading_ = ref(false);
  const tasks_ = refarr([]);
  const taskCount_ = ref(0);
  const runningCount_ = computed(
    tasks_,
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
    list: new Timeless.RequestCore(
      (params) => request.get("/api/task/list", params),
      {
        client,
        process(r) {
          if (r.error) return r;
          const {
            list = [],
            total = 0,
            page = 1,
            page_size = PAGE_SIZE,
          } = r.data;
          return Timeless.Result.Ok({
            list: list.map(formatTask),
            total: total,
            page: page,
            pageSize: page_size,
          });
        },
      },
    ),
    delete: new Timeless.RequestCore(
      (id) => request.post("/api/task/delete", { id }),
      { client },
    ),
    pause: new Timeless.RequestCore(
      (id) => request.post("/api/task/pause", { id }),
      { client },
    ),
    resume: new Timeless.RequestCore(
      (id) => request.post("/api/task/resume", { id }),
      { client },
    ),
    clear: new Timeless.RequestCore(() => request.post("/api/task/clear"), {
      client,
    }),
  };

  const list$ = new Timeless.ListCore(services.list, {
    pageSize: PAGE_SIZE,
  });

  const view_page$ = new Timeless.vm.ScrollViewCore({});
  const view_downloadtask$ = new Timeless.vm.ScrollViewCore({
    onScroll(pos) {
      // console.log(pos);
      waterfall$.methods.handleScroll({ scrollTop: pos.scrollTop });
    },
    async onReachBottom() {
      if (list$.response.loading || list$.response.noMore) {
        return;
      }
      await list$.loadMore();
      view_downloadtask$.finishLoadingMore();
    },
  });

  const waterfall$ = Timeless.vm.WaterfallModel({
    column: 1,
    size: PAGE_SIZE,
    buffer: 10,
    gutter: GUTTER,
  });

  const state = {
    loading: loading_,
    tasks: tasks_,
    taskCount: taskCount_,
    runningCount: runningCount_,
  };
  const ui = {
    view_page$,
    view_downloadtask$,
    waterfall$,
  };

  const methods = {
    async pauseTask(task) {
      const r = await services.pause.run(task.id);
      if (r.error) return;
      list$.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "paused" } : t,
      );
      const matched = tasks_.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "paused" });
    },

    async resumeTask(task) {
      const r = await services.resume.run(task.id);
      if (r.error) return;
      list$.modifyItem((t) =>
        t.id === task.id ? { ...t, status: "running" } : t,
      );
      const matched = tasks_.find((t) => t.id === task.id);
      if (matched) matched.assign({ status: "running" });
    },

    async deleteTask(task) {
      const r = await services.delete.run(task.id);
      if (r.error) return;
      tasks_.remove((t) => t.id === task.id);
      taskCount_.as((prev) => prev - 1);
      list$.deleteItem((t) => t.id === task.id);
    },

    async clearTasks() {
      await services.clear.run();
      list$.clear();
      tasks_.as([]);
      taskCount_.as(0);
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
        const matched = tasks_.find((v) => v.id === t.id);
        if (matched) {
          matched.assign(t);
        } else {
          toInsert.push(t);
        }
      }
      if (toInsert.length) {
        tasks_.unshift(...toInsert);
        taskCount_.as((prev) => prev + toInsert.length);
      }
    },

    upsert(task) {
      if (!task?.id) return;
      const matched = tasks_.find((v) => v.id === task.id);
      if (!matched) {
        taskCount_.as((prev) => prev + 1);
        tasks_.unshift(task);
        return;
      }
      matched.assign(task);
    },

    async init() {
      methods.connect();
      const r = await list$.init();
      if (r.error) return;
      const tasks = list$.response.dataSource || [];
      tasks_.as([]);
      tasks_.push(...tasks);
      taskCount_.as(list$.response.total);
      ui.waterfall$.methods.cleanColumns();
      ui.waterfall$.methods.appendItems(tasks);
    },
  };
  const handlers = {
    handleClickTask() {},
  };
  const listeners = [
    list$.onDataSourceAdded((tasks) => {
      tasks_.push(...tasks);
      ui.waterfall$.methods.appendItems(tasks);
    }),
  ];

  return defineModel({
    state,
    methods,
    ui,
    services,
    listeners,
  });
}
