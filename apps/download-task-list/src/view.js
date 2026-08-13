/**
 * Timeless store-driven download task view.
 *
 * Business state remains in DownloadTaskListModel. This view directly consumes
 * model.state refs and only renders or calls model methods.
 */
(function define_download_task_list_view(global) {
  "use strict";

  const Txt = Timeless.Text;

  const ACTION_LABELS = {
    start: "开始",
    pause: "暂停",
    resume: "继续",
    retry: "重试",
    delete: "删除",
  };

  function task_action_variant(action) {
    if (action === "delete") return "destructive";
    if (action === "start" || action === "resume" || action === "retry") {
      return "default";
    }
    return "outline";
  }

  function TaskActionButton(props) {
    const { model, task, action } = props;
    const button$ = new Timeless.vm.ButtonCore({
      variant: task_action_variant(action),
      size: "sm",
      disabled: task.pending,
      onClick() {
        void model.perform_task_action(action, task.id);
      },
    });
    return Button(
      {
        class: "task-action-button",
        store: button$,
        attributes: {
          id: `task-${task.id}-${action}`,
          "data-task-action": action,
          "data-task-id": String(task.id),
        },
        onUnmounted() {
          button$.destroy();
        },
      },
      [Txt(ACTION_LABELS[action] || action)],
    );
  }

  function DownloadTaskCard(props) {
    const { model, task } = props;
    const actions = [...task.actions, "delete"];
    const detail = [task.speed_label, task.size_label]
      .filter(Boolean)
      .join(" · ");
    const progress_ = ref(task.progress);

    return Card(
      {
        as: "article",
        key: String(task.id),
        class: "task-card",
        attributes: {
          id: `download-task-${task.id}`,
          "data-task-id": String(task.id),
        },
        onUnmounted() {
          progress_.destroy();
        },
      },
      [
        Grid({ class: "task-heading" }, [
          View({ class: "file-mark", attributes: { "aria-hidden": "true" } }, [
            Txt("↓"),
          ]),
          View({ class: "task-title-wrap" }, [
            View(
              {
                as: "h2",
                class: "task-title",
                attributes: { title: task.name },
              },
              [Txt(task.name)],
            ),
            Flex({ items: "center", gap: 2, class: "task-meta" }, [
              Badge(
                {
                  variant:
                    task.status_tone === "error" ? "destructive" : "secondary",
                  class: `status status-${task.status_tone}`,
                },
                [Txt(task.status_label)],
              ),
              View({ as: "span" }, [Txt(detail)]),
            ]),
          ]),
          Flex({ items: "center", gap: 2, class: "task-actions" }, [
            For({
              each: actions,
              render(action) {
                return TaskActionButton({ model, task, action });
              },
            }),
          ]),
        ]),
        Grid({ class: "progress-row" }, [
          Progress({
            value: progress_,
            max: 100,
            class: "task-progress",
            attributes: {
              "aria-label": `下载进度 ${task.progress_label}`,
            },
          }),
          View({ as: "output", class: "progress-label" }, [
            Txt(task.progress_label),
          ]),
        ]),
        Show({
          when: Boolean(task.error),
          ok() {
            return [View({ as: "p", class: "task-error" }, [Txt(task.error)])];
          },
        }),
      ],
    );
  }

  function StatCard(props) {
    const { label, tone, value } = props;
    return Card({ as: "article", class: `stat-card stat-${tone}` }, [
      View({ as: "span", class: "stat-label" }, [Txt(label)]),
      View({ as: "strong", class: "stat-value" }, [Txt(value)]),
    ]);
  }

  class DownloadTaskListView {
    constructor(root, model) {
      this.root = root;
      this.model = model;
      this.destroyed = false;

      this.refresh_button$ = new Timeless.vm.ButtonCore({
        variant: "outline",
        size: "lg",
        onClick() {
          void model.reload_tasks("manual");
        },
      });
      this.reconnect_button$ = new Timeless.vm.ButtonCore({
        variant: "default",
        size: "lg",
        onClick() {
          void model.reconnect();
        },
      });

      const state = model.state;
      const derived_ = [];
      const derive = (source, selector) => {
        const value = computed(source, selector);
        derived_.push(value);
        return value;
      };
      const tasks_ = state.tasks;
      const empty_ = derive(tasks_, (tasks) => tasks.length === 0);
      const error_ = derive(state.error, (error) => error || "");
      const has_error_ = derive(state.error, Boolean);
      const connection_class_ = derive(
        state.connection,
        (connection) => `connection-card connection-${connection.status}`,
      );
      const connection_label_ = derive(
        state.connection,
        (connection) => connection.label,
      );
      const connection_detail_ = derive(
        state.connection,
        (connection) => connection.retry_label || connection.error || "",
      );
      const api_origin_ = derive(state.config, (config) => config.api_origin);
      const websocket_url_ = derive(
        state.config,
        (config) => config.websocket_url,
      );
      const empty_title_ = derive(state.loading, (loading) =>
        loading ? "正在读取任务" : "暂无下载任务",
      );
      const empty_description_ = derive(state.error, (error) =>
        error
          ? "服务暂时不可用，实时连接仍会继续重试。"
          : "新的下载任务会通过实时连接出现在这里。",
      );
      const updated_text_ = derive(state.last_updated_at, (last_updated_at) => {
        if (!last_updated_at) return "尚未同步";
        return new Date(last_updated_at).toLocaleTimeString("zh-CN", {
          hour12: false,
        });
      });
      const stat_values_ = {
        total: derive(state.stats, (stats) => stats.total),
        running: derive(state.stats, (stats) => stats.running),
        wait: derive(state.stats, (stats) => stats.wait),
        pause: derive(state.stats, (stats) => stats.pause),
        done: derive(state.stats, (stats) => stats.done),
        error: derive(state.stats, (stats) => stats.error),
      };

      const sync_loading = (loading) => {
        this.refresh_button$.setLoading(loading);
      };
      const sync_connection = (connection) => {
        if (connection.connecting) this.reconnect_button$.disable();
        else this.reconnect_button$.enable();
      };
      sync_loading(state.loading.value);
      sync_connection(state.connection.value);
      this.listeners_ = [
        state.loading.subscribe({ onChange: sync_loading }),
        state.connection.subscribe({ onChange: sync_connection }),
      ];

      const page = View(
        {
          class: "app-shell",
          onUnmounted: () => this.destroy(),
        },
        [
          Row(
            {
              class: "app-header",
              breakpoints: {
                xs: { direction: "column", align: "start", gap: 24 },
                md: {
                  direction: "row",
                  align: "end",
                  justify: "between",
                  gap: 32,
                },
              },
            },
            [
              View({}, [
                View({ as: "p", class: "eyebrow" }, [Txt("TIMELESS CHANNEL")]),
                View({ as: "h1", class: "page-title" }, [Txt("下载任务")]),
                View({ as: "p", class: "subtitle" }, [
                  Txt("WebSocket 实时更新 · 断线后每 5 秒自动重连"),
                ]),
              ]),
              Flex({ items: "center", gap: 3, class: "header-actions" }, [
                Button(
                  {
                    store: this.refresh_button$,
                    attributes: {
                      id: "refresh-tasks",
                      "data-action": "refresh",
                    },
                  },
                  [Txt("刷新任务")],
                ),
                Button(
                  {
                    store: this.reconnect_button$,
                    attributes: {
                      id: "reconnect-channel",
                      "data-action": "reconnect",
                    },
                  },
                  [Txt("立即重连")],
                ),
              ]),
            ],
          ),

          Card(
            {
              class: connection_class_,
              attributes: {
                id: "connection-status",
                "data-testid": "connection-status",
              },
            },
            [
              View(
                {
                  class: "connection-indicator",
                  attributes: { "aria-hidden": "true" },
                },
                [View({ as: "span", class: "connection-dot" })],
              ),
              View({ class: "connection-copy" }, [
                View({ as: "strong", class: "connection-title" }, [
                  Txt(connection_label_),
                ]),
                View({ as: "span", class: "connection-detail" }, [
                  Txt(connection_detail_),
                ]),
              ]),
              View({ as: "dl", class: "endpoint-list" }, [
                View({}, [
                  View({ as: "dt", class: "endpoint-label" }, [Txt("API")]),
                  View({ as: "dd", class: "endpoint-value" }, [
                    Txt(api_origin_),
                  ]),
                ]),
                View({}, [
                  View({ as: "dt", class: "endpoint-label" }, [
                    Txt("WebSocket"),
                  ]),
                  View({ as: "dd", class: "endpoint-value" }, [
                    Txt(websocket_url_),
                  ]),
                ]),
              ]),
            ],
          ),

          Show({
            when: has_error_,
            ok() {
              return [
                Alert({ variant: "destructive", class: "error-alert" }, [
                  AlertTitle({}, [Txt("任务服务暂时不可用")]),
                  AlertDescription({}, [Txt(error_)]),
                ]),
              ];
            },
          }),

          Grid(
            {
              cols: { xs: 2, sm: 3, lg: 6 },
              gap: 10,
              class: "stats-grid",
              attributes: { "aria-label": "任务统计" },
            },
            [
              StatCard({
                label: "全部",
                value: stat_values_.total,
                tone: "total",
              }),
              StatCard({
                label: "下载中",
                value: stat_values_.running,
                tone: "running",
              }),
              StatCard({
                label: "等待中",
                value: stat_values_.wait,
                tone: "waiting",
              }),
              StatCard({
                label: "已暂停",
                value: stat_values_.pause,
                tone: "paused",
              }),
              StatCard({
                label: "已完成",
                value: stat_values_.done,
                tone: "done",
              }),
              StatCard({
                label: "失败",
                value: stat_values_.error,
                tone: "error",
              }),
            ],
          ),

          View({ class: "list-section" }, [
            Row(
              {
                class: "section-heading",
                breakpoints: {
                  xs: { direction: "column", align: "start", gap: 8 },
                  sm: {
                    direction: "row",
                    align: "end",
                    justify: "between",
                    gap: 20,
                  },
                },
              },
              [
                View({}, [
                  View({ as: "p", class: "eyebrow" }, [Txt("TASK STREAM")]),
                  View({ as: "h2", class: "section-title" }, [Txt("最近任务")]),
                ]),
                View({ as: "span", class: "last-updated" }, [
                  Txt("最后同步："),
                  Txt(updated_text_),
                ]),
              ],
            ),
            Show({
              when: empty_,
              ok() {
                return [
                  Card({ as: "section", class: "empty-state" }, [
                    View(
                      {
                        class: "empty-icon",
                        attributes: { "aria-hidden": "true" },
                      },
                      [Txt("↓")],
                    ),
                    View({ as: "h2", class: "empty-title" }, [
                      Txt(empty_title_),
                    ]),
                    View({ as: "p", class: "empty-description" }, [
                      Txt(empty_description_),
                    ]),
                  ]),
                ];
              },
              else() {
                return [
                  View({ class: "task-list" }, [
                    For({
                      each: tasks_,
                      render(task) {
                        return DownloadTaskCard({ model, task });
                      },
                    }),
                  ]),
                ];
              },
            }),
          ]),
        ],
      );

      this.derived_ = derived_;
      root.replaceChildren();
      Timeless.DOM.render(page, root);
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      this.listeners_?.forEach((unlisten) => unlisten());
      this.derived_?.forEach((value) => value.destroy?.());
      this.refresh_button$.destroy();
      this.reconnect_button$.destroy();
    }
  }

  global.DownloadTaskListView = DownloadTaskListView;
})(window);
