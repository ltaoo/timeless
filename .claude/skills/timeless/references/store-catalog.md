# Core/Store 类速查

所有控制器（Core/Store）类的构造函数、状态结构和可用方法。Core 类通过 `new CoreClass({...})` 创建。

---

## 基础控件

### ButtonCore

```js
new ButtonCore({
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
});
```

| 方法 | 说明 |
|------|------|
| `click()` | 触发点击逻辑 |
| `disable()` / `enable()` | 禁用/启用 |
| `setLoading(bool)` | 设置加载状态 |
| `setVariant(v)` | 设置变体样式 |
| `setSize(s)` | 设置尺寸 |
| `onClick(handler)` | 订阅点击事件 |
| `onStateChange(handler)` | 订阅状态变化（返回取消函数） |

**state:** `{ variant, size, loading, disabled }`

---

### InputCore\<T\>

```js
new InputCore({
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  onChange?: (value: T) => void;
});
```

| 方法 | 说明 |
|------|------|
| `setValue(v)` | 设置值 |
| `setDisabled(b)` | 设置禁用 |
| `focus()` | 聚焦 |
| `blur()` | 失焦 |
| `clear()` | 清空值 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value, focus, disabled, status, allowClear, loading }`

---

### NumberInputCore

```js
new NumberInputCore({
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  onChange?: (v: number) => void;
});
```

| 方法 | 说明 |
|------|------|
| `increase()` / `decrease()` | 增减 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value, canIncrease, canDecrease, disabled }`

---

## 选择控件

### SelectCore\<T\>

```js
new SelectCore({
  defaultValue?: T;
  options: Array<{ value: T; label: string; disabled?: boolean }>;
  onChange?: (v: T) => void;
  search?: boolean;         // 开启搜索
  allowClear?: boolean;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
});
```

| 方法 | 说明 |
|------|------|
| `select(value)` | 选中项 |
| `show()` / `hide()` | 打开/关闭下拉 |
| `setOptions(opts)` | 更新选项 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value, options, open, focused, disabled, loading, allowClear, search, searchKeyword }`

---

### CascaderCore\<T\>

```js
new CascaderCore({
  options: Array<{
    value: T;
    label: string;
    children?: CascaderOption<T>[];
  }>;
  value?: T[];
  onChange?: (v: T[]) => void;
  allowClear?: boolean;
  search?: boolean;
});
```

| 方法 | 说明 |
|------|------|
| `select(path)` | 选择路径 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value, open, allowClear, panels, searchKeyword, searchResults, search }`

---

### CheckboxCore

```js
new CheckboxCore({
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
});
```

| 方法 | 说明 |
|------|------|
| `toggle()` | 翻转 |
| `check()` / `uncheck()` | 勾选/取消 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ checked, disabled }`

---

### SwitchCore（同用于 Toggle）

```js
new SwitchCore({
  checked?: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
});
```

| 方法 | 说明 |
|------|------|
| `toggle()` | 翻转 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ checked, disabled }`

---

### CheckboxGroupCore\<T\>

```js
new CheckboxGroupCore({
  options: Array<{
    label: string;
    value: T;
    checked?: boolean;
    disabled?: boolean;
  }>;
  onChange?: (values: T[]) => void;
});
```

| 方法 | 说明 |
|------|------|
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ options: Array<{ label, value, core: CheckboxCore }> }`

---

### RadioGroupCore\<T\>

```js
new RadioGroupCore({
  value?: T;
  options: Array<{
    label: string;
    value: T;
    disabled?: boolean;
  }>;
  onChange?: (v: T) => void;
});
```

| 方法 | 说明 |
|------|------|
| `select(v)` | 选中项 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value, options }`

---

## 弹层/浮层

### DialogCore

```js
new DialogCore({
  title?: string;
  footer?: boolean;          // 是否显示底部按钮
  closeable?: boolean;       // 是否可关闭
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  onShow?: () => void;
  onHide?: () => void;
});
```

| 方法 | 说明 |
|------|------|
| `show()` | 打开 |
| `hide()` | 关闭 |
| `ok()` / `cancel()` | 确认/取消 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ title, footer, closeable, enter, exit }`
**子 store:** `cancelBtn: ButtonCore`, `okBtn: ButtonCore`
**presence store:** `presence.state = { enter, exit, mounted }`（动画状态）

---

### PopoverCore

```js
new PopoverCore({
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  onOpenChange?: (open: boolean) => void;
});
```

| 方法 | 说明 |
|------|------|
| `open()` / `close()` / `toggle()` | 打开/关闭/切换 |
| `onStateChange(handler)` | 订阅状态变化 |

---

### TooltipCore

全局单例模式，`TooltipProvider` 管理。通常不直接实例化。

```js
// 使用 Tooltip 组件时自动管理
Tooltip({ content: [...], side: "top" }, [trigger]);
```

---

### ContextMenuCore

```js
new ContextMenuCore({
  items: Array<MenuItemCore | MenuSeparatorCore | MenuGroupCore>;
});
```

| 方法 | 说明 |
|------|------|
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ items: Array<...>; 每项含: { focused, disabled, label, icon, shortcut, checked } }`

---

### DropdownMenuCore

```js
new DropdownMenuCore({
  items: Array<MenuItemCore | MenuSeparatorCore | MenuGroupCore>;
});
```

| 方法 | 说明 |
|------|------|
| `toggle()` / `hide()` | 打开/关闭 |
| `onStateChange(handler)` | 订阅状态变化 |

---

### MenuCore / MenuItemCore

```js
new MenuCore({
  items: Array<MenuItemCore | MenuSeparatorCore | MenuGroupCore>;
});

new MenuItemCore({
  label: string;
  icon?: ViewChildren;
  shortcut?: string;
  disabled?: boolean;
  variant?: "default" | "destructive";
  onClick?: () => void;
});

// MenuGroupCore: { label: string; items: MenuItemCore[] }
// MenuSeparatorCore: {}
// MenuCheckboxCore: { checked, onChange }  — 菜单中的复选框项
// MenuRadioGroupCore / MenuRadioItemCore — 菜单中的 Radio 项
```

---

### PopconfirmCore

```js
new PopconfirmCore({
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
});
```

| 方法 | 说明 |
|------|------|
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ enter, exit, loading }`

---

## Toast / 通知

### ToastCore

```js
new ToastCore({});
```

| 方法 | 说明 |
|------|------|
| `show({ texts: string[] })` | 显示通知 |
| `hide()` | 隐藏 |
| `onStateChange(handler)` | 订阅状态变化 |

### ToasterModel / ToastModel（Sonner 风格）

```js
const toaster$ = new ToasterModel();
// state: { toasts: ToastModel[] }
// 通过 toaster$.add({...}) 或全局方法发送通知
```

---

## 表单

### SingleFieldCore\<T\>

```js
new SingleFieldCore({
  label?: string;
  name?: string;
  help?: string;
  input: InputCore<T> | SelectCore<T> | ...;  // 绑定的输入控件
  rules?: Array<{
    required?: boolean;
    message?: string;
    pattern?: RegExp;
    min?: number;
    max?: number;
    validator?: (v: T) => boolean | string;
  }>;
});
```

| 方法 | 说明 |
|------|------|
| `validate()` | 执行验证，返回 `{ error?, data? }` |
| `reset()` | 重置值和错误 |
| `onStateChange(handler)` | 订阅状态变化 |
| `onError(handler)` | 订阅错误事件 |

**state:** `{ label, help, error?: { message } }`
**派生:** `name`, `id`（从 props 获取或自动生成）

---

### ObjectFieldCore\<T\>

```js
new ObjectFieldCore({
  fields: Record<string, SingleFieldCore | ObjectFieldCore | ArrayFieldCore>;
});
```

| 方法 | 说明 |
|------|------|
| `validate()` | 递归验证所有字段，返回 `{ error?, data }` |
| `reset()` | 重置所有字段 |

### ArrayFieldCore\<T\>

```js
new ArrayFieldCore({
  fields: Array<ObjectFieldCore>;
});
```

---

## 导航

### TabHeaderCore\<T\>

```js
new TabHeaderCore({
  selected?: string;
  options: Array<{
    label: string;
    value: T;
    content?: ViewChildren;
  }>;
  onChange?: (v: T) => void;
});
```

| 方法 | 说明 |
|------|------|
| `selectTab(value)` | 切换标签 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ curId, tabs: Array<{ value, label, content }> }`

---

### AccordionCore

```js
new AccordionCore({
  type?: "single" | "multiple";  // 单个展开 或 多个展开
  defaultValue?: string | string[];
});
```

| 方法 | 说明 |
|------|------|
| `toggle(index)` | 切换某项展开/折叠 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ openItems: number[] }`

---

### StepCore

```js
new StepCore({
  value?: number;  // 当前步骤索引（从 0 开始）
  onChange?: (step: number) => void;
});
```

| 方法 | 说明 |
|------|------|
| `next()` / `prev()` / `goTo(n)` | 切换步骤 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ value }`

---

## 图编辑 / Flow

### FlowCanvasModel

```js
new FlowCanvasModel({
  nodes?: FlowNodeModel[];
  edges?: FlowEdgeModel[];
  viewport?: { x: number; y: number; zoom: number };
  nodesConnectable?: boolean;
});
```

| 方法 | 说明 |
|------|------|
| `setViewport(v)` | 设置视口 |
| `zoomIn()` / `zoomOut()` | 缩放 |
| `resetView()` / `fitView()` | 重置/适应视图 |
| `clearSelection()` | 清除选中 |
| `refreshEdgesPosition()` | 刷新边位置 |
| `onNodesChange(h)` / `onEdgesChange(h)` | 节点/边变化事件 |
| `onViewportChange(h)` | 视口变化事件 |
| `emit(event, data)` | 触发事件 |

**state:** `{ nodes, edges, viewport, nodesConnectable }`

### FlowNodeModel

```js
new FlowNodeModel({
  id: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
  type?: string;
});
```

| 方法 | 说明 |
|------|------|
| `pointerDown(e)` / `pointerMove(e)` / `pointerUp(e)` | 拖拽交互 |
| `setHovering(b)` | 设置悬停 |
| `click()` | 点击 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ position{x,y}, dragging, selected, hovering, data, handles[], execution{status} }`

### FlowEdgeModel

```js
new FlowEdgeModel({
  id: string;
  source: string;  // 源节点 ID
  target: string;  // 目标节点 ID
  animated?: boolean;
});
```

| 方法 | 说明 |
|------|------|
| `toggle()` | 切换选中 |
| `onStateChange(handler)` | 订阅状态变化 |

**state:** `{ d (path), selected, animated }`

### FlowHandleModel

```js
new FlowHandleModel({
  id: string;
  type: "source" | "target";
  position: "top" | "bottom" | "left" | "right";
  nodeId: string;
});
```

**state:** `{ id, type, idx, position }`

---

## 布局 / 滚动

### ScrollViewCore

```js
new ScrollViewCore({
  horizontal?: "auto" | "hidden" | "visible" | "scroll";
  vertical?: "auto" | "hidden" | "visible" | "scroll";
});
```

### ResizablePanelsCore / ResizablePanelCore

```js
new ResizablePanelsCore({
  direction: "horizontal" | "vertical";
});

new ResizablePanelCore({
  defaultSize: number;  // 百分比
  minSize?: number;
  maxSize?: number;
});
```

### AffixCore

```js
new AffixCore({
  offsetTop?: number;
  offsetBottom?: number;
});
```

---

## 其他

### PresenceCore

控制进出场动画：

```js
new PresenceCore({});

// 方法：enter(), exit()
// state: { enter, exit, mounted }
// 用于 Transition 组件或需要动画的组件内部
```

### ProgressCore

```js
new ProgressCore({
  value?: number;
  max?: number;
});
```

### FilePickerCore

```js
new FilePickerCore({
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
});
```

---

## 通用 Store 模式

所有 Core 类共享以下接口模式：

```js
// 状态订阅
const unsub = store.onStateChange((state) => {
  // state 是 store.state 的快照
  // 在 UI 组件中用 state.as(store.state) 同步到响应式 ref
});

// 状态访问
store.state  // 当前状态的引用

// 清理
unsub();     // 取消订阅
```

### 在自定义 View 组件中使用 Store

```js
export function MyCustomView(props, children) {
  const { store, ...rest } = props;
  const state = ref(store.state);
  const events = [];

  events.push(store.onStateChange(() => {
    state.as(store.state);
  }));

  return View({
    ...rest,
    class: computed({ state }, (d) => d.state.active ? "active" : ""),
    onClick() { store.doSomething(); },
    onUnmounted() {
      for (const fn of events) if (typeof fn === 'function') fn();
    },
  }, children);
}
```
