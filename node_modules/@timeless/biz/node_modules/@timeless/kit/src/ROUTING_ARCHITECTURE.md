# Timeless 路由架构设计文档

## 一、核心理念：视图驱动，平台无关

Timeless 路由系统的核心设计哲学是 **视图优先（View-First）**：

- 路由的本质是**视图的管理**，而非 URL 的管理
- 内部维护一套完整的视图栈（stacks）作为**唯一真实数据源（Single Source of Truth）**
- URL 只是内部视图状态的**外部镜像**，用于序列化/持久化当前导航状态
- 整个路由核心（`@timeless/kit`）**完全不依赖任何平台 API**（无 `window`、无 `history`、无 `popstate`）

**初始化流程**：外部传入当前 URL → 解析 → 确定应渲染的视图树 → 渲染

**导航流程**：`push()` → 内部视图栈变更 → 将新状态同步为 URL → 平台适配器将 URL 写入浏览器

**浏览器回退流程**：浏览器 popstate → 平台适配器转发 → 内部视图栈响应 → URL 同步

---

## 二、分层架构

```
┌─────────────────────────────────────────────────────┐
│                   HistoryCore (编排层)                │
│      视图栈(stacks) + 栈指针(cursor) + 路由 API      │
│      push / replace / back / forward                │
├────────────────────────┬────────────────────────────┤
│    RouteViewCore       │     NavigatorCore           │
│    (视图层)             │     (URL 状态层)            │
│    树形视图、生命周期    │     地址解析、URL 状态存储   │
│    show/hide/animate   │     内部 histories 管理     │
├────────────────────────┴────────────────────────────┤
│              BaseDomain (事件总线 mitt)               │
├─────────────────────────────────────────────────────┤
│         Platform Adapter (平台适配层，外部)           │
│    provider-web / provider-native / provider-...    │
│    监听事件 → 调用平台 API (pushState/popstate/...)  │
└─────────────────────────────────────────────────────┘
```

| 类               | 文件                          | 职责                                                                             |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `HistoryCore`    | `history/index.ts`            | **统一入口**。管理视图栈、栈指针、视图缓存池，提供 push/replace/back/forward API |
| `RouteViewCore`  | `route_view/index.ts`         | **视图实例**。树形父子关系、显示/隐藏生命周期、动画控制                          |
| `NavigatorCore`  | `navigator/index.ts`          | **URL 状态容器**。解析 URL、存储当前 pathname/href/query、维护内部 histories     |
| Platform Adapter | `provider-web/src/history.ts` | **外部**。监听路由事件 → 调用浏览器 API；监听浏览器事件 → 转发给路由核心         |

三层核心类均继承 `BaseDomain`，通过 `mitt` 事件总线通信，彼此无直接依赖。

---

## 三、RouteViewCore — 视图实例

> 文件：`packages/kit/src/route_view/index.ts`

### 3.1 树形视图结构

每个路由对应一个 `RouteViewCore` 实例，实例之间通过 `parent` / `subViews[]` / `curView` 形成树：

```
root                        ← 根布局 (isRoot=true)
 ├── home_layout            ← 首页布局 (layout=true)
 │    ├── index             ← 首页
 │    └── explore           ← 发现页
 └── article_layout         ← 文章布局 (layout=true)
      ├── article_list      ← 文章列表
      └── article_detail    ← 文章详情
```

关键字段：

| 字段         | 含义                                                     |
| ------------ | -------------------------------------------------------- |
| `parent`     | 父视图引用                                               |
| `subViews[]` | 已加载的子视图列表                                       |
| `curView`    | **当前活跃子视图**，同一时刻每个父视图只有一个子视图可见 |
| `visible`    | 可见状态（委托给 `PresenceCore`）                        |
| `mounted`    | 是否挂载在 DOM 上（动画期间仍为 true）                   |

### 3.2 唯一标识

```typescript
get href() {
  return [this.pathname, qs_stringify(this.query)].filter(Boolean).join("?");
}
```

`href = pathname + ? + query` 构成视图的唯一 key。同一 pathname 带不同 query 算作不同视图实例。

### 3.3 生命周期

```
构造完成
  │
  ├── Mounted ──→ BeforeShow ──→ show() ──→ Show (可见)
  │                                        │
  │                               (被替换/返回)
  │                                        │
  │                              BeforeHide ──→ hide() ──→ Hidden
  │                                                      │
  │                                              (退出动画结束)
  │                                                      │
  │                                                   Unmounted ──→ destroy()
  │
  ├── Layered (被其他视图覆盖)
  └── Uncover (覆盖自身的视图移开)
```

| 事件         | 触发时机                       |
| ------------ | ------------------------------ |
| `Mounted`    | 视图挂载到页面                 |
| `BeforeShow` | 即将变为可见                   |
| `Show`       | 进入动画完成，真正可见         |
| `BeforeHide` | 即将隐藏                       |
| `Hidden`     | 退出动画完成，不可见           |
| `Unmounted`  | 从页面卸载，可触发 `destroy()` |
| `Layered`    | 被另一个视图覆盖（如弹窗场景） |
| `Uncover`    | 覆盖层移走                     |

### 3.4 核心方法

#### `showView(subView, options)`

父视图将一个子视图设为可见：

```
1. 自身不可见？→ 递归让 parent.showView(this) 先使自身可见
2. 有旧 curView？→ curView.hide() 隐藏旧视图（触发退出动画）
3. appendView(subView) → 加入 subViews 列表
4. curView = subView
5. subView.show() → 触发进入动画
```

#### `removeView(view, options)`

移除子视图：

```
1. 注册 onUnmounted 回调 → view.destroy() + 从 subViews 移除
2. view.hide() → 播放退出动画
3. destroy=false 时：仅隐藏不销毁，保留实例供后续复用
4. destroy=false 且 view === curView 时：主动清除 curView 引用
```

#### `hide(options)`

递归隐藏：先递归隐藏所有 `subViews`，再隐藏自身。

#### `findCurView()`

沿 `curView` 链递归找到最深层的活跃视图。

### 3.5 动画系统

每个视图可配置四种 CSS 动画类名：

```typescript
animation: {
  in: "fade-in",     // 进入
  out: "fade-out",   // 退出
  show?: string,     // 显示（可选）
  hide?: string,     // 隐藏（可选）
}
```

实际动画控制委托给 `PresenceCore`：`hide()` 时播放退出动画，动画结束后才触发 `Unmounted` 并卸载 DOM 节点，保证动画完整性。

### 3.6 路由配置构建

`route_view/utils.ts` 中 `build()` 将嵌套的声明式配置展开为扁平结构：

```typescript
// 声明式配置（嵌套）
{
  root: { pathname: "/", children: {
    home_layout: { pathname: "/home", children: {
      index: { pathname: "/home" }
    }}
  }}
}

// 展开后（扁平 Record<name, RouteConfig>）
{
  "root":                   { name: "root", pathname: "/", layout: true, parent: null },
  "root.home_layout":       { name: "root.home_layout", pathname: "/home", layout: true, parent: { name: "root" } },
  "root.home_layout.index": { name: "root.home_layout.index", pathname: "/home", parent: { name: "root.home_layout" } }
}
```

有 `children` 的节点自动标记 `layout: true`。名称通过 `parent.name.key` 的拼接方式保证全局唯一。

---

## 四、NavigatorCore — URL 状态容器

> 文件：`packages/kit/src/navigator/index.ts`
>
> 注释："仅负责「地址」的核心类，包括 URL 解析、应用等"

### 4.1 定位

NavigatorCore **不驱动导航**，它是一个纯粹的 URL 状态容器：

- **存储**当前 pathname、href、query
- **解析**外部传入的 URL（支持绝对/相对路径、前缀剥离）
- **维护**内部 histories 栈（用于前进/后退方向检测）
- **发出**事件供平台适配器消费

它不调用任何浏览器 API。`pushState` / `replaceState` 方法只是**更新内部状态 + 发出事件**，由外部适配器决定如何处理。

### 4.2 URL 解析

```typescript
static parse(url: string)
```

- 绝对路径（`http://`、`https://`、`//`）→ 完整解析 origin/protocol/host
- 相对路径 → 以 `http://localhost` 为 base，只提取 pathname/search
- 自动剥离 `NavigatorCore.prefix`（如 `/app` 部署前缀）

### 4.3 内部 Histories 管理

```typescript
histories: {
  (pathname, href);
}
[]; // 主历史栈
prevHistories: {
  (pathname, href);
}
[]; // 后退暂存栈
```

**前进/后退方向检测**：

浏览器 popstate 事件本身不区分前进与后退。NavigatorCore 通过两个栈的交互来判断：

```
pushState(url):
  histories.push({ pathname, href })
  → emit PushState

用户点击浏览器后退:
  histories 栈顶 → 移入 prevHistories
  → emit Back

用户点击浏览器前进:
  prevHistories 栈顶 → 弹回 histories
  → emit Forward
```

### 4.4 事件

| 事件              | 触发时机                     | 消费者                                       |
| ----------------- | ---------------------------- | -------------------------------------------- |
| `PushState`       | 内部调用 `pushState(url)`    | 平台适配器 → `window.history.pushState()`    |
| `ReplaceState`    | 内部调用 `replaceState(url)` | 平台适配器 → `window.history.replaceState()` |
| `Back`            | 检测到后退方向               | 平台适配器 → `history.back()`                |
| `Forward`         | 检测到前进方向               | 平台适配器 → `history.forward()`             |
| `PopState`        | 处理完 popstate 后           | 通用监听                                     |
| `HistoriesChange` | 历史栈变更                   | UI 展示                                      |

---

## 五、HistoryCore — 统一编排入口

> 文件：`packages/kit/src/history/index.ts`

### 5.1 核心数据

```typescript
stacks: RouteViewCore[]           // 导航栈：按 push 顺序排列的视图实例
cursor: number                    // 栈指针：当前活跃视图在 stacks 中的下标
views: Record<string, RouteViewCore>  // 视图缓存池，key = pathname?query 或路由名
$router: NavigatorCore            // URL 状态容器
$view: RouteViewCore              // 根视图
virtual: boolean                  // 虚拟模式（不改变外部 URL）
```

### 5.2 导航栈模型

```
stacks:  [ root, home, article_list, article_detail ]
cursor:                          0     1       2          3
                                           ↑ 当前位置

push(new_page):
  截断 stacks[3] 之后 → 追加 new_page → cursor = 4

back():
  cursor 移到 2 → 隐藏 article_detail (destroy=false)

forward():
  cursor 移回 3 → 重新显示 article_detail
```

**关键**：back/forward 时 `destroy=false`，视图仅隐藏不销毁。实例保留在 `stacks` 中，用户前进/后退时状态完全恢复。

### 5.3 核心操作

#### `push(name, query, options)`

**视图驱动的导航**。流程：

```
1. 查找路由配置 → 拼接 uniqueKey = pathname + query
2. 去重：uniqueKey === 当前 $router.href → 返回
3. views 缓存命中？
   ├── 是 → 复用已有 RouteViewCore 实例
   └── 否 → new RouteViewCore() → 存入 views 缓存
4. ensureParent(view) → 递归确保父视图链存在
5. 更新 $router.href = view.href （URL 状态同步）
6. stacks = stacks[0..cursor] + [view] （截断前进栈，追加新视图）
7. cursor++
8. parent.showView(view) → 视图切换（含动画）
9. emit(RouteChange, { reason: "push", view, ... })
```

第 5 步是关键：先完成视图栈变更，再将新状态写入 `$router.href`。URL 是视图状态的镜像，而非驱动者。

#### `replace(name, query)`

与 push 相同，但第 6 步变为**替换** `stacks[cursor]` 而非追加，cursor 不变。

#### `back(opt?)`

```
1. 从 $router.href 在 stacks 中查找目标视图下标
2. cursor = targetIndex
3. 隐藏 stacks[targetIndex+1..] 中所有视图（destroy=false）
4. 目标视图 visible 且有 curView？→ clearCurView() 清理子视图
5. parent.showView(targetView) → 显示目标
6. emit(RouteChange, { reason: "back", view, data })
```

可传入 `opt.data` 在页面间传递数据（如从列表页返回详情页时携带修改后的数据）。

#### `forward()`

与 back 对称，cursor 前进。

#### `destroyAllAndPush(name, query)`

销毁除根视图、根布局外的所有视图和缓存，然后 push 到目标。用于登出、重置等场景。

### 5.4 父视图自动创建 — `ensureParent()`

push 时如果目标视图的父视图不存在，递归创建：

```
push("root.article_layout.article_detail")

→ article_detail.parent 不存在
  → 查找 routes["root.article_layout.article_detail"].parent = { name: "root.article_layout" }
  → views["root.article_layout"] 不存在
    → 创建 article_layout RouteViewCore
    → article_layout.parent 不存在
      → 查找 routes["root.article_layout"].parent = { name: "root" }
      → views["root"] 已存在 → 关联
```

### 5.5 虚拟路由

`virtual = true` 时路由切换不向外同步 URL，适用于：

- 嵌套路由内部切换（外层 URL 不变）
- 弹窗/抽屉内的路由
- Tab 切换等不需要反映到 URL 的场景

---

## 六、平台适配层

> 文件：`packages/provider-web/src/history.ts`

平台适配器是路由核心与浏览器之间的**薄胶水层**，将核心事件翻译为平台 API：

```typescript
function connect(history: HistoryCore) {
  // 内部 push → 浏览器 pushState
  history.$router.onPushState(({ from, to, path }) => {
    window.history.pushState({ from, to }, "", path);
  });

  // 内部 replace → 浏览器 replaceState
  history.$router.onReplaceState(({ from, path }) => {
    window.history.replaceState({ from }, "", path);
  });

  // 浏览器 popstate → 内部 back/forward
  window.addEventListener("popstate", (event) => {
    const { pathname, href } = window.location;
    history.$router.handlePopState({ type: event.type, href, pathname });
    // handlePopState 内部 emit(Back/Forward)
    // → 适配器监听后调用 history.back() / history.forward()
  });

  // 点击 <a> 标签 → 拦截 → 内部处理
  document.addEventListener("click", (event) => {
    // 拦截站内链接，preventDefault，交给 history.handleClickLink()
  });
}
```

### 数据流

**主动导航（push/replace）**：

```
history.push("article", { id: "1" })
  │
  ├─ 内部：views 缓存 → 创建/复用视图 → stacks 变更 → cursor++
  ├─ 内部：$router.href = "/article?id=1"
  ├─ 内部：emit(RouteChange)
  │
  └─ NavigatorCore：emit(PushState, { path: "/article?id=1" })
       │
       └─ Platform Adapter：window.history.pushState(...)
            │
            └─ 浏览器地址栏更新
```

**浏览器后退**：

```
用户点击浏览器后退按钮
  │
  └─ 浏览器 popstate 事件
       │
       └─ Platform Adapter：history.$router.handlePopState({ type, pathname, href })
            │
            ├─ NavigatorCore：检测方向 → emit(Back)
            │     │
            │     └─ Platform Adapter：监听 Back → history.back()
            │           │
            │           └─ HistoryCore.back()
            │                 ├─ cursor-- → 在 stacks 中找到目标视图
            │                 ├─ 隐藏栈顶视图（destroy=false）
            │                 ├─ 显示目标视图
            │                 └─ emit(RouteChange)
            │
            └─ NavigatorCore：histories 栈顶 → 移入 prevHistories
```

---

## 七、关键设计决策

### 7.1 视图栈是唯一数据源

URL 不是驱动者，而是结果。`HistoryCore.stacks` + `cursor` 构成导航的唯一真实状态。URL 只是对该状态的序列化表达。这使得：

- 路由核心完全可测试（无需 mock 浏览器 API）
- 可适配任意平台（Web、Native、小程序、SSR）
- 虚拟路由等模式成为可能

### 7.2 视图缓存池

`views: Record<string, RouteViewCore>` 以 `pathname?query` 为 key 缓存所有视图实例：

- 同一 URL 再次 push → 直接复用，避免重复创建
- back/forward → 视图仅隐藏不销毁，状态完整保留
- `destroyAllAndPush()` → 强制清空缓存，用于重置场景

### 7.3 栈指针模型

用 `cursor` 指针而非数组增删来管理当前位置：

- back/forward → O(1) 移动指针
- push → O(n) 截断 + 追加
- 物理数组保留历史，逻辑位置由 cursor 决定

### 7.4 布局视图（Layout）

带 `children` 的路由自动成为布局视图（`layout: true`）。布局视图作为容器：

- 外层布局保持不动（不因子路由切换而重建）
- 内层内容区域通过 `curView` 切换
- 实现了嵌套路由的 UI 结构

### 7.5 PresenceCore 动画驱动

视图的 visible 状态由 `PresenceCore` 代理，`hide()` 触发退出动画，动画结束后才触发 `Unmounted`。这保证退出动画不会被提前中断。

### 7.6 平台无关的 URL 处理

`NavigatorCore.parse()` 使用标准 `URL` 构造函数（Node.js 和浏览器均支持），通过 try/catch 处理相对路径。`prefix` 机制支持子路径部署。整个 URL 处理不依赖浏览器特有 API。

---

## 八、与传统 SPA 路由的对比

| 维度         | React Router                              | Timeless 路由                   |
| ------------ | ----------------------------------------- | ------------------------------- |
| **数据源**   | URL 驱动（URL → 匹配路由 → 渲染组件）     | 视图驱动（视图栈 → 同步到 URL） |
| **平台依赖** | 依赖浏览器 history API                    | 平台无关，通过适配器对接        |
| **视图管理** | 声明式（React 渲染）                      | 命令式（显式 show/hide/mount）  |
| **动画**     | 需第三方（CSSTransition / framer-motion） | 内置 PresenceCore 动画系统      |
| **视图缓存** | 需手动实现 keep-alive                     | 自动缓存，back/forward 复用实例 |
| **状态保留** | 组件卸载即丢失状态                        | 视图隐藏不销毁，状态完整保留    |
| **导航栈**   | 隐式（浏览器管理）                        | 显式（stacks + cursor）         |
| **嵌套路由** | Outlet 声明式                             | 树形视图 + curView 命令式       |
