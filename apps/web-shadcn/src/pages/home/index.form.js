import { Section, Item } from "@/components/index.js";

export default function FormView() {
  const platform = getPlatform();
  const view$ = new Timeless.ui.ScrollViewCore({});

  const search_select$ = new Timeless.ui.SelectCore({
    view$,
    defaultValue: null,
    placeholder: "输入关键词搜索",
    options: [],
    platform,
    search: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "输入水果名...",
    }),
  });

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Input", [
        View({ class: "w-full" }, [
          Select({
            store: new Timeless.ui.SelectCore({
              defaultValue: "apple",
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
              ],
            }),
          }),
        ]),

        Item("Default", [
          Flex({ direction: "col", gap: "4px" }, [
            Input({
              id: "input_default_1",
              store: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Type something...",
                allowClear: false,
              }),
            }),
            Input({
              id: "input_default_2",
              store: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Type something...",
                // allowClear: false,
              }),
            }),
          ]),
        ]),
      ]),
      Section("FileInput", [
        Item("Default", [
          FileInput({
            store: new Timeless.ui.FilePickerCore({
              accept: "image/*",
              defaultValue: null,
              onChange(e) {
                console.log("File selected:", e);
              },
            }),
          }),
        ]),
        Item("Multiple", [
          FileInput({
            store: new Timeless.ui.FilePickerCore({
              accept: "*/*",
              multiple: true,
              onChange(e) {
                console.log("Files selected:", e);
              },
            }),
          }),
        ]),
      ]),
      Section("FileDropZone", [
        Item("Default", [
          FileDropZone({
            store: new Timeless.ui.FilePickerCore({
              accept: "image/*",
              onChange(e) {
                console.log("File dropped:", e);
              },
            }),
          }),
        ]),
        Item("Multiple", [
          FileDropZone({
            store: new Timeless.ui.FilePickerCore({
              accept: ".pdf,.doc,.docx",
              multiple: true,
              onChange(e) {
                console.log("Files dropped:", e);
              },
            }),
            tip: "拖拽文件到此处，或点击选择",
          }),
        ]),
        Item("Custom Content", [
          FileDropZone({
            store: new Timeless.ui.FilePickerCore({
              multiple: true,
              onChange(e) {
                console.log("Files dropped:", e);
              },
            }),
            tip: "支持所有文件类型",
            class: "w-full",
          }),
        ]),
      ]),
      Section("NumberInput", [
        Item("Default", [
          NumberInput({
            store: new Timeless.ui.NumberInputCore({
              placeholder: "请输入数字",
            }),
          }),
        ]),
        Item("With Min/Max", [
          NumberInput({
            store: new Timeless.ui.NumberInputCore({
              placeholder: "0-100",
              min: 0,
              max: 100,
            }),
          }),
        ]),
        Item("With Step", [
          NumberInput({
            store: new Timeless.ui.NumberInputCore({
              placeholder: "步长为5",
              step: 5,
              defaultValue: 10,
            }),
          }),
        ]),
        Item("With Precision", [
          NumberInput({
            store: new Timeless.ui.NumberInputCore({
              placeholder: "保留2位小数",
              precision: 2,
              step: 0.01,
              defaultValue: 3.14,
            }),
          }),
        ]),
        Item("Without Controls", [
          NumberInput({
            store: new Timeless.ui.NumberInputCore({
              placeholder: "无控制按钮",
            }),
            showControls: false,
          }),
        ]),
      ]),
      Section("Textarea", [
        Item("Default", [
          Textarea({
            store: new Timeless.ui.InputCore({
              defaultValue: "",
              placeholder: "Enter your message...",
              onChange(e) {
                console.log(e);
              },
            }),
          }),
        ]),
      ]),
      Section("Label", [
        Item("With Input", [
          View({ class: "space-y-2 w-full" }, [
            Label({}, ["Email"]),
            Input({
              store: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "email@example.com",
              }),
            }),
          ]),
        ]),
      ]),
      Section("Select", [
        Item("Scrollable (100 options)", [
          Select({
            store: new Timeless.ui.SelectCore({
              // defaultValue: null,
              defaultValue: "option_88",
              platform,
              placeholder: "从 100 个选项中选择",
              options: Array.from({ length: 100 }, (_, i) => {
                return new Timeless.ui.SelectItemCore({
                  value: `option_${i + 1}`,
                  label: `选项 ${i + 1}`,
                });
              }),
            }),
          }),
        ]),
        Item("Search Remote", [
          View({ class: "space-y-2 w-[240px]" }, [
            Select({
              store: search_select$,
            }),
          ]),
        ]),
      ]),
      Section("Cascader", [
        Item("Default", [
          Cascader({
            store: new Timeless.ui.CascaderCore({
              placeholder: "请选择地区",
              options: [
                {
                  value: "zhejiang",
                  label: "浙江",
                  children: [
                    {
                      value: "hangzhou",
                      label: "杭州",
                      children: [
                        { value: "xihu", label: "西湖区" },
                        { value: "binjiang", label: "滨江区" },
                      ],
                    },
                    {
                      value: "ningbo",
                      label: "宁波",
                      children: [
                        { value: "haishu", label: "海曙区" },
                        { value: "jiangbei", label: "江北区" },
                      ],
                    },
                  ],
                },
                {
                  value: "jiangsu",
                  label: "江苏",
                  children: [
                    {
                      value: "nanjing",
                      label: "南京",
                      children: [
                        { value: "xuanwu", label: "玄武区" },
                        { value: "qinhuai", label: "秦淮区" },
                      ],
                    },
                    {
                      value: "suzhou",
                      label: "苏州",
                      children: [
                        { value: "gusu", label: "姑苏区" },
                        { value: "wuzhong", label: "吴中区" },
                      ],
                    },
                  ],
                },
              ],
            }),
          }),
        ]),
        Item("With Search", [
          Cascader({
            store: new Timeless.ui.CascaderCore({
              placeholder: "搜索地区",
              search: true,
              searchPlaceholder: "输入关键词搜索...",
              options: [
                {
                  value: "zhejiang",
                  label: "浙江",
                  children: [
                    {
                      value: "hangzhou",
                      label: "杭州",
                      children: [
                        { value: "xihu", label: "西湖区" },
                        { value: "binjiang", label: "滨江区" },
                      ],
                    },
                    {
                      value: "ningbo",
                      label: "宁波",
                      children: [
                        { value: "haishu", label: "海曙区" },
                        { value: "jiangbei", label: "江北区" },
                      ],
                    },
                  ],
                },
                {
                  value: "jiangsu",
                  label: "江苏",
                  children: [
                    {
                      value: "nanjing",
                      label: "南京",
                      children: [
                        { value: "xuanwu", label: "玄武区" },
                        { value: "qinhuai", label: "秦淮区" },
                      ],
                    },
                    {
                      value: "suzhou",
                      label: "苏州",
                      children: [
                        { value: "gusu", label: "姑苏区" },
                        { value: "wuzhong", label: "吴中区" },
                      ],
                    },
                  ],
                },
              ],
            }),
          }),
        ]),
        Item("With Default Value", [
          Cascader({
            store: new Timeless.ui.CascaderCore({
              placeholder: "请选择地区",
              defaultValue: ["zhejiang", "hangzhou", "xihu"],
              options: [
                {
                  value: "zhejiang",
                  label: "浙江",
                  children: [
                    {
                      value: "hangzhou",
                      label: "杭州",
                      children: [
                        { value: "xihu", label: "西湖区" },
                        { value: "binjiang", label: "滨江区" },
                      ],
                    },
                    {
                      value: "ningbo",
                      label: "宁波",
                      children: [
                        { value: "haishu", label: "海曙区" },
                        { value: "jiangbei", label: "江北区" },
                      ],
                    },
                  ],
                },
                {
                  value: "jiangsu",
                  label: "江苏",
                  children: [
                    {
                      value: "nanjing",
                      label: "南京",
                      children: [
                        { value: "xuanwu", label: "玄武区" },
                        { value: "qinhuai", label: "秦淮区" },
                      ],
                    },
                    {
                      value: "suzhou",
                      label: "苏州",
                      children: [
                        { value: "gusu", label: "姑苏区" },
                        { value: "wuzhong", label: "吴中区" },
                      ],
                    },
                  ],
                },
              ],
            }),
          }),
        ]),
      ]),
      Section("DatePicker", [
        Item("Default", [
          DatePicker({
            store: Timeless.ui.DatePickerCore({ today: new Date() }),
            placeholder: "选择日期",
          }),
        ]),
      ]),
      Section("DateRangePicker", [
        Item("Default", [
          DateRangePicker({
            store: Timeless.ui.DateRangePickerCore({ today: new Date() }),
            placeholder: "选择日期范围",
          }),
        ]),
      ]),
      Section("TimePicker", [
        Item("Default", [
          TimePicker({
            store: Timeless.ui.TimePickerCore({}),
            placeholder: "选择时间",
          }),
        ]),
        Item("With Seconds", [
          TimePicker({
            store: Timeless.ui.TimePickerCore({ showSeconds: true }),
            placeholder: "选择时间（含秒）",
          }),
        ]),
        Item("With Default Value", [
          TimePicker({
            store: Timeless.ui.TimePickerCore({
              defaultValue: { hour: 9, minute: 30 },
            }),
            placeholder: "选择时间",
          }),
        ]),
      ]),
      Section("DateTimePicker", [
        Item("Default", [
          DateTimePicker({
            date: Timeless.ui.DatePickerCore({ today: new Date() }),
            time: Timeless.ui.TimePickerCore({}),
            placeholder: "选择日期时间",
          }),
        ]),
        Item("With Seconds", [
          DateTimePicker({
            date: Timeless.ui.DatePickerCore({ today: new Date() }),
            time: Timeless.ui.TimePickerCore({ showSeconds: true }),
            placeholder: "选择日期时间（含秒）",
          }),
        ]),
      ]),
      Section("Checkbox", [
        Item("Default", [
          Checkbox({ store: new Timeless.ui.CheckboxCore({}) }),
        ]),
        Item("With Label", [
          View({ class: "flex items-center gap-2" }, [
            Checkbox({
              id: "checkbox_with_label1",
              store: new Timeless.ui.CheckboxCore({ checked: true }),
            }),
            Label({ for: "checkbox_with_label1", class: "text-sm" }, [
              "Accept terms and conditions",
            ]),
          ]),
        ]),
      ]),
      Section("CheckboxGroup", [
        Item("Vertical (Default)", [
          CheckboxGroup({
            store: new Timeless.ui.CheckboxGroupCore({
              options: [
                { value: "apple", label: "苹果" },
                { value: "banana", label: "香蕉" },
                { value: "orange", label: "橙子" },
                { value: "grape", label: "葡萄" },
              ],
            }),
          }),
        ]),
        Item("Horizontal", [
          CheckboxGroup({
            store: new Timeless.ui.CheckboxGroupCore({
              options: [
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "angular", label: "Angular" },
                { value: "svelte", label: "Svelte" },
              ],
            }),
            direction: "horizontal",
          }),
        ]),
      ]),
      Section("RadioGroup", [
        Item("Vertical (Default)", [
          RadioGroup({
            store: new Timeless.ui.RadioGroupCore({
              options: [
                { value: "apple", label: "苹果" },
                { value: "banana", label: "香蕉" },
                { value: "orange", label: "橙子" },
                { value: "grape", label: "葡萄" },
              ],
            }),
          }),
        ]),
        Item("Horizontal", [
          RadioGroup({
            store: new Timeless.ui.RadioGroupCore({
              options: [
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "angular", label: "Angular" },
                { value: "svelte", label: "Svelte" },
              ],
            }),
            direction: "horizontal",
          }),
        ]),
        Item("With Default Value", [
          RadioGroup({
            store: new Timeless.ui.RadioGroupCore({
              value: "vue",
              options: [
                { value: "react", label: "React" },
                { value: "vue", label: "Vue" },
                { value: "angular", label: "Angular" },
              ],
            }),
          }),
        ]),
      ]),
      // Section("Switch", [
      //   Item("Default", [
      //     Switch({ store: new Timeless.ui.CheckboxCore({}) }),
      //   ]),
      // ]),
      // Section("Slider", [
      //   Item("Default", [Slider({ value: ref(50), min: 0, max: 100 })]),
      // ]),
      Section("Dialog Form", [
        Item("Form in Dialog", [
          (() => {
            const platform = getPlatform();

            const nameField$ = new Timeless.ui.SingleFieldCore({
              label: "Name",
              name: "name",
              input: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Enter your name",
              }),
              rules: [{ required: true, message: "Name is required" }],
            });

            const emailField$ = new Timeless.ui.SingleFieldCore({
              label: "Email",
              name: "email",
              input: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Enter your email",
              }),
              rules: [
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email format" },
              ],
            });

            const roleField$ = new Timeless.ui.SingleFieldCore({
              label: "Role",
              name: "role",
              input: new Timeless.ui.SelectCore({
                defaultValue: "admin",
                placeholder: "Select a role",
                platform,
                options: [
                  new Timeless.ui.SelectItemCore({
                    value: "admin",
                    label: "Admin",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "editor",
                    label: "Editor",
                  }),
                  new Timeless.ui.SelectItemCore({
                    value: "viewer",
                    label: "Viewer",
                  }),
                ],
              }),
              rules: [{ required: true, message: "Role is required" }],
            });

            const bioField$ = new Timeless.ui.SingleFieldCore({
              label: "Bio",
              name: "bio",
              input: new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Tell us about yourself",
              }),
            });

            const form$ = new Timeless.ui.ObjectFieldCore({
              fields: {
                name: nameField$,
                email: emailField$,
                role: roleField$,
                bio: bioField$,
              },
            });

            const dialog$ = new Timeless.ui.DialogCore({
              title: "User Form",
              footer: true,
              async onOk() {
                const r = await form$.validate();
                if (r.error) return;
                dialog$.okBtn.setLoading(true);
                setTimeout(() => {
                  dialog$.okBtn.setLoading(false);
                  dialog$.hide();
                  console.log("Form submitted:", r.data);
                }, 1000);
              },
            });

            return View({}, [
              Button({
                store: new Timeless.ui.ButtonCore({
                  onClick() {
                    dialog$.show();
                  },
                }),
              }, ["Open Form Dialog"]),
              Dialog({ store: dialog$ }, () => [
                View({ class: "space-y-4" }, [
                  Field({ store: nameField$ }, [
                    Input({ id: nameField$.name, store: nameField$.input }),
                  ]),
                  Field({ store: emailField$ }, [
                    Input({ id: emailField$.name, store: emailField$.input }),
                  ]),
                  Field({ store: roleField$ }, [
                    Select({ store: roleField$.input }),
                  ]),
                  Field({ store: bioField$ }, [
                    Textarea({ store: bioField$.input }),
                  ]),
                ]),
              ]),
            ]);
          })(),
        ]),
      ]),
    ]),
  ]);
}
