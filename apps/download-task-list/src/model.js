/**
 * Download task domain model.
 *
 * All connection state, task data, protocol handling, and actions live here.
 * Every public state field is a Timeless reactive value consumed by the view.
 */
(function define_download_task_list_model(global) {
  "use strict";
  const socket_client = new Timeless.kit.SocketClientCore();
  const http_client = new Timeless.kit.HttpClientCore({
    hostname: config.api_origin,
    headers: { "Content-Type": "application/json" },
  });
  Timeless.web.provide_socket_client(socket_client);
  Timeless.web.provide_http_client(http_client);

  const DEFAULT_API_ORIGIN = "http://127.0.0.1:2022";
  const DEFAULT_RECONNECT_INTERVAL = 5000;
  const PAGE_SIZE = 100;

  const STATUS_META = {
    ready: { label: "准备中", tone: "waiting" },
    wait: { label: "等待中", tone: "waiting" },
    running: { label: "下载中", tone: "running" },
    pause: { label: "已暂停", tone: "paused" },
    done: { label: "已完成", tone: "done" },
    error: { label: "失败", tone: "error" },
  };

  function normalize_origin(value) {
    return String(value || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
  }

  function websocket_url_from_origin(origin) {
    const url = new URL(origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws/v1/download_task";
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  function resolve_config(location) {
    const query = new URLSearchParams(location.search);
    const api_origin = normalize_origin(
      query.get("api") || global.DOWNLOAD_TASK_API_ORIGIN,
    );
    const websocket_url =
      query.get("ws") ||
      global.DOWNLOAD_TASK_WEBSOCKET_URL ||
      websocket_url_from_origin(api_origin);
    return {
      api_origin,
      websocket_url,
      reconnect_interval: DEFAULT_RECONNECT_INTERVAL,
    };
  }

  function normalize_status(status) {
    const value = String(status ?? "")
      .trim()
      .toLowerCase();
    if (value === "0" || value === "waiting") return "wait";
    if (value === "1" || value === "preparing") return "wait";
    if (value === "2" || value === "downloading") return "running";
    if (value === "3" || value === "paused") return "pause";
    if (value === "4" || value === "merging") return "running";
    if (value === "5" || value === "finished") return "done";
    if (value === "6" || value === "failed") return "error";
    if (value === "7" || value === "cancelled" || value === "canceled") {
      return "error";
    }
    if (value === "pending" || value === "queued") return "wait";
    if (value === "completed" || value === "success") return "done";
    if (value === "errored" || value === "failure" || value === "fail") {
      return "error";
    }
    return value || "wait";
  }

  function task_name(task) {
    if (task && task.name) return String(task.name);
    if (task?.meta?.opts?.name) return String(task.meta.opts.name);
    if (task?.meta?.res?.name) return String(task.meta.res.name);
    if (task?.meta?.res?.files?.[0]?.name) {
      return String(task.meta.res.files[0].name);
    }
    return `任务 ${task?.id ?? ""}`.trim();
  }

  function task_progress(task) {
    const direct = Number(task?.progress);
    if (Number.isFinite(direct)) {
      return Math.min(100, Math.max(0, direct));
    }
    const detail =
      task?.progress && typeof task.progress === "object" ? task.progress : {};
    const total = Number(task?.size || detail.total || detail.size || 0);
    const downloaded = Number(task?.downloaded || detail.downloaded || 0);
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, (downloaded * 100) / total));
  }

  function task_speed(task) {
    const detail =
      task?.progress && typeof task.progress === "object" ? task.progress : {};
    return Math.max(0, Number(task?.speed || detail.speed || 0));
  }

  function task_size(task) {
    const detail =
      task?.progress && typeof task.progress === "object" ? task.progress : {};
    return Math.max(
      0,
      Number(task?.size || task?.meta?.res?.size || detail.size || 0),
    );
  }

  function task_downloaded(task) {
    const detail =
      task?.progress && typeof task.progress === "object" ? task.progress : {};
    return Math.max(0, Number(task?.downloaded || detail.downloaded || 0));
  }

  function format_bytes(bytes) {
    const value = Math.max(0, Number(bytes) || 0);
    if (value === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const exponent = Math.min(
      Math.floor(Math.log(value) / Math.log(1024)),
      units.length - 1,
    );
    const precision = exponent === 0 ? 0 : 1;
    return `${(value / 1024 ** exponent).toFixed(precision)} ${units[exponent]}`;
  }

  function format_speed(bytes_per_second) {
    return `${format_bytes(bytes_per_second)}/s`;
  }

  function empty_stats() {
    return {
      total: 0,
      running: 0,
      pause: 0,
      wait: 0,
      done: 0,
      error: 0,
    };
  }

  function normalize_stats(stats, fallback_total) {
    const source = stats || {};
    const result = empty_stats();
    Object.entries(source).forEach(([status, count]) => {
      if (status === "total") return;
      const normalized = normalize_status(status);
      const key = normalized === "ready" ? "wait" : normalized;
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] += Number(count) || 0;
      }
    });
    result.total = Number(
      source.total ??
        fallback_total ??
        result.running +
          result.pause +
          result.wait +
          result.done +
          result.error,
    );
    return result;
  }

  function merge_file_updates(files, updates) {
    if (!Array.isArray(updates)) return files;
    const existing = Array.isArray(files) ? files : [];
    const update_by_id = new Map(
      updates.map((file) => [String(file.id), file]),
    );
    const merged = existing.map((file) => {
      const update = update_by_id.get(String(file.id));
      if (!update) return file;
      update_by_id.delete(String(file.id));
      return { ...file, ...update };
    });
    update_by_id.forEach((file) => merged.push(file));
    return merged;
  }

  function merge_task_update(task, update) {
    const merged = { ...task, ...update };
    if (Object.prototype.hasOwnProperty.call(update || {}, "files")) {
      merged.files = merge_file_updates(task?.files, update.files);
    }
    return merged;
  }

  function connection_label(status) {
    const labels = {
      idle: "尚未连接",
      connecting: "连接中",
      connected: "实时连接正常",
      reconnecting: "正在等待重连",
      closing: "正在断开",
      closed: "连接已关闭",
      failed: "连接失败",
    };
    return labels[status] || status;
  }

  function task_actions(status) {
    if (status === "running") return ["pause"];
    if (status === "pause") return ["resume"];
    if (status === "error") return ["retry"];
    if (status === "wait" || status === "ready") return ["start"];
    return [];
  }

  function format_tasks(tasks, pending_task_ids) {
    const pending_ids = new Set(pending_task_ids.map(String));
    return tasks.map((task) => {
      const status = normalize_status(task.status);
      const progress = task_progress(task);
      const speed = task_speed(task);
      const size = task_size(task);
      const downloaded = task_downloaded(task);
      const meta = STATUS_META[status] || {
        label: status,
        tone: "waiting",
      };
      return {
        id: task.id,
        name: task_name(task),
        status,
        status_label: meta.label,
        status_tone: meta.tone,
        progress,
        progress_label: `${progress.toFixed(1)}%`,
        speed_label: status === "running" ? format_speed(speed) : "",
        size_label:
          size > 0
            ? `${format_bytes(downloaded)} / ${format_bytes(size)}`
            : "大小未知",
        error: String(task.error || task._errMsg || ""),
        pending: pending_ids.has(String(task.id)),
        actions: task_actions(status),
      };
    });
  }

  function format_connection(connection) {
    return {
      ...connection,
      label: connection_label(connection.status),
      retry_label: connection.next_reconnect_at
        ? `${Math.max(
            0,
            Math.ceil((connection.next_reconnect_at - Date.now()) / 1000),
          )} 秒后重试`
        : "",
    };
  }

  class DownloadTaskListModel {
    constructor(config) {
      this.config = config;
      this.started = false;
      this.destroyed = false;
      this.loading_promise = null;

      const source_tasks_ = refarr([]);
      const pending_task_ids_ = refarr([]);
      const connection_source_ = refobj({
        status: "idle",
        connected: false,
        connecting: false,
        reconnect_attempt: 0,
        next_reconnect_at: null,
        error: null,
      });
      const tasks_ = derive(
        {
          tasks: source_tasks_,
          pending_task_ids: pending_task_ids_,
        },
        (state) => format_tasks(state.tasks, state.pending_task_ids),
      );
      const connection_ = computed(connection_source_, format_connection);

      this.source_tasks_ = source_tasks_;
      this.connection_source_ = connection_source_;
      this.state = {
        config: refobj({ ...config }),
        tasks: tasks_,
        stats: refobj(empty_stats()),
        loading: ref(false),
        error: ref(null),
        pending_task_ids: pending_task_ids_,
        last_updated_at: ref(null),
        connection: connection_,
      };
      this.reactive_sources_ = [
        this.state.config,
        source_tasks_,
        this.state.stats,
        this.state.loading,
        this.state.error,
        pending_task_ids_,
        this.state.last_updated_at,
        connection_source_,
      ];
      this.derived_state_ = [tasks_, connection_];
      this.request = Timeless.kit.request_factory({
        headers: { "Content-Type": "application/json" },
        process(response) {
          if (response.error) return Timeless.Result.Err(response.error);
          const payload = response.data;
          if (!payload || payload.code !== 0) {
            return Timeless.Result.Err(
              payload?.msg || "服务返回了无法识别的数据",
              payload?.code,
              payload?.data,
            );
          }
          return Timeless.Result.Ok(payload.data);
        },
      });
      this.list_request = new Timeless.kit.RequestCore(
        (params) => this.request.get("/api/v1/download_task/list", params),
        { client: http_client },
      );

      this.channel = new Timeless.kit.ChannelCore(config.websocket_url, {
        client: socket_client,
        reconnect: { interval: config.reconnect_interval },
      });
      this.channel.onMessage((message) => this.handle_socket_message(message));
      this.channel.onStateChange((channel_state) => {
        connection_source_.as({
          status: channel_state.status,
          connected: channel_state.connected,
          connecting: channel_state.connecting,
          reconnect_attempt: channel_state.reconnectAttempt,
          next_reconnect_at: channel_state.nextReconnectAt,
          error: channel_state.error?.message || null,
        });
      });
      this.channel.onConnected(() => {
        if (this.state.last_updated_at.value === null) {
          void this.reload_tasks("connected-without-history");
        }
      });
      this.channel.onReconnected(() => {
        void this.reload_tasks("reconnected");
      });
    }

    static resolve_config(location) {
      return resolve_config(location);
    }

    subscribe(listener) {
      let active = true;
      let scheduled = false;
      const notify = () => {
        if (!active || scheduled) return;
        scheduled = true;
        queueMicrotask(() => {
          scheduled = false;
          if (active) listener(this.get_snapshot());
        });
      };
      const unlisteners = Object.values(this.state).map((source) =>
        source.subscribe({ onChange: notify }),
      );
      listener(this.get_snapshot());
      return () => {
        active = false;
        unlisteners.forEach((unlisten) => unlisten());
      };
    }

    get_snapshot() {
      return {
        config: { ...this.state.config.value },
        tasks: this.state.tasks.value,
        stats: { ...this.state.stats.value },
        loading: this.state.loading.value,
        error: this.state.error.value,
        last_updated_at: this.state.last_updated_at.value,
        connection: this.state.connection.value,
      };
    }

    async start() {
      if (this.started) return;
      this.started = true;
      await Promise.allSettled([
        this.reload_tasks("initial"),
        this.channel.connect(),
      ]);
    }

    async reload_tasks(reason = "manual") {
      if (this.loading_promise) return this.loading_promise;
      const task = this.run_reload_tasks(reason);
      this.loading_promise = task;
      try {
        return await task;
      } finally {
        if (this.loading_promise === task) this.loading_promise = null;
      }
    }

    async run_reload_tasks(reason) {
      this.state.loading.as(true);
      this.state.error.as(null);
      const result = await this.list_request.run({
        page: 1,
        page_size: PAGE_SIZE,
      });
      this.state.loading.as(false);
      if (result.error) {
        this.state.error.as(result.error.message);
        return result;
      }
      const data = result.data || {};
      this.source_tasks_.as(Array.isArray(data.list) ? data.list : []);
      this.state.stats.as(normalize_stats(data.stats, data.total));
      this.state.last_updated_at.as(Date.now());
      this.state.error.as(null);
      console.log(`[download-task-list] tasks reloaded: ${reason}`);
      return result;
    }

    reconnect() {
      return this.channel.reconnect();
    }

    async perform_task_action(action, task_id) {
      const endpoints = {
        start: "/api/v1/download_task/start",
        pause: "/api/v1/download_task/pause",
        resume: "/api/v1/download_task/resume",
        retry: "/api/v1/download_task/retry",
        delete: "/api/v1/download_task/delete",
      };
      const endpoint = endpoints[action];
      if (!endpoint) return Timeless.Result.Err(`未知操作: ${action}`);
      const key = String(task_id);
      if (this.state.pending_task_ids.value.map(String).includes(key)) {
        return Timeless.Result.Err("任务正在处理中");
      }
      this.state.pending_task_ids.push(task_id);
      const body = { task_ids: [Number(task_id)] };
      if (action === "delete") body.delete_files = false;
      const action_request = new Timeless.kit.RequestCore(
        () => this.request.post(endpoint, body),
        { client: http_client },
      );
      const result = await action_request.run();
      this.state.pending_task_ids.removeBy((id) => String(id) === key);
      if (result.error) {
        this.state.error.as(result.error.message);
        return result;
      }
      if (action === "delete") this.remove_tasks([task_id]);
      await this.reload_tasks(`action:${action}`);
      return result;
    }

    handle_socket_message(message) {
      if (!message || typeof message !== "object") return;
      if (message.type === "task_stats") {
        if (message.stats) {
          this.state.stats.as(normalize_stats(message.stats));
        }
        return;
      }
      if (message.type === "task_create") {
        this.upsert_tasks(message.tasks, { prepend: true });
        return;
      }
      if (message.type === "task_upsert") {
        this.upsert_tasks(message.tasks, { existing_only: true });
        return;
      }
      if (message.type === "task_update") {
        this.patch_tasks(message.updates);
        return;
      }
      if (message.type === "task_delete") {
        this.remove_tasks(message.task_ids);
        return;
      }

      // Transitional messages retained by the reference implementation.
      if (message.type === "batch_tasks") {
        this.upsert_tasks(Array.isArray(message.data) ? message.data : []);
        return;
      }
      if (message.type === "task_snapshot" && message.task_id) {
        const resources = Array.isArray(message.resources)
          ? message.resources
          : [];
        const progress = resources.reduce(
          (result, resource) => ({
            downloaded: result.downloaded + Number(resource.downloaded || 0),
            size: result.size + Number(resource.size || 0),
            speed: result.speed + Number(resource.speed || 0),
          }),
          { downloaded: 0, size: 0, speed: 0 },
        );
        this.upsert_tasks([
          {
            id: message.task_id,
            status: message.status,
            name: message.name,
            resources,
            progress,
          },
        ]);
        return;
      }
      if (message.type === "event" && message.data) {
        if (message.data.status_counts) {
          this.state.stats.as(normalize_stats(message.data.status_counts));
        }
        const event_key = message.data.Key || message.data.key || "";
        if (event_key === "delete") {
          return;
        }
        const task = message.data.Task || message.data.task;
        const error = message.data.Err || message.data.err || "";
        if (task && error && event_key === "error") task.error = error;
        if (task && event_key === "start") task.error = "";
        if (task) {
          this.upsert_tasks([task], {
            prepend: event_key === "create" || !event_key,
          });
        }
      }
    }

    upsert_tasks(tasks, options = {}) {
      if (!Array.isArray(tasks) || tasks.length === 0) return;
      const current = [...this.source_tasks_.value];
      tasks.forEach((task) => {
        if (!task || task.id === undefined || task.id === null) return;
        const index = current.findIndex(
          (item) => String(item.id) === String(task.id),
        );
        if (index >= 0) current[index] = { ...current[index], ...task };
        else if (options.existing_only) return;
        else if (options.prepend) current.unshift(task);
        else current.push(task);
      });
      this.source_tasks_.as(current);
      this.state.stats.assign({
        total: Math.max(this.state.stats.value.total, current.length),
      });
      this.state.last_updated_at.as(Date.now());
    }

    patch_tasks(updates) {
      if (!Array.isArray(updates) || updates.length === 0) return;
      const update_by_id = new Map(
        updates
          .filter((update) => update && update.id !== undefined)
          .map((update) => [String(update.id), update]),
      );
      let changed = false;
      const next_tasks = this.source_tasks_.value.map((task) => {
        const update = update_by_id.get(String(task.id));
        if (!update) return task;
        changed = true;
        return merge_task_update(task, update);
      });
      if (!changed) return;
      this.source_tasks_.as(next_tasks);
      this.state.last_updated_at.as(Date.now());
    }

    remove_tasks(task_ids) {
      if (!Array.isArray(task_ids) || task_ids.length === 0) return;
      const removed = new Set(task_ids.map(String));
      const previous_length = this.source_tasks_.value.length;
      const next_tasks = this.source_tasks_.value.filter(
        (task) => !removed.has(String(task.id)),
      );
      const removed_count = previous_length - next_tasks.length;
      this.source_tasks_.as(next_tasks);
      this.state.stats.assign({
        total: Math.max(0, this.state.stats.value.total - removed_count),
      });
      this.state.last_updated_at.as(Date.now());
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.channel.destroy();
      this.derived_state_.forEach((state) => state.destroy());
      this.reactive_sources_.forEach((state) => state.destroy());
    }
  }

  global.DownloadTaskListModel = DownloadTaskListModel;
})(window);
