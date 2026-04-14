/**
 * @param {ViewComponentProps} props
 */
export default function HomeChatPage(props) {
  const a2ui = Timeless.a2ui;

  // Register shadcn components for a2ui to use
  a2ui.registerComponents({
    Field,
    Input,
    Button,
    Select,
    Checkbox,
    Textarea,
    Separator,
  });

  // Reactive messages list
  const messages$ = refarr([
    {
      role: "assistant",
      content:
        "你好！我是 Timeless AI 助手。请描述你需要的表单，我会帮你生成。",
    },
  ]);

  // Current session
  let currentSession = null;

  // Preview area children - driven by refArray for incremental rendering
  const previewChildren$ = refarr([]);

  const scroll$ = new Timeless.ui.ScrollViewCore({});
  const input$ = new Timeless.ui.InputCore({ defaultValue: "" });

  /**
   * Simulate LLM streaming: emit ops with delays to mimic token-by-token generation.
   */
  function simulateLLMStream(userMessage) {
    // Cleanup previous session
    if (currentSession) {
      currentSession.destroy();
      previewChildren$.clear();
    }

    // Add user message
    messages$.push({ role: "user", content: userMessage });
    messages$.push({
      role: "assistant",
      content: "正在为你生成界面...",
    });

    const renderer = new a2ui.A2UIRenderer();
    const parser = new a2ui.A2UIStreamParser(renderer, {
      onDone() {
        // Replace the "generating" message
        const lastIdx = messages$.length - 1;
        messages$.set(lastIdx, {
          role: "assistant",
          content: "✅ 表单已生成！你可以在上方预览区填写并提交。",
        });
      },
    });

    currentSession = {
      renderer,
      destroy() {
        renderer.destroy();
      },
    };

    // Build the ops that the "LLM" would stream
    const ops = buildDemoOps(userMessage);

    // Stream ops with delays to simulate token-by-token generation
    let i = 0;
    function emitNext() {
      if (i >= ops.length) return;
      const op = ops[i];
      parser.applyOps([op]);

      // After root op, mount the element into preview
      if (op.op === "root") {
        previewChildren$.push(renderer.rootElement);
      }

      i++;
      if (i < ops.length) {
        const delay = op.op === "done" ? 100 : 200 + Math.random() * 300;
        setTimeout(emitNext, delay);
      }
    }
    emitNext();
  }

  /**
   * Build demo StreamOps based on user input.
   */
  function buildDemoOps(userMessage) {
    const msg = userMessage.toLowerCase();

    // Registration form
    if (msg.includes("注册") || msg.includes("register")) {
      return buildRegistrationFormOps();
    }
    // Feedback form
    if (msg.includes("反馈") || msg.includes("feedback")) {
      return buildFeedbackFormOps();
    }
    // Default: contact form
    return buildContactFormOps();
  }

  function buildContactFormOps() {
    return [
      {
        op: "root",
        node: {
          id: "root",
          type: "view",
          props: { class: "space-y-4 p-4" },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "title",
          type: "text",
          props: {
            class: "text-lg font-semibold",
            content: "联系我们",
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "name-field",
          type: "field",
          props: {
            label: "姓名",
            name: "name",
            required: true,
            rules: [{ required: true }],
            input: {
              type: "input",
              placeholder: "请输入您的姓名",
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "email-field",
          type: "field",
          props: {
            label: "邮箱",
            name: "email",
            required: true,
            rules: [{ required: true }],
            input: {
              type: "input",
              placeholder: "请输入您的邮箱",
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "subject-field",
          type: "field",
          props: {
            label: "主题",
            name: "subject",
            input: {
              type: "select",
              placeholder: "请选择主题",
              options: [
                { label: "技术咨询", value: "tech" },
                { label: "商务合作", value: "business" },
                { label: "其他", value: "other" },
              ],
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "message-field",
          type: "field",
          props: {
            label: "留言",
            name: "message",
            input: {
              type: "textarea",
              placeholder: "请输入您的留言内容",
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "sep1",
          type: "separator",
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "submit-btn",
          type: "button",
          props: { text: "提交", variant: "default" },
        },
      },
      { op: "done" },
    ];
  }

  function buildRegistrationFormOps() {
    return [
      {
        op: "root",
        node: {
          id: "root",
          type: "view",
          props: { class: "space-y-4 p-4" },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "title",
          type: "text",
          props: {
            class: "text-lg font-semibold",
            content: "用户注册",
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "username-field",
          type: "field",
          props: {
            label: "用户名",
            name: "username",
            required: true,
            rules: [{ required: true }],
            input: { type: "input", placeholder: "请输入用户名" },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "email-field",
          type: "field",
          props: {
            label: "邮箱",
            name: "email",
            required: true,
            rules: [{ required: true }],
            input: { type: "input", placeholder: "请输入邮箱" },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "row1",
          type: "row",
          props: { cols: 2 },
        },
      },
      {
        op: "append",
        parentId: "row1",
        node: {
          id: "password-col",
          type: "col",
          props: { span: 1 },
        },
      },
      {
        op: "append",
        parentId: "password-col",
        node: {
          id: "password-field",
          type: "field",
          props: {
            label: "密码",
            name: "password",
            required: true,
            rules: [{ required: true }],
            input: { type: "input", placeholder: "请输入密码" },
          },
        },
      },
      {
        op: "append",
        parentId: "row1",
        node: {
          id: "confirm-col",
          type: "col",
          props: { span: 1 },
        },
      },
      {
        op: "append",
        parentId: "confirm-col",
        node: {
          id: "confirm-field",
          type: "field",
          props: {
            label: "确认密码",
            name: "confirmPassword",
            required: true,
            rules: [{ required: true }],
            input: { type: "input", placeholder: "请再次输入密码" },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "role-field",
          type: "field",
          props: {
            label: "角色",
            name: "role",
            input: {
              type: "select",
              placeholder: "请选择角色",
              options: [
                { label: "开发者", value: "developer" },
                { label: "设计师", value: "designer" },
                { label: "产品经理", value: "pm" },
              ],
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "agree-field",
          type: "field",
          props: {
            label: "同意用户协议",
            name: "agree",
            input: { type: "checkbox", defaultValue: false },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: { id: "sep1", type: "separator" },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "submit-btn",
          type: "button",
          props: { text: "注册", variant: "default" },
        },
      },
      { op: "done" },
    ];
  }

  function buildFeedbackFormOps() {
    return [
      {
        op: "root",
        node: {
          id: "root",
          type: "view",
          props: { class: "space-y-4 p-4" },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "title",
          type: "text",
          props: {
            class: "text-lg font-semibold",
            content: "意见反馈",
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "desc",
          type: "text",
          props: {
            class: "text-sm text-muted-foreground",
            content: "请告诉我们您的使用体验和改进建议。",
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "type-field",
          type: "field",
          props: {
            label: "反馈类型",
            name: "type",
            input: {
              type: "select",
              placeholder: "请选择反馈类型",
              options: [
                { label: "Bug 报告", value: "bug" },
                { label: "功能建议", value: "feature" },
                { label: "使用体验", value: "ux" },
                { label: "其他", value: "other" },
              ],
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "content-field",
          type: "field",
          props: {
            label: "详细描述",
            name: "content",
            required: true,
            rules: [{ required: true }],
            input: {
              type: "textarea",
              placeholder: "请详细描述您的反馈...",
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "contact-field",
          type: "field",
          props: {
            label: "联系方式（可选）",
            name: "contact",
            help: "方便我们回复您",
            input: {
              type: "input",
              placeholder: "邮箱或手机号",
            },
          },
        },
      },
      {
        op: "append",
        parentId: "root",
        node: { id: "sep1", type: "separator" },
      },
      {
        op: "append",
        parentId: "root",
        node: {
          id: "submit-btn",
          type: "button",
          props: { text: "提交反馈", variant: "default" },
        },
      },
      { op: "done" },
    ];
  }

  // Handle send
  const send$ = new Timeless.ui.ButtonCore({
    onClick() {
      const text = input$.value;
      console.log(text);
      if (!text || !text.trim()) {
        return;
      }
      input$.clear();
      simulateLLMStream(text.trim());
    },
  });

  return View({ class: "flex h-full" }, [
    // Left: Preview area - AI generated UI renders here
    View(
      {
        class:
          "preview flex-1 overflow-auto border-r border-zinc-200 dark:border-zinc-700",
      },
      [
        Show({
          when: computed(previewChildren$, (items) => items.length > 0),
          ok() {
            return [
              View({ class: "max-w-lg mx-auto py-4" }, [
                For({
                  each: previewChildren$,
                  render(item) {
                    return item;
                  },
                }),
              ]),
            ];
          },
          else() {
            return [
              View(
                {
                  class:
                    "flex items-center justify-center h-full text-sm text-muted-foreground",
                },
                ["在右侧输入需求，AI 会在此区域生成界面"],
              ),
            ];
          },
        }),
      ],
    ),
    // Right: Chat area
    View(
      {
        class: "chat flex flex-col w-[380px] shrink-0",
      },
      [
        View(
          {
            class: "flex-1 overflow-hidden",
          },
          [
            ScrollView({ store: scroll$, class: "h-full p-3 space-y-3" }, [
              For({
                each: messages$,
                render(msg) {
                  const isUser = msg.role === "user";
                  return View(
                    {
                      class: classNames([
                        "flex",
                        isUser ? "justify-end" : "justify-start",
                      ]),
                    },
                    [
                      View(
                        {
                          class: classNames([
                            "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                            isUser
                              ? "bg-blue-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100",
                          ]),
                        },
                        [msg.content],
                      ),
                    ],
                  );
                },
              }),
            ]),
          ],
        ),
        View(
          {
            class: "border-t border-zinc-200 dark:border-zinc-700 p-3",
          },
          [
            View({ class: "text-xs text-muted-foreground mb-2" }, [
              '提示：输入"注册"生成注册表单，"反馈"生成反馈表单，其他内容生成联系表单',
            ]),
            View(
              {
                class: "flex gap-2",
              },
              [
                Input({ store: input$ }),
                Button(
                  {
                    store: send$,
                  },
                  ["发送"],
                ),
              ],
            ),
          ],
        ),
      ],
    ),
  ]);
}
