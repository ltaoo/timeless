/**
 * 「画廊」的全部 Section 函数。
 *
 * 这里只放**区块**，不再放页面骨架：7 个分类页（index.general.js / index.layout.js / …）
 * 按需从这里 import；左菜单（categories.js）用 Section 标题派生锚点 id（见 components 的
 * sectionId）。本文件是纯 module-scope 函数，无闭包、无页面级 ref，可被多个分类页安全共享。
 */
import { Section, Item } from "@/components/index.js";

const BUTTON_VARIANTS = [
  "primary",
  "default",
  "dashed",
  "text",
  "link",
  "ghost",
  "danger",
  "success",
  "warning",
  "info",
];
const BUTTON_SIZES = ["sm", "md", "lg"];

export function ButtonSection() {
  return Section("Button", [
    Item(
      "Variants",
      BUTTON_VARIANTS.map((variant) =>
        Button(
          { store: new Timeless.vm.ButtonCore({ variant }) },
          [variant],
        ),
      ),
    ),
    Item(
      "Sizes",
      BUTTON_SIZES.map((size) =>
        Button({ store: new Timeless.vm.ButtonCore({ size }) }, [size]),
      ),
    ),
    Item("Disabled", [
      Button(
        { store: new Timeless.vm.ButtonCore({ disabled: true }) },
        ["Disabled"],
      ),
      Button(
        { store: new Timeless.vm.ButtonCore({ variant: "primary" }) },
        ["Enabled"],
      ),
    ]),
    Item("Loading", [
      (() => {
        const store = new Timeless.vm.ButtonCore({
          onClick: () => {
            store.setLoading(true);
            setTimeout(() => store.setLoading(false), 1500);
          },
        });
        return Button({ store }, ["Click to load"]);
      })(),
    ]),
  ]);
}

export function InputSection() {
  return Section("Input", [
    Item("Default", [
      View({ class: "gallery-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "Please input",
          }),
        }),
      ]),
    ]),
    Item("With value (clearable)", [
      View({ class: "gallery-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "Hello Animal",
            allowClear: true,
          }),
        }),
      ]),
    ]),
    Item("Disabled / Error", [
      View({ class: "gallery-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "disabled",
            disabled: true,
          }),
        }),
      ]),
      View({ class: "gallery-field" }, [
        Input({
          store: new Timeless.vm.InputCore({
            defaultValue: "invalid",
            status: "error",
          }),
        }),
      ]),
    ]),
  ]);
}

export function TextareaSection() {
  return Section("Textarea", [
    Item("Default", [
      View({ class: "gallery-field gallery-field-wide" }, [
        Textarea({
          store: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "Please leave a comment",
          }),
          showCount: true,
        }),
      ]),
    ]),
  ]);
}

export function CheckboxSection() {
  return Section("Label / Checkbox", [
    Item("Checkbox", [
      View({ class: "animal-check" }, [
        Checkbox({
          id: "animal-checkbox-1",
          store: new Timeless.vm.CheckboxCore({ checked: true }),
        }),
        Label({ for: "animal-checkbox-1", class: "animal-check__label" }, ["Checked"]),
      ]),
      View({ class: "animal-check" }, [
        Checkbox({
          id: "animal-checkbox-2",
          store: new Timeless.vm.CheckboxCore({ checked: false }),
        }),
        Label({ for: "animal-checkbox-2", class: "animal-check__label" }, ["Unchecked"]),
      ]),
      View({ class: "animal-check" }, [
        Checkbox({
          id: "animal-checkbox-3",
          store: new Timeless.vm.CheckboxCore({ checked: false, disabled: true }),
        }),
        Label({ for: "animal-checkbox-3", class: "animal-check__label" }, ["Disabled"]),
      ]),
    ]),
  ]);
}

const FRUITS = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "orange", label: "橙子" },
  { value: "grape", label: "葡萄" },
];

export function CheckboxGroupSection() {
  return Section("CheckboxGroup", [
    Item("Vertical", [
      CheckboxGroup({
        store: new Timeless.vm.CheckboxGroupCore({ options: FRUITS }),
      }),
    ]),
    Item("Horizontal", [
      CheckboxGroup({
        store: new Timeless.vm.CheckboxGroupCore({ options: FRUITS }),
        direction: "horizontal",
      }),
    ]),
  ]);
}

const LANGS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
];

export function RadioSection() {
  const stores = [
    new Timeless.vm.RadioCore({ checked: false }),
    new Timeless.vm.RadioCore({ checked: true }),
    new Timeless.vm.RadioCore({ checked: false, disabled: true }),
  ];
  return Section("Radio / RadioGroup", [
    Item("Single radio", [
      View({ class: "animal-check" }, [
        Radio({ id: "animal-radio-1", store: stores[0] }),
        Label({ for: "animal-radio-1", class: "animal-check__label" }, ["Default"]),
      ]),
      View({ class: "animal-check" }, [
        Radio({ id: "animal-radio-2", store: stores[1] }),
        Label({ for: "animal-radio-2", class: "animal-check__label" }, ["Checked"]),
      ]),
      View({ class: "animal-check" }, [
        Radio({ id: "animal-radio-3", store: stores[2] }),
        Label({ for: "animal-radio-3", class: "animal-check__label" }, ["Disabled"]),
      ]),
    ]),
    Item("Group (vertical)", [
      RadioGroup({
        store: new Timeless.vm.RadioGroupCore({ options: LANGS }),
      }),
    ]),
    Item("Group (horizontal, with default)", [
      RadioGroup({
        store: new Timeless.vm.RadioGroupCore({ value: "vue", options: LANGS }),
        direction: "horizontal",
      }),
    ]),
  ]);
}

export function SwitchToggleSection() {
  // 注意：SwitchCore 是工厂函数（不是 class），prop 是 defaultValue 而非 checked。
  const on = Timeless.vm.SwitchCore({ defaultValue: true });
  const off = Timeless.vm.SwitchCore({ defaultValue: false });
  return Section("Switch / Toggle", [
    Item("Switch", [
      Switch({ store: on }),
      Switch({ store: off }),
      Switch({
        store: Timeless.vm.SwitchCore({ defaultValue: false, disabled: true }),
      }),
    ]),
    Item("Toggle", [
      Toggle({ store: Timeless.vm.SwitchCore({ defaultValue: true }) }),
      Toggle({ store: Timeless.vm.SwitchCore({ defaultValue: false }) }),
    ]),
  ]);
}

export function SliderSection() {
  return Section("Slider", [
    Item("Continuous", [
      View({ class: "gallery-field" }, [
        Slider({ value: 40, min: 0, max: 100 }),
      ]),
    ]),
    Item("Stepped / disabled", [
      View({ class: "gallery-field" }, [
        Slider({ value: 20, min: 0, max: 100, step: 10 }),
      ]),
      View({ class: "gallery-field" }, [
        Slider({ value: 60, min: 0, max: 100, disabled: true }),
      ]),
    ]),
  ]);
}

function selectStore(defaultValue) {
  return new Timeless.vm.SelectCore({
    defaultValue,
    placeholder: "请选择水果",
    options: FRUITS.map(
      (o) => new Timeless.vm.SelectItemCore({ value: o.value, label: o.label }),
    ),
  });
}

export function SelectSection() {
  return Section("Select", [
    Item("Basic", [
      View({ class: "gallery-field" }, [Select({ store: selectStore(null) })]),
    ]),
    Item("With default / disabled", [
      View({ class: "gallery-field" }, [Select({ store: selectStore("orange") })]),
      View({ class: "gallery-field" }, [
        Select({
          store: new Timeless.vm.SelectCore({
            defaultValue: "apple",
            disabled: true,
            options: FRUITS.map(
              (o) =>
                new Timeless.vm.SelectItemCore({ value: o.value, label: o.label }),
            ),
          }),
        }),
      ]),
    ]),
  ]);
}

export function NumberInputSection() {
  return Section("NumberInput", [
    Item("Default", [
      View({ class: "gallery-field" }, [
        NumberInput({
          store: new Timeless.vm.NumberInputCore({
            defaultValue: 3,
            min: 0,
            max: 10,
          }),
        }),
      ]),
    ]),
    Item("Disabled / Error", [
      View({ class: "gallery-field" }, [
        NumberInput({
          store: new Timeless.vm.NumberInputCore({
            defaultValue: 5,
            disabled: true,
          }),
        }),
      ]),
      View({ class: "gallery-field" }, [
        NumberInput({
          store: new Timeless.vm.NumberInputCore({
            defaultValue: 99,
            max: 10,
          }),
        }),
      ]),
    ]),
  ]);
}

export function ProgressSection() {
  return Section("Progress", [
    Item("Variants", [
      View({ class: "gallery-stack" }, [
        Progress({ value: 25, max: 100 }),
        Progress({ value: 50, max: 100, variant: "success" }),
        Progress({ value: 75, max: 100, variant: "warning", striped: true }),
        Progress({ value: 100, max: 100, variant: "danger", striped: true, animated: true }),
      ]),
    ]),
  ]);
}

export function AvatarBadgeSection() {
  return Section("Avatar / Badge", [
    Item("Avatar", [
      Avatar({
        src: "public/avatar.jpeg",
        alt: "Timeless",
        size: "sm",
      }),
      Avatar({ src: "public/avatar.jpeg", alt: "Timeless" }),
      Avatar({ src: "public/avatar.jpeg", alt: "Timeless", size: "lg" }),
    ]),
    Item("Badge", [
      Badge({}, ["default"]),
      Badge({ variant: "secondary" }, ["secondary"]),
      Badge({ variant: "success" }, ["success"]),
      Badge({ variant: "warning" }, ["warning"]),
      Badge({ variant: "danger" }, ["danger"]),
      Badge({ variant: "info" }, ["info"]),
      Badge({ variant: "outline" }, ["outline"]),
    ]),
  ]);
}

export function SeparatorSection() {
  return Section("Separator", [
    Item("Separator", [
      View({ class: "gallery-stack" }, [
        View({}, ["Above"]),
        Separator({}),
        View({}, ["Below"]),
        View({ class: "gallery-row" }, [
          View({}, ["Left"]),
          Separator({ orientation: "vertical", style: { height: "24px" } }),
          View({}, ["Right"]),
        ]),
      ]),
    ]),
  ]);
}

export function SkeletonSection() {
  return Section("Skeleton", [
    Item("Skeleton", [
      View({ class: "gallery-skeleton-demo" }, [
        Skeleton({ class: "skeleton-avatar" }),
        View({ class: "gallery-skeleton-lines" }, [
          Skeleton({ class: "skeleton-line" }),
          Skeleton({ class: "skeleton-line skeleton-line-short" }),
        ]),
      ]),
    ]),
  ]);
}

export function CardSection() {
  return Section("Card", [
    Item("Basic", [
      View({ class: "gallery-card-wrap" }, [
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Card title"]),
            CardDescription({}, ["Supporting description text."]),
          ]),
          CardContent({}, [
            View({}, ["Card 默认**没有** box-shadow —— 层次来自 2px 描边与奶油纸底色，不是海拔。"]),
          ]),
          CardFooter({}, [Button({ store: new Timeless.vm.ButtonCore({ size: "sm" }) }, ["Action"])]),
        ]),
      ]),
    ]),
  ]);
}

export function AlertSection() {
  return Section("Alert", [
    Item("Variants", [
      View({ class: "gallery-stack" }, [
        Alert({ variant: "primary" }, [
          AlertTitle({}, ["Heads up!"]),
          AlertDescription({}, ["Primary alert with a title and description."]),
        ]),
        Alert({ variant: "success" }, [AlertDescription({}, ["Success alert."])]),
        Alert({ variant: "warning" }, [AlertDescription({}, ["Warning alert."])]),
        Alert({ variant: "danger" }, [AlertDescription({}, ["Danger alert."])]),
      ]),
    ]),
  ]);
}

export function KbdLinkSection() {
  return Section("Kbd / Link", [
    Item("Kbd", [
      Kbd({}, ["Ctrl"]),
      View({}, ["+"]),
      Kbd({}, ["K"]),
      KbdGroup({}, [Kbd({}, ["⌘"]), Kbd({}, ["Shift"]), Kbd({}, ["P"])]),
    ]),
    Item("Link", [
      Link({ href: "https://github.com/guokaigdg/animal-island-ui" }, ["animal-island-ui 上游仓库"]),
    ]),
  ]);
}

export function AspectScrollSection() {
  return Section("AspectRatio / ScrollArea", [
    Item("AspectRatio 16:9", [
      View({ class: "gallery-ratio-wrap" }, [
        AspectRatio({ ratio: 16 / 9 }, [
          View({ class: "gallery-ratio-fill" }, ["16 : 9"]),
        ]),
      ]),
    ]),
    Item("ScrollArea", [
      ScrollArea({ class: "gallery-scroll-area" }, [
        ...Array.from({ length: 12 }, (_, i) =>
          View({ class: "gallery-scroll-row" }, [`Row ${i + 1}`]),
        ),
      ]),
    ]),
  ]);
}

export function FieldSection() {
  const name$ = new Timeless.vm.SingleFieldCore({
    label: "Name",
    name: "name",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "Enter your name",
    }),
    rules: [{ required: true, message: "Name is required" }],
  });
  const email$ = new Timeless.vm.SingleFieldCore({
    label: "Email",
    name: "email",
    help: "We never share your email.",
    input: new Timeless.vm.InputCore({
      defaultValue: "hi@timeless.dev",
      placeholder: "you@example.com",
    }),
  });

  return Section("Field", [
    Item("FieldSet", [
      FieldSet({}, [
        FieldLegend({}, ["Profile"]),
        View({ class: "gallery-stack" }, [
          // Field 的输入控件通过 children 传入（Input/Select/Textarea 皆可）。
          Field({ store: name$, class: "gallery-field-wide" }, [
            Input({ id: name$.name, store: name$.input }),
          ]),
          Field({ store: email$, class: "gallery-field-wide" }, [
            Input({ id: email$.name, store: email$.input }),
          ]),
          FieldDescription({}, [
            "Field wires label / description / error to a SingleFieldCore.",
          ]),
          FieldSeparator({}),
        ]),
      ]),
    ]),
  ]);
}

/* ---------------------------------------------------------------------------
   Tier 2：浮层 / 菜单 / 导航 / 反馈 / 数据
   ------------------------------------------------------------------------- */

function demoButton(label, extra = {}) {
  return Button(
    { store: new Timeless.vm.ButtonCore({ size: "sm", ...extra }) },
    [label],
  );
}

export function DialogSection() {
  const d$ = new Timeless.vm.DialogCore({ title: "Dialog Title" });
  const noFooter$ = new Timeless.vm.DialogCore({
    title: "Confirm deletion",
    footer: false,
  });
  return Section("Dialog", [
    Item("Default (header + body + footer)", [
      demoButton("Open Dialog", {
        variant: "primary",
        onClick() {
          d$.show();
        },
      }),
      Dialog({ store: d$ }, () => [
        View({}, [
          "Dialog 用 24px 圆角 + 2px 描边，遮罩是 rgba(0,0,0,0.35)。",
        ]),
      ]),
    ]),
    Item("footer: false", [
      demoButton("Open without footer", {
        onClick() {
          noFooter$.show();
        },
      }),
      Dialog({ store: noFooter$ }, () => [
        View({}, ["Set footer: false on the store to hide the action bar."]),
      ]),
    ]),
  ]);
}

export function SheetSection() {
  const right$ = new Timeless.vm.DialogCore({ title: "Sheet Right" });
  const left$ = new Timeless.vm.DialogCore({ title: "Sheet Left" });
  const bottom$ = new Timeless.vm.DialogCore({ title: "Sheet Bottom" });
  return Section("Sheet", [
    Item("Sides", [
      demoButton("Right", { onClick: () => right$.show() }),
      demoButton("Left", { onClick: () => left$.show() }),
      demoButton("Bottom", { onClick: () => bottom$.show() }),
      Sheet({ store: right$, side: "right" }, [
        View({}, ["Right side sheet (Drawer)."]),
      ]),
      Sheet({ store: left$, side: "left" }, [View({}, ["Left side sheet."])]),
      Sheet({ store: bottom$, side: "bottom" }, [
        View({}, ["Bottom side sheet."]),
      ]),
    ]),
  ]);
}

export function PopoverSection() {
  return Section("Popover", [
    Item("With title + body", [
      Popover(
        {
          store: new Timeless.vm.PopoverCore({ side: "bottom", align: "start" }),
          title: ["Popover title"],
          content: ["And here's some amazing content. It's very engaging. Right?"],
        },
        [demoButton("Click to toggle popover", { variant: "primary" })],
      ),
    ]),
  ]);
}

export function PopconfirmSection() {
  return Section("Popconfirm", [
    Item("Confirm / cancel", [
      Popconfirm(
        {
          store: new Timeless.vm.PopconfirmCore({ side: "top" }),
          title: ["Delete this item?"],
          description: ["This action cannot be undone."],
        },
        [demoButton("Delete", { variant: "danger" })],
      ),
    ]),
  ]);
}

export function TooltipSection() {
  const side = (s) =>
    Tooltip({ side: s, content: [`${s} tooltip`] }, [
      demoButton(s[0].toUpperCase() + s.slice(1), { variant: "outline" }),
    ]);
  return Section("Tooltip", [
    Item("Sides · requires one mounted TooltipProvider", [
      TooltipProvider({}, [
        View({ class: "gallery-row" }, [
          side("top"),
          side("right"),
          side("bottom"),
          side("left"),
        ]),
      ]),
    ]),
  ]);
}

function menuItems() {
  return [
    new Timeless.vm.MenuItemCore({
      label: "Edit",
      icon: Icon({ name: "pencil", size: 16 }),
      shortcut: "⌘E",
      onClick() {},
    }),
    new Timeless.vm.MenuItemCore({
      label: "Duplicate",
      icon: Icon({ name: "copy", size: 16 }),
      onClick() {},
    }),
    new Timeless.vm.MenuSeparatorCore(),
    new Timeless.vm.MenuItemCore({
      label: "Share",
      icon: Icon({ name: "share-2", size: 16 }),
      menu: new Timeless.vm.MenuCore({
        items: [
          new Timeless.vm.MenuItemCore({ label: "Email", onClick() {} }),
          new Timeless.vm.MenuItemCore({ label: "Message", onClick() {} }),
        ],
      }),
    }),
    new Timeless.vm.MenuSeparatorCore(),
    new Timeless.vm.MenuItemCore({ label: "Delete", disabled: true }),
  ];
}

export function DropdownMenuSection() {
  return Section("DropdownMenu", [
    Item("Click trigger · items / separator / submenu", [
      DropdownMenu(
        {
          store: new Timeless.vm.DropdownMenuCore({
            trigger: "click",
            items: menuItems(),
          }),
        },
        [demoButton("Open Menu", { variant: "primary" })],
      ),
      DropdownMenu(
        {
          store: new Timeless.vm.DropdownMenuCore({
            trigger: "hover",
            items: menuItems(),
          }),
        },
        [demoButton("Hover Menu", { variant: "outline" })],
      ),
    ]),
  ]);
}

export function ContextMenuSection() {
  return Section("ContextMenu", [
    Item("Right click the dashed area", [
      ContextMenu(
        { store: new Timeless.vm.ContextMenuCore({ items: menuItems() }) },
        [View({ class: "gallery-ctx-target" }, ["Right click here"])],
      ),
    ]),
  ]);
}

export function MenuSection() {
  return Section("Menu", [
    Item("Static (non-portal) menu", [
      Menu({
        store: new Timeless.vm.MenuCore({ items: menuItems() }),
      }),
    ]),
  ]);
}

export function TabsSection() {
  return Section("Tabs", [
    Item("Default · animated underline pill", [
      View({ class: "gallery-wide" }, [
        Tabs({
          store: new Timeless.vm.TabHeaderCore({
            key: "value",
            selected: "profile",
            options: [
              { label: "Account", value: "account" },
              { label: "Profile", value: "profile" },
              { label: "Notifications", value: "notifications" },
            ],
          }),
          items: [
            {
              value: "account",
              label: "Account",
              content: ["Update your account details here."],
            },
            {
              value: "profile",
              label: "Profile",
              content: ["This is the profile panel."],
            },
            {
              value: "notifications",
              label: "Notifications",
              content: ["Choose what you want to be notified about."],
            },
          ],
        }),
      ]),
    ]),
  ]);
}

export function AccordionSection() {
  return Section("Accordion", [
    Item("Single expand", [
      View({ class: "gallery-wide" }, [
        Accordion({
          store: Timeless.vm.AccordionCore({ type: "single" }),
          items: [
            {
              title: "Is it accessible?",
              content: ["Yes. It adheres to the WAI-ARIA design pattern."],
            },
            {
              title: "Is it styled?",
              content: ["Yes. 走的是 .animal-accordion__* 这套类名，与另三套库同名不同前缀。"],
            },
            {
              title: "Is it animated?",
              content: ["Yes. Open state is driven by .is-open and CSS."],
            },
          ],
        }),
      ]),
    ]),
  ]);
}

export function StepsSection() {
  const items = [
    { title: "Account", description: "Create your account" },
    { title: "Profile", description: "Fill in your profile" },
    { title: "Complete", description: "All done" },
  ];
  const step$ = new Timeless.vm.StepCore({ value: 1 });
  return Section("Steps", [
    Item("3 steps", [View({ class: "gallery-wide" }, [Steps({ store: step$, items })])]),
    Item("Controls", [
      demoButton("Prev", {
        variant: "outline",
        onClick() {
          step$.change(Math.max(0, step$.value - 1));
        },
      }),
      demoButton("Next", {
        variant: "outline",
        onClick() {
          step$.change(Math.min(items.length, step$.value + 1));
        },
      }),
    ]),
  ]);
}

export function ToastSection() {
  // Toast() 返回的是数组（ToastPrimitive.Root 只是透传 children）。
  // 直接把它当作 View 的 children 平铺传入；外面再包一层 [ ] 会变成嵌套数组，
  // 渲染时被字符串化成 "[object Object]"。
  const toast = Toast({ store: new Timeless.vm.ToastCore({ delay: 3000 }) }, [
    View({ class: "animal-toast__header" }, [
      Icon({ name: "info", size: 16 }),
      View({}, ["Timeless"]),
      View({ class: "gallery-toast-time" }, ["just now"]),
    ]),
    View({ class: "animal-toast__body" }, [
      "Toast 左侧有一条状态色竖条，2px 描边 + 柔和高度阴影。",
    ]),
  ]);
  return Section("Toast", [
    Item("Static toast", [View({ class: "gallery-toast-wrap" }, toast)]),
  ]);
}

export function TableSection() {
  const rows = [
    ["Alice", "Active", "Admin"],
    ["Bob", "Inactive", "User"],
    ["Charlie", "Active", "Editor"],
  ];
  return Section("Table", [
    Item("Default", [
      View({ class: "gallery-wide" }, [
        Table({}, [
          TableHeader({}, [
            TableRow({}, [
              TableHead({}, ["Name"]),
              TableHead({}, ["Status"]),
              TableHead({}, ["Role"]),
            ]),
          ]),
          TableBody(
            {},
            rows.map((cells) =>
              TableRow(
                {},
                cells.map((cell) => TableCell({}, [cell])),
              ),
            ),
          ),
        ]),
      ]),
    ]),
  ]);
}

export function FormSection() {
  const name$ = new Timeless.vm.SingleFieldCore({
    label: "Name",
    name: "name",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "Enter your name",
    }),
    rules: [{ required: true, message: "Name is required" }],
  });
  const company$ = new Timeless.vm.SingleFieldCore({
    label: "Company",
    name: "company",
    help: "Where do you work?",
    input: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "Timeless Inc.",
    }),
  });
  const form$ = new Timeless.vm.ObjectFieldCore({
    label: "Contact",
    fields: { name: name$, company: company$ },
  });
  return Section("Form", [
    Item("Form is a layout passthrough — use Field for fields", [
      View({ class: "gallery-field-wide" }, [
        Form({ store: form$ }, [
          Field({ store: name$ }, [Input({ id: name$.name, store: name$.input })]),
          Field({ store: company$ }, [
            Input({ id: company$.name, store: company$.input }),
          ]),
          Button(
            { store: new Timeless.vm.ButtonCore({ variant: "primary" }) },
            ["Submit"],
          ),
        ]),
      ]),
    ]),
  ]);
}

export function SearchSelectSection() {
  const store = new Timeless.vm.SelectCore({
    defaultValue: null,
    placeholder: "输入关键词搜索",
    options: FRUITS.map(
      (o) => new Timeless.vm.SelectItemCore({ value: o.value, label: o.label }),
    ),
    search: new Timeless.vm.InputCore({
      defaultValue: "",
      placeholder: "输入水果名...",
    }),
  });
  const apply = (keyword) => {
    if (!store.canSearch()) {
      return;
    }
    // startSearch 会把当前 options 存起来并 emit StateChange，
    // finishSearch 再 emit 一次——缺了这对调用，setOptions 不会刷新面板。
    store.startSearch();
    const kw = String(keyword || "").toLowerCase();
    store.setOptions(
      FRUITS.filter(
        (f) => f.label.toLowerCase().includes(kw) || f.value.includes(kw),
      ).map(
        (f) => new Timeless.vm.SelectItemCore({ value: f.value, label: f.label }),
      ),
    );
    store.finishSearch();
  };
  store.onSearchChange(apply);
  return Section("SearchSelect", [
    Item("Type to filter", [
      View({ class: "gallery-field" }, [SearchSelect({ store })]),
    ]),
  ]);
}

export function FilePickerSection() {
  const zone$ = new Timeless.vm.FilePickerCore({
    accept: "image/*",
    onChange(e) {
      console.log("dropped", e);
    },
  });
  const multi$ = new Timeless.vm.FilePickerCore({
    accept: ".pdf,.doc,.docx",
    multiple: true,
    onChange(e) {
      console.log("dropped", e);
    },
  });
  const input$ = new Timeless.vm.FilePickerCore({
    accept: "*/*",
    onChange(e) {
      console.log("selected", e);
    },
  });
  return Section("FilePicker", [
    Item("FileDropZone", [
      View({ class: "gallery-wide" }, [
        FileDropZone({ store: zone$, tip: "拖拽图片到此处，或点击选择" }),
      ]),
      View({ class: "gallery-wide" }, [
        FileDropZone({ store: multi$, tip: "支持 .pdf / .doc / .docx，可多选" }),
      ]),
    ]),
    Item("FileInput", [
      View({ class: "gallery-wide" }, [FileInput({ store: input$ })]),
    ]),
  ]);
}

export function ResizablePanelsSection() {
  const group$ = new Timeless.vm.ResizablePanelsCore({ direction: "horizontal" });
  const left$ = new Timeless.vm.ResizablePanelCore({ defaultSize: 35 });
  const right$ = new Timeless.vm.ResizablePanelCore({ defaultSize: 65 });
  return Section("ResizablePanels", [
    Item("Horizontal · drag the divider", [
      View({ class: "gallery-resizable" }, [
        ResizablePanels({ store: group$, direction: "horizontal" }, [
          ResizablePanel({ store: left$, group: group$ }, [
            View({ class: "gallery-pane" }, ["Panel A"]),
          ]),
          ResizableHandle({
            store: group$,
            panelBefore: left$,
            panelAfter: right$,
            withHandle: true,
          }),
          ResizablePanel({ store: right$, group: group$ }, [
            View({ class: "gallery-pane" }, ["Panel B"]),
          ]),
        ]),
      ]),
    ]),
  ]);
}

/* ---------------------------------------------------------------------------
   Tier 3：日期时间 / 级联 / 滚动 / 固钉 / 瀑布流
   ------------------------------------------------------------------------- */

const AREA_OPTIONS = [
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
          { value: "yuhang", label: "余杭区" },
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
          { value: "gulou", label: "鼓楼区" },
        ],
      },
    ],
  },
];

function cascaderStore(extra = {}) {
  return new Timeless.vm.CascaderCore({
    placeholder: "请选择地区",
    options: AREA_OPTIONS,
    ...extra,
  });
}

export function DatePickerSection() {
  return Section("DatePicker", [
    Item("Default", [
      View({ class: "gallery-field" }, [
        DatePicker({
          store: Timeless.vm.DatePickerCore({ today: new Date() }),
          placeholder: "选择日期",
        }),
      ]),
    ]),
    Item("Clearable", [
      View({ class: "gallery-field" }, [
        DatePicker({
          store: Timeless.vm.DatePickerCore({
            today: new Date(),
            allowClear: true,
          }),
          placeholder: "选择日期",
        }),
      ]),
    ]),
  ]);
}

export function DateRangePickerSection() {
  return Section("DateRangePicker", [
    Item("Two-month calendar · start / end / in-range", [
      View({ class: "gallery-field" }, [
        DateRangePicker({
          store: Timeless.vm.DateRangePickerCore({ today: new Date() }),
          placeholder: "选择日期范围",
        }),
      ]),
    ]),
  ]);
}

export function TimePickerSection() {
  return Section("TimePicker", [
    Item("Default (hour : minute)", [
      View({ class: "gallery-field" }, [
        TimePicker({
          store: Timeless.vm.TimePickerCore({}),
          placeholder: "选择时间",
        }),
      ]),
    ]),
    Item("With seconds", [
      View({ class: "gallery-field" }, [
        TimePicker({
          store: Timeless.vm.TimePickerCore({ showSeconds: true }),
          placeholder: "选择时间",
        }),
      ]),
    ]),
    Item("Default value 09:30", [
      View({ class: "gallery-field" }, [
        TimePicker({
          store: Timeless.vm.TimePickerCore({
            defaultValue: { hour: 9, minute: 30 },
          }),
          placeholder: "选择时间",
        }),
      ]),
    ]),
  ]);
}

export function DateTimePickerSection() {
  return Section("DateTimePicker", [
    Item("Date + time", [
      DateTimePicker({
        date: Timeless.vm.DatePickerCore({ today: new Date() }),
        time: Timeless.vm.TimePickerCore({}),
        placeholder: "选择日期时间",
      }),
    ]),
    Item("With seconds", [
      DateTimePicker({
        date: Timeless.vm.DatePickerCore({ today: new Date() }),
        time: Timeless.vm.TimePickerCore({ showSeconds: true }),
        placeholder: "选择日期时间",
      }),
    ]),
  ]);
}

export function CascaderSection() {
  return Section("Cascader", [
    Item("Multi level", [
      View({ class: "gallery-field" }, [Cascader({ store: cascaderStore() })]),
    ]),
    Item("With search", [
      View({ class: "gallery-field" }, [
        Cascader({
          store: cascaderStore({
            search: true,
            searchPlaceholder: "输入关键词搜索...",
          }),
        }),
      ]),
    ]),
    Item("With default value", [
      View({ class: "gallery-field" }, [
        Cascader({
          store: cascaderStore({
            defaultValue: ["zhejiang", "hangzhou", "xihu"],
          }),
        }),
      ]),
    ]),
  ]);
}

export function ScrollViewSection() {
  const view$ = new Timeless.vm.ScrollViewCore({});
  return Section("ScrollView", [
    Item("Thin scrollbar", [
      View({ class: "gallery-scroll-view-box" }, [
        ScrollView({ class: "gallery-scroll-view", store: view$ }, [
          View(
            { class: "gallery-stack" },
            Array.from({ length: 24 }, (_, i) =>
              View({ class: "gallery-scroll-row" }, [`Row ${i + 1}`]),
            ),
          ),
        ]),
      ]),
    ]),
  ]);
}

export function AffixSection() {
  // 画廊的滚动发生在外层 .gallery-root（height:100vh; overflow-y:auto），
  // 因此把 Affix 的滚动目标指向它；默认 window 在本页永远不滚动。
  return Section("Affix", [
    Item("Scroll the page — the bar pins 16px below the top", [
      Affix(
        {
          store: new Timeless.vm.AffixCore({ top: 16 }),
          offsetTop: 16,
          target: () => document.querySelector(".gallery-root"),
          class: "gallery-affix-bar",
        },
        ["Affix — pinned 16px from the top"],
      ),
    ]),
    Item("Scroll filler", [
      View(
        { class: "gallery-stack" },
        Array.from({ length: 8 }, (_, i) =>
          View({ class: "gallery-filler-row" }, [`Filler row ${i + 1}`]),
        ),
      ),
    ]),
  ]);
}

export function WaterfallSection() {
  const NAMES = [
    "project-archive.zip",
    "design-assets.psd",
    "video-tutorial.mp4",
    "database-backup.sql",
    "photo-gallery.jpg",
    "report-2024.pdf",
    "music-collection.mp3",
    "source-code.tar.gz",
    "presentation.pptx",
    "firmware-update.bin",
  ];
  let nextId = 1;
  function generate(count) {
    return Array.from({ length: count }, () => {
      const id = nextId++;
      return {
        id,
        name: NAMES[(id - 1) % NAMES.length],
        height: 72 + ((id * 37) % 4) * 24,
      };
    });
  }

  const waterfall = Timeless.vm.WaterfallModel({
    column: 2,
    size: 8,
    buffer: 4,
    gutter: 12,
  });
  let total = 24;
  waterfall.methods.appendItems(generate(total));
  const total$ = ref(total);

  const scroll$ = new Timeless.vm.ScrollViewCore({
    onScroll(pos) {
      waterfall.methods.handleScroll({ scrollTop: pos.scrollTop });
    },
    onReachBottom() {
      waterfall.methods.appendItems(generate(8));
      total += 8;
      total$.as(total);
      scroll$.finishLoadingMore();
    },
  });

  return Section("Waterfall", [
    Item("Two columns · virtualized · infinite scroll", [
      View({ class: "gallery-waterfall-box" }, [
        ScrollView({ store: scroll$, class: "gallery-scroll-view" }, [
          Waterfall({
            store: waterfall,
            class: "is-embedded",
            render(task) {
              return View({ class: "gallery-waterfall-card" }, [
                View({ class: "gallery-waterfall-card-title" }, [task.name]),
                View(
                  { class: "gallery-waterfall-card-meta" },
                  [`${task.height}px`],
                ),
              ]);
            },
          }),
        ]),
      ]),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// Tree
// ---------------------------------------------------------------------------

function format_size(bytes) {
  if (typeof bytes !== "number") return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/** 文件图标 / 体积格式化都是**应用层**的事，通过 renderIcon / renderMeta 注入。 */
function tree_file_icon(title) {
  const ext = String(title).split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg", "gif"].includes(ext))
    return "file-image";
  if (["mp4", "mov", "webm"].includes(ext)) return "file-video-camera";
  if (["mp3", "wav", "flac"].includes(ext)) return "file-volume";
  if (["js", "ts", "html", "css", "json", "md"].includes(ext)) return "file-code";
  if (["zip", "tar", "gz", "7z"].includes(ext)) return "file-box";
  return "file-text";
}

function render_tree_icon(node, is_dir) {
  return [
    Icon({ name: is_dir ? "folder" : tree_file_icon(node.title), size: 15 }),
  ];
}

function render_tree_meta(node, is_dir) {
  if (is_dir) return [`${(node.children || []).length} 项`];
  return [node.size ? format_size(node.size) : ""];
}

function demo_file(title, size) {
  return { title, size };
}

function demo_dir(title, children) {
  return { title, children };
}

function make_tree_demo_nodes() {
  return [
    demo_dir("Documents", [
      demo_file("report.pdf", 2457600),
      demo_file("notes.txt", 1240),
      demo_file("README.md", 512),
    ]),
    demo_dir("Images", [
      demo_file("photo.jpg", 3145728),
      demo_file("logo.svg", 4096),
      demo_dir("icons", [
        demo_file("hero.png", 88000),
        demo_file("badge.webp", 15360),
      ]),
    ]),
    demo_dir("Videos", [
      demo_file("clip.mp4", 104857600),
      demo_file("demo.mov", 52428800),
    ]),
    demo_dir("Code", [
      demo_file("app.js", 20480),
      demo_file("index.html", 3072),
      demo_file("data.json", 65536),
    ]),
    demo_file("archive.zip", 134217728),
  ];
}

/** 50 目录 × 100 文件 = 5050 行，用来验证虚拟滚动只挂可视区那几十行。 */
function make_tree_big_nodes() {
  const dirs = [];
  for (let d = 0; d < 50; d += 1) {
    const files = [];
    for (let f = 0; f < 100; f += 1) {
      files.push(
        demo_file(`file-${String(f).padStart(3, "0")}.txt`, 1024 * (f + 1)),
      );
    }
    dirs.push(demo_dir(`folder-${String(d).padStart(3, "0")}`, files));
  }
  return dirs;
}

function tree_count_rows(nodes) {
  let total = 0;
  for (const node of nodes || []) {
    total += 1;
    if (Array.isArray(node.children)) total += tree_count_rows(node.children);
  }
  return total;
}

export function TreeSection() {
  const move_ = ref("拖动任意行试试：上 / 下 25% 调整顺序，中间 50% 移入目录。");
  const check_ = ref("勾选一个父目录，整棵子树会跟着勾上；取消一个子项，父目录变半选。");
  const big_note_ = ref("尚未生成");

  const demo$ = new Timeless.vm.TreeCore({
    nodes: make_tree_demo_nodes(),
    draggable: true,
    checkable: true,
    multiple: true,
    onMove(info) {
      move_.as(
        `《${info.node.title}》→ ${info.to.parentKey || "根级"} #${info.to.index}`,
      );
    },
    onCheck(_key, _checked, info) {
      check_.as(
        `已勾选 ${info.checkedKeys.size} 项，半选 ${info.halfCheckedKeys.size} 项`,
      );
    },
  });

  const big$ = new Timeless.vm.TreeCore({ draggable: true, checkable: true });

  function text_button(label, onClick) {
    return Button(
      {
        store: new Timeless.vm.ButtonCore({
          variant: "outline",
          size: "sm",
          onClick,
        }),
      },
      [label],
    );
  }

  function note(text_) {
    return View(
      {
        style: {
          "font-size": "var(--font-size-sm)",
          color: "var(--muted-foreground)",
          "min-height": "1.25rem",
        },
      },
      [text_],
    );
  }

  return Section("Tree", [
    Item("文件树 · 展开折叠 / 拖拽 / 多选", [
      View(
        {
          style: {
            width: "520px",
            display: "flex",
            "flex-direction": "column",
            gap: "0.5rem",
          },
        },
        [
          View(
            { style: { display: "flex", gap: "0.5rem", "flex-wrap": "wrap" } },
            [
              text_button("展开全部", () => demo$.expandAll()),
              text_button("折叠全部", () => demo$.collapseAll()),
              text_button("清空勾选", () => demo$.uncheckAll()),
              text_button("重置", () => demo$.setNodes(make_tree_demo_nodes())),
            ],
          ),
          Timeless.animal.Tree({
            store: demo$,
            maxHeight: 320,
            renderIcon: render_tree_icon,
            renderMeta: render_tree_meta,
          }),
          note(move_),
          note(check_),
        ],
      ),
    ]),
    Item("虚拟滚动 · 5050 行", [
      View(
        {
          style: {
            width: "520px",
            display: "flex",
            "flex-direction": "column",
            gap: "0.5rem",
          },
        },
        [
          View(
            { style: { display: "flex", gap: "0.5rem", "flex-wrap": "wrap" } },
            [
              text_button("生成 5050 行", () => {
                const t0 = performance.now();
                const nodes = make_tree_big_nodes();
                big$.setNodes(nodes);
                big$.expandAll();
                const build_ms = (performance.now() - t0).toFixed(1);
                // 等一帧再数：同步数到的是「还没挂行的那个时刻」。
                requestAnimationFrame(() => {
                  const mounted = document.querySelectorAll(
                    '[n="tree-scroll"] [data-tree-row-id]',
                  ).length;
                  big_note_.as(
                    `${tree_count_rows(nodes)} 行 · 建树 ${build_ms}ms · 当前 DOM 里挂了约 ${mounted} 行`,
                  );
                });
              }),
              text_button("折叠全部", () => big$.collapseAll()),
              text_button("清空", () => {
                big$.setNodes([]);
                big_note_.as("已清空");
              }),
            ],
          ),
          Timeless.animal.Tree({
            store: big$,
            maxHeight: 320,
            emptyText: "还没有生成大树",
          }),
          note(big_note_),
        ],
      ),
    ]),
  ]);
}

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------

/** 一个六节点执行图，覆盖全部五种状态，并且有两条流动边。 */
function make_flow_demo() {
  const node = (id, x, y, label, desc, status) =>
    new Timeless.vm.FlowNodeModel({
      id,
      position: { x, y },
      data: desc ? { label, desc } : { label },
      execution: { status, logs: [] },
    });

  return new Timeless.vm.FlowCanvasModel({
    nodes: [
      node("trigger", 0, 140, "手动触发", "", "completed"),
      node("fetch", 180, 140, "抓取页面", "HTTP / CDP", "completed"),
      node("parse", 380, 140, "解析响应", "", "running"),
      node("img", 580, 40, "img 提取", "", "failed"),
      node("css", 580, 240, "css 提取", "命中缓存", "skipped"),
      node("save", 780, 140, "保存结果", "", "pending"),
    ],
    edges: [
      { id: "e1", source: "trigger", target: "fetch", type: "bezier" },
      {
        id: "e2",
        source: "fetch",
        target: "parse",
        type: "bezier",
        animated: true,
      },
      {
        id: "e3",
        source: "parse",
        target: "img",
        type: "bezier",
        animated: true,
      },
      { id: "e4", source: "parse", target: "css", type: "bezier" },
      { id: "e5", source: "parse", target: "save", type: "bezier" },
      { id: "e6", source: "img", target: "save", type: "bezier" },
      { id: "e7", source: "css", target: "save", type: "bezier" },
    ],
    isValidConnection: (conn) => conn.source !== conn.target,
  });
}

export function FlowSection() {
  const flow$ = make_flow_demo();
  const rerun_count = { n: 0 };
  const note_ = ref(
    "拖动节点 / 滚轮缩放 / 空白处平移；悬浮节点上方会浮出动作条，失败节点多一个「重试」。",
  );

  // 失败节点的「重试」会 emit NodeRerun —— 这个订阅入口就是从画廊侧验证缺陷修复。
  flow$.onNodeRerun((params) => {
    rerun_count.n += 1;
    note_.as(
      `NodeRerun 已收到 ${rerun_count.n} 次：《${params.node.data.label}》`,
    );
  });

  flow$.fitView({ padding: 40 });

  function flow_button(label, onClick) {
    return Button(
      {
        store: new Timeless.vm.ButtonCore({
          variant: "outline",
          size: "sm",
          onClick,
        }),
      },
      [label],
    );
  }

  return Section("Flow", [
    Item("执行图 · 拖拽 / 缩放 / 状态色 / 流动边", [
      View(
        {
          style: {
            width: "100%",
            display: "flex",
            "flex-direction": "column",
            gap: "0.5rem",
          },
        },
        [
          View({ style: { display: "flex", gap: "0.5rem", "flex-wrap": "wrap" } }, [
            flow_button("适配视图", () => flow$.fitView({ padding: 40 })),
            flow_button("重置视图", () => flow$.resetView()),
          ]),
          View(
            {
              style: {
                position: "relative",
                width: "100%",
                height: "420px",
                border: "1px solid var(--border)",
                "border-radius": "var(--radius-lg)",
                overflow: "hidden",
              },
            },
            [
              Timeless.animal.FlowCanvasView({
                store: flow$,
                showBackground: true,
                backgroundVariant: "dots",
                showControls: true,
                showMinimap: true,
              }),
            ],
          ),
          View(
            {
              style: {
                "font-size": "var(--font-size-sm)",
                color: "var(--muted-foreground)",
                "min-height": "1.25rem",
              },
            },
            [note_],
          ),
        ],
      ),
    ]),
  ]);
}

