import { Section, Item } from "@/components/index.js";
import { TaskDeleteConfirmDialog } from "./task-delete-confirm-dialog.js";
import { ClearTasksConfirmDialog } from "./clear-tasks-confirm-dialog.js";

export default function HomePageView() {
  const view$ = new Timeless.ui.ScrollViewCore({});
  const platform = getPlatform();

  return ScrollView(
    {
      store: view$,
      style: {
        padding: "16px",
        height: "100vh",
        "overflow-y": "auto",
        background: "var(--weui-BG-1)",
      },
    },
    [
      // Page Title
      View(
        {
          style: {
            "font-size": "20px",
            "font-weight": "700",
            color: "var(--weui-FG-0)",
            "margin-bottom": "24px",
            "padding-left": "4px",
          },
        },
        ["WeUI Components"],
      ),

      // ===== Button =====
      Section("Button", [
        Item("Variants", [
          Button({ store: new Timeless.ui.ButtonCore({}) }, ["Primary"]),
          Button(
            { store: new Timeless.ui.ButtonCore({ variant: "default" }) },
            ["Default"],
          ),
          Button({ store: new Timeless.ui.ButtonCore({ variant: "warn" }) }, [
            "Warn",
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ variant: "text" }) }, [
            "Text",
          ]),
        ]),
        Item("Sizes", [
          Button({ store: new Timeless.ui.ButtonCore({ size: "sm" }) }, [
            "Small",
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "md" }) }, [
            "Medium",
          ]),
          Button({ store: new Timeless.ui.ButtonCore({ size: "lg" }) }, [
            "Large",
          ]),
        ]),
        Item("Loading", [
          (() => {
            const store = new Timeless.ui.ButtonCore({
              onClick: () => {
                store.setLoading(true);
                setTimeout(() => store.setLoading(false), 2000);
              },
            });
            return Button({ store }, ["Click to Load"]);
          })(),
          (() => {
            const store = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick: () => {
                store.setLoading(true);
                setTimeout(() => store.setLoading(false), 2000);
              },
            });
            return Button({ store }, ["Click to Load"]);
          })(),
        ]),
        Item("Disabled", [
          Button({ store: new Timeless.ui.ButtonCore({ disabled: true }) }, [
            "Disabled",
          ]),
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                variant: "warn",
                disabled: true,
              }),
            },
            ["Disabled"],
          ),
        ]),
      ]),

      // ===== Badge =====
      Section("Badge", [
        Item("Variants", [
          Badge({}, ["Default"]),
          Badge({ variant: "secondary" }, ["Secondary"]),
          Badge({ variant: "outline" }, ["Outline"]),
          Badge({ variant: "destructive" }, ["Destructive"]),
        ]),
      ]),

      // ===== Input =====
      Section("Input", [
        Item("Default", [
          View({ style: { width: "100%" } }, [
            Input({
              store: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "请输入内容...",
                allowClear: false,
              }),
            }),
          ]),
        ]),
        Item("With Clear", [
          View({ style: { width: "100%" } }, [
            Input({
              store: new Timeless.ui.InputCore({
                defaultValue: "可清除的输入",
                placeholder: "请输入...",
                allowClear: true,
              }),
            }),
          ]),
        ]),
        Item("Disabled", [
          View({ style: { width: "100%" } }, [
            Input({
              store: new Timeless.ui.InputCore({
                defaultValue: "不可编辑",
                disabled: true,
              }),
            }),
          ]),
        ]),
      ]),

      // ===== Textarea =====
      Section("Textarea", [
        Item("Default", [
          View({ style: { width: "100%" } }, [
            Textarea({
              store: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "请输入多行文本...",
              }),
            }),
          ]),
        ]),
      ]),

      // ===== Checkbox =====
      Section("Checkbox", [
        Item("Default", [
          (() => {
            const store1 = new Timeless.ui.CheckboxCore({});
            const store2 = new Timeless.ui.CheckboxCore({});
            const store3 = new Timeless.ui.CheckboxCore({
              disabled: true,
            });
            return Fragment({}, [
              View(
                {
                  style: {
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                  },
                },
                [Checkbox({ store: store1 }), "已选中"],
              ),
              View(
                {
                  style: {
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                  },
                },
                [Checkbox({ store: store2 }), "未选中"],
              ),
              View(
                {
                  style: {
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                  },
                },
                [Checkbox({ store: store3 }), "禁用"],
              ),
            ]);
          })(),
        ]),
      ]),

      // ===== Switch =====
      Section("Switch", [
        Item("Default", [
          (() => {
            const store1 = Timeless.ui.SwitchCore({
              defaultValue: true,
            });
            const store2 = Timeless.ui.SwitchCore({
              defaultValue: false,
            });
            const store3 = Timeless.ui.SwitchCore({
              disabled: true,
              defaultValue: false,
            });
            return Fragment({}, [
              Switch({ store: store1 }),
              Switch({ store: store2 }),
              Switch({ store: store3 }),
            ]);
          })(),
        ]),
      ]),

      // ===== Toggle =====
      Section("Toggle", [
        Item("Default", [
          (() => {
            const store1 = Timeless.ui.SwitchCore({
              defaultValue: false,
            });
            const store2 = Timeless.ui.SwitchCore({
              defaultValue: true,
            });
            return Fragment({}, [
              Toggle({ store: store1 }),
              Toggle({ store: store2 }),
            ]);
          })(),
        ]),
      ]),

      // ===== Select =====
      Section("Select", [
        Item("Basic", [
          View({ style: { width: "100%", height: "40px" } }, [
            Select({
              store: new Timeless.ui.SelectCore({
                defaultValue: null,
                placeholder: "请选择水果",
                platform,
                options: [
                  new Timeless.ui.SelectItemCore({
                    value: "apple",
                    label: "苹果",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "banana",
                    label: "香蕉",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "orange",
                    label: "橙子",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "grape",
                    label: "葡萄",
                  }),
                ],
              }),
            }),
          ]),
        ]),
        Item("With Default Value", [
          View({ style: { width: "100%", height: "40px" } }, [
            Select({
              store: new Timeless.ui.SelectCore({
                defaultValue: "beijing",
                placeholder: "选择城市",
                platform,
                options: [
                  new Timeless.ui.SelectItemCore({
                    value: "beijing",
                    label: "北京",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "shanghai",
                    label: "上海",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "guangzhou",
                    label: "广州",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "shenzhen",
                    label: "深圳",
                  }),
                ],
              }),
            }),
          ]),
        ]),
      ]),

      // ===== Tabs =====
      Section("Tabs", [
        Item("Default", [
          View({ style: { width: "100%" } }, [
            Tabs({
              store: new Timeless.ui.TabHeaderCore({
                key: "tab-demo",
                options: [
                  { value: "tab1", label: "选项一" },
                  { value: "tab2", label: "选项二" },
                  { value: "tab3", label: "选项三" },
                ],
              }),
              items: [
                {
                  value: "tab1",
                  label: "选项一",
                  content: [
                    View(
                      {
                        style: {
                          padding: "16px",
                          color: "var(--weui-FG-1)",
                        },
                      },
                      ["这是选项一的内容"],
                    ),
                  ],
                },
                {
                  value: "tab2",
                  label: "选项二",
                  content: [
                    View(
                      {
                        style: {
                          padding: "16px",
                          color: "var(--weui-FG-1)",
                        },
                      },
                      ["这是选项二的内容"],
                    ),
                  ],
                },
                {
                  value: "tab3",
                  label: "选项三",
                  content: [
                    View(
                      {
                        style: {
                          padding: "16px",
                          color: "var(--weui-FG-1)",
                        },
                      },
                      ["这是选项三的内容"],
                    ),
                  ],
                },
              ],
            }),
          ]),
        ]),
      ]),

      // ===== Separator =====
      Section("Separator", [
        Item("Horizontal", [
          View({ style: { width: "100%" } }, [Separator({})]),
        ]),
        Item("Vertical", [
          View(
            {
              style: {
                display: "flex",
                "align-items": "center",
                height: "24px",
                gap: "12px",
              },
            },
            ["左边", Separator({ orientation: "vertical" }), "右边"],
          ),
        ]),
      ]),

      // ===== Skeleton =====
      Section("Skeleton", [
        Item("Default", [
          View({ style: { width: "100%" } }, [
            View(
              {
                style: {
                  display: "flex",
                  gap: "12px",
                  "align-items": "center",
                },
              },
              [
                Skeleton({
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "50%",
                  },
                }),
                View({ style: { flex: "1" } }, [
                  Skeleton({
                    style: {
                      width: "60%",
                      height: "14px",
                      "margin-bottom": "8px",
                    },
                  }),
                  Skeleton({ style: { width: "80%", height: "14px" } }),
                ]),
              ],
            ),
          ]),
        ]),
      ]),

      // ===== Card =====
      Section("Card", [
        Item("Default", [
          View({ style: { width: "100%" } }, [
            Card({}, [
              CardHeader({}, [
                CardTitle({}, ["卡片标题"]),
                CardDescription({}, ["这是卡片的描述信息"]),
              ]),
              CardContent({}, [
                View(
                  {
                    style: {
                      "font-size": "var(--weui-FONT-SIZE-SM)",
                      color: "var(--weui-FG-1)",
                    },
                  },
                  ["这里是卡片的主要内容区域，可以放置任何信息。"],
                ),
              ]),
              CardFooter({}, [
                Button({ store: new Timeless.ui.ButtonCore({ size: "sm" }) }, [
                  "操作按钮",
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),

      // ===== Dialog =====
      Section("Dialog", [
        Item("Default", [
          (() => {
            const dialog$ = new Timeless.ui.DialogCore({
              title: "确认操作",
              footer: true,
              onOk() {
                dialog$.hide();
              },
              onCancel() {
                dialog$.hide();
              },
            });
            const btn$ = new Timeless.ui.ButtonCore({
              variant: "primary",
              onClick() {
                dialog$.show();
              },
            });
            const checkbox$ = new Timeless.ui.CheckboxCore({});
            return Fragment({}, [
              Button({ store: btn$ }, ["打开弹窗"]),
              Dialog({ store: dialog$ }, [
                "确定要执行此操作吗？此操作不可撤销。",
                View(
                  {
                    style: {
                      display: "flex",
                      "align-items": "center",
                      gap: "8px",
                      "margin-top": "12px",
                    },
                  },
                  [Checkbox({ store: checkbox$ }), "记住我的选择"],
                ),
              ]),
            ]);
          })(),
        ]),
        Item("Without Footer", [
          (() => {
            const dialog$ = new Timeless.ui.DialogCore({
              title: "提示",
              footer: false,
            });
            const btn$ = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick() {
                dialog$.show();
                setTimeout(() => dialog$.hide(), 2000);
              },
            });
            return Fragment({}, [
              Button({ store: btn$ }, ["自动关闭弹窗"]),
              Dialog({ store: dialog$ }, ["2秒后自动关闭..."]),
            ]);
          })(),
        ]),
        Item("With Custom Checkbox", [
          (() => {
            const dialog$ = new Timeless.ui.DialogCore({
              title: "删除下载记录",
              footer: true,
              onOk() {
                dialog$.hide();
              },
              onCancel() {
                dialog$.hide();
              },
            });
            const btn$ = new Timeless.ui.ButtonCore({
              variant: "warn",
              onClick() {
                dialog$.show();
              },
            });
            const store = {
              state: {
                delete_delete_files: ref(false),
              },
              ui: {
                deleteConfirmDialog$: dialog$,
              },
              methods: {
                handleClickCheckboxConfirmDeleteFiles() {
                  const current = store.state.delete_delete_files.value;
                  store.state.delete_delete_files.as(!current);
                },
              },
            };
            return Fragment({}, [
              Button({ store: btn$ }, ["删除记录（含 Checkbox）"]),
              TaskDeleteConfirmDialog({ store }),
            ]);
          })(),
        ]),
        Item("Shared State Between Dialogs", [
          (() => {
            // Shared ref — same pattern as production code
            // where ClearTasksConfirmDialog and TaskDeleteConfirmDialog
            // share delete_delete_files_ ref
            const sharedDeleteFiles$ = ref(false);

            const deleteDialog$ = new Timeless.ui.DialogCore({
              title: "删除下载记录",
              footer: true,
              onOk() {
                alert("同时删除已下载的文件: " + sharedDeleteFiles$.value);
                deleteDialog$.hide();
              },
              onCancel() { deleteDialog$.hide(); },
            });
            const clearDialog$ = new Timeless.ui.DialogCore({
              title: "清空下载记录",
              footer: true,
              onOk() {
                alert("同时删除已下载的文件: " + sharedDeleteFiles$.value);
                clearDialog$.hide();
              },
              onCancel() { clearDialog$.hide(); },
            });

            const sharedStore = {
              state: {
                delete_delete_files: sharedDeleteFiles$,
              },
              ui: {
                deleteConfirmDialog$: deleteDialog$,
                clearConfirmDialog$: clearDialog$,
              },
              methods: {
                handleClickCheckboxConfirmDeleteFiles() {
                  const current = sharedDeleteFiles$.value;
                  console.log("[sharedStore] toggle delete_delete_files:", current, "→", !current);
                  sharedDeleteFiles$.as(!current);
                  console.log("[sharedStore] after toggle, ref value =", sharedDeleteFiles$.value);
                },
              },
            };

            const openDeleteBtn$ = new Timeless.ui.ButtonCore({
              variant: "warn",
              onClick() { deleteDialog$.show(); },
            });
            const openClearBtn$ = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick() { clearDialog$.show(); },
            });

            return Fragment({}, [
              View(
                {
                  style: {
                    display: "flex",
                    gap: "8px",
                    "flex-wrap": "wrap",
                  },
                },
                [
                  Button({ store: openDeleteBtn$ }, ["删除记录弹窗"]),
                  Button({ store: openClearBtn$ }, ["清空记录弹窗"]),
                ],
              ),
              TaskDeleteConfirmDialog({ store: sharedStore }),
              ClearTasksConfirmDialog({ store: sharedStore }),
            ]);
          })(),
        ]),
      ]),

      // ===== Sheet =====
      Section("Sheet", [
        Item("Sides", [
          (() => {
            const sheet_right$ = new Timeless.ui.DialogCore({
              title: "右侧面板",
              onOk() {
                sheet_right$.hide();
              },
            });
            const sheet_bottom$ = new Timeless.ui.DialogCore({
              title: "底部面板",
              onOk() {
                sheet_bottom$.hide();
              },
            });
            const btn_right$ = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick() {
                sheet_right$.show();
              },
            });
            const btn_bottom$ = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick() {
                sheet_bottom$.show();
              },
            });
            return Fragment({}, [
              Button({ store: btn_right$ }, ["右侧抽屉"]),
              Button({ store: btn_bottom$ }, ["底部抽屉"]),
              Sheet({ store: sheet_right$, side: "right" }, [
                View(
                  {
                    style: {
                      "padding-top": "48px",
                      color: "var(--weui-FG-1)",
                    },
                  },
                  ["这是右侧抽屉的内容"],
                ),
              ]),
              Sheet({ store: sheet_bottom$, side: "bottom" }, [
                View(
                  {
                    style: {
                      "min-height": "200px",
                      "padding-top": "24px",
                      color: "var(--weui-FG-1)",
                    },
                  },
                  ["这是底部抽屉的内容"],
                ),
              ]),
            ]);
          })(),
        ]),
      ]),

      // ===== Toast =====
      Section("Toast", [
        Item("Default", [
          (() => {
            const toast$ = new Timeless.ui.ToastCore({});
            const btn$ = new Timeless.ui.ButtonCore({
              variant: "default",
              onClick() {
                // toast$.show({ text: "操作成功" });
                // setTimeout(() => toast$.hide(), 2000);
              },
            });
            return Fragment({}, [
              Button({ store: btn$ }, ["显示 Toast"]),
              // Toast({ store: toast$ }, [
              //   View(
              //     {
              //       style: {
              //         display: "flex",
              //         "flex-direction": "column",
              //         "align-items": "center",
              //         gap: "8px",
              //         padding: "24px",
              //         "min-width": "120px",
              //         background: "var(--weui-BG-4)",
              //         "border-radius": "12px",
              //         color: "#fff",
              //       },
              //     },
              //     [
              //       Icon({ name: "check", size: 36 }),
              //       View(
              //         {
              //           style: {
              //             "font-size": "var(--weui-FONT-SIZE-SM)",
              //             "text-align": "center",
              //           },
              //         },
              //         ["操作成功"],
              //       ),
              //     ],
              //   ),
              // ]),
            ]);
          })(),
        ]),
      ]),
    ],
  );
}
