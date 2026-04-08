import { Section, Item } from "@/components/index.js";

export default function FormView() {
  const view$ = new Timeless.ui.ScrollViewCore({});
  const searchSelect$ = new Timeless.ui.SelectCore({
    defaultValue: null,
    placeholder: "输入关键词搜索",
    options: [],
    search: false,
    searchPlaceholder: "输入水果名...",
  });

  const mockClient = new Timeless.kit.HttpClientCore({});
  // @ts-ignore
  mockClient.fetch = async (options) => {
    await new Promise((r) => setTimeout(r, 400));
    // @ts-ignore
    const url = new URL(options.url, "http://localhost");
    const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
    const all = [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "orange", label: "橙子" },
      { value: "grape", label: "葡萄" },
      { value: "watermelon", label: "西瓜" },
      { value: "peach", label: "桃子" },
      { value: "pear", label: "梨" },
      { value: "strawberry", label: "草莓" },
    ];
    const matched = keyword
      ? all.filter((o) => {
          const v = String(o.value).toLowerCase();
          const l = String(o.label).toLowerCase();
          return v.includes(keyword) || l.includes(keyword);
        })
      : [];
    return {
      data: {
        options: matched.slice(0, 8),
      },
    };
  };

  const request = Timeless.kit.request_factory({
    headers: { "Content-Type": "application/json" },
  });
  const searchSelectOptionsReq = new Timeless.kit.RequestCore(
    (params) => request.get("/api/mock/select/search", params),
    {
      client: mockClient,
      process(r) {
        if (r.error) return r.error;
        const options = r.data?.options || [];
        return Timeless.Result.Ok(options);
      },
    },
  );

  async function fetchSearchSelectOptions(keyword) {
    const r = await searchSelectOptionsReq.run({ keyword });
    if (r.error) {
      return [];
    }
    return r.data;
  }

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Input", [
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
            store: new Timeless.ui.FileInputCore({
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
            store: new Timeless.ui.FileInputCore({
              accept: "*/*",
              multiple: true,
              onChange(e) {
                console.log("Files selected:", e);
              },
            }),
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
            }),
            // rows: "3",
          }),
        ]),
      ]),
      Section("Label", [
        Item("With Input", [
          View({ class: "space-y-2 w-full" }, [
            Label({}, [Txt("Email")]),
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
        Item("Default", [
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
        Item("Search Remote", [
          View({ class: "space-y-2 w-[240px]" }, [
            SearchSelect({
              store: searchSelect$,
              fetchOptions: fetchSearchSelectOptions,
              minLength: 1,
              debounce: 300,
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
    ]),
  ]);
}
