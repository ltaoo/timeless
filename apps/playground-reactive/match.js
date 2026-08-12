/**
 * Match 完整示例。
 *
 * API 要点：
 * - when 可以是普通值或 Ref。
 * - cases 中与 when 相同的 key 优先渲染。
 * - 没有普通 case 命中时执行 cases.else，并将实际 when 值传给它。
 * - 没有 cases.else 时，仍可使用 fallback 兼容旧写法。
 * - 支持 onMounted、beforeUnmounted 和 onUnmounted 生命周期。
 */
(function () {
  const { ref, View, Button, Show, Match } = Timeless;

  // Model：集中维护示例的业务状态和状态变更行为。
  function create_match_examples_model() {
    const status_ = ref("loading");
    const step_ = ref(0);
    const response_ = ref("ok");
    const fallback_value_ = ref("missing");
    const role_ = ref("admin");
    const admin_page_ = ref("dashboard");
    const lifecycle_visible_ = ref(true);
    const lifecycle_log_ = ref("等待生命周期事件……");

    return {
      status_,
      step_,
      response_,
      fallback_value_,
      role_,
      admin_page_,
      lifecycle_visible_,
      lifecycle_log_,

      select_status(value) {
        status_.as(value);
      },
      select_step(value) {
        step_.as(value);
      },
      select_ok_response() {
        response_.as("ok");
      },
      select_teapot_response() {
        response_.as({ code: 418, message: "I'm a teapot" });
      },
      select_unavailable_response() {
        response_.as({ code: 503, message: "Unavailable" });
      },
      select_fallback_value(value) {
        fallback_value_.as(value);
      },
      select_role(value) {
        role_.as(value);
      },
      select_admin_page(value) {
        admin_page_.as(value);
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

  function format_when_value(value) {
    if (typeof value === "string") {
      return `"${value}"`;
    }
    if (value === undefined) {
      return "undefined";
    }
    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }

  function MatchExamplesView(model) {
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
            "Match 完整用法",
          ]),
          View({ style: { color: "var(--FG-1)" } }, [
            "普通 case 优先；未命中时进入 cases.else(value)。",
          ]),
        ]),

        ExampleSection(
          "1. 普通值与精确匹配",
          "when 也可以直接传非响应式值。普通 case 不需要接收参数。",
          [
            ResultBox([
              Match({
                when: "success",
                cases: {
                  loading: () => "正在加载",
                  success: () => "success case 已命中",
                  else: (value) => `未匹配：${value}`,
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "2. 响应式字符串与 else(value)",
          "点击 timeout 或 offline 时没有普通 case 命中，else 会收到对应的实际字符串。",
          [
            ButtonGroup([
              Button({ onClick: () => model.select_status("loading") }, [
                "loading",
              ]),
              Button({ onClick: () => model.select_status("success") }, [
                "success",
              ]),
              Button({ onClick: () => model.select_status("timeout") }, [
                "timeout",
              ]),
              Button({ onClick: () => model.select_status("offline") }, [
                "offline",
              ]),
            ]),
            ResultBox([
              Match({
                when: model.status_,
                cases: {
                  loading: () => "正在加载",
                  success: () => "加载成功",
                  else: (value) => `else 收到：${format_when_value(value)}`,
                },
                // cases.else 存在时，其优先级高于旧的 fallback。
                fallback: () => "这里不会执行",
              }),
            ]),
          ],
        ),

        ExampleSection(
          "3. 数字 case",
          "对象的数字 key 可匹配数字 when；其他数字进入 else，并保留 number 类型。",
          [
            ButtonGroup([
              Button({ onClick: () => model.select_step(0) }, ["0"]),
              Button({ onClick: () => model.select_step(1) }, ["1"]),
              Button({ onClick: () => model.select_step(2) }, ["2"]),
              Button({ onClick: () => model.select_step(99) }, ["99"]),
            ]),
            ResultBox([
              Match({
                when: model.step_,
                cases: {
                  0: () => "第 0 步：开始",
                  1: () => "第 1 步：处理中",
                  2: () => "第 2 步：完成",
                  else: (value) =>
                    `未知步骤 ${value}，参数类型为 ${typeof value}`,
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "4. else 接收原始对象",
          "未匹配值不只可以是字符串；else 收到的是实际 when 值本身。",
          [
            ButtonGroup([
              Button({ onClick: () => model.select_ok_response() }, [
                "匹配 ok",
              ]),
              Button(
                {
                  onClick: () => model.select_teapot_response(),
                },
                ["未匹配对象"],
              ),
              Button(
                {
                  onClick: () => model.select_unavailable_response(),
                },
                ["切换另一个对象"],
              ),
            ]),
            ResultBox([
              Match({
                when: model.response_,
                cases: {
                  ok: () => "响应正常",
                  else: (value) =>
                    View({}, [
                      `else 收到原始对象：${format_when_value(value)}`,
                    ]),
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "5. fallback 兼容写法",
          "没有定义 cases.else 时，未匹配值继续使用 fallback；fallback 不接收 when 参数。",
          [
            ButtonGroup([
              Button({ onClick: () => model.select_fallback_value("known") }, [
                "known",
              ]),
              Button(
                { onClick: () => model.select_fallback_value("missing") },
                ["missing"],
              ),
            ]),
            ResultBox([
              Match({
                when: model.fallback_value_,
                cases: {
                  known: () => "命中 known",
                },
                fallback: () => "旧 fallback：没有可用的匹配分支",
              }),
            ]),
          ],
        ),

        ExampleSection(
          "6. 嵌套 Match",
          "case 可以返回另一个 Match，用于表达分层状态。",
          [
            ButtonGroup([
              Button({ onClick: () => model.select_role("admin") }, ["admin"]),
              Button({ onClick: () => model.select_role("member") }, [
                "member",
              ]),
              Button({ onClick: () => model.select_role("visitor") }, [
                "visitor",
              ]),
              Button({ onClick: () => model.select_admin_page("dashboard") }, [
                "admin / dashboard",
              ]),
              Button({ onClick: () => model.select_admin_page("settings") }, [
                "admin / settings",
              ]),
              Button({ onClick: () => model.select_admin_page("audit") }, [
                "admin / audit",
              ]),
            ]),
            ResultBox([
              Match({
                when: model.role_,
                cases: {
                  admin: () =>
                    Match({
                      when: model.admin_page_,
                      cases: {
                        dashboard: () => "管理员 / 仪表盘",
                        settings: () => "管理员 / 设置",
                        else: (value) => `管理员 / 未知页面：${value}`,
                      },
                    }),
                  member: () => "普通成员页面",
                  else: (value) => `未知角色：${value}`,
                },
              }),
            ]),
          ],
        ),

        ExampleSection(
          "7. 生命周期",
          "用 Show 挂载或卸载 Match，可观察 Match 自身的生命周期回调。",
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
                ok: () =>
                  Match({
                    when: "ready",
                    cases: {
                      ready: () => "生命周期 Match 已挂载",
                      else: (value) => `未匹配：${value}`,
                    },
                    onMounted() {
                      model.record_lifecycle("onMounted");
                    },
                    beforeUnmounted() {
                      model.record_lifecycle("beforeUnmounted");
                    },
                    onUnmounted() {
                      model.record_lifecycle("onUnmounted");
                    },
                  }),
                else: () => "Match 当前已卸载",
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
      ],
    );
  }

  function mount_match_examples() {
    const $root = document.querySelector("#root");
    if (!$root) {
      console.error("[Match examples] Root element not found");
      return;
    }

    const model = create_match_examples_model();
    Timeless.DOM.render(MatchExamplesView(model), $root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount_match_examples);
  } else {
    mount_match_examples();
  }
})();
