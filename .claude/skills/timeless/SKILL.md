---
name: timeless
description: Build pages and components with the Timeless framework (vanilla JS store-driven UI). Use when the user asks to create pages, components, dialogs, forms, lists, or any frontend UI in this project.
when_to_use: |
  User mentions: timeless, shadcn, build a page, create component, add dialog,
  make a form, render list, store-driven, reactive UI, shadcn component
allowed-tools: Bash(npm run *) Bash(pnpm *) Bash(npx *)
---

# Timeless Framework — 构建指南

Timeless 是一个纯 vanilla JS 的前端框架，采用 **Store-Driven Architecture**（控制器驱动视图）。

---

## 1. 核心理念

```
Core(state) → View(render) → User(event) → Core(method)
     ↑                                          |
     └──────────────────────────────────────────┘
```

- **Core（控制器）**：持有所有业务状态（state）和行为（methods）。用户交互触发 Core 方法修改状态。
- **View（视图组件）**：无状态的渲染层，从 Core 读取 state 渲染 UI，将用户事件委托给 Core 方法。
- **Reactive System**：状态变化自动触发视图更新，无需手动操作 DOM。

### 全局变量约定

所有 API（组件、响应式函数、Core 类）均挂载到 `window`，**编写 UI 文件时不需要 import**，直接使用全局变量即可：

```js
// 响应式
ref(0), computed(deps, fn), defineModel({...})

// 视图组件
View({...}, children), Show({ when, ok, else }), For({ each, render }), ...

// shadcn 组件
Button({ store }), Input({ store }), Dialog({ store }), ...

// Core 类
new ButtonCore({...}), new InputCore({...}), new DialogCore({...})
```

---

## 2. 决策树：我需要用什么？

| 用户需求 | 使用 |
|---------|------|
| 渲染文本 | `stringOrRef` |
| 容器 / div | `View({ class, style, ... }, children)` |
| 条件显示/隐藏 | `Show({ when: refOrComputed, ok(): ViewChildren, else(): ViewChildren })` |
| 渲染列表 | `For({ each: refArray, render(item, idx) })` |
| 多分支条件 | `Switch({ when, case: {} }])` |
| 按钮 | `Button({ store: new ButtonCore({...}) }, ["Label"])` |
| 文本输入 | `Input({ store: new InputCore({...}) })` |
| 多行文本 | `Textarea({ store: new InputCore({...}) })` |
| 数字输入 | `NumberInput({ store: new NumberInputCore({...}) })` |
| 下拉选择 | `Select({ store: new SelectCore({ options: [new SelectItemCore({ value, label })] }) })` |
| 级联选择 | `Cascader({ store: new CascaderCore({ options: [...] }) })` |
| 复选框 | `Checkbox({ store: new CheckboxCore({...}) })` |
| 复选框组 | `CheckboxGroup({ store: new CheckboxGroupCore({ options: [...] }) })` |
| 单选组 | `RadioGroup({ store: new RadioGroupCore({ options: [...] }) })` |
| 开关 | `Switch({ store: new SwitchCore({...}) })` / `Toggle({ store })` |
| 滑块 | `Slider({ value, min, max, onChange })` |
| 对话框/模态框 | `Dialog({ store: new DialogCore({...}) }, [content])` |
| 侧边抽屉 | `Sheet({ store: new DialogCore({...}), side: "right" }, [content])` |
| 弹出气泡 | `Popover({ store: new PopoverCore({...}), content: [...] }, [trigger])` |
| 工具提示 | `Tooltip({ content: [...], side: "top" }, [trigger])` |
| 下拉菜单 | `DropdownMenu({ store: new DropdownMenuCore({ items: [...] }) }, [trigger])` |
| 右键菜单 | `ContextMenu({ store: new ContextMenuCore({ items: [...] }) }, [target])` |
| 标签页 | `Tabs({ store: new TabHeaderCore({...}) })` |
| 折叠面板 | `Accordion({ store: new AccordionCore({...}), items: [...] })` |
| 表格 | `Table({}, [TableHeader({}, [...]), TableBody({}, [...])])` |
| 表单/验证 | `Field({ store: new SingleFieldCore({...}) })` / `Form({ store: new ObjectFieldCore({...}) })` |
| Toast/通知 | `Toast({ store }); toast$.show({ texts: ["Done!"] })` |
| 进度条 | `Progress({ value: ref(60), max: 100 })` |
| 骨架屏 | `Skeleton({ class: "h-4 w-full" })` |
| 日期选择 | `DatePicker({ store: new DatePickerCore({...}) })` |
| 日期范围 | `DateRangePicker({ store: new DateRangePickerCore({...}) })` |
| 时间选择 | `TimePicker({ store: new TimePickerCore({...}) })` |
| 步骤条 | `Steps({ store: new StepCore({...}), items: [...] })` |
| 节点图/流程图 | `FlowCanvasView({ store: new FlowCanvasModel({...}) })` |
| 可调整面板 | `ResizablePanels({ store: new ResizablePanelsCore({...}) })` |
| 虚拟滚动 | `ScrollView({ store: new ScrollViewCore({...}) })` |
| 弹性布局 | `Flex({ direction: "col", gap: 4 }, children)` |
| 卡片 | `Card({}, [CardHeader({}, [...]), CardContent({}, [...])])` |
| 徽章 | `Badge({ variant: "secondary" }, [Txt("Tag")])` |
| 头像 | `Avatar({ src: "url", fallback: "AB" })` |
| 分隔线 | `Separator({ orientation: "horizontal" })` |
| 提示框 | `Alert({ variant: "destructive" }, [AlertTitle({}, [...]), AlertDescription({}, [...])])` |

---

## 3. 组件创建标准模式（5 步）

每个自定义组件必须遵循此模式：

```js
export function MyComponent(props, children) {
  const { store, ...rest } = props;

  // 1. 用 ref 包装 store.state，作为响应式数据源
  const state = ref(store.state);

  // 2. 订阅 store 状态变化，收集取消订阅函数
  const events = [];
  events.push(store.onStateChange(() => {
    state.as(store.state);
  }));

  // 3. 用 computed 派生响应式 class/内容
  // 4. 在 View 事件回调中调用 store 方法
  // 5. 在 onUnmounted 中清理所有订阅
  return View({
    ...rest,
    class: computed({ state }, (d) => {
      return ["base-classes", d.state.active ? "active" : ""].filter(Boolean).join(" ");
    }),
    onClick() { store.handleClick(); },
    onUnmounted() {
      for (const fn of events) if (typeof fn === 'function') fn();
    },
  }, children);
}
```

### 三条铁律

1. **View 不持有业务状态** — 始终从 `store.state` 读取
2. **View 不直接修改状态** — 始终调用 `store.method()`，如 `store.click()`、`store.setValue()`、`store.toggle()`
3. **始终在 `onUnmounted` 中清理 `onStateChange` 订阅**

---

## 4. 响应式系统速查

```js
// === 基本 ref ===
const count = ref(0);           // 创建响应式值
count.value;                    // 读取（不触发订阅）
count.set(5);                   // 设值，触发通知
count.as(5);                    // 同 set，支持函数：count.as(v => v + 1)
count.update(v => v + 1);       // 通过函数更新
count.toggle();                 // 布尔翻转
count.increment(2);             // +2（默认 +1）
count.decrement(2);             // -2（默认 -1）

// === 响应式数组 ===
const list = refarr([]);           // 或 reactiveArray([]) / refarr([])
list.push(item);                // 触发 { type: "insert", index, items }
list.splice(idx, 1);            // 触发增量 patch
list.insert(idx, ...items);     // 指定位置插入
list.remove(item);              // 删除指定项
list.move(from, to);            // 移动
list.swap(a, b);                // 交换
list.as([...newItems]);         // 整体替换，触发 "refresh"
list.assign([...newItems]);     // 整体替换
// 还支持：pop, shift, unshift, sort, reverse, filter, map, find, forEach 等标准数组方法
// 扩展：toggle(item), removeBy(predicate), moveToFirst(idx), moveToLast(idx),
//       first(), last(), nth(n), count(), distinct(), groupBy(fn), chunk(size),
//       shuffle(), rotate(n), compact(), take(n), skip(n), isEmpty()

// === 响应式对象 ===
const obj = refobj({ a: 1 });   // 或 reactiveObject({})
obj.set('a', 2);                // 设值，触发通知
obj.get('a');                   // 读取
obj.delete('a');                // 删除键
obj.update('a', v => v + 1);    // 通过函数更新
obj.assign({ b: 3 });           // 浅合并
obj.merge({ nested: { c: 4 } });// 深合并
obj.as({ a: 10 });             // 整体替换
// 扩展：keys(), values(), entries(), has(key), isEmpty(), size(),
//       pick(...keys), omit(...keys), toggle(key), increment(key), decrement(key),
//       getIn("path.to.key"), setIn("path", val), hasIn("path"), mapValues(fn)

// === computed：派生值 ===
const double = computed(count, (t) => t * 2);        // 单 ref 依赖
// 选项：{ debounce: 300 } 或 { throttle: 100 }
// computed 返回只读 DerivedRef，只有 value 和 subscribe，无 set/as

// === derive / combine：多源派生（别名相同函数）===
const total = combine({ a, b, c }, (t) => t.a + t.b + t.c);     // 对象传入

// === signal：自动检测类型 ===
signal(0);       // 数字 → PrimitiveSignal (Ref)
signal({ a: 1 });// 对象 → ObjectSignal (RefObject)
signal([1,2,3]); // 数组 → ArraySignal (RefArray)
signal(existingRef); // 已是 ref → 原样返回

// === 清理 ===
const unsub = ref.subscribe({ onChange(v) {...} });
unsub();                       // 取消单个订阅
ref.destroy();                 // 清除所有订阅
release(ref);                  // 从全局注册表移除（不调用 destroy）
release_all();                 // 清空全局注册表

// === 关键陷阱 ===
// 1. 始终用 .as() 复制对象值，不要直接修改原对象
//    ❌ state.value.items.push(x)      — 不会触发更新
//    ✅ state.as(store.state)           — 正确触发通知
// 2. computed 返回只读，不能调用 .set() / .as()
// 3. 数组 refarr 用 .push() 方法而非 .value.push()
```

---

## 5. 页面标准写法

> 详见 [references/page-pattern.md](references/page-pattern.md)

每个页面由 **Model 文件**（`*.model.js`）+ **View 文件**（`*.js`）组成：

```
pages/home/
  index.model.js    ← HomePageModel()：状态 + 方法 + UI Core
  index.js          ← HomePageView()：实例化 Model，组装视图
```

三种 Model 模式：

| 场景 | 模式 | 返回值 |
|------|------|--------|
| 有 API 请求、列表分页、CRUD | `defineModel({ state, methods, ui, services, listeners })` | defineModel 包装对象 |
| 纯前端状态、配置页 | `Timeless.base()` 事件总线 + `onStateChange` | `{ state, methods, ui, onStateChange, destroy }` |
| 只有表单、无复杂状态 | 简单返回 | `{ ui }` |

```js
// Model（defineModel 模式）
/** @param {ViewComponentProps} props */
export function HomePageModel(props) {
  const items_ = refarr([]);
  const ui = { view_page$: new Timeless.ui.ScrollViewCore({}) };
  const methods = { async init() { /* 加载数据 */ } };
  return defineModel({ state: { items: items_ }, methods, ui });
}

// View — props 类型为 ViewComponentProps（见 apps/web-shadcn/types/global.d.ts）
// 包含：view, views, history, app, client, storage
/** @param {ViewComponentProps} props */
export default function HomePageView(props) {
  const vm$ = HomePageModel(props);
  return ScrollView({
    store: vm$.ui.view_page$,
    onMounted() { vm$.methods.init(); },
  }, [ For({ each: vm$.state.items, render(item) { /* ... */ } }) ]);
}
```

---

## 6. View 组件 Props 参考

```js
View({
  id: "my-id",            // 支持 ref<string>
  class: "cls",           // 支持 string | ref<string> | computed<string>
  style: { color: '#ccc', 'background-color': '#fff' },     // 支持 object | ref<object> | 对象
  dataset: { key: "v" },  // data-* 属性
  draggable: true,
  attributes: {},         // 额外 HTML 属性

  // 生命周期
  onMounted(event) {},    // 挂载后回调，递归触发子元素
  onUnmounted() {},       // 卸载后回调 — 清理订阅在此

  // 事件
  onClick(e) {}, onDoubleClick(e) {}, onContextMenu(e) {},
  onMouseDown(e) {}, onMouseUp(e) {}, onMouseEnter(e) {}, onMouseLeave(e) {}, onMouseMove(e) {},
  onPointerDown(e) {}, onPointerUp(e) {}, onLongPress(e) {},
  onInput(e) {}, onChange(e) {}, onFocus(e) {}, onBlur(e) {},
  onKeyDown(e) {}, onKeyUp(e) {},
  onDragStart(e) {}, onDrag(e) {}, onDragEnd(e) {}, onDragEnter(e) {}, onDragOver(e) {}, onDragLeave(e) {}, onDrop(e) {},
  onWheel(e) {}, onAnimationEnd(e) {},
}, children)
```

---

## 7. 路由

> 详见 [references/routing.md](references/routing.md)

关键 API 速查：

```js
// 路由配置 → src/store/index.js
const routes_configure = {
  home_layout: { title: "首页", pathname: "/home", component: HomeLayoutView, children: { ... } },
  login: { title: "登录", pathname: "/login", component: Timeless.lazy("@/pages/login/index.js") },
  notfound: { title: "404", pathname: "/notfound", component: NotFoundPageView, notfound: true },
};
const router = Timeless.buildRoutes(routes_configure);

// 导航
history$.push("root.home_layout.index.form", {});          // push 跳转
history$.replace("root.login", { redirect: route.name });  // replace
history$.push("root.home_layout", {}, { ignore: true });   // 不更新 URL

// 权限守卫 → options.require: ["login"]
```

---

## 8. 网络请求

> 详见 [references/request.md](references/request.md)

关键 API 速查：

```js
// request_factory — 业务接口封装（推荐）
import { request } from "@/biz/request.js";
request.get("/api/fruit", params);
request.post("/api/items", data);

// HttpClientCore — 全局客户端
const client$ = new Timeless.HttpClientCore({ headers: {...} });
client$.appendHeaders({ Authorization: token });

// 返回值：{ data, error } — 始终检查 r.error
const r = await someRequest(params);
if (r.error) { app.tip?.({ text: [r.error.message] }); return; }
```

### ChannelCore — 双向通道 / Velo 事件推送

`ChannelCore` 和 `HttpClientCore` 是同一层概念：它本身就是 provider-facing core，不要给它传 `client$`。底层由 provider 接管，例如 Velo 中使用 `provide_channel()` 对接 `window.onGoMessage` 和 `window.invoke`。

适用场景：

- Go/Native 主动向前端推送消息，例如 Velo `b.SendMessage({ type: "download_progress", ... })`
- 前端需要通过同一个通道向 host 提交对象消息
- 非请求-响应模型，不要用 `RequestCore`

```js
// app 初始化时调用一次 provider
// Velo 项目：import { provide_channel } from "@timeless/provider-velo";
provide_channel();

// 业务侧：直接 new ChannelCore(endpoint)
const channel$ = new Timeless.ChannelCore("/eventnamelisten");

channel$.onConnected(() => {
  console.log("channel connected");
});

// onMessage 接收对象本身，不是 { data, raw } 包装
channel$.onMessage((msg) => {
  if (msg.type === "download_progress") {
    console.log(msg.percentage);
  }
});

// sendMessage 提交对象
channel$.sendMessage({ type: "ping", payload: { now: Date.now() } });
```

如果需要手动接管连接时机：

```js
provide_channel(undefined, { autoConnect: false });

const channel$ = new Timeless.ChannelCore("/eventnamelisten");
await channel$.connect();
```

常见错误：

- 不要写 `new ChannelCore("/event", { client: client$ })`，`ChannelCore` 不需要 client
- 不要把 Go 推送事件包装成 HTTP 请求；`b.SendMessage(...)` 对应 `channel$.onMessage(...)`
- `onMessage` 的入参就是业务对象；只有底层 provider/调试场景才需要 raw/meta
- Velo 中 `sendMessage(obj)` 会调用 `invoke(channel.endpoint, { method: "POST", args: obj })`

---

## 9. 常见陷阱

1. **忘记在 onUnmounted 中清理订阅** — `store.onStateChange()` 返回取消函数，必须收集并在 `onUnmounted` 中逐一调用
2. **直接修改响应式对象** — 使用 `.as()`、`.set()` 或 `.update()`，不要 `state.value.someProp = x`
3. **应该用 ref 的变量没用 ref** — 需要响应式更新的变量必须用 `ref()` 包装
4. **不给组件传 store** — 所有带状态组件都需要 `store` prop
5. **ref 数组 vs .value** — 用 `list.push(item)` 而非 `list.value.push(item)`；前者触发增量通知，后者只触发 refresh
6. **computed 的 deps 格式错误** — 传给 computed 的 deps 里的 ref 必须是 ref 对象本身，不能是 `.value`
7. **把 ChannelCore 当 RequestCore 用** — `ChannelCore` 对应 `HttpClientCore`，provider 接管底层连接，不传 `client$`

---

## 10. 参考文件索引

需要更详细的 API 时，读取对应的 reference 文件：

| 需求 | 文件 |
|------|------|
| 完整响应式 API（ref, computed, signal, derive, reactiveArray, reactiveObject） | [references/reactive-api.md](references/reactive-api.md) |
| 视图组件 API（View, Txt, Show, For, Match, Portal, Fragment, Flex, Grid 等） | [references/view-components.md](references/view-components.md) |
| 所有 shadcn 组件速查（props, store 类型, 用法示例） | [references/component-catalog.md](references/component-catalog.md) |
| 所有 Core 类速查（构造函数参数, state 结构, 方法, 事件） | [references/store-catalog.md](references/store-catalog.md) |
| 页面标准写法（Model + View 双文件、defineModel、base 事件总线） | [references/page-pattern.md](references/page-pattern.md) |
| 路由系统（配置、导航、守卫、链接处理） | [references/routing.md](references/routing.md) |
| 网络请求（HttpClientCore, request_factory, 接口封装） | [references/request.md](references/request.md) |
| 双向通道（ChannelCore, Velo SendMessage, provider-velo） | 本文第 8 节 ChannelCore |

### 示例文件

| 需求 | 文件 |
|------|------|
| 构建一个简单页面（标题 + 列表 + 按钮） | [examples/simple-page.md](examples/simple-page.md) |
| 弹窗表单（Dialog + Form） | [examples/dialog-form.md](examples/dialog-form.md) |
| 列表 CRUD（增删改查 + 响应式数组） | [examples/list-crud.md](examples/list-crud.md) |

---

## 11. 样式约定

- 使用 **Tailwind CSS** 类名，支持 `dark:` 前缀
- `View({ class: "flex items-center gap-2 p-4" })` — 内联 Tailwind 类名
- `style` 支持响应式对象（值可以是 ref）：

```js
View({
  style: {
    'background-color': bgColorRef,  // ref<string> 支持动态更新
    width: computed(count, v => `${v * 10}px`),
  }
})
```
