import { TaskPageViewModel } from "./task.model.js";

const OpenIconSVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
  <circle cx="8" cy="8" r="7" fill="var(--GREEN)"/>
</svg>`;

const ClosedIconSVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" fill="var(--PURPLE)"/>
</svg>`;

export function TaskPageView(props) {
  const vm$ = TaskPageViewModel(props);

  const taskList = ref(vm$.state.task.dataSource);
  const hasTask = computed({ taskList }, (draft) => {
    return !draft.taskList.value || draft.taskList.value.length === 0;
  });

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const ts = Number(timestamp);
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return "刚刚";
  }

  function getStatusIcon(status) {
    return status === "closed" ? ClosedIconSVG : OpenIconSVG;
  }

  return View({ class: "flex flex-col h-full" }, [
    View(
      {
        class:
          "flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700",
      },
      [
        Head2(
          { class: "text-lg font-semibold text-gray-900 dark:text-white m-0" },
          [Txt("任务列表")],
        ),
        View({ class: "flex gap-2" }, [
          Button(
            {
              class:
                "px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
            },
            [Txt("筛选")],
          ),
          Button(
            {
              class:
                "px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors",
            },
            [Txt("新建任务")],
          ),
        ]),
      ],
    ),
    View(
      {
        class:
          "flex gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
      },
      [
        View(
          {
            class:
              "text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white",
          },
          [Txt("待处理 0")],
        ),
        View(
          {
            class:
              "text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white",
          },
          [Txt("进行中 0")],
        ),
        View(
          {
            class:
              "text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white",
          },
          [Txt("已完成 0")],
        ),
      ],
    ),
    View({ class: "flex-1 overflow-auto" }, [
      View(
        {
          class:
            "flex items-center px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
        },
        [
          View({ class: "w-8 h-4" }, []),
          View({ class: "flex-1 min-w-0" }, [Txt("标题")]),
          View({ class: "w-20" }, [Txt("状态")]),
          View({ class: "w-32" }, [Txt("标签")]),
          View({ class: "w-24" }, [Txt("指派给")]),
          View({ class: "w-32" }, [Txt("更新时间")]),
        ],
      ),
      For({
        each: taskList,
        render(task) {
          return View(
            {
              class:
                "flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
            },
            [
              View(
                {
                  class:
                    "w-8 h-4 border border-gray-300 dark:border-gray-600 rounded cursor-pointer",
                },
                [],
              ),
              View({ class: "flex-1 min-w-0 pr-4" }, [
                View({ class: "flex items-center gap-2 flex-wrap" }, [
                  DangerouslyInnerHTML(getStatusIcon(task.status)),
                  View(
                    {
                      class:
                        "text-sm text-gray-500 dark:text-gray-400 font-mono",
                    },
                    [Txt(`#${task.issue_number}`)],
                  ),
                  View(
                    {
                      class:
                        "text-sm font-medium text-gray-900 dark:text-white truncate",
                    },
                    [Txt(task.title)],
                  ),
                ]),
                View({ class: "flex items-center gap-2 mt-1.5 flex-wrap" }, [
                  View({ class: "flex gap-1 flex-wrap" }, [
                    For({
                      each: task.labels || [],
                      render(label) {
                        return View(
                          {
                            class:
                              "inline-flex items-center px-2 py-0.5 text-xs rounded-full",
                            style: `background-color: ${label.color || "#6b7280"}; color: #fff;`,
                          },
                          [Txt(label.name)],
                        );
                      },
                    }),
                  ]),
                  View({ class: "text-xs text-gray-500 dark:text-gray-400" }, [
                    Txt(
                      `${task.assignee?.name || "未指派"} 发起于 ${formatTime(task.created_at)}`,
                    ),
                  ]),
                ]),
              ]),
              View({ class: "w-20" }, [
                View(
                  {
                    class:
                      "inline-flex items-center px-2 py-0.5 text-xs rounded-full",
                    style: `background-color: ${task.status === "closed" ? "#f3e8ff" : "#dcfce7"}; color: ${task.status === "closed" ? "#7e22ce" : "#15803d"};`,
                  },
                  [Txt(task.status === "closed" ? "已关闭" : "开放")],
                ),
              ]),
              View({ class: "w-32" }, [
                View({ class: "flex items-center gap-2" }, [
                  View(
                    {
                      class:
                        "w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium",
                    },
                    [Txt(task.assignee?.name?.[0] || "?")],
                  ),
                  View(
                    {
                      class:
                        "text-sm text-gray-700 dark:text-gray-300 truncate",
                    },
                    [Txt(task.assignee?.name || "未指派")],
                  ),
                ]),
              ]),
              View({ class: "w-32 text-sm text-gray-500 dark:text-gray-400" }, [
                Txt(formatTime(task.updated_at || task.created_at)),
              ]),
            ],
          );
        },
      }),
      Show({
        when: hasTask,
        children: [
          View(
            {
              class:
                "flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400",
            },
            [
              View({ class: "text-4xl mb-3" }, [Txt("📋")]),
              View({ class: "text-base mb-4" }, [Txt("暂无任务")]),
              Button(
                {
                  class:
                    "px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors",
                },
                [Txt("创建第一个任务")],
              ),
            ],
          ),
        ],
      }),
    ]),
  ]);
}
