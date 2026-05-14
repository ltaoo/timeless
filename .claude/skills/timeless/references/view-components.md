# 视图组件 API 完整参考

所有内置视图组件的详细 API。这些函数均为全局变量。

---

## `View(props, children)` — 通用容器

最基础的容器组件，渲染为 `<div>`（可通过 `as` 指定其他标签）。

```js
View({
  as: "div",              // HTML 标签名（默认 "div"）
  id: "my-id",            // 元素 ID，支持 ref<string>
  key: "unique-key",      // 列表渲染时的唯一键
  class: "cls1 cls2",     // CSS 类名，支持 string | ref<string> | computed<string>
  style: "color:red",     // 内联样式，支持 string | ref<string> | 对象（值可为 ref）
  dataset: { key: "v" },  // data-* 属性
  draggable: true,        // 是否可拖拽
  attributes: {},         // 额外 HTML 属性 Record<string, any>

  // 生命周期
  onMounted(event) {},    // 挂载后回调 (event: { reason?, target, error? })
  beforeUnmounted() {},   // 卸载前回调
  onUnmounted() {},       // 卸载后回调 — 在此清理订阅

  // 鼠标事件
  onClick(e) {}, onDoubleClick(e) {}, onContextMenu(e) {},
  onMouseDown(e) {}, onMouseUp(e) {}, onMouseEnter(e) {}, onMouseLeave(e) {}, onMouseMove(e) {},

  // 指针/触摸事件
  onPointerDown(e) {}, onPointerUp(e) {}, onLongPress(e: PointerEvent) {},

  // 输入事件
  onInput(e) {}, onChange(e) {}, onFocus(e) {}, onBlur(e) {},

  // 键盘事件
  onKeyDown(e) {}, onKeyUp(e) {},

  // 拖拽事件
  onDragStart(e) {}, onDrag(e) {}, onDragEnd(e) {},
  onDragEnter(e) {}, onDragOver(e) {}, onDragLeave(e) {}, onDrop(e) {},

  // 其他
  onWheel(e) {}, onAnimationEnd(e) {},
}, children);
```

### children 类型

`children` 可以是：
- 单个 `TimelessElement`（View/Show/For 等返回值）
- `string | number` — 自动包装为 `Text`
- `Ref | DerivedRef` — 自动包装为响应式 `Text`
- `null | undefined` — 渲染为空
- 数组（上述类型的混合）
- 返回上述类型的函数（懒解析）

```js
View({}, [
  "plain text",                    // → Text("plain text")
  Txt("explicit text"),            // 显式 Text
  someRef,                         // → Text(someRef) 响应式文本
  View({ class: "child" }, [...]), // 子元素
  condition && View({}, [...]),    // 条件子元素
]);
```

---

## `Txt(stringOrRef)` — 文本节点

```js
Txt("Hello World");
Txt(someRef);         // ref<string> — 自动订阅，值变自动更新
Txt(someComputed);    // computed<string> — 同上
Txt(42);              // 数字自动转字符串
```

---

## `Show({ when }, children)` — 条件渲染

```js
Show({
  when: someBoolRef,         // ref<boolean> | computed<boolean> | boolean
  ok: () => [Txt("显示内容")],  // when 为真时渲染
  else: () => [Txt("隐藏内容")], // when 为假时渲染（可选）
  onMounted(event) {},
  beforeUnmounted() {},
  onUnmounted() {},
}, fallbackChildren);  // fallbackChildren 用于 when 为假时的默认内容
```

- `when` 变化时，旧子元素完整卸载（beforeUnmounted + onUnmounted），新子元素重新构建和挂载
- `ok()` / `else()` 是工厂函数，每次切换时重新调用

**简写形式（只有一个子元素时）：**
```js
Show({ when: someBoolRef }, [Txt("显示")]);
// 等价于 Show({ when: someBoolRef, ok: () => [Txt("显示")] })
```

---

## `For({ each, render })` — 列表渲染

```js
For({
  key: "optional-key",       // 可选，用于对象引用匹配
  each: reactiveArray,       // T[] | ref<T[]> | computed<T[]> | reactiveArray<T>
  render(item, idx) {
    // item: T — 当前项
    // idx: DerivedRef<number> — 响应式索引（自动重算）
    return View({ key: item.id }, [Txt(item.name)]);
  },
  onMounted(event) {},
  beforeUnmounted() {},
  onUnmounted() {},
});
```

### 智能差异更新

当 `each` 是 ref 数组时，For 订阅 `onPatch` 实现增量更新：

- `push` / `insert` → 只插入新元素，不移除已有元素
- `delete` / `remove` → 只移除对应元素
- `move` / `swap` → 只调整 DOM 顺序
- `as` / `assign` / `splice` → 完整重新渲染

```js
// 示例：点击按钮添加列表项
const items = reactiveArray([{ id: 1, name: "A" }, { id: 2, name: "B" }]);

View({}, [
  For({ each: items, render(item, idx) {
    return View({ class: "p-2" }, [Txt(item.name)]);
  }}),
  Button({ store: addBtn }, [Txt("Add")]),
]);

addBtn.onClick(() => {
  items.push({ id: Date.now(), name: "New" }); // 只插入新项，不重渲染全部
});
```

---

## `Switch({ when, fallback? }, [Match(...), Match(...)])` — 多分支条件

```js
Switch({
  when: computed(store.state, s => s.tab),  // ref<any> | any — 匹配值
  fallback: () => [Txt("Not Found")],        // 无匹配时的默认内容
  onMounted() {}, beforeUnmounted() {}, onUnmounted() {},
}, [
  Match("tab1", () => [Txt("Tab 1 Content")]),   // 精确匹配
  Match("tab2", () => [Txt("Tab 2 Content")]),
]);
```

- `Match` 的第一个参数是匹配键（字符串或数字）
- 切换时旧内容完整卸载，新内容构建挂载
- 支持 SSR/hydration 的 `render()` 和 `hydrate()` 方法

---

## `Fragment(props, children)` — 无包装分组

不创建 DOM 元素，只管理子元素的生命周期。

```js
Fragment({
  onMounted() {}, beforeUnmounted() {}, onUnmounted() {},
}, [
  View({}, [...]),
  View({}, [...]),
]);
// 渲染为两个平级 div，没有外层包裹
```

- `isFragment(v)` 类型守卫

---

## `Portal(props, children)` — 挂载到 body

将子元素渲染到 `document.body`，脱离当前 DOM 层级。

```js
Portal({
  onMounted(e) {}, beforeUnmounted() {}, onUnmounted() {},
}, [
  Dialog({ store: dialog$ }, [...]),
]);
```

适用于模态框、下拉菜单、Tooltip 等需要避开父级 overflow 限制的场景。

---

## `LazyView(loader, props?, children?)` — 懒加载

```js
LazyView(
  () => import("@/pages/HeavyPage.js"),  // 返回 Promise<{ default: Component }>
  { placeholder: [Txt("Loading...")] },   // 加载前占位内容
  children,
);
```

- 组件异步加载，加载完成后自动挂载
- 支持 HMR
- 未加载时显示 `placeholder`
- 加载失败时显示错误 fallback（支持 `ErrorFallback` prop 或 `useErrorBoundary`）

---

## 布局组件

### `Flex(props, children)` — 弹性布局

```js
Flex({
  direction: "col",           // "col" | "col-reverse" | "reverse"
  justify: "center",          // "start" | "end" | "center" | "between" | "around" | "evenly"
  items: "center",            // "start" | "end" | "center" | "baseline" | "stretch"
  gap: 4,                     // 间隙（数字自动转 rem：4 → "1rem"）
  class: "flex-wrap",         // 额外 class
  ...viewProps,               // 支持所有 View props
}, children);
```

### `Grid(props, children)` — 网格布局

```js
Grid({
  cols: 3,                    // 列数 | { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }
  rows: 2,                    // 行数
  gap: 16,                    // 统一间距（px）
  gapX: 8,                    // 列间距（px）
  gapY: 8,                    // 行间距（px）
  flow: "row",                // "row" | "col" | "dense" | "row-dense" | "col-dense"
  alignItems: "center",
  justifyItems: "start",
  marginBottom / marginTop / marginLeft / marginRight / padding: number,
  ...viewProps,
}, children);
```

### `Row(props, children)` — 水平弹性布局

```js
Row({
  gap: 4,                     // 间隙，支持 ref<number>
  wrap: true,                 // 是否换行
  direction: "row",           // "row" | "column" | "row-reverse" | "column-reverse"
  align: "center",            // "start" | "end" | "center" | "stretch" | "baseline"
  justify: "between",         // "start" | "end" | "center" | "between" | "around" | "evenly"
  ...viewProps,
}, children);
```

### `Column(props, children)` — 垂直弹性布局

```js
Column({
  gap: 4,
  align: "center",
  justify: "start",
  ...viewProps,
}, children);
```

### `Col(props, children)` — 弹性/网格子项

```js
Col({
  flex: 1,                    // flex 值，支持响应式 { sm: 1, md: 2 }
  width: "200px",
  span: 6,                    // 栅格列跨度
  start: 1,                   // 栅格起始列
  offset: 2,                  // 偏移
  padding: 16,
  ...viewProps,
}, children);
```

### `SplitView(props)` — 可调整分割面板

```js
SplitView({
  direction: "horizontal",    // "horizontal" | "vertical"
  panels: [
    { size: "200px", style: {}, content: [leftPanel] },
    { size: "1fr", style: {}, content: [rightPanel] },
  ],
  onResize(sizes) {},
});
```

### `ScrollView(props, children)` — 可滚动容器

```js
ScrollView({
  horizontal: "auto",         // "auto" | "hidden" | "visible" | "scroll"
  vertical: "auto",
  contentWidth: 800,
  contentHeight: 600,
  ...viewProps,
}, children);

// 实例方法（通过 $elm 访问）
// scrollTo(x, y), scrollToTop(), scrollToBottom()
```

---

## 其他内容组件

### `RichText(props)` — HTML 内容

```js
RichText({ content: "<strong>bold</strong>" });
RichText({ content: htmlRef });  // 支持 ref | computed
```

### `Img(props)` — 图片

```js
Img({
  src: "url",                 // 支持 ref<string>
  alt: "description",
  loading: "lazy",            // "eager" | "lazy"
  decoding: "async",
  crossOrigin: "anonymous",
  srcset: "url1 1x, url2 2x",
  sizes: "(max-width: 600px) 100vw",
  onLoad(e) {}, onError(e) {},
});
```

### `AspectRatio(props, children)` — 宽高比容器

```js
AspectRatio({ ratio: 16/9 }, [content]);  // ratio 默认 1
```
