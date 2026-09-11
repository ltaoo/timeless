/**
 * Show 完整示例。
 *
 * API 要点：
 * - when 可以是普通 boolean、Ref<boolean> 或 DerivedRef<boolean>。
 * - when 为 true 时执行 ok；为 false 时执行 else（如果提供）。
 * - ok 和 else 可以返回单个节点、节点数组、文本或 undefined。
 * - 条件变化时，旧分支会被卸载，新分支会被创建并挂载。
 * - 支持 onMounted、beforeUnmounted 和 onUnmounted 生命周期。
 */
(function () {
  const { ref, refarr, computed, View, Button, For, Show, Fragment } = Timeless;

  function create_breadcrumb_picker_model() {
    const all_paths = [
      { id: "disk", name: "Macintosh HD" },
      { id: "users", name: "Users" },
      { id: "mayfair", name: "mayfair" },
      { id: "documents", name: "Documents" },
      { id: "timeless", name: "timeless" },
    ];
    const paths = refarr([...all_paths]);
    const current_path_ = computed(paths, (items) => {
      return `/${items.map((item) => item.name).join("/")}`;
    });
    const separator_count_ = computed(paths, (items) => {
      return Math.max(0, items.length - 1);
    });

    function random_path_name() {
      return Math.random().toString(36).slice(2, 8);
    }

    return {
      state: {
        paths,
        current_path_,
        separator_count_,
      },
      path_options: all_paths,

      select_path(path_index) {
        paths.as(all_paths.slice(0, path_index + 1));
      },
      restore_full_path() {
        paths.as([...all_paths]);
      },
      randomize_last_path() {
        paths.as((current_paths) => {
          if (current_paths.length === 0) {
            return current_paths;
          }

          const last_index = current_paths.length - 1;
          return current_paths.map((path, index) => {
            if (index !== last_index) {
              return path;
            }
            return {
              ...path,
              name: random_path_name(),
            };
          });
        });
      },
    };
  }

  // Model：集中维护示例的业务状态、派生状态和状态变更行为。
  function create_show_examples_model() {
    const visible_ = ref(true);
    const mode_enabled_ = ref(true);
    const count_ = ref(0);
    const count_ready_ = computed(count_, (count) => count >= 3);
    const list_visible_ = ref(true);
    const parent_visible_ = ref(true);
    const child_visible_ = ref(true);
    const lifecycle_visible_ = ref(true);
    const lifecycle_log_ = ref("等待生命周期事件……");
    const picker = create_breadcrumb_picker_model();

    return {
      visible_,
      mode_enabled_,
      count_,
      count_ready_,
      list_visible_,
      parent_visible_,
      child_visible_,
      lifecycle_visible_,
      lifecycle_log_,
      picker,

      toggle_visible() {
        visible_.as((visible) => !visible);
      },
      enable_mode() {
        mode_enabled_.as(true);
      },
      disable_mode() {
        mode_enabled_.as(false);
      },
      increment_count() {
        count_.as((count) => count + 1);
      },
      decrement_count() {
        count_.as((count) => count - 1);
      },
      reset_count() {
        count_.as(0);
      },
      toggle_list() {
        list_visible_.as((visible) => !visible);
      },
      toggle_parent() {
        parent_visible_.as((visible) => !visible);
      },
      toggle_child() {
        child_visible_.as((visible) => !visible);
      },
      toggle_lifecycle_example() {
        lifecycle_visible_.as((visible) => !visible);
      },
      clear_lifecycle_log() {
        lifecycle_log_.as("");
      },
      record_lifecycle(event_name) {
        lifecycle_log_.as((current) => {
          return current ? `${current}\n${event_name}` : event_name;
        });
      },
    };
  }

  // View helpers：只负责样式、渲染，以及把交互转发给 Model。
  function ExampleSection(title, description, children) {
    return View(
      {
        style: {
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
          padding: "16px",
          border: "1px solid var(--border)",
          "border-radius": "10px",
          background: "var(--BG-0)",
        },
      },
      [
        View({ style: { "font-size": "18px", "font-weight": "600" } }, [title]),
        View({ style: { color: "var(--FG-1)", "font-size": "14px" } }, [
          description,
        ]),
        ...children,
      ],
    );
  }

  function ButtonGroup(children) {
    return View(
      {
        style: {
          display: "flex",
          "flex-wrap": "wrap",
          gap: "8px",
        },
      },
      children,
    );
  }

  function ResultBox(children) {
    return View(
      {
        style: {
          padding: "12px",
          "border-radius": "8px",
          background: "var(--BG-1)",
          "font-family": "ui-monospace, SFMono-Regular, Menlo, monospace",
        },
      },
      children,
    );
  }

  function StatusLine(label, value) {
    return View(
      {
        style: {
          display: "flex",
          gap: "8px",
          "align-items": "center",
          color: "var(--FG-1)",
          "font-size": "13px",
        },
      },
      [View({ style: { "font-weight": "600" } }, [label]), value],
    );
  }

  // For 的 index 是 DerivedRef<number>；创建当前项时读取它的数值。
  function file_picker_index_value(index) {
    if (typeof index === "number") {
      return index;
    }
    if (index && typeof index.value === "number") {
      return index.value;
    }
    return 0;
  }

  function BreadcrumbExampleView(picker) {
    return View(
      {
        style: {
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
        },
      },
      [
        ButtonGroup([
          ...picker.path_options.map((path, index) => {
            return Button(
              {
                onClick() {
                  picker.select_path(index);
                },
              },
              [`切换到第 ${index + 1} 个 path（${path.name}）`],
            );
          }),
          Button(
            {
              onClick() {
                picker.restore_full_path();
              },
            },
            ["恢复完整路径"],
          ),
          Button(
            {
              onClick() {
                picker.randomize_last_path();
              },
            },
            ["随机修改最后一个 path"],
          ),
        ]),
        ResultBox([
          View(
            {
              class: "wx-file-picker-dialog__breadcrumbs",
              attributes: {
                "aria-label": "文件路径面包屑",
              },
            },
            [
              For({
                each: picker.state.paths,
                render(path, index) {
                  const pathIndex = file_picker_index_value(index);
                  return View({ class: "flex" }, [
                    Show({
                      when: pathIndex > 0,
                      ok() {
                        return View(
                          { class: "wx-file-picker-dialog__path-separator" },
                          ["/"],
                        );
                      },
                    }),
                    View(
                      {
                        class: "wx-file-picker-dialog__path-part",
                        attributes: {
                          role: "button",
                          tabindex: "0",
                          "data-path-index": String(pathIndex),
                        },
                        onClick() {
                          picker.select_path(pathIndex);
                        },
                      },
                      [path.name],
                    ),
                  ]);
                },
              }),
            ],
          ),
          StatusLine("当前路径：", picker.state.current_path_),
          StatusLine("预期分隔符数量：", picker.state.separator_count_),
        ]),
      ],
    );
  }

  function ShowExamplesView(model) {
    return View(
      {
        style: {
          display: "flex",
          "flex-direction": "column",
          gap: "16px",
          width: "min(920px, calc(100vw - 32px))",
          margin: "24px auto",
          color: "var(--foreground)",
        },
      },
      [
        View({}, [
          View({ style: { "font-size": "28px", "font-weight": "700" } }, [
            "Show 完整用法",
          ]),
          View({ style: { color: "var(--FG-1)" } }, [
            "条件为真时渲染 ok；条件为假时渲染 else，或保持为空。",
          ]),
        ]),

        ExampleSection(
          "1. 普通 boolean",
          "when 可以直接传普通布尔值；没有 else 的 false 分支不会产生可见内容。",
          [
            ResultBox([
              View({}, ["when: true → "]),
              Show({
                when: true,
                ok: () => "ok 已渲染",
              }),
            ]),
            ResultBox([
              View({}, ["when: false（未提供 else）→ 下方为空"]),
              Show({
                when: false,
                ok: () => "这里不会渲染",
              }),
            ]),
          ],
        ),

        ExampleSection(
          "2. 响应式 Ref",
          "Show 会订阅 Ref；点击按钮会挂载或卸载 ok 分支。",
          [
            ButtonGroup([
              Button({ onClick: () => model.toggle_visible() }, [
                "切换显示 / 隐藏",
              ]),
            ]),
            ResultBox([
              Show({
                when: model.visible_,
                ok() {
                  return View({}, ["响应式内容当前可见"]);
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "3. ok 与 else",
          "提供 else 后，条件变化时两个分支会互相替换。",
          [
            ButtonGroup([
              Button({ onClick: () => model.enable_mode() }, ["启用"]),
              Button({ onClick: () => model.disable_mode() }, ["禁用"]),
            ]),
            ResultBox([
              Show({
                when: model.mode_enabled_,
                ok() {
                  return View({}, ["ok：功能已启用"]);
                },
                else() {
                  return View({}, ["else：功能已禁用"]);
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "4. DerivedRef 条件",
          "computed 可以产生 Show 使用的派生条件；count >= 3 时切换到 ok。",
          [
            ButtonGroup([
              Button({ onClick: () => model.decrement_count() }, ["-1"]),
              Button({ onClick: () => model.increment_count() }, ["+1"]),
              Button({ onClick: () => model.reset_count() }, ["重置"]),
            ]),
            StatusLine("count：", model.count_),
            ResultBox([
              Show({
                when: model.count_ready_,
                ok: () => "ok：count 已达到 3",
                else: () => "else：count 还小于 3",
              }),
            ]),
          ],
        ),

        ExampleSection(
          "5. 返回多个子节点",
          "ok 和 else 都可以返回数组；数组中的文本和 View 会按顺序渲染。",
          [
            ButtonGroup([
              Button({ onClick: () => model.toggle_list() }, ["切换分支"]),
            ]),
            ResultBox([
              Show({
                when: model.list_visible_,
                ok() {
                  return [
                    View({}, ["第一项"]),
                    View({}, ["第二项"]),
                    "数组中的文本节点",
                  ];
                },
                else() {
                  return [View({}, ["列表当前隐藏"]), undefined];
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "6. 嵌套 Show",
          "外层控制整个区域，内层独立控制子内容。",
          [
            ButtonGroup([
              Button({ onClick: () => model.toggle_parent() }, ["切换外层"]),
              Button({ onClick: () => model.toggle_child() }, ["切换内层"]),
            ]),
            ResultBox([
              Show({
                when: model.parent_visible_,
                ok() {
                  return [
                    View({}, ["外层已显示"]),
                    Show({
                      when: model.child_visible_,
                      ok: () => View({}, ["内层 ok：子内容已显示"]),
                      else: () => View({}, ["内层 else：子内容已隐藏"]),
                    }),
                  ];
                },
                else() {
                  return View({}, ["外层 else：整个区域已隐藏"]);
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "7. 生命周期",
          "外层 Show 挂载或卸载内层 Show，可观察内层的三个生命周期回调。",
          [
            ButtonGroup([
              Button({ onClick: () => model.toggle_lifecycle_example() }, [
                "挂载 / 卸载",
              ]),
              Button({ onClick: () => model.clear_lifecycle_log() }, [
                "清空日志",
              ]),
            ]),
            ResultBox([
              Show({
                when: model.lifecycle_visible_,
                ok() {
                  return Show({
                    when: true,
                    ok: () => "生命周期 Show 已挂载",
                    onMounted() {
                      model.record_lifecycle("onMounted");
                    },
                    beforeUnmounted() {
                      model.record_lifecycle("beforeUnmounted");
                    },
                    onUnmounted() {
                      model.record_lifecycle("onUnmounted");
                    },
                  });
                },
                else: () => "生命周期 Show 当前已卸载",
              }),
            ]),
            View(
              {
                style: {
                  padding: "12px",
                  "white-space": "pre-wrap",
                  "font-size": "13px",
                  color: "var(--FG-1)",
                },
              },
              [model.lifecycle_log_],
            ),
          ],
        ),

        ExampleSection(
          "8. For + Show：文件路径面包屑",
          "每个非首项前用 Show 渲染“/”。点击面包屑会回到该层，也可以直接切换到第 n 个 path。",
          [BreadcrumbExampleView(model.picker)],
        ),

        ExampleSection(
          "9. Fragment + Show + For：Memo 列表搜索",
          "Fragment 嵌套 Show 与 For，实现前端搜索过滤。输入关键词实时过滤标题、内容和标签。",
          [MemoListExampleView()],
        ),
      ],
    );
  }

  function MemoListExampleView() {
    const { Input } = Timeless;

    const MOCK_MEMOS = [
      {
        id: 1,
        title: "项目周会纪要",
        content: "讨论了 Q3 产品路线图和技术债务清理计划",
        tag: "工作",
      },
      {
        id: 2,
        title: "读书笔记：深入理解计算机系统",
        content: "第三章 程序的机器级表示，汇编与反汇编",
        tag: "学习",
      },
      {
        id: 3,
        title: "健身计划",
        content: "每周三次力量训练，两次有氧运动",
        tag: "生活",
      },
      {
        id: 4,
        title: "React 性能优化",
        content: "useMemo、useCallback、React.memo 的正确使用场景",
        tag: "技术",
      },
      {
        id: 5,
        title: "旅行清单：京都",
        content: "岚山竹林、伏见稻荷、金阁寺、鸭川散步",
        tag: "生活",
      },
      {
        id: 6,
        title: "API 设计规范",
        content: "RESTful 命名约定、版本控制、错误码统一格式",
        tag: "技术",
      },
      {
        id: 7,
        title: "周末菜谱",
        content: "番茄牛腩、清蒸鲈鱼、蒜蓉西兰花",
        tag: "生活",
      },
      {
        id: 8,
        title: "面试准备",
        content: "算法复习：二叉树遍历、动态规划、图的最短路径",
        tag: "工作",
      },
      {
        id: 9,
        title: "Timeless 框架学习",
        content: "响应式原语 ref/computed、虚拟节点 Show/For/Fragment",
        tag: "技术",
      },
      {
        id: 10,
        title: "年度目标回顾",
        content: "已完成 6/10 个目标，需要加速推进剩余项目",
        tag: "工作",
      },
    ];

    const loading_ = ref(false);
    const filtered_arr_ = refarr(MOCK_MEMOS);
    const empty_ = ref(false);
    const count_ = ref(`${MOCK_MEMOS.length} / ${MOCK_MEMOS.length}`);
    const has_more_ = ref(true);

    // simulate async search with ~2s delay
    function search_memos(kw) {
      return new Promise((resolve) => {
        setTimeout(() => {
          let results;
          if (!kw || !kw.trim()) {
            results = MOCK_MEMOS;
          } else {
            const lower = kw.toLowerCase();
            results = MOCK_MEMOS.filter(
              (m) =>
                m.title.toLowerCase().includes(lower) ||
                m.content.toLowerCase().includes(lower) ||
                m.tag.toLowerCase().includes(lower),
            );
          }
          resolve(results);
        }, 2000);
      });
    }

    // debounced search triggered from onInput
    let debounce_timer = null;
    let search_id = 0;
    function on_keyword_change(kw) {
      if (debounce_timer) clearTimeout(debounce_timer);
      loading_.as(true);
      debounce_timer = setTimeout(() => {
        const id = ++search_id;
        search_memos(kw).then((results) => {
          if (id !== search_id) return;
          filtered_arr_.as(results);
          empty_.as(results.length === 0);
          count_.as(`${results.length} / ${MOCK_MEMOS.length}`);
          loading_.as(false);
        });
      }, 300);
    }

    function MemoItem(memo) {
      return View(
        {
          style: {
            display: "flex",
            "flex-direction": "column",
            gap: "4px",
            padding: "10px 12px",
            "border-radius": "8px",
            background: "var(--BG-0)",
            border: "1px solid var(--FG-5)",
          },
        },
        [
          View(
            {
              style: {
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
              },
            },
            [
              View({ style: { "font-weight": "600", "font-size": "14px" } }, [
                memo.title,
              ]),
              View(
                {
                  style: {
                    "font-size": "11px",
                    padding: "2px 8px",
                    "border-radius": "9999px",
                    background: "var(--BG-1)",
                    color: "var(--FG-1)",
                  },
                },
                [memo.tag],
              ),
            ],
          ),
          View(
            {
              style: {
                "font-size": "13px",
                color: "var(--FG-1)",
                "line-height": "1.5",
              },
            },
            [memo.content],
          ),
        ],
      );
    }

    return View(
      {
        style: {
          display: "flex",
          "flex-direction": "column",
          gap: "12px",
        },
      },
      [
        View(
          {
            style: {
              display: "flex",
              gap: "8px",
              "align-items": "center",
            },
          },
          [
            Input({
              placeholder: "搜索 memo（标题、内容或标签）…",
              style: {
                flex: "1",
                padding: "8px 12px",
                "border-radius": "8px",
                border: "1px solid var(--FG-3)",
                background: "var(--BG-1)",
                color: "var(--foreground)",
                "font-size": "14px",
                outline: "none",
              },
              onInput(e) {
                on_keyword_change(e.target.value);
              },
            }),
            View(
              {
                style: {
                  "font-size": "13px",
                  color: "var(--FG-1)",
                  "white-space": "nowrap",
                },
              },
              [count_],
            ),
          ],
        ),
        ResultBox([
          Fragment({}, [
            Show({
              when: empty_,
              ok() {
                return View(
                  {
                    style: {
                      padding: "24px",
                      "text-align": "center",
                      color: "var(--FG-1)",
                      "font-size": "14px",
                    },
                  },
                  ["没有匹配的 memo"],
                );
              },
              else() {
                return Fragment({}, [
                  For({
                    each: filtered_arr_,
                    render(memo) {
                      return MemoItem(memo);
                    },
                  }),
                ]);
              },
            }),
            Show({
              when: has_more_,
              ok() {
                return View(
                  {
                    style: {
                      padding: "16px 24px",
                      "text-align": "center",
                      color: "var(--FG-1)",
                      "font-size": "14px",
                      cursor: "pointer",
                    },
                    onClick() {
                      on_keyword_change("");
                    },
                  },
                  [
                    computed(loading_, (t) => {
                      return t ? "正在加载..." : "加载更多";
                    }),
                  ],
                );
              },
            }),
          ]),
        ]),
      ],
    );
  }

  function mount_show_examples() {
    const $root = document.querySelector("#root");
    if (!$root) {
      console.error("[Show examples] Root element not found");
      return;
    }

    const model = create_show_examples_model();
    Timeless.DOM.render(ShowExamplesView(model), $root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount_show_examples);
  } else {
    mount_show_examples();
  }
})();
