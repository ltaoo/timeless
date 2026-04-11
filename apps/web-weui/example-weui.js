import {
  Button,
  Badge,
  Separator,
  Avatar,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Select,
  Checkbox,
  Toggle,
  Slider,
  Progress,
  Skeleton,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  Toast,
  Alert,
  AlertTitle,
  AlertDescription,
  Tabs,
  Accordion,
  DropdownMenu,
  Tooltip,
  Popover,
  Sheet,
} from "@timeless/weui";

function injectWeUITheme() {
  if (document.getElementById("weui-theme-style")) return;
  const link = document.createElement("link");
  link.id = "weui-theme-style";
  link.rel = "stylesheet";
  link.href = "/node_modules/@timeless/weui/src/weui-theme.css";
  document.head.appendChild(link);
}

function Section(title, children) {
  return View({ style: "margin-bottom:24px;" }, [
    View(
      {
        style:
          "font-size:12px;font-weight:600;color:var(--weui-FG-1);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;",
      },
      [title],
    ),
    View(
      {
        style: "padding-left:4px;display:flex;flex-direction:column;gap:16px;",
      },
      children,
    ),
  ]);
}

function Item(label, children) {
  return View({ style: "display:flex;flex-direction:column;gap:8px;" }, [
    View({ style: "font-size:14px;color:var(--weui-FG-2);" }, [label]),
    View(
      { style: "display:flex;flex-wrap:wrap;align-items:center;gap:12px;" },
      children,
    ),
  ]);
}

export function UIExampleWeUIPageView() {
  injectWeUITheme();

  const progressVal = ref(60);
  const dialog$ = new Timeless.ui.DialogCore({ title: "提示", footer: true });
  const activeCategory = ref("general");

  const categories = [
    { label: "General", value: "general" },
    { label: "Form", value: "form" },
    { label: "Data Display", value: "data" },
    { label: "Feedback", value: "feedback" },
    { label: "Navigation", value: "nav" },
    { label: "Overlay", value: "overlay" },
  ];

  return View(
    {
      style:
        "display:flex;height:100%;font-family:system-ui,-apple-system,'PingFang SC',sans-serif;",
    },
    [
      // Sidebar
      View(
        {
          style:
            "width:180px;border-right:1px solid var(--weui-SEPARATOR-0);padding:16px 0;background:var(--weui-BG-2);",
        },
        [
          View(
            {
              style:
                "padding:0 12px;margin-bottom:12px;font-size:12px;font-weight:700;color:var(--weui-FG-2);text-transform:uppercase;letter-spacing:0.05em;",
            },
            ["WeUI Components"],
          ),
          For({
            each: categories,
            render(cat) {
              return View(
                {
                  style: computed({ activeCategory }, (d) =>
                    [
                      "padding:10px 12px;font-size:14px;cursor:pointer;transition:all .2s;",
                      d.activeCategory === cat.value
                        ? "color:var(--weui-BRAND);background:var(--weui-STATELAYER-PRESSED);font-weight:500;"
                        : "color:var(--weui-FG-1);",
                    ].join(""),
                  ),
                  onClick() {
                    activeCategory.value = cat.value;
                  },
                },
                [cat.label],
              );
            },
          }),
        ],
      ),
      // Content
      View(
        {
          style:
            "flex:1;width:0;overflow-y:auto;padding:24px;background:var(--weui-BG-1);",
        },
        [
          // === General ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "general",
            ),
            ok() {
              return [
                View({}, [
                  Section("Button", [
                    Item("Variants", [
                      Button({ variant: "primary", size: "sm" }, ["主要"]),
                      Button({ variant: "default", size: "sm" }, ["默认"]),
                      Button({ variant: "warn", size: "sm" }, ["警告"]),
                      Button({ variant: "text", size: "sm" }, ["文字"]),
                    ]),
                    Item("Sizes", [
                      Button({ variant: "primary", size: "sm" }, ["Small"]),
                      Button({ variant: "primary", size: "md" }, ["Medium"]),
                      Button({ variant: "primary", size: "lg" }, ["Large"]),
                    ]),
                  ]),
                  Section("Badge", [
                    Item("Variants", [
                      Badge({}, ["默认"]),
                      Badge({ variant: "secondary" }, ["次要"]),
                      Badge({ variant: "outline" }, ["描边"]),
                      Badge({ variant: "destructive" }, ["危险"]),
                    ]),
                  ]),
                  Section("Separator", [
                    Item("Horizontal", [
                      View({ style: "width:100%;" }, [Separator({})]),
                    ]),
                    Item("Vertical", [
                      View(
                        {
                          style:
                            "display:flex;align-items:center;height:24px;gap:12px;",
                        },
                        [
                          "Left",
                          Separator({ orientation: "vertical" }),
                          "Right",
                        ],
                      ),
                    ]),
                  ]),
                  Section("Avatar", [
                    Item("Sizes", [
                      Avatar({ fallback: "S", size: "sm" }),
                      Avatar({ fallback: "M" }),
                      Avatar({ fallback: "L", size: "lg" }),
                    ]),
                  ]),
                  Section("Card", [
                    Item("Default", [
                      Card({ style: "width:350px;" }, [
                        CardHeader({}, [
                          CardTitle({}, ["卡片标题"]),
                          CardDescription({}, ["卡片描述信息"]),
                        ]),
                        CardContent({}, [
                          View(
                            { style: "font-size:14px;color:var(--weui-FG-0);" },
                            ["这是卡片内容区域。"],
                          ),
                        ]),
                        CardFooter({}, [
                          Button({ variant: "primary", size: "sm" }, ["操作"]),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
          // === Form ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "form",
            ),
            ok() {
              return [
                View({}, [
                  // Input cells
                  View({ class: "weui-cells__title" }, ["输入框"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__hd" }, [Label({}, ["手机号"])]),
                      View({ class: "weui-cell__bd" }, [
                        Input({
                          store: new Timeless.ui.InputCore({
                            defaultValue: "",
                          }),
                          // placeholder: "请输入手机号",
                          type: "tel",
                        }),
                      ]),
                    ]),
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__hd" }, [Label({}, ["邮箱"])]),
                      View({ class: "weui-cell__bd" }, [
                        Input({
                          store: new Timeless.ui.InputCore({
                            defaultValue: "",
                          }),
                          placeholder: "email@example.com",
                        }),
                      ]),
                    ]),
                  ]),
                  // Textarea
                  View({ class: "weui-cells__title" }, ["文本域"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__bd" }, [
                        Textarea({
                          store: new Timeless.ui.InputCore({
                            defaultValue: "",
                          }),
                          placeholder: "请输入消息...",
                          rows: "3",
                        }),
                      ]),
                    ]),
                  ]),
                  // Select
                  View({ class: "weui-cells__title" }, ["选择"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__hd" }, [Label({}, ["水果"])]),
                      View({ class: "weui-cell__bd" }, [
                        Select({
                          store: new Timeless.ui.SelectCore({
                            defaultValue: "apple",
                            options: [
                              { value: "apple", label: "苹果" },
                              { value: "banana", label: "香蕉" },
                              { value: "orange", label: "橙子" },
                            ],
                          }),
                        }),
                      ]),
                    ]),
                  ]),
                  // Checkbox
                  View({ class: "weui-cells__title" }, ["复选框"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell", style: "cursor:pointer;" }, [
                      View({ class: "weui-cell__hd" }, [
                        Checkbox({ store: new Timeless.ui.CheckboxCore({}) }),
                      ]),
                      View({ class: "weui-cell__bd" }, ["选项一"]),
                    ]),
                    View({ class: "weui-cell", style: "cursor:pointer;" }, [
                      View({ class: "weui-cell__hd" }, [
                        Checkbox({ store: new Timeless.ui.CheckboxCore({}) }),
                      ]),
                      View({ class: "weui-cell__bd" }, ["选项二"]),
                    ]),
                  ]),
                  // Switch
                  View({ class: "weui-cells__title" }, ["开关"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__bd" }, ["开启通知"]),
                      View({ class: "weui-cell__ft" }, [
                        Toggle({ store: new Timeless.ui.CheckboxCore({}) }),
                      ]),
                    ]),
                  ]),
                  // Slider
                  View({ class: "weui-cells__title" }, ["滑块"]),
                  View({ class: "weui-cells" }, [
                    View({ class: "weui-cell" }, [
                      View({ class: "weui-cell__bd" }, [
                        Slider({ value: ref(50), min: 0, max: 100 }),
                      ]),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
          // === Data Display ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "data",
            ),
            ok() {
              return [
                View({}, [
                  Section("Progress", [
                    Item("60%", [Progress({ value: progressVal, max: 100 })]),
                    Item("Controls", [
                      Button(
                        {
                          variant: "default",
                          size: "sm",
                          onClick() {
                            progressVal.value = Math.max(
                              0,
                              progressVal.value - 10,
                            );
                          },
                        },
                        ["-10"],
                      ),
                      Button(
                        {
                          variant: "default",
                          size: "sm",
                          onClick() {
                            progressVal.value = Math.min(
                              100,
                              progressVal.value + 10,
                            );
                          },
                        },
                        ["+10"],
                      ),
                    ]),
                  ]),
                  Section("Skeleton", [
                    Item("Default", [
                      View(
                        {
                          style:
                            "display:flex;gap:12px;align-items:center;width:250px;",
                        },
                        [
                          Skeleton({
                            style: "width:48px;height:48px;border-radius:50%;",
                          }),
                          View(
                            {
                              style:
                                "flex:1;display:flex;flex-direction:column;gap:8px;",
                            },
                            [
                              Skeleton({ style: "width:60%;height:16px;" }),
                              Skeleton({ style: "width:100%;height:12px;" }),
                            ],
                          ),
                        ],
                      ),
                    ]),
                  ]),
                  Section("Table", [
                    Item("Default", [
                      Table({}, [
                        TableHeader({}, [
                          TableRow({}, [
                            TableHead({}, ["姓名"]),
                            TableHead({}, ["状态"]),
                            TableHead({}, ["角色"]),
                          ]),
                        ]),
                        TableBody({}, [
                          TableRow({}, [
                            TableCell({}, ["Alice"]),
                            TableCell({}, ["活跃"]),
                            TableCell({}, ["管理员"]),
                          ]),
                          TableRow({}, [
                            TableCell({}, ["Bob"]),
                            TableCell({}, ["离线"]),
                            TableCell({}, ["用户"]),
                          ]),
                          TableRow({}, [
                            TableCell({}, ["Charlie"]),
                            TableCell({}, ["活跃"]),
                            TableCell({}, ["编辑"]),
                          ]),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
          // === Feedback ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "feedback",
            ),
            ok() {
              return [
                View({}, [
                  Section("Dialog", [
                    Item("Default", [
                      Button(
                        {
                          variant: "primary",
                          size: "sm",
                          onClick() {
                            dialog$.show();
                          },
                        },
                        ["打开对话框"],
                      ),
                      Dialog({ store: dialog$ }, [
                        View(
                          { style: "font-size:14px;color:var(--weui-FG-1);" },
                          ["这是对话框内容区域，可以放置任意内容。"],
                        ),
                      ]),
                    ]),
                  ]),
                  Section("Toast", [
                    Item("Default", [
                      (() => {
                        const toast$ = new Timeless.ui.ToastCore({});
                        return View({ style: "display:flex;gap:8px;" }, [
                          Button(
                            {
                              variant: "primary",
                              size: "sm",
                              onClick() {
                                toast$.show({ texts: ["操作成功"] });
                              },
                            },
                            ["成功"],
                          ),
                          Button(
                            {
                              variant: "default",
                              size: "sm",
                              onClick() {
                                toast$.show({
                                  texts: ["加载中..."],
                                  icon: "loading",
                                  mask: true,
                                });
                                setTimeout(() => toast$.hide(), 2000);
                              },
                            },
                            ["加载"],
                          ),
                          Toast({ store: toast$ }),
                        ]);
                      })(),
                    ]),
                  ]),
                  Section("Alert", [
                    Item("Default", [
                      Alert({}, [
                        AlertTitle({}, ["提示"]),
                        AlertDescription({}, [
                          "你可以使用 CLI 添加组件到你的应用。",
                        ]),
                      ]),
                    ]),
                    Item("Destructive", [
                      Alert({ variant: "destructive" }, [
                        AlertTitle({}, ["错误"]),
                        AlertDescription({}, ["出了点问题，请重试。"]),
                      ]),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
          // === Navigation ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "nav",
            ),
            ok() {
              return [
                View({}, [
                  Section("Tabs", [
                    Item("Default", [
                      Tabs({
                        value: ref("tab1"),
                        items: [
                          {
                            label: "账户",
                            value: "tab1",
                            content: View(
                              { style: "padding:16px;color:var(--weui-FG-0);" },
                              ["账户设置内容"],
                            ),
                          },
                          {
                            label: "密码",
                            value: "tab2",
                            content: View(
                              { style: "padding:16px;color:var(--weui-FG-0);" },
                              ["密码设置内容"],
                            ),
                          },
                          {
                            label: "通知",
                            value: "tab3",
                            content: View(
                              { style: "padding:16px;color:var(--weui-FG-0);" },
                              ["通知偏好设置"],
                            ),
                          },
                        ],
                      }),
                    ]),
                  ]),
                  Section("Accordion", [
                    Item("Default", [
                      Accordion({
                        items: [
                          {
                            title: "是否支持无障碍？",
                            content: "是的，遵循 WAI-ARIA 设计规范。",
                          },
                          {
                            title: "是否有样式？",
                            content: "是的，自带与其他组件匹配的默认样式。",
                          },
                          {
                            title: "是否有动画？",
                            content: "是的，使用 CSS 过渡实现平滑的展开/收起。",
                          },
                        ],
                      }),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
          // === Overlay ===
          Show({
            when: computed(
              { activeCategory },
              (d) => d.activeCategory === "overlay",
            ),
            ok() {
              return [
                View({}, [
                  Section("Dropdown Menu", [
                    Item("Default", [
                      DropdownMenu(
                        {
                          store: new Timeless.ui.DropdownMenuCore({
                            // strategy: "fixed",
                            side: "bottom",
                            align: "start",
                            items: [
                              new Timeless.ui.MenuItemCore({
                                label: "编辑",
                                onClick() {
                                  console.log("edit");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "复制",
                                onClick() {
                                  console.log("duplicate");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "删除",
                                onClick() {
                                  console.log("delete");
                                },
                              }),
                            ],
                          }),
                        },
                        [
                          Button({ variant: "default", size: "sm" }, [
                            "打开菜单",
                          ]),
                        ],
                      ),
                    ]),
                    Item("With Submenu", [
                      DropdownMenu(
                        {
                          store: new Timeless.ui.DropdownMenuCore({
                            items: [
                              new Timeless.ui.MenuItemCore({
                                label: "剪切",
                                onClick() {
                                  console.log("cut");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "复制",
                                onClick() {
                                  console.log("copy");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "分享",
                                menu: new Timeless.ui.MenuCore({
                                  items: [
                                    new Timeless.ui.MenuItemCore({
                                      label: "邮件",
                                      onClick() {
                                        console.log("email");
                                      },
                                    }),
                                    new Timeless.ui.MenuItemCore({
                                      label: "短信",
                                      onClick() {
                                        console.log("message");
                                      },
                                    }),
                                    new Timeless.ui.MenuItemCore({
                                      label: "微信",
                                      onClick() {
                                        console.log("wechat");
                                      },
                                    }),
                                  ],
                                }),
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "删除",
                                onClick() {
                                  console.log("delete");
                                },
                              }),
                            ],
                          }),
                        },
                        [
                          Button({ variant: "default", size: "sm" }, [
                            "二级菜单",
                          ]),
                        ],
                      ),
                    ]),
                    Item("Dynamic Submenu", [
                      (() => {
                        const shareMenu = new Timeless.ui.MenuCore({
                          items: [
                            new Timeless.ui.MenuItemCore({
                              label: "February",
                              onClick() {
                                console.log("February");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "March",
                              onClick() {
                                console.log("March");
                              },
                            }),
                          ],
                        });
                        const menuItem = new Timeless.ui.MenuItemCore({
                          label: "Month",
                          menu: shareMenu,
                          onClick() {
                            console.log("Month");
                          },
                        });
                        let count = 0;
                        shareMenu.onShow(() => {
                          setTimeout(() => {
                            count++;
                            const extra = Array.from({ length: 3 }, (_, i) => {
                              const label = `Extra ${(count - 1) * 3 + i + 1}`;
                              return new Timeless.ui.MenuItemCore({
                                label,
                                onClick() {
                                  console.log(label);
                                },
                              });
                            });
                            shareMenu.setItems([...shareMenu.items, ...extra]);
                          }, 1000);
                        });
                        const dm$ = new Timeless.ui.DropdownMenuCore({
                          items: [
                            new Timeless.ui.MenuItemCore({
                              label: "Year 2025",
                              onClick() {
                                console.log("Year 2025");
                              },
                            }),
                            menuItem,
                          ],
                        });
                        return DropdownMenu({ store: dm$ }, [
                          Button({ variant: "default", size: "sm" }, [
                            "动态子菜单",
                          ]),
                        ]);
                      })(),
                    ]),
                    Item("Hover Trigger", [
                      DropdownMenu(
                        {
                          store: new Timeless.ui.DropdownMenuCore({
                            trigger: "hover",
                            items: [
                              new Timeless.ui.MenuItemCore({
                                label: "个人资料",
                                onClick() {
                                  console.log("profile");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "设置",
                                onClick() {
                                  console.log("settings");
                                },
                              }),
                              new Timeless.ui.MenuItemCore({
                                label: "退出",
                                onClick() {
                                  console.log("logout");
                                },
                              }),
                            ],
                          }),
                        },
                        [
                          Button({ variant: "default", size: "sm" }, [
                            "悬停触发",
                          ]),
                        ],
                      ),
                    ]),
                    Item("Context Menu", [
                      (() => {
                        const ctxStore = new Timeless.ui.DropdownMenuCore({
                          trigger: "manual",
                          side: "bottom",
                          align: "start",
                          offsetX: 4,
                          offsetY: 4,
                          items: [
                            new Timeless.ui.MenuItemCore({
                              label: "剪切",
                              onClick() {
                                console.log("cut");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "复制",
                              onClick() {
                                console.log("copy");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "粘贴",
                              onClick() {
                                console.log("paste");
                              },
                            }),
                            new Timeless.ui.MenuItemCore({
                              label: "删除",
                              onClick() {
                                console.log("delete");
                              },
                            }),
                          ],
                        });
                        return DropdownMenu(
                          {
                            store: ctxStore,
                            onMounted($e) {
                              $e.addEventListener("contextmenu", (e) => {
                                e.preventDefault();
                                ctxStore.toggle({ x: e.clientX, y: e.clientY });
                              });
                            },
                          },
                          [
                            View(
                              {
                                style:
                                  "display:flex;align-items:center;justify-content:center;width:300px;height:150px;border-radius:8px;border:2px dashed var(--weui-SEPARATOR-0);font-size:14px;color:var(--weui-FG-2);user-select:none;",
                              },
                              ["右键点击此处"],
                            ),
                          ],
                        );
                      })(),
                    ]),
                    Item("Near Page Bottom", [
                      View(
                        {
                          style:
                            "width:100%;height:800px;display:flex;align-items:flex-end;justify-content:center;",
                        },
                        [
                          DropdownMenu(
                            {
                              store: new Timeless.ui.DropdownMenuCore({
                                items: [
                                  new Timeless.ui.MenuItemCore({
                                    label: "编辑",
                                    onClick() {
                                      console.log("edit");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "复制",
                                    onClick() {
                                      console.log("duplicate");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "删除",
                                    onClick() {
                                      console.log("delete");
                                    },
                                  }),
                                ],
                              }),
                            },
                            [
                              Button({ variant: "default", size: "sm" }, [
                                "打开菜单",
                              ]),
                            ],
                          ),
                        ],
                      ),
                    ]),
                    Item("Near Right Side", [
                      View(
                        {
                          style:
                            "width:100%;display:flex;justify-content:flex-end;",
                        },
                        [
                          DropdownMenu(
                            {
                              store: new Timeless.ui.DropdownMenuCore({
                                side: "right",
                                align: "start",
                                items: [
                                  new Timeless.ui.MenuItemCore({
                                    label: "编辑",
                                    onClick() {
                                      console.log("edit");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "复制",
                                    onClick() {
                                      console.log("duplicate");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "删除",
                                    onClick() {
                                      console.log("delete");
                                    },
                                  }),
                                ],
                              }),
                            },
                            [
                              Button({ variant: "default", size: "sm" }, [
                                "打开菜单",
                              ]),
                            ],
                          ),
                        ],
                      ),
                    ]),
                    Item("Align Positions", [
                      View({ style: "display:flex;gap:16px;flex-wrap:wrap;" }, [
                        ...[
                          "bottom-start",
                          "bottom-center",
                          "bottom-end",
                          "top-start",
                          "top-center",
                          "top-end",
                          "right-start",
                          "right-center",
                          "left-start",
                        ].map((pos) => {
                          const [side, align] = pos.split("-");
                          return DropdownMenu(
                            {
                              store: new Timeless.ui.DropdownMenuCore({
                                side: /** @type {any} */ (side),
                                align: /** @type {any} */ (align),
                                items: [
                                  new Timeless.ui.MenuItemCore({
                                    label: "编辑",
                                    onClick() {
                                      console.log("edit");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "复制",
                                    onClick() {
                                      console.log("duplicate");
                                    },
                                  }),
                                  new Timeless.ui.MenuItemCore({
                                    label: "删除",
                                    onClick() {
                                      console.log("delete");
                                    },
                                  }),
                                ],
                              }),
                            },
                            [Button({ variant: "default", size: "sm" }, [pos])],
                          );
                        }),
                      ]),
                    ]),
                  ]),
                  Section("Popover", [
                    Item("Align (start / center / end)", [
                      (() => {
                        const popover$ = new Timeless.ui.PopoverCore({
                          align: "start",
                        });
                        return View(
                          { style: "display:inline-block;margin-right:8px;" },
                          [
                            Popover(
                              {
                                store: popover$,
                                title: "气泡 (start)",
                                content: "align: start",
                              },
                              [
                                Button(
                                  {
                                    variant: "default",
                                    size: "sm",
                                  },
                                  ["align: start"],
                                ),
                              ],
                            ),
                          ],
                        );
                      })(),
                      (() => {
                        const popover$ = new Timeless.ui.PopoverCore({
                          align: "center",
                        });
                        return View(
                          { style: "display:inline-block;margin-right:8px;" },
                          [
                            Popover(
                              {
                                store: popover$,
                                title: "气泡 (center)",
                                content: "align: center",
                              },
                              [
                                Button(
                                  {
                                    variant: "default",
                                    size: "sm",
                                  },
                                  ["align: center"],
                                ),
                              ],
                            ),
                          ],
                        );
                      })(),
                      (() => {
                        const popover$ = new Timeless.ui.PopoverCore({
                          align: "end",
                        });
                        return View(
                          { style: "display:inline-block;margin-right:8px;" },
                          [
                            Popover(
                              {
                                store: popover$,
                                title: "气泡 (end)",
                                content: "align: end",
                              },
                              [
                                Button(
                                  {
                                    variant: "default",
                                    size: "sm",
                                  },
                                  ["align: end"],
                                ),
                              ],
                            ),
                          ],
                        );
                      })(),
                    ]),
                    Item("With offsetY", [
                      (() => {
                        const popover$ = new Timeless.ui.PopoverCore({
                          align: "center",
                        });
                        popover$.popper.setOffset({ x: 0, y: 12 });
                        return View({ style: "display:inline-block;" }, [
                          Popover(
                            {
                              store: popover$,
                              title: "气泡 (offsetY)",
                              content: "offsetY: 12px 让气泡更靠下",
                            },
                            [
                              Button(
                                {
                                  variant: "default",
                                  size: "sm",
                                },
                                ["offsetY: 12px"],
                              ),
                            ],
                          ),
                        ]);
                      })(),
                    ]),
                  ]),
                  Section("Tooltip", [
                    Item("Positions", [
                      Tooltip({ content: "上方提示", side: "top" }, [
                        Button({ variant: "default", size: "sm" }, ["上"]),
                      ]),
                      Tooltip({ content: "下方提示", side: "bottom" }, [
                        Button({ variant: "default", size: "sm" }, ["下"]),
                      ]),
                      Tooltip({ content: "左侧提示", side: "left" }, [
                        Button({ variant: "default", size: "sm" }, ["左"]),
                      ]),
                      Tooltip({ content: "右侧提示", side: "right" }, [
                        Button({ variant: "default", size: "sm" }, ["右"]),
                      ]),
                    ]),
                  ]),
                  Section("Sheet", [
                    Item("Sides", [
                      (() => {
                        const sheetR$ = new Timeless.ui.DialogCore({
                          title: "Sheet Right",
                        });
                        const sheetL$ = new Timeless.ui.DialogCore({
                          title: "Sheet Left",
                        });
                        const sheetB$ = new Timeless.ui.DialogCore({
                          title: "Sheet Bottom",
                        });
                        return View({ style: "display:flex;gap:8px;" }, [
                          Button(
                            {
                              variant: "primary",
                              size: "sm",
                              onClick() {
                                sheetR$.show();
                              },
                            },
                            ["右侧"],
                          ),
                          Button(
                            {
                              variant: "default",
                              size: "sm",
                              onClick() {
                                sheetL$.show();
                              },
                            },
                            ["左侧"],
                          ),
                          Button(
                            {
                              variant: "default",
                              size: "sm",
                              onClick() {
                                sheetB$.show();
                              },
                            },
                            ["底部"],
                          ),
                          Sheet({ store: sheetR$, side: "right" }, [
                            View({ style: "margin-top:32px;" }, [
                              View(
                                {
                                  style:
                                    "font-size:18px;font-weight:600;color:var(--weui-FG-0);",
                                },
                                ["右侧面板"],
                              ),
                              View(
                                {
                                  style:
                                    "font-size:14px;color:var(--weui-FG-1);margin-top:8px;",
                                },
                                ["从右侧滑入的面板内容。"],
                              ),
                            ]),
                          ]),
                          Sheet({ store: sheetL$, side: "left" }, [
                            View({ style: "margin-top:32px;" }, [
                              View(
                                {
                                  style:
                                    "font-size:18px;font-weight:600;color:var(--weui-FG-0);",
                                },
                                ["左侧面板"],
                              ),
                              View(
                                {
                                  style:
                                    "font-size:14px;color:var(--weui-FG-1);margin-top:8px;",
                                },
                                ["从左侧滑入的面板内容。"],
                              ),
                            ]),
                          ]),
                          Sheet({ store: sheetB$, side: "bottom" }, [
                            View(
                              {
                                style:
                                  "font-size:18px;font-weight:600;color:var(--weui-FG-0);",
                              },
                              ["底部面板"],
                            ),
                            View(
                              {
                                style:
                                  "font-size:14px;color:var(--weui-FG-1);margin-top:8px;",
                              },
                              ["从底部滑入的面板内容。"],
                            ),
                          ]),
                        ]);
                      })(),
                    ]),
                  ]),
                ]),
              ];
            },
          }),
        ],
      ),
    ],
  );
}
