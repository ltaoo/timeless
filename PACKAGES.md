# Timeless 包架构文档

## 项目概述

Timeless 是一个**平台无关的前端框架**，核心理念是"一次编写，多平台运行"。它提供：

1. **响应式数据系统** — 类似 Vue 的 `ref`/`computed`/`signal`
2. **平台无关的抽象组件** — 用 `View`/`Input` 替代 `div`/`input`，类似 Taro
3. **无头 UI 状态机** — 60+ 组件的交互逻辑，与平台和样式完全解耦
4. **现成业务套件** — 路由、HTTP 请求、数据持久化、导航等开箱即用
5. **多平台渲染器** — DOM / SSR / Canvas / Native / TUI 五种渲染目标
6. **多设计系统** — shadcn/ui 和 WeChat WeUI 两套带样式组件库

## 架构分层

```
┌──────────────────────────────────────────────────────┐
│                  用户应用 (apps/)                      │
├──────────────────────────────────────────────────────┤
│  shadcn / weui        │  solidjs / vue               │
│  (带样式组件)           │  (框架适配器)                  │
├──────────────────────────────────────────────────────┤
│  ui-primitive          │  a2ui (JSON→UI)             │
│  (无样式 DOM 绑定)      │                              │
├──────────────────────────────────────────────────────┤
│           @timeless/timeless (框架核心 barrel)         │
├──────────┬──────────┬──────────┬─────────────────────┤
│ reactive │ primitive│ inner-vm │ inner-kit           │
│ (响应式)  │ (VNode)  │ (状态机)  │ (应用服务)           │
├──────────┴──────────┴──────────┴─────────────────────┤
│              inner-base (事件/Result/平台抽象)         │
│              inner-types (TS 类型工具)                 │
│              inner-utils (dayjs/工具函数)              │
└──────────────────────────────────────────────────────┘
```

## inner- 包（原子构建块）

`inner-` 前缀表示这是不可再分的原子包，不直接面向用户，只作为构建块被上层组合。

---

### `@timeless/inner-base` — 基石

**职责**：事件系统、Result 类型、Logger、平台抽象

**关键导出**：
- `base()` / `BaseDomain` — 基于 mitt 的事件系统（`on`/`off`/`emit`）
- `Result.Ok<T>()` / `Result.Err()` — Rust 风格的错误处理
- `BizError` — 业务错误类
- `Platform` — 平台抽象接口（addEventListener、getBoundingClientRect 等）
- `Logger` — 日志工具
- `debounce` / `throttle` — 防抖节流

**依赖**：仅有 `mitt`（200 字节的事件发射器）

**地位**：所有包最终都依赖它。相当于"标准库中的 std"。

---

### `@timeless/inner-reactive` — 响应式系统

**职责**：细粒度响应式原语，类似 Vue 3 的 reactivity 包

**关键导出**：
- `ref(value)` — 响应式引用，类似 Vue 的 `ref()`
- `computed(fn)` — 计算属性，自动追踪依赖
- `signal()` — 信号原语（比 ref 更底层）
- `defineModel(options)` — 模型定义，组合 state + methods
- `refArray()` / `reactiveArray()` — 响应式数组
- `refObject()` / `reactiveObject()` — 响应式对象
- `release()` / `release_all()` — 资源释放
- `start_tracking()` / `stop_tracking()` — 手动依赖追踪
- `hmrScope` — HMR 热更新标记

**依赖**：`inner-base`（事件系统用于变更通知）

**典型用法**：
```ts
const count = ref(0);
const doubled = computed(() => count.value * 2);
count.value = 5; // doubled 自动更新
```

---

### `@timeless/inner-types` — 类型工具

**职责**：跨包共享的 TypeScript 类型定义

**关键导出**：
- `Unpacked<T>` — 解包数组/承诺类型
- `MutableRecord<U>` — 可变记录类型
- `Brand<T, B>` — 品牌类型（名义类型）
- `Rect` / `JSONValue` / `JSONObject` — 常用结构类型
- `global.d.ts` — 全局类型声明（包括所有 VNode 元素的 JSX 类型）

**依赖**：无

---

### `@timeless/inner-utils` — 工具函数

**职责**：通用工具函数集合

**关键导出**：
- `dayjs` — 配置好的 dayjs（中文 locale + relativeTime 插件）
- `cn()` — 中文数字转换（nzh）
- `qs` — URL 查询字符串解析
- `uidFactory()` — 唯一 ID 生成器
- `toFixed()` / `padding_zero()` — 数字/字符串格式化
- `update_arr_item()` / `remove_arr_item()` — 数组不可变操作
- `sleep(ms)` — 异步等待
- `download()` — 文件下载工具
- `primitive` — 基础类型判断
- `json` — JSON 安全解析

**依赖**：`inner-base`、`inner-types`、`dayjs`、`tailwind-merge`

---

### `@timeless/inner-primitive` — VNode 工厂

**职责**：平台无关的元素工厂，类似 React 的 `createElement` 但更丰富

**关键导出**：

| 类别 | 导出 |
|------|------|
| 响应式渲染 | `For`、`Show`、`Match` |
| 基础元素 | `View`、`Text`、`Fragment`、`Portal`、`SVG`、`Img`、`Video` |
| 布局 | `Row`、`Column`、`Flex`、`Grid`、`Split`、`Scroll` |
| 表单 | `Input`、`NumberInput`、`PasswordInput`、`Checkbox`、`Select`、`Textarea`、`Radio`、`Slider`、`FilePicker` |
| 浮层 | `Dialog`、`Tooltip`、`Popconfirm`、`Drawer`、`DropdownMenu` |
| 导航 | `Tab`、`Window` |
| 交互 | `Button`、`Link`、`Dismissable`、`Event` |
| 上下文 | `createContext`、`provide`、`use`、`Scope` |
| 样式 | `Style`、`cn`（class 合并） |
| 平台 | `setPlatform`、`getPlatform` |

**核心设计**：所有元素都是纯数据（VNode 对象），不涉及任何 DOM 操作。渲染器负责把这些 VNode 转换为平台的实际输出。

```ts
// 平台无关的组件写法
function Counter() {
  const count = ref(0);
  return View({}, [
    "Count:",
    computed(count, (t) => {
      return ` ${t}`;
    }),
    Button({ onClick: () => {
      count.as((prev) => prev += 1);
    } }, ["+1"]),
  ]);
}
```

**依赖**：`inner-base`、`inner-reactive`

---

### `@timeless/inner-vm` — 无头 UI 状态机

**职责**：组件交互逻辑的纯状态管理，不绑定任何平台或样式

**关键导出**（60+ 模块）：

| 模块 | Core 类 | 管理什么状态 |
|------|---------|------------|
| `dialog` | `DialogCore` | 打开/关闭、层级、焦点 |
| `select` | `SelectCore` | 选项列表、选中值、过滤、多选 |
| `popper` | `PopperCore` | 定位、翻转、自适应 |
| `popover` | `PopoverCore` | 触发方式（hover/click）、开关 |
| `menu` | `MenuCore` | 菜单项、子菜单、快捷键 |
| `form` | `FormCore` | 字段校验、提交、重置 |
| `toast` | `ToastCore` | 消息队列、自动关闭 |
| `tabs` | `TabsCore` | 激活标签、面板切换 |
| `tree` | `TreeCore` | 展开/折叠、勾选、拖拽 |
| `calendar` | `CalendarCore` | 日期选择、范围、月/年切换 |
| `input` | `InputCore` | 值、校验、焦点、格式化 |
| `scroll-view` | `ScrollViewCore` | 滚动位置、边界检测 |
| `progress` | `ProgressCore` | 进度值、动画状态 |
| `accordion` | `AccordionCore` | 展开项、动画 |
| `drag-drop` | `DragDropCore` | 拖拽位置、放置目标 |
| `presence` | `PresenceCore` | 进出场动画状态 |
| `waterfall` | `WaterfallCore` | 瀑布流布局计算 |
| … | 40+ 更多 | … |

**设计理念**：
```
inner-vm = "组件怎么工作"（纯逻辑，零依赖 DOM）
   ↓ 被组合
ui-primitive = inner-vm + DOM 事件绑定（无样式）
   ↓ 被组合
shadcn/weui = ui-primitive + CSS 样式（视觉层）
```

**依赖**：`inner-base`、`inner-reactive`、`inner-utils`

---

### `@timeless/inner-kit` — 应用服务套件

**职责**：平台无关的应用级服务抽象（路由、HTTP、存储等）

**关键导出**：

| 模块 | 核心类 | 用途 |
|------|--------|------|
| HTTP | `HttpClientCore` | HTTP 请求抽象（拦截器、超时、重试） |
| 路由 | `HistoryCore`、`NavigatorCore`、`RouteViewCore` | 导航历史、路由匹配、视图切换 |
| 存储 | `StorageCore` | 数据持久化抽象 |
| 剪贴板 | `ClipboardModel` | 剪贴板读写 |
| 列表 | `ListCore` | 分页、加载更多、刷新 |
| 通信 | `ChannelCore` | 实时消息通道（WebSocket/SSE 抽象） |
| 应用 | `ApplicationModel` | 应用生命周期管理 |
| 请求 | `RequestCore`、`request_factory` | 请求构造器 |

**依赖**：`inner-base`、`inner-reactive`、`inner-vm`、`inner-types`、`inner-utils`

**使用模式**：kit 定义抽象接口 → provider 包（provider-web/provider-tauri 等）提供平台实现

---

### `@timeless/inner-chart` — 图表状态引擎

**职责**：平台无关的图表计算（布局、比例尺、路径、渲染基元）

**关键导出**：
- `createChartState(options)` — 图表状态工厂
- `createAreaChartState(options)` — 面积图状态
- `createLinearScale()` / `resolveDomain()` — 比例尺计算
- `createAreaPath()` / `createLinePath()` / `serializePathCommands()` — 路径生成

**使用模式**：`state.primitives` 得到渲染基元列表 → 任何渲染器（SVG/Canvas/终端）消费

**依赖**：无

---

### `@timeless/inner-icons` — 图标库

**职责**：~70 个 SVG 图标的注册表和 ASN 格式源文件

**关键导出**：
- `iconRegistry` — 图标注册表（name → SVG path data 的映射）
- `/asn` — ASN（Abstract Syntax Notation）格式的图标定义
- `/file/*.svg` — 原始 SVG 文件

**依赖**：无

---

### `@timeless/inner-vite-plugin` — 构建工具

**职责**：Vite HMR 插件，为 Timeless 的响应式原语注入热更新能力

**关键导出**：
- `timelessHMR()` — 浏览器 HMR 插件
- `timelessNativeHMR()` — Native 平台 HMR 插件

**依赖**：`vite` (peer)

---

## 可发布包（面向用户）

### `@timeless/timeless` — 框架核心

**组合**：`inner-reactive` + `inner-primitive` + `ui-primitive` + `inner-kit`（导出为 `kit` 命名空间）+ `inner-vm`（导出为 `ui` 命名空间）

**给用户的一站式导入**：
```ts
// 响应式
import { ref, computed, signal } from "@timeless/timeless";
// 元素工厂
import { View, Text, For, Show, Input } from "@timeless/timeless";
// 无头状态机
import { ui } from "@timeless/timeless";
const dialog = ui.DialogCore({ open: ref(false) });

// 通用业务模型
import { kit } from "@timeless/timeless";
const HistoryCore = kit.HistoryCore;
```

**依赖**：`inner-reactive`、`inner-primitive`、`ui-primitive`、`inner-kit`、`inner-vm`

---

### `@timeless/timeless-dom` — DOM 渲染器

**组合**：`timeless`

**职责**：将 VNode 树渲染为浏览器 DOM 节点

**关键导出**：
- `render(element, container)` — 挂载渲染
- `hydrate(element, container)` — SSR 水合
- `platform` — 浏览器平台的 Platform 接口实现

```ts
import { render } from "@timeless/timeless-dom";
import { View, Text } from "@timeless/timeless";

render(View({}, [Text({}, "Hello DOM")]), document.getElementById("app")!);
```

**依赖**：`timeless`

---

### `@timeless/timeless-ssr` — SSR 渲染器

**组合**：`timeless` + `inner-icons`

**职责**：将 VNode 树渲染为 HTML 字符串

**关键导出**：
- `renderToString(element)` → HTML 字符串

**依赖**：`timeless`、`inner-icons`

---

### `@timeless/timeless-native` — Native 渲染器

**组合**：`timeless`

**职责**：macOS JavaScriptCore 环境的原生渲染

**关键导出**：
- `render()` / `nativePlatform` — 原生平台渲染入口

**依赖**：`timeless`

---

### `@timeless/timeless-canvas` — Canvas 渲染器

**组合**：`timeless` + `inner-icons`

**职责**：将 VNode 树绘制到 HTML Canvas

**依赖**：`timeless`、`inner-icons`

---

### `@timeless/timeless-tui` — 终端渲染器

**组合**：`timeless`

**职责**：将 VNode 树渲染为终端 ANSI 字符界面

**关键导出**：
- `renderToScreen()` / `renderToString()` — 终端渲染
- `createTuiApp()` — TUI 应用工厂
- `listenKeys()` — 键盘输入处理

**依赖**：`timeless`

---

### `@timeless/ui-primitive` — 无样式 DOM 组件

**组合**：`timeless` + `inner-vm` + `inner-kit` + Tailwind（样式基础设施）

**职责**：把 inner-vm 的状态机绑定到 DOM 事件，但不带视觉样式

**关键导出**（50+ 个 Primitive）：
`ButtonPrimitive`、`DialogPrimitive`、`SelectPrimitive`、`MenuPrimitive`、`ToastPrimitive`、`PopoverPrimitive`、`TabsPrimitive`、`CheckboxPrimitive`……

每个 Primitive 提供 Trigger/Content/Item 等子组件 + 事件绑定 + ARIA 属性，但没有任何颜色、间距、圆角等视觉样式。

**依赖**：`timeless`、`inner-vm`、`inner-kit`

---

### `@timeless/shadcn` — Tailwind 设计系统

**组合**：`timeless` + `ui-primitive` + `inner-vm` + `inner-icons`

**职责**：在 headless primitive 之上加 Tailwind CSS 视觉样式

**关键导出**（40+ 个带样式组件）：
`Button`、`Input`、`Dialog`、`Select`、`Menu`、`Toast`、`Card`、`Table`、`Form`、`Sheet`、`Accordion`、`Tabs`、`DatePicker`……

```ts
import { Button, Dialog, Input } from "@timeless/shadcn";
import "tailwindcss/tailwind.css";
```

**依赖**：`timeless`、`ui-primitive`、`inner-vm`、`inner-icons`、`tailwindcss` (peer)

---

### `@timeless/weui` — 微信设计系统

**组合**：`timeless` + `ui-primitive` + `inner-vm` + `inner-icons`

**职责**：与 shadcn 平行的 WeChat WeUI 风格组件库，使用 Less 而非 Tailwind

**关键导出**（20+ 个 WeUI 风格组件）：
`Button`、`Input`、`Checkbox`、`Switch`、`Dialog`、`Sheet`、`Toast`、`Tabs`、`Card`……

**依赖**：`timeless`、`ui-primitive`、`inner-vm`、`inner-icons`

---

### `@timeless/a2ui` — JSON→UI 引擎

**组合**：`timeless` + `inner-vm`

**职责**：从 JSON Schema 或 SSE 流动态生成 UI（A2UI = AI-to-UI）

**关键导出**：
- `renderSchema(schema)` — 渲染 JSON Schema
- `renderStream(stream)` — 消费 SSE 流实时渲染
- `registerComponents(map)` — 注册自定义组件解析器

**使用场景**：服务端驱动 UI、AI 生成界面、低代码平台

**依赖**：`timeless`、`inner-vm`

---

### Provider 包（平台服务适配）

#### `@timeless/provider-web` — 浏览器平台
**组合**：`timeless` + `inner-kit` + `inner-vm`

提供 `provide_http_client`（axios）、`provide_clipboard`、`provide_history`、`provide_channel`（WebSocket/SSE）等浏览器实现。

#### `@timeless/provider-memory` — 内存平台（测试用）
**组合**：`inner-base` + `inner-kit` + `inner-utils`

提供内存中的 HTTP 客户端，用于单元测试。

#### `@timeless/provider-tauri` — Tauri 桌面
**组合**：`inner-base` + `inner-kit` + `inner-utils` + `provider-web`

复用 provider-web 的应用生命周期，覆盖 HTTP 客户端为 Tauri 实现。

#### `@timeless/provider-wails3` — Wails3 桌面
**组合**：`inner-base` + `inner-kit` + `inner-utils` + `provider-web`

与 provider-tauri 结构相同，用 Wails3 的 HTTP 客户端。

#### `@timeless/provider-weapp` — 微信小程序
**组合**：`inner-base` + `inner-kit` + `inner-vm` + `inner-utils`

微信小程序平台适配（不依赖 provider-web，因为小程序不是浏览器环境）。

#### `@timeless/provider-velo` — Wix Velo
**组合**：`inner-base` + `inner-kit`

最精简的 provider，仅实现 HTTP 和 Channel。

---

### 框架适配器

#### `@timeless/solidjs` — SolidJS 组件
**组合**：`inner-kit` + `inner-vm`

将 Timeless 的无头组件包装为 SolidJS 组件，在 SolidJS 生态中使用 Timeless 的能力。

#### `@timeless/vue` — Vue 3 组件
**组合**：`inner-kit` + `inner-utils` + `provider-web`

将 Timeless 的功能包装为 Vue 3 SFC 组件。

---

### 捆绑包

#### `@timeless/vanillakit` — 全量捆绑
**组合**：`timeless` + `inner-base` + `inner-reactive` + `inner-vm` + `inner-kit` + `inner-icons` + `inner-utils`

一个导入获得所有 Timeless 子系统，按命名空间组织。

```ts
import { base, reactive, ui, kit, icons } from "@timeless/vanillakit";
```

#### `@timeless/vanillalite` — 轻量捆绑
**组合**：`timeless` + `timeless-dom` + `inner-reactive`

仅包含核心响应式、元素工厂和 DOM 渲染器，适合简单项目。

```ts
import { render, View, Text, ref } from "@timeless/vanillalite";
```

---

### CLI

#### `@timeless/cli` — 命令行工具
**组合**：`timeless` + `timeless-ssr`

提供 `timeless dev`（开发服务器）、`timeless build`（生产构建）、`timeless start`（生产服务器）命令。

---

### `@timeless/biz` — 业务逻辑
**组合**：`inner-base` + `inner-kit` + `inner-vm` + `inner-types` + `inner-utils`

在 kit 之上的更高层业务封装：OSS 文件上传、用户管理、二维码确认流程等。

---

## 依赖流向图

```
                    inner-base (事件/Result/Logger)
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  inner-reactive   inner-types    inner-chart
        │               │          (图表状态)
        ├───────────────┤
        ▼               ▼
  inner-primitive   inner-utils
  (VNode 工厂)      (工具函数)
        │               │
        ├───────────────┤
        ▼               ▼
     inner-vm        inner-icons
  (无头状态机)        (图标注册表)
        │               │
        ├───────────────┤
        ▼               ▼
     inner-kit      inner-vite-plugin
  (应用服务抽象)     (Vite HMR)
        │
   ┌────┼────────────┬──────────────┐
   ▼    ▼            ▼              ▼
  biz  providers  solidjs/vue   vanillakit

 ============== timeless (barrel) ==============
 timeless = inner-reactive + inner-primitive + inner-vm(as ui)
        │
   ┌────┼────────────┬──────────────┬──────────┐
   ▼    ▼            ▼              ▼          ▼
 dom  native  ssr/canvas/tui   ui-primitive  a2ui
                                   │
                              ┌────┴────┐
                              ▼         ▼
                           shadcn     weui
                        (Tailwind)  (Less/WeChat)
```

## 给用户的选择指南

| 你想要…… | 安装这些包 |
|----------|-----------|
| 最简 Web 应用 | `timeless` + `timeless-dom` |
| Web 应用 + 业务套件 | `timeless` + `timeless-dom` + `provider-web` |
| 带样式的 Web 应用 | `shadcn`（含以上所有） |
| 微信风格 Web 应用 | `weui`（含以上所有） |
| SSR 应用 | `timeless` + `timeless-ssr` + `cli` |
| 桌面应用 (Tauri) | `timeless` + `timeless-native` + `provider-tauri` |
| 微信小程序 | `timeless` + `provider-weapp` |
| Canvas 图表 | `timeless` + `timeless-canvas` + `inner-chart` |
| 终端应用 | `timeless` + `timeless-tui` |
| AI 生成 UI | `timeless` + `timeless-dom` + `a2ui` |
| 在 SolidJS 中使用 | `timeless` + `timeless-dom` + `solidjs` + `provider-web` |
| 在 Vue 中使用 | `timeless` + `timeless-dom` + `vue`（含 provider-web） |
| 全部功能（vanilla JS） | `vanillakit` |
| 轻量（vanilla JS） | `vanillalite` |
