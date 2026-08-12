/**
 * @param {ViewComponentProps} props
 */
export default function HomeChatPage(props) {
  // ── Conversation list ────────────────────────────────────────────────────
  const conversations$ = refarr([
    {
      id: "default",
      title: "新对话",
      preview: "你好！有什么我可以帮你的？",
      date: "今天",
    },
  ]);
  const activeId$ = ref("default");

  // ── Per-conversation messages ────────────────────────────────────────────
  /** @type {Record<string, {id:string,role:string,content:string,streaming?:boolean}[]>} */
  const convMessages = {
    default: [
      {
        id: "m0",
        role: "assistant",
        content: "你好！我是 AI 助手，有什么可以帮你的？",
        streaming: false,
      },
      {
        id: "m1",
        role: "user",
        content: "你好！我想了解一下 Timeless 框架的特点。",
        streaming: false,
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Timeless 是一个跨平台 UI 框架，核心理念是将状态逻辑与渲染平台彻底分离。\n\n主要特点包括：\n\n1. **响应式系统**：基于 `ref`、`refarr`、`computed` 的细粒度响应式，只更新真正变化的 DOM 节点。\n2. **平台无关**：同一套 primitive 层代码，可以在 DOM、Native 等不同宿主上运行。\n3. **HMR 支持**：支持热更新，开发体验流畅。\n4. **组件丰富**：内置 Button、Input、Dialog、Table 等常用组件，基于 shadcn 风格。",
        streaming: false,
      },
      {
        id: "m3",
        role: "user",
        content: "响应式系统具体是怎么工作的？",
        streaming: false,
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Timeless 的响应式系统分三种原语：\n\n- `ref(value)` — 存储单个值，通过 `.value` 读取，`.as(newValue)` 写入\n- `refarr(array)` — 响应式数组，支持 `push`、`splice`、`as`、`get`、`set` 等方法\n- `computed(dep, fn)` — 派生值，自动追踪依赖，依赖变化时重新计算\n\n当你把 `ref` 或 `computed` 传给组件的 `class`、`style` 等属性时，框架会订阅变化并精准更新对应的 DOM 属性，不会触发整个组件重渲染。",
        streaming: false,
      },
      {
        id: "m5",
        role: "user",
        content: "能给一个 computed 的使用示例吗？",
        streaming: false,
      },
      {
        id: "m6",
        role: "assistant",
        content:
          "当然，这是一个典型示例：\n\n```js\nconst count$ = ref(0);\nconst doubled$ = computed(count$, (n) => n * 2);\n\n// 读取派生值\nconsole.log(doubled$.value); // 0\n\n// 更新源\ncount$.as(5);\nconsole.log(doubled$.value); // 10\n```\n\n在视图中直接使用：\n\n```js\nView(\n  { class: computed(isActive$, (active) =>\n    active ? 'text-blue-500' : 'text-zinc-400'\n  )},\n  ['Hello']\n)\n```\n\n框架会自动在 `isActive$` 变化时更新这个节点的 class，其他节点不受影响。",
        streaming: false,
      },
      {
        id: "m7",
        role: "user",
        content: "refarr 和普通数组有什么区别？",
        streaming: false,
      },
      {
        id: "m8",
        role: "assistant",
        content:
          "普通 JS 数组的变更无法被框架感知，而 `refarr` 是代理过的响应式数组，任何变更都会通知框架进行最小化 DOM 更新。\n\n主要 API 对比：\n\n| 操作 | 原生数组 | refarr |\n|------|---------|--------|\n| 读取 | `arr[i]` | `arr$.get(i)` |\n| 修改 | `arr[i] = v` | `arr$.set(i, v)` |\n| 追加 | `arr.push(v)` | `arr$.push(v)` |\n| 删除 | `arr.splice(i,1)` | `arr$.splice(i,1)` |\n| 替换 | `arr = newArr` | `arr$.as(newArr)` |\n| 长度 | `arr.length` | `arr$.length` |\n| 转数组 | — | `arr$.toArray()` |\n\n框架对 `For` 组件配合 `refarr` 做了 diff 优化，插入/删除只操作对应 DOM 节点，不会重建整个列表。",
        streaming: false,
      },
    ],
  };

  /** Messages for the active conversation */
  const messages$ = refarr(convMessages["default"]);

  let _msgId = 8;
  function nextId() {
    return String(++_msgId);
  }

  // ── Scroll ───────────────────────────────────────────────────────────────
  const scroll$ = new Timeless.vm.ScrollViewCore({});

  function scrollToBottom() {
    setTimeout(() => scroll$.setScrollTop(scroll$.getScrollHeight()), 30);
  }

  // ── Input ────────────────────────────────────────────────────────────────
  const textarea$ = new Timeless.vm.InputCore({
    defaultValue: "",
    placeholder: "发消息给 AI 助手… (Enter 发送，Shift+Enter 换行)",
  });
  const send$ = new Timeless.vm.ButtonCore({
    size: "icon",
    onClick() {
      sendMessage();
    },
  });
  const sending$ = ref(false);

  /** Files selected for upload */
  const attachments$ = refarr([]);

  // ── Switch conversation ──────────────────────────────────────────────────
  function switchConv(id) {
    activeId$.as(id);
    if (!convMessages[id]) convMessages[id] = [];
    messages$.as(convMessages[id]);
    scrollToBottom();
  }

  // ── Create new conversation ──────────────────────────────────────────────
  function newConv() {
    const id = "conv-" + Date.now();
    const conv = { id, title: "新对话", preview: "...", date: "今天" };
    convMessages[id] = [];
    conversations$.push(conv);
    switchConv(id);
    attachments$.clear();
  }

  // ── Send message ─────────────────────────────────────────────────────────
  function sendMessage() {
    const text = (textarea$.value || "").trim();
    const hasFiles = attachments$.length > 0;
    if ((!text && !hasFiles) || sending$.value) return;

    sending$.as(true);
    send$.setLoading(true);
    textarea$.clear();

    // User message
    const userMsg = {
      id: nextId(),
      role: "user",
      content: text || "(附件)",
      files: attachments$.toArray().map((f) => f.name),
      streaming: false,
    };
    messages$.push(userMsg);
    attachments$.clear();

    // Update conversation preview & title
    const convIdx = conversations$.findIndex((c) => c.id === activeId$.value);
    if (convIdx !== -1) {
      const conv = conversations$.get(convIdx);
      const updated = {
        ...conv,
        preview: text.slice(0, 40) || "(附件)",
        title:
          conv.title === "新对话"
            ? text.slice(0, 20) || "附件对话"
            : conv.title,
      };
      conversations$.set(convIdx, updated);
    }
    scrollToBottom();

    // AI streaming reply
    const assistantMsg = {
      id: nextId(),
      role: "assistant",
      content: "",
      streaming: true,
    };
    messages$.push(assistantMsg);
    const assistantIdx = messages$.length - 1;
    scrollToBottom();

    streamReply(text, assistantIdx);
  }

  // ── Simulate streaming ───────────────────────────────────────────────────
  function streamReply(userText, targetIdx) {
    const responses = buildReply(userText);
    let charIdx = 0;
    let full = "";

    const tick = setInterval(() => {
      if (charIdx >= responses.length) {
        clearInterval(tick);
        const msg = messages$.get(targetIdx);
        messages$.set(targetIdx, { ...msg, content: full, streaming: false });
        sending$.as(false);
        send$.setLoading(false);

        // persist
        const id = activeId$.value;
        if (convMessages[id]) {
          convMessages[id] = messages$.toArray();
        }
        return;
      }
      const chunk = responses.slice(charIdx, charIdx + 3);
      full += chunk;
      charIdx += 3;
      const msg = messages$.get(targetIdx);
      messages$.set(targetIdx, { ...msg, content: full, streaming: true });
      scrollToBottom();
    }, 30);
  }

  function buildReply(text) {
    if (!text) return "好的，我已收到你的附件，请问有什么需要帮忙分析的？";
    const t = text.toLowerCase();
    if (t.includes("你好") || t.includes("hello") || t.includes("hi")) {
      return "你好！我是 AI 助手，随时准备为你服务。你可以问我任何问题，或者让我帮你完成各种任务，比如写作、分析、编程等。";
    }
    if (t.includes("代码") || t.includes("code") || t.includes("编程")) {
      return "当然！请告诉我你需要什么语言或功能，我会为你生成清晰、可运行的代码示例，并附上说明。";
    }
    if (t.includes("翻译")) {
      return "我可以帮你进行多语言翻译，支持中文、英文、日文、法文、德文等主流语言。请告诉我要翻译的内容和目标语言。";
    }
    if (t.includes("总结") || t.includes("摘要")) {
      return "请将需要总结的文本发给我，我会为你提取关键信息，生成简洁清晰的摘要。";
    }
    return `我理解你的问题：「${text.slice(0, 30)}${text.length > 30 ? "..." : ""}」。让我来为你详细解答。这是一个很有趣的话题，涉及多个方面需要考虑。首先，我们可以从基本概念入手，然后逐步深入分析具体细节，最后给出实用的建议和方案。`;
  }

  // ── Key handler: Enter to send, Shift+Enter for newline ──────────────────
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Sidebar conversation item ────────────────────────────────────────────
  function ConvItem(conv) {
    const isActive$ = computed(activeId$, (id) => id === conv.id);
    return View(
      {
        class: classNames([
          "group relative flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
          computed(isActive$, (active) => {
            return active
              ? "bg-zinc-100 dark:bg-zinc-800"
              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50";
          }),
        ]),
        onClick() {
          switchConv(conv.id);
        },
      },
      [
        View(
          {
            class:
              "text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate pr-4",
          },
          [conv.title],
        ),
        View({ class: "text-xs text-zinc-400 dark:text-zinc-500 truncate" }, [
          conv.preview,
        ]),
      ],
    );
  }

  // ── Message bubble ───────────────────────────────────────────────────────
  function MessageBubble(msg) {
    const isUser = msg.role === "user";
    return Flex(
      {
        justify: isUser ? "end" : "start",
        class: "w-full",
      },
      [
        // Avatar (assistant only)
        !isUser &&
          View(
            {
              class:
                "shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-0.5",
            },
            ["AI"],
          ),
        Flex(
          {
            direction: "col",
            class: "max-w-[72%]",
          },
          [
            // Bubble
            View(
              {
                class: classNames([
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                  isUser
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm",
                ]),
              },
              [
                msg.content ||
                  (msg.streaming
                    ? View({ class: "flex gap-1 items-center py-1" }, [
                        View({
                          class:
                            "w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce",
                        }),
                        View({
                          class:
                            "w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.15s]",
                        }),
                        View({
                          class:
                            "w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.3s]",
                        }),
                      ])
                    : ""),
              ],
            ),
            // Attached files
            msg.files && msg.files.length > 0
              ? Flex(
                  { class: "flex-wrap gap-1 mt-1" },
                  msg.files.map((name) =>
                    View(
                      {
                        class:
                          "flex items-center gap-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md px-2 py-1",
                      },
                      [Icon({ name: "paperclip", size: 12 }), View({}, [name])],
                    ),
                  ),
                )
              : null,
          ],
        ),
      ],
    );
  }

  // ── Attachment chips ─────────────────────────────────────────────────────
  function AttachmentChip(file, idx) {
    return View(
      {
        class:
          "flex items-center gap-1.5 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full px-2.5 py-1",
      },
      [
        Icon({ name: "paperclip", size: 12 }),
        View({ class: "max-w-[120px] truncate" }, [file.name]),
        View(
          {
            class:
              "cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
            onClick() {
              attachments$.splice(idx, 1);
            },
          },
          [Icon({ name: "x", size: 12 })],
        ),
      ],
    );
  }

  // ── Root view ────────────────────────────────────────────────────────────
  return Flex({ class: "h-full overflow-hidden" }, [
    // ── LEFT SIDEBAR ─────────────────────────────────────────────────────
    Flex(
      {
        direction: "col",
        class:
          "w-[240px] shrink-0 h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60",
      },
      [
        // Sidebar header
        View(
          {
            class: "px-3 pt-4 pb-2",
          },
          [
            Button(
              {
                store: new Timeless.vm.ButtonCore({
                  variant: "outline",
                  onClick: newConv,
                }),
                prefix: [Icon({ name: "square-pen", size: 16 })],
                class: "w-full justify-start text-sm",
              },
              ["新对话"],
            ),
          ],
        ),

        // Conversations list
        ScrollArea({ class: "flex-1 px-2" }, [
          // Date group: 今天
          View(
            {
              class:
                "px-1 pt-3 pb-1 text-xs font-medium text-zinc-400 dark:text-zinc-500",
            },
            ["今天"],
          ),
          For({
            each: conversations$,
            render(conv) {
              return ConvItem(conv);
            },
          }),
        ]),

        // Sidebar footer
        View(
          {
            class:
              "px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-2",
          },
          [Icon({ name: "info", size: 14 }), View({}, ["模型：GPT-4o mini"])],
        ),
      ],
    ),

    // ── MAIN CHAT AREA ───────────────────────────────────────────────────
    Flex(
      {
        direction: "col",
        class: "flex-1 h-full min-w-0",
      },
      [
        // Chat header
        Flex(
          {
            items: "center",
            justify: "between",
            class:
              "shrink-0 h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm",
          },
          [
            Flex({ items: "center", class: "gap-2" }, [
              View({
                class: "w-2 h-2 rounded-full bg-emerald-500",
              }),
              View(
                {
                  class: "text-sm font-medium text-zinc-700 dark:text-zinc-200",
                },
                ["AI 助手"],
              ),
            ]),
            Flex({ items: "center", class: "gap-1" }, [
              Button(
                {
                  store: new Timeless.vm.ButtonCore({
                    variant: "ghost",
                    size: "icon-sm",
                  }),
                },
                [Icon({ name: "more-horizontal", size: 16 })],
              ),
            ]),
          ],
        ),

        // Messages area
        ScrollView(
          {
            store: scroll$,
            class: "flex-1 overflow-y-auto",
          },
          [
            View({ class: "max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5" }, [
              For({
                each: messages$,
                render(msg) {
                  return MessageBubble(msg);
                },
              }),
            ]),
          ],
        ),

        // ── INPUT BAR ──────────────────────────────────────────────────
        View(
          {
            class:
              "shrink-0 px-4 pb-4 pt-2 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800",
          },
          [
            // Unified input box
            View(
              {
                class:
                  "max-w-3xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden",
              },
              [
                // Attachment chips (inside the box, above textarea)
                Show({
                  when: computed(attachments$, (files) => files.length > 0),
                  ok() {
                    return Flex(
                      { class: "flex-wrap gap-1.5 px-3 pt-2.5 pb-1" },
                      [
                        For({
                          each: attachments$,
                          render(file, idx) {
                            return AttachmentChip(file, idx);
                          },
                        }),
                      ],
                    );
                  },
                }),

                // Textarea (full width, no extra border)
                View({ class: "px-1 pt-0.5" }, [
                  Textarea({ store: textarea$, onKeyDown }),
                ]),

                // Bottom toolbar
                Flex(
                  {
                    items: "center",
                    justify: "between",
                    class: "px-2 py-2",
                  },
                  [
                    // Left: attach button with transparent FilePicker overlay
                    Flex({ items: "center", class: "gap-1.5" }, [
                      View({ class: "relative" }, [
                        Button(
                          {
                            store: new Timeless.vm.ButtonCore({
                              variant: "outline",
                              size: "sm",
                            }),
                            prefix: [Icon({ name: "paperclip", size: 14 })],
                          },
                          ["附件"],
                        ),
                        FilePicker({
                          multiple: true,
                          class:
                            "absolute inset-0 opacity-0 cursor-pointer z-10",
                          onChange(e) {
                            const files = Array.from(e.target.files || []);
                            files.forEach((f) => attachments$.push(f));
                            e.target.value = "";
                          },
                        }),
                      ]),
                    ]),

                    // Right: model label + separator + send
                    Flex({ items: "center", class: "gap-2" }, [
                      Flex(
                        {
                          items: "center",
                          class:
                            "gap-1 text-xs text-zinc-400 dark:text-zinc-500 cursor-default select-none",
                        },
                        [
                          View({}, ["GPT-4o mini"]),
                          Icon({ name: "chevron-down", size: 12 }),
                        ],
                      ),
                      View({
                        class: "w-px h-4 bg-zinc-200 dark:bg-zinc-700",
                      }),
                      Button(
                        { store: send$ },
                        [Icon({ name: "corner-down-left", size: 14 })],
                      ),
                    ]),
                  ],
                ),
              ],
            ),

            // Hint
            View(
              {
                class:
                  "text-center text-[11px] text-zinc-300 dark:text-zinc-600 mt-2",
              },
              ["AI 助手可能会出错，请核实重要信息。"],
            ),
          ],
        ),
      ],
    ),
  ]);
}
