# `@timeless/bootstrap` 设计规范（Design Token + CSS Variable）

> 本文档描述 `@timeless/bootstrap` 的 token 体系。
> 阅读前请先看仓库根目录的 `THEME_PACKAGE_GUIDE.md`（分层模型与新建样式库的方法），
> 以及 `packages/shadcn/THEME_DESIGN.md`（同一骨架在 Tailwind 路线的实现）。

---

## 1. 与 shadcn / weui 的根本差异

三个库共享**同一批组件**（`@timeless/ui-primitive` 的组合层 + `@timeless/inner-vm` 的状态机），
差异只在 token 与 CSS。但"作用域"策略不同：

| 维度 | shadcn | weui | **bootstrap（本库）** |
|---|---|---|---|
| 样式技术 | Tailwind v4 + 工具类 | Less 编译产物 + CSS 变量 | **纯 CSS + CSS 变量** |
| 主题挂载点 | `:root` / `.dark` | `.weui-*` 前缀类 + `[data-theme]` | **`[data-tt-style="bootstrap"]`** |
| 全局污染 | 有（`@layer base` 改 `*`、`body`） | 无（`weui-` 前缀天然隔离） | **无（属性作用域隔离）** |
| 类名风格 | `tt-` 前缀 + Tailwind 工具类 | `weui-btn` 等前缀类 | **Bootstrap 原生类名（`.btn` / `.btn-primary`）** |
| 多库共存 | 与 weui 冲突需避免 | 安全 | **安全（见第 5 节）** |

**一句话**：bootstrap 库用 Bootstrap 5.3 的**原生类名**，靠 `<html data-tt-style="bootstrap">`
这一个属性做隔离。因此它可以直接和真实 Bootstrap 的类名共存于文档，但**不能把
`data-tt-style` 子树与真实 Bootstrap 的样式混用**（见第 5.3 节）。

---

## 2. Token 分层模型

```
① tokens.css   ── 上游原始 token（--bs-*），亮/暗两套，照抄 Bootstrap 5.3
② alias.css    ── Timeless 语义别名（--primary / --background / --radius …）
③ components/*.css ── 组件样式，只读第 ② 层
```

### ① 上游原始层 — `src/style/tokens.css`

变量名与值**照抄 Bootstrap 5.3 的 `dist/css/bootstrap.css`**，只做两处改动：

1. 全部挂在 `[data-tt-style="bootstrap"]` 之下（而不是 `:root`）；
2. 暗色从 Bootstrap 的 `[data-bs-theme="dark"]` 改挂到 `.dark` / `[data-theme="dark"]`，
   与 `app.setTheme()` 对齐。

组件代码**不读这一层**。换 Bootstrap 小版本时只动这个文件。

### ② Timeless 语义别名层 — `src/style/alias.css`

组件代码只读这一层。这一层的存在保证了三套作用域库（bootstrap / material / fluent）
的模块代码**形状完全一致**——同一个 `button.ts` 里 `classNames(["btn", ...])` 的写法，
在 material 里换成 `m3-btn` 即可，无需理解 M3 的色调调色板。

### ③ 组件样式层 — `src/style/components/*.css`

每个组件一个文件，全部以 `[data-tt-style="bootstrap"]` 开头。允许在本文件内定义
**组件级局部 token**（`--btn-*` / `--card-*` / `--form-check-*`），但必须有合理默认值。

---

## 3. 完整 Token 清单

### 3.1 上游原始 token（`--bs-*`，`tokens.css`）

| 分组 | 变量 | 亮色值 | 暗色值 |
|---|---|---|---|
| 基础色板 | `--bs-blue` | `#0d6efd` | 同名不变 |
| | `--bs-red` | `#dc3545` | 同名不变 |
| | `--bs-green` | `#198754` | 同名不变 |
| | `--bs-yellow` | `#ffc107` | 同名不变 |
| | `--bs-gray-{100..900}` | `#f8f9fa` … `#212529` | 同名不变 |
| 语义色 | `--bs-primary` | `#0d6efd` | 同名不变 |
| | `--bs-secondary` | `#6c757d` | 同名不变 |
| | `--bs-success` | `#198754` | 同名不变 |
| | `--bs-info` | `#0dcaf0` | 同名不变 |
| | `--bs-warning` | `#ffc107` | 同名不变 |
| | `--bs-danger` | `#dc3545` | 同名不变 |
| 正文/表面 | `--bs-body-color` | `#212529` | `#dee2e6` |
| | `--bs-body-bg` | `#fff` | `#212529` |
| | `--bs-emphasis-color` | `#000` | `#fff` |
| | `--bs-secondary-color` | `rgba(33,37,41,.75)` | `rgba(222,226,230,.75)` |
| | `--bs-secondary-bg` | `#e9ecef` | `#343a40` |
| | `--bs-tertiary-bg` | `#f8f9fa` | `#2b3035` |
| 链接 | `--bs-link-color` | `#0d6efd` | `#6ea8fe` |
| | `--bs-link-hover-color` | `#0a58ca` | `#8bb9fe` |
| 边框 | `--bs-border-color` | `#dee2e6` | `#495057` |
| | `--bs-border-width` | `1px` | 同名不变 |
| | `--bs-border-radius` | `0.375rem` | 同名不变 |
| | `--bs-border-radius-sm` | `0.25rem` | 同名不变 |
| | `--bs-border-radius-lg` | `0.5rem` | 同名不变 |
| | `--bs-border-radius-pill` | `50rem` | 同名不变 |
| 表单 | `--bs-form-valid-color` | `#198754` | `#75b798` |
| | `--bs-form-invalid-color` | `#dc3545` | `#ea868f` |
| | `--bs-form-invalid-border-color` | `#dc3545` | `#ea868f` |
| 排版 | `--bs-font-sans-serif` | system-ui 栈 | 同名不变 |
| | `--bs-body-font-size` | `1rem` | 同名不变 |
| | `--bs-body-line-height` | `1.5` | 同名不变 |
| 焦点环 | `--bs-focus-ring-width` | `0.25rem` | 同名不变 |
| | `--bs-focus-ring-color` | `rgba(13,110,253,.25)` | 同名不变 |
| 阴影 | `--bs-box-shadow` | `0 .5rem 1rem rgba(0,0,0,.15)` | `… rgba(0,0,0,.5)` |
| | `--bs-box-shadow-sm` | `0 .125rem .25rem rgba(0,0,0,.075)` | `… rgba(0,0,0,.3)` |
| | `--bs-box-shadow-lg` | `0 1rem 3rem rgba(0,0,0,.175)` | `… rgba(0,0,0,.6)` |
| | `--bs-box-shadow-inset` | `inset 0 1px 2px rgba(0,0,0,.075)` | `… rgba(0,0,0,.3)` |
| 状态量 | `--bs-btn-hover-bg-shade-amount` | `15%` | 同名不变 |
| | `--bs-btn-active-bg-shade-amount` | `20%` | 同名不变 |
| | `--bs-disabled-opacity` | `0.65` | 同名不变 |

> 上游文件的完整清单见 `src/style/tokens.css`。以上是组件实际引用到的部分。

### 3.2 Timeless 语义别名（`alias.css`）

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--background` / `--foreground` | `--bs-body-bg` / `--bs-body-color` | 页面底色与正文 |
| `--card` / `--card-foreground` | `--bs-body-bg` / `--bs-body-color` | Card 表面 |
| `--popover` / `--popover-foreground` | `--bs-body-bg` / `--bs-body-color` | 浮层表面 |
| `--primary` / `--primary-foreground` | `--bs-primary` / `#fff` | 主操作 |
| `--secondary` / `--secondary-foreground` | `--bs-secondary` / `#fff` | 次操作 |
| `--destructive` / `--destructive-foreground` | `--bs-danger` / `#fff` | 危险操作 |
| `--success` / `--warning` / `--info` (+`-foreground`) | `--bs-success` / `--bs-warning` / `--bs-info` | 语义状态 |
| `--muted` / `--muted-foreground` | `--bs-secondary-bg` / `--bs-secondary-color` | 弱化底色/文字 |
| `--accent` / `--accent-foreground` | `--bs-tertiary-bg` / `--bs-emphasis-color` | 强调底色 |
| `--border` / `--input` | `--bs-border-color` | 边框、输入框描边 |
| `--ring` / `--ring-width` / `--ring-color` | `--bs-primary` / `--bs-focus-ring-*` | 焦点环 |
| `--radius` / `--radius-sm` / `--radius-lg` / `--radius-pill` | `--bs-border-radius*` | 圆角 |
| `--shadow-sm` / `--shadow` / `--shadow-lg` / `--shadow-inset` | `--bs-box-shadow*` | 阴影 |
| `--disabled-opacity` | `--bs-disabled-opacity` | 禁用态透明度 |
| `--font-sans` / `--font-mono` | `--bs-font-sans-serif` / `--bs-font-monospace` | 字体栈 |
| `--font-size` / `--font-size-sm` / `--font-size-xs` | `1rem` / `0.875rem` / `0.75rem` | 字号 |
| `--line-height` | `--bs-body-line-height` | 行高 |
| `--spacer` / `--spacer-sm` / `--spacer-lg` | `1rem` / `0.5rem` / `1.5rem` | 间距（Bootstrap `$spacer`） |
| `--control-height` / `-sm` / `-lg` | `2.375rem` / `1.9375rem` / `3rem` | 控件高度（Bootstrap 输入框） |

> 组件样式**必须**只引用本表。若发现组件引用了表外的别名，属于规范缺口，应补进本表。

### 3.3 组件级局部 token

定义在各自的 `components/*.css` 里，以组件类为作用域，例如：

- Button：`--btn-padding-y` / `--btn-padding-x` / `--btn-font-size` / `--btn-radius`
- Card：`--card-spacer-y` / `--card-cap-bg` / `--card-inner-radius`
- Checkbox：`--form-check-bg` / `--form-check-border`

它们的作用域是**声明块所在的选择器**，不是 token 层，因此可以安全地按状态改写
（例如 `.form-check-input:hover { --form-check-border: … }`）。

---

## 4. 暗色挂载点

### 4.1 四选择器形式

与 shadcn/weui 同源，暗色必须同时命中"属性在祖先"与"属性在同元素"两种情况：

```css
.dark [data-tt-style="bootstrap"],
[data-theme="dark"] [data-tt-style="bootstrap"],
[data-tt-style="bootstrap"].dark,
[data-tt-style="bootstrap"][data-theme="dark"] { /* 暗色覆盖 */ }
```

**为什么是四个**：`data-tt-style` 可以挂在 `<html>`（示例应用的用法），也可以挂在任意
包裹元素（多库同页时必须在子树上切换）。前者命中后两个，后者命中前两个。只写一种会
在另一种用法下静默失效。

### 4.2 与应用主题 API 的衔接

`packages/kit/src/app/index.ts` 的 `app.setTheme("light" | "dark" | "system")`
由 `provider-web` 实现（`packages/provider-web/src/app.ts`），它在 `<html>` 上同时设置：

- `data-theme="dark"` 属性
- `style.colorScheme = "dark"`
- `.dark` class

因此 bootstrap 库**不需要任何额外适配**：模块代码不感知主题，只有 token 变。
示例应用（`apps/web-bootstrap`）用 `app.toggleTheme()` / `app.setTheme(next)` 切换。

### 4.3 首屏闪烁

暗色在 JS 启动前必须就位，否则会闪过一帧亮色。示例应用在 `<head>` 里放了一段
内联脚本（读 `localStorage.theme`，解析 `system`，写 `data-theme` + `.dark` +
`colorScheme`），与 `app.setTheme` 写的是同一组属性。

---

## 5. 作用域与共存

### 5.1 核心约定

> **本库输出的每一条 CSS 规则、每一个 token，都必须处于 `[data-tt-style="bootstrap"]`
> 之下。** 没有例外。

具体禁令：

- 不得输出 `html` / `body` / `#root` 规则；
- 不得输出无作用域的 `*` 规则（`*::before` 也必须带 `${Scope} ` 前缀）；
- 不得输出裸 `@keyframes`（用 `bs-` 前缀命名，如 `bs-spin` / `bs-pulse`）。

`base.css` 里的重置写在 `[data-tt-style="bootstrap"] *` 之下，只在作用域内生效。

### 5.2 多库同页

因为隔离靠属性而非类名前缀，同一页面可以同时加载 `timeless.bootstrap.css` 与
`timeless.shadcn.css`：

```html
<html data-tt-style="bootstrap">
  …bootstrap 组件…
  <div>                        <!-- 子树切到 shadcn -->
    …shadcn 组件（class 带 tt- 前缀 + Tailwind 工具类）…
  </div>
</html>
```

> 注意：切换 `data-tt-style` 只切换**本库自己的**设计与 token。shadcn 的 token 挂在
> `:root`，它不读 `data-tt-style`，所以子树切换对它没有意义——shadcn/weui 是"全局库"，
> bootstrap/material/fluent 是"作用域库"。这一区别见 `THEME_PACKAGE_GUIDE.md` 第 2 节。

### 5.3 与真实 Bootstrap 共存

本库类名（`.btn` / `.btn-primary` / `.form-control` …）与真实 Bootstrap **完全相同**。

- 若页面同时加载真实 `bootstrap.css`：真实 Bootstrap 的规则是**无作用域**的
  （`.btn { … }`），而本库是 `[data-tt-style="bootstrap"] .btn { … }`，
  后者的特异性更高，会在作用域内胜出；作用域外则只有真实 Bootstrap 生效。
  这能工作，但**不推荐**——升级任一方都可能因为新增的 `!important` 或层叠顺序变化而打架。
- 正确用法：**不要**在同一个子树里混用两者。要么整体用本库，要么整体用真实 Bootstrap。
- 不要把 `data-tt-style="bootstrap"` 加到挂载了真实 Bootstrap 组件的容器上。

---

## 6. 应用内覆盖 Token 的三种方式

### 方式 A：覆盖上游层（换配色，保留 Bootstrap 结构）

```html
<html data-tt-style="bootstrap">
  <style>
    [data-tt-style="bootstrap"] { --bs-primary: #7c3aed; --bs-border-radius: 0.5rem; }
  </style>
```

### 方式 B：覆盖别名层（只改某类语义，不动上游）

```html
<style>
  [data-tt-style="bootstrap"] { --radius: 0.25rem; --muted: #f1f3f5; }
</style>
```

### 方式 C：局部子树换肤

```html
<div data-tt-style="bootstrap" style="--primary: #d946ef">
  …该子树内的 primary 按钮变品红…
</div>
```

> 三种方式的**特异性都低于**组件样式里"声明块内改写局部 token"的写法，所以
> 组件自身的 hover/active 覆盖不会被应用层意外压掉。

### 方式 D：规范页实时调参（预览孤岛）

`apps/web-bootstrap` 的**设计规范页**（左菜单「设计规范」→ `/home/design`）把方式 B / C
做成了可视化编辑器：左侧是从真实 token 读出来的规范表 + 控件，右侧一块预览孤岛。
控件写的是孤岛元素上的**内联 CSS 变量**，所以只影响孤岛，画廊外壳不受影响，
可一键重置。机制与注意事项见 `THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=bootstrap`（→ <http://127.0.0.1:3401>，见指南 §8.4）。

本库实际可调的 token（页面按「该 token 在 `<html>` 上是否声明」自动筛选，
共 22 个）：

| 分组 | token |
|---|---|
| 色板 | `--primary` `--secondary` `--destructive` `--background` `--foreground` `--muted` `--muted-foreground` `--border` |
| 圆角 | `--radius` `--radius-sm` `--radius-lg` |
| 间距 | `--spacer` `--spacer-sm` `--spacer-lg` |
| 尺寸 | `--control-height` `--control-height-sm` `--control-height-lg` |
| 字阶 | `--font-size` `--line-height` |
| 阴影 | `--shadow` `--shadow-sm` `--shadow-lg` |
| 动效 | — 本库无动效时长 token，页面显示「该库未声明可调 token」 |

两条边界：

- 页面**不暴露第一层 `--bs-*`**，只暴露第二层语义别名（理由见
  `THEME_PACKAGE_GUIDE.md` §5.4）。
- 组件样式里直接读原始 token 的地方（如 `tree.css` 的 `var(--bs-border-width)`）
  不随编辑器变化，这是设计如此，不为了让「看起来都变了」去改组件 CSS。

---

## 7. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/bootstrap.css` | 样式入口，`tokens → alias → base → components/*` |
| `src/style/tokens.css` | 上游 `--bs-*`（亮/暗） |
| `src/style/alias.css` | Timeless 语义别名 |
| `src/style/base.css` | 作用域内的基础/重置 |
| `src/style/components/*.css` | 51 个组件的样式（Tier 1 的 24 + Tier 2 的 17 + Tier 3 的 8 + tree / flow） |
| `src/modules/*.ts` | 薄包装：store 订阅 + 作用域类名 |
| `src/index.ts` | 导出 + 动态 `import("./style/bootstrap.css")` |
| `apps/web-bootstrap` | 组件画廊示例应用 |

---

## 8. 状态与暗色巡检

51 个模块走同一套状态钩子，巡检口径：`disabled` 属性 / `[aria-invalid="true"]` /
`.is-invalid` / `.is-loading` / `:focus-visible` / `@media (prefers-reduced-motion: reduce)`。

| 状态 | 落点 | 覆盖 |
|---|---|---|
| 禁用 | `[disabled]` / `[aria-disabled="true"]`，透明度用 `--disabled-opacity` | 27 个样式文件 |
| 校验失败 | `[aria-invalid="true"]`（输入/选择类）或 `.is-invalid`（表单类） | 12 个样式文件 |
| 加载 | `.is-loading`（按钮、搜索类）；占位符用 `skeleton.css` | button / search-select 等 |
| 键盘焦点 | `:focus-visible` 用 `--ring` 描边——**不写 `:focus`**，否则鼠标点击也出描边 | 20 个样式文件 |
| 动效降级 | `base.css` 一条作用域内的兜底：`[data-tt-style="bootstrap"] *` 把 animation / transition 压到 `0.01ms` | 26 个样式文件 |

暗色**不使用组件级选择器**：所有组件样式只引用语义别名（`--background` / `--primary` /
`--border` …），暗色只在 `tokens.css` 里换一次声明（第 4 节那 4 个选择器）。
新增组件时不需要写任何 `[data-theme="dark"]` 分支——这是本库暗色零维护成本的来源。

---

## 9. 与其他库的关系

| | 关系 |
|---|---|
| `@timeless/timeless` | 唯一依赖。提供 `ui`（primitive）与 `vm`（core）。 |
| `@timeless/shadcn` | 兄弟库，同一批组件。shadcn 是全局（`:root` + Tailwind），本库是作用域。 |
| `@timeless/weui` | 兄弟库。weui 用 `weui-` 类名前缀隔离，本库用 `data-tt-style` 属性隔离。 |
| `@timeless/material` / `@timeless/fluent` | 同批新增的作用域库，`data-tt-style="material"` / `"fluent"`。 |

---

## 10. 组件覆盖范围

本库按标准组件清单落地，分三档：

- **Tier 1（24，已实现）**：button、input、textarea、label、checkbox、checkbox-group、radio、
  switch、toggle、slider、select、number-input、progress、avatar、badge、separator、
  skeleton、card、alert、kbd、link、aspect-ratio、scroll-area、field。
- **Tier 2（17，已实现）**：dialog、sheet、popover、popconfirm、tooltip、dropdown-menu、
  context-menu、menu、tabs、accordion、steps、toast、table、form、search-select、
  file-picker、resizable-panels。
- **Tier 3（8，已实现）**：date-picker、date-range-picker、time-picker、date-time-picker、
  cascader、scroll-view、affix、waterfall。

另有两个结构复杂组件（已实现，逻辑在共享层，本库只出薄包装 + CSS）：

- **tree**：`vm.TreeCore` + `ui.TreePrimitive`。虚拟滚动（`ListViewV2`）、展开/折叠、
  指针拖拽三区落点（上/下 25% 排序、中间 50% 移入目录）、悬停折叠目录自动展开、
  checkbox 父子联动与半选。行高落在 `--tree-row-height`（32px），因为
  `ListViewV2` 的 `itemHeight` 是渲染器入参，两边必须一致。
- **flow**：`vm.FlowCanvasModel` / `FlowNodeModel` / `FlowEdgeModel`。节点拖拽、滚轮缩放、
  空白平移、边路径计算（straight / step / smoothstep / bezier）全在 core；本库只画 DOM。
  流动边用 `.is-animated` + `@keyframes bs-flow-dash`。

累计 **51 / 51** 已实现（24 + 17 + 8 + tree + flow）。

**不在范围**：`llm-provider-form`、`history-panel`、`menu-shared` / `popper-shared`
（辅助，非组件）、`sonner`（由 `toast` 覆盖）。

新增组件时必须遵守的骨架与状态要求见 `THEME_PACKAGE_GUIDE.md` 第 6 节。
