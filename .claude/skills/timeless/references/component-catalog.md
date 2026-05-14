# shadcn 组件速查

所有 shadcn 组件的 store 类型、props 和用法示例。组件均为全局函数，无需 import。Core 类通过 `new` 创建。

---

## 基础交互

### Button

**Store:** `ButtonCore`

```js
const btn$ = new ButtonCore({ variant: "default", size: "default" });
Button({ store: btn$, variant: "default", size: "default" }, [Txt("Click")]);

// variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
// size: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
// store 方法：click(), disable(), enable(), setLoading(bool), setVariant(v), setSize(s)
// store 事件：onClick(handler), onStateChange(handler)
// state: { variant, size, loading, disabled }
```

### Input

**Store:** `InputCore<any>`

```js
const input$ = new InputCore({ defaultValue: "", placeholder: "请输入" });
Input({ store: input$, id: "name" });
// store 方法：setValue(v), setDisabled(b), focus(), blur()
// state: { value, focus, disabled, status, allowClear, loading }
```

### Textarea

**Store:** `InputCore<any>`

```js
const ta$ = new InputCore({ defaultValue: "" });
Textarea({ store: ta$, id: "desc", showClear: true, showCount: true });
// 同 InputCore，增加了 showClear / showLoading / showCount 控制
```

### NumberInput

**Store:** `NumberInputCore`

```js
const num$ = new NumberInputCore({ min: 0, max: 100, step: 5 });
NumberInput({ store: num$, showControls: true });
// state: { canIncrease, canDecrease, disabled }
```

---

## 选择器

### Select

**Store:** `SelectCore<any>`

```js
const select$ = new SelectCore({
  defaultValue: "a",
  options: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ],
  onChange(v) {},
});
Select({ store: select$, id: "my-select" });
// state: { value, options, open, focused, disabled, loading, allowClear, search, searchKeyword }
// 方法：select(v), show(), hide(), setOptions(opts)
// options 可分组: { label: "Group", items: [{value, label}] }
```

### SearchSelect

**Store:** `SelectCore<any>`

```js
SearchSelect({ store: new SelectCore({ options: [...], search: true }) });
// 带搜索功能的 Select 变体
```

### Cascader

**Store:** `CascaderCore<any>`

```js
const cascader$ = new CascaderCore({
  options: [
    { value: "a", label: "A", children: [
      { value: "a1", label: "A-1" }
    ]},
  ],
});
Cascader({ store: cascader$, id: "my-cascader" });
// state: { value, open, allowClear, panels, searchKeyword, searchResults, search }
```

### Checkbox

**Store:** `CheckboxCore`

```js
const cb$ = new CheckboxCore({ checked: true });
Checkbox({ store: cb$ });
// state: { checked, disabled }
// 方法：toggle(), check(), uncheck()
```

### CheckboxGroup

**Store:** `CheckboxGroupCore<any>`

```js
const cbg$ = new CheckboxGroupCore({
  options: [
    { label: "A", value: "a" },
    { label: "B", value: "b" },
  ],
});
CheckboxGroup({ store: cbg$, direction: "horizontal" });  // 或 "vertical"
```

### RadioGroup

**Store:** `RadioGroupCore<any>`

```js
const rg$ = new RadioGroupCore({
  value: "a",
  options: [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ],
});
RadioGroup({ store: rg$, direction: "horizontal" });
```

### Switch / Toggle

**Store:** `SwitchCore`

```js
const sw$ = new SwitchCore({ checked: false });
Switch({ store: sw$ });
// state: { checked, disabled }
// Toggle 是 Switch 的另一种视觉样式
Toggle({ store: sw$ });
```

### Slider

**无 Store**（使用本地 ref）

```js
Slider({ value: 50, min: 0, max: 100, step: 1, onChange(v) {} });
```

---

## 弹层/浮层

### Dialog

**Store:** `DialogCore`

```js
const dialog$ = new DialogCore({ title: "标题", footer: true });
Dialog({ store: dialog$ }, [
  Txt("内容文本"),
]);
// 方法：show(), hide(), ok(), cancel()
// 子 store: dialog$.cancelBtn (ButtonCore), dialog$.okBtn (ButtonCore)
// 事件：onOk(handler), onCancel(handler), onShow(handler), onHide(handler)
// state: { title, footer, closeable, enter, exit }
// 动画状态通过 store.presence.state { enter, exit, mounted }
```

### Sheet

**Store:** `DialogCore`（复用 DialogCore）

```js
Sheet({ store: new DialogCore({ title: "面板" }), side: "right" }, [content]);
// side: "right" | "top" | "bottom" | "left"
```

### Popover

**Store:** `PopoverCore`

```js
const pop$ = new PopoverCore({ side: "bottom" });
Popover({ store: pop$, content: [Txt("弹出内容")] }, [
  Button({ store: new ButtonCore({}) }, [Txt("触发")]),
]);
// state: presence.state { enter, exit }
```

### Tooltip

**Store:** `TooltipCore`（内部全局单例）

```js
Tooltip({ content: [Txt("提示文本")], side: "top", align: "center" }, [
  Button({ store: btn$ }, [Txt("悬停")]),
]);
// 需要包裹在 TooltipProvider 中（全局共享 store）
// TooltipProvider({}, [Tooltip(...), Tooltip(...)])
```

### Popconfirm

**Store:** `PopconfirmCore`

```js
Popconfirm({
  store: new PopconfirmCore({}),
  title: [Txt("确认删除？")],
  description: [Txt("此操作不可撤销")],
  confirmText: "确认",
  cancelText: "取消",
}, [
  Button({ store: btn$ }, [Txt("删除")]),
]);
// state: { enter, exit, loading }
// 事件：onConfirm(handler), onCancel(handler)
```

### Menu

**Store:** `MenuCore`

```js
// 手动构建菜单
Menu({ store: new MenuCore({ items: [...] }) });
// items 可以是 MenuItemCore, MenuSeparatorCore, MenuGroupCore
```

### DropdownMenu

**Store:** `DropdownMenuCore`

```js
const dm$ = new DropdownMenuCore({
  items: [
    new MenuItemCore({ label: "Edit", onClick() {} }),
    new MenuItemCore({ label: "Delete", variant: "destructive" }),
    // MenuSeparatorCore, MenuGroupCore, MenuCheckboxCore, MenuRadioGroupCore
  ],
});
DropdownMenu({ store: dm$ }, [
  Button({ store: new ButtonCore({}) }, [Txt("菜单")]),
]);
```

### ContextMenu

**Store:** `ContextMenuCore`

```js
const cm$ = new ContextMenuCore({
  items: [
    new MenuItemCore({ label: "Copy", onClick() {} }),
  ],
});
ContextMenu({ store: cm$ }, [
  View({ class: "w-64 h-64" }, [Txt("右键此区域")]),
]);
```

---

## 导航与结构

### Tabs

**Store:** `TabHeaderCore<any>`

```js
const tabs$ = new TabHeaderCore({
  selected: "tab1",
  options: [
    { label: "Tab 1", value: "tab1", content: [Txt("Content 1")] },
    { label: "Tab 2", value: "tab2", content: [Txt("Content 2")] },
  ],
});
Tabs({ store: tabs$ });
// state: { curId, tabs }
```

### Accordion

**Store:** `AccordionCore`

```js
const acc$ = new AccordionCore({ type: "single" });  // 或 "multiple"
Accordion({ store: acc$, items: [
  { title: [Txt("Q1")], content: [Txt("A1")] },
  { title: [Txt("Q2")], content: [Txt("A2")] },
]});
// state: { openItems: number[] }
```

### Steps

**Store:** `StepCore`

```js
const steps$ = new StepCore({ value: 0 });
Steps({ store: steps$, items: [
  { title: "Step 1", description: "First step" },
  { title: "Step 2", description: "Second step" },
]});
// state: { value } — 当前步骤索引
```

### Breadcrumb / Pagination

见具体使用场景或使用自定义 View 组合。

---

## 数据展示

### Table

**无 Store**（纯展示组件）

```js
Table({}, [
  TableHeader({}, [
    TableRow({}, [
      TableHead({}, [Txt("Name")]),
      TableHead({}, [Txt("Email")]),
    ]),
  ]),
  TableBody({}, [
    TableRow({}, [
      TableCell({}, [Txt("John")]),
      TableCell({}, [Txt("john@example.com")]),
    ]),
  ]),
]);
```

### Card

**无 Store**

```js
Card({ class: "w-96" }, [
  CardHeader({}, [
    CardTitle({}, [Txt("Title")]),
    CardDescription({}, [Txt("Description")]),
  ]),
  CardContent({}, [Txt("Body content")]),
  CardFooter({}, [Button({ store: btn$ }, [Txt("Action")])]),
]);
```

### Badge

**无 Store**

```js
Badge({ variant: "default" }, [Txt("Tag")]);
// variant: "default" | "secondary" | "outline" | "destructive"
```

### Avatar

**无 Store**

```js
Avatar({ src: "url.jpg", alt: "User", size: "default", fallback: "JD" });
// size: "sm" | "default" | "lg" | "large"
// fallback: src 加载失败时显示的文字缩写
```

### Skeleton

**无 Store**

```js
Skeleton({ class: "h-4 w-full rounded" });
```

### Progress

**Store（可选）:** `ProgressCore`

```js
Progress({ value: ref(60), max: 100 });
// 或使用 store:
Progress({ store: new ProgressCore({ value: 0, max: 100 }) });
```

### Alert

**无 Store**

```js
Alert({ variant: "default" }, [
  AlertTitle({}, [Txt("Title")]),
  AlertDescription({}, [Txt("Description text")]),
]);
// variant: "default" | "destructive"
```

### Separator

**无 Store**

```js
Separator({ orientation: "horizontal" });
// orientation: "horizontal" | "vertical"
```

### Kbd / KbdGroup

**无 Store**

```js
Kbd({}, [Txt("⌘")]);
KbdGroup({}, [Kbd({}, [Txt("⌘")]), Kbd({}, [Txt("K")])]);
```

---

## 表单相关

### Field

**Store:** `SingleFieldCore<any>`

```js
const field$ = new SingleFieldCore({
  label: "Email",
  name: "email",
  input: new InputCore({ defaultValue: "", placeholder: "email@example.com" }),
  rules: [{ required: true, message: "必填" }],
});
Field({ store: field$ }, [
  Input({ store: field$.input }),
]);
// 子组件: FieldLabel, FieldDescription, FieldError, FieldHelp
// 方法: field$.validate() → { error?, data }
```

### Form

**Store:** `ObjectFieldCore<any>` 或 `ArrayFieldCore<any>`

```js
const form$ = new ObjectFieldCore({
  fields: {
    name: field1$,
    email: field2$,
  },
});
Form({ store: form$ }, [
  Field({ store: form$.fields.name }, [...]),
  Field({ store: form$.fields.email }, [...]),
]);
// 方法: form$.validate() → { error?, data }
```

### Label

**无 Store**

```js
Label({}, [Txt("Label text")]);
```

---

## Toast / 通知

### Toast（Sonner 风格）

**Store:** `ToasterModel` / `ToastModel`

```js
// 1. 全局挂载 Toaster
const toaster$ = new ToasterModel();
Toaster({ store: toaster$, position: "bottom-right" });
// position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"

// 2. 发送通知
// 通过 toaster$ 或全局方法
toast$.show({ texts: ["操作成功！"] });  // toast$ 是 ToastCore 实例
```

### Toast（旧版）

**Store:** `ToastCore`

```js
const toast$ = new ToastCore({});
Toast({ store: toast$ });
toast$.show({ texts: ["Done!"] });
```

---

## 日期时间

### DatePicker

**Store:** `DatePickerCore`

```js
const dp$ = new DatePickerCore({ value: new Date() });
DatePicker({ store: dp$, placeholder: "选择日期" });
// state: value, allowClear
// 内部子 store: $calendar, $presence
```

### DateRangePicker

**Store:** `DateRangePickerCore`

```js
const drp$ = new DateRangePickerCore({ value: [startDate, endDate] });
DateRangePicker({ store: drp$ });
// state: value, startDate, endDate
// 内部子 store: $calendar { startDate, endDate, hoverDate, left.weeks, right.weeks }
```

### TimePicker

**Store:** `TimePickerCore`

```js
const tp$ = new TimePickerCore({ value: "12:00" });
TimePicker({ store: tp$ });
```

### DateTimePicker

**Store:** 组合使用 `DatePickerCore` + `TimePickerCore`

```js
DateTimePicker({ store: { date: datePicker$, time: timePicker$ } });
```

---

## 图编辑 / Flow

### FlowCanvasView

**Store:** `FlowCanvasModel`

```js
const flow$ = new FlowCanvasModel({
  nodes: [node1, node2],
  edges: [edge1],
  viewport: { x: 0, y: 0, zoom: 1 },
  nodesConnectable: true,
});
FlowCanvasView({ store: flow$ });
// 方法: setViewport(), zoomIn(), zoomOut(), resetView(), fitView(),
//       clearSelection(), refreshEdgesPosition()
// 事件: onNodesChange(), onEdgesChange(), onViewportChange(), emit()
// state: { nodes, edges, viewport }
```

### FlowNodeView

**Store:** `FlowNodeModel`

```js
// state: { position{x,y}, dragging, selected, hovering, data, handles[], execution{status} }
// 方法: pointerDown(), pointerMove(), pointerUp(), setHovering(), click(), onStateChange()
```

### FlowEdgeView

**Store:** `FlowEdgeModel`

```js
// state: { d (path string), selected, animated }
// 方法: toggle(), onStateChange()
```

### FlowHandle

```js
// state: { id, type, idx, position } — 节点连接点
```

---

## 其他

### ScrollView / ScrollArea

**Store（ScrollView）:** `ScrollViewCore`

```js
ScrollView({ store: new ScrollViewCore() }, [content]);
// ScrollArea 无 store，纯 CSS overflow-auto
ScrollArea({ class: "h-64" }, [content]);
```

### ResizablePanels

**Store:** `ResizablePanelsCore` / `ResizablePanelCore`

```js
ResizablePanels({ store: new ResizablePanelsCore({ direction: "horizontal" }) }, [
  ResizablePanel({ store: panel1$, defaultSize: 30 }, [left]),
  ResizableHandle({}),
  ResizablePanel({ store: panel2$, defaultSize: 70 }, [right]),
]);
```

### Affix

**Store:** `AffixCore`

```js
Affix({ store: new AffixCore({ offsetTop: 0 }) }, [content]);
// 固定位置组件，支持滚动时切换固定状态
```

### FileInput / FilePicker

**Store:** `FilePickerCore`

```js
FileInput({ store: new FilePickerCore({}) });
// state: { value, loading }
```

### AspectRatio

**无 Store**

```js
AspectRatio({ ratio: 16/9 }, [content]);
```

### Waterfall

**Store:** `WaterfallModel<T>`

```js
Waterfall({ store: new WaterfallModel({ items: [...] }) });
// 瀑布流/虚拟滚动布局
```
