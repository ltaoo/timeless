# `@timeless/material` 设计规范（Design Token + CSS Variable）

> 本文档描述 `@timeless/material` 的 token 体系。
> 阅读前请先看仓库根目录的 `THEME_PACKAGE_GUIDE.md`（分层模型与新建样式库的方法），
> 以及 `packages/bootstrap/THEME_DESIGN.md`（同一骨架在 Bootstrap 路线的实现）。

---

## 1. 与 shadcn / weui / bootstrap 的根本差异

四个库共享**同一批组件**（`@timeless/ui-primitive` 的组合层 + `@timeless/inner-vm`
的状态机），差异只在 token 与 CSS。material 与 bootstrap/fluent 同属「作用域库」：

| 维度 | shadcn | weui | bootstrap | **material（本库）** |
|---|---|---|---|---|
| 上游设计系统 | Tailwind + 自定义 | WeUI | Bootstrap 5.3 | **Material Design 3（Material You）** |
| 样式技术 | Tailwind v4 + 工具类 | Less 编译产物 | 纯 CSS | **纯 CSS + CSS 变量** |
| 主题挂载点 | `:root` / `.dark` | `.weui-*` + `[data-theme]` | `[data-tt-style="bootstrap"]` | **`[data-tt-style="material"]`** |
| 全局污染 | 有 | 无 | 无 | **无** |
| 类名风格 | `tt-` 前缀 + 工具类 | `weui-` 前缀 | Bootstrap 原生类名 | **`m3-` 前缀 + BEM（`.m3-btn__spinner`）** |
| 多库共存 | 与 weui 冲突 | 安全 | 安全 | **安全** |

**一句话**：material 用 `m3-` 类名承载 M3 的五种按钮形态、filled/outlined 输入框、
state layer、surface-container 层级与 elevation，靠 `<html data-tt-style="material">`
这一个属性隔离。与 bootstrap 的模块代码**结构完全一致**，只有类名与 CSS 值不同。

---

## 2. Token 分层模型

```
① tokens.css   ── 上游原始 token（--md-sys-*），亮/暗两套，照抄 M3 baseline
② alias.css    ── Timeless 语义别名（--primary / --background / --radius / --state-hover …）
③ components/*.css ── 组件样式，只读第 ② 层
```

### ① 上游原始层 — `src/style/tokens.css`

变量名照抄 Material Design 3 的 design token 命名（`md.sys.*`），CSS 自定义属性
统一小写连字符：`--md-sys-color-*` / `--md-sys-shape-*` / `--md-sys-typescale-*` /
`--md-sys-elevation-*` / `--md-sys-state-*` / `--md-sys-motion-*`。

调色板来源：M3 官方 **baseline**（seed = `#6750A4`，即默认 purple baseline），
按静态值落库，不引入运行时生成算法。全部挂在 `[data-tt-style="material"]` 之下；
暗色挂 `.dark` / `[data-theme="dark"]`，与 `app.setTheme` 对齐。

组件代码**不读这一层**。换上游调色板时只动这个文件。

### ② Timeless 语义别名层 — `src/style/alias.css`

组件代码只读这一层（`--primary` / `--background` / `--border` / `--radius` …），
别名表与 bootstrap / fluent 保持同名，因此三套作用域库的 `modules/*.ts`
形状完全一致。除通用别名外，material 额外暴露 M3 专有语义：
`--surface-container-*` / `--outline` / `--outline-variant` / `--state-hover` /
`--state-focus` / `--state-pressed` / `--elevation-1..5` / `--radius-pill`。

### ③ 组件样式层 — `src/style/components/*.css`

每个组件一个文件，全部以 `[data-tt-style="material"]` 开头。允许在本文件内定义
**组件级局部 token**（如 Button 的 `--m3-btn-container` / `--m3-btn-label`），
但必须有合理默认值。

---

## 3. 完整 Token 清单

### 3.1 上游原始 token（`--md-sys-*`，`tokens.css`）

调色板来自 M3 baseline。下表为组件实际引用到的部分（完整清单见 `src/style/tokens.css`）。

| 分组 | 变量 | 亮色值 | 暗色值 |
|---|---|---|---|
| primary | `--md-sys-color-primary` | `#6750A4` | `#D0BCFF` |
| | `--md-sys-color-on-primary` | `#FFFFFF` | `#381E72` |
| | `--md-sys-color-primary-container` | `#EADDFF` | `#4F378B` |
| | `--md-sys-color-on-primary-container` | `#21005D` | `#EADDFF` |
| secondary | `--md-sys-color-secondary` | `#625B71` | `#CCC2DC` |
| | `--md-sys-color-secondary-container` | `#E8DEF8` | `#4A4458` |
| | `--md-sys-color-on-secondary-container` | `#1D192B` | `#E8DEF8` |
| tertiary | `--md-sys-color-tertiary` | `#7D5260` | `#EFB8C8` |
| | `--md-sys-color-tertiary-container` | `#FFD8E4` | `#633B48` |
| | `--md-sys-color-on-tertiary-container` | `#31111D` | `#FFD8E4` |
| error | `--md-sys-color-error` | `#B3261E` | `#F2B8B5` |
| | `--md-sys-color-error-container` | `#F9DEDC` | `#8C1D18` |
| | `--md-sys-color-on-error-container` | `#410E0B` | `#F9DEDC` |
| surface | `--md-sys-color-surface` / `background` | `#FFFBFE` | `#1C1B1F` |
| | `--md-sys-color-on-surface` / `on-background` | `#1C1B1F` | `#E6E1E5` |
| | `--md-sys-color-surface-variant` | `#E7E0EC` | `#49454F` |
| | `--md-sys-color-on-surface-variant` | `#49454F` | `#CAC4D0` |
| | `--md-sys-color-surface-container-lowest` | `#FFFFFF` | `#0F0D13` |
| | `--md-sys-color-surface-container-low` | `#F7F2FA` | `#1D1B20` |
| | `--md-sys-color-surface-container` | `#F3EDF7` | `#211F26` |
| | `--md-sys-color-surface-container-high` | `#ECE6F0` | `#2B2930` |
| | `--md-sys-color-surface-container-highest` | `#E6E0E9` | `#36343B` |
| outline | `--md-sys-color-outline` | `#79747E` | `#938F99` |
| | `--md-sys-color-outline-variant` | `#CAC4D0` | `#49454F` |
| inverse | `--md-sys-color-inverse-surface` | `#313033` | `#E6E1E5` |
| | `--md-sys-color-inverse-primary` | `#D0BCFF` | `#6750A4` |
| shape | `--md-sys-shape-corner-none/extra-small/small/medium/large/extra-large/full` | `0 / 4 / 8 / 12 / 16 / 28 / 9999px` | 同名不变 |
| elevation | `--md-sys-elevation-level0..5` | M3 官方两层阴影 | 同名不变 |
| state | `--md-sys-state-hover/focus/pressed/dragged-state-layer-opacity` | `0.08 / 0.12 / 0.12 / 0.16` | 同名不变 |
| motion | `--md-sys-motion-easing-standard/emphasized*`、`duration-short2/medium2/long2` | `cubic-bezier(…)` / `100 / 300 / 500ms` | 同名不变 |
| typescale | `--md-sys-typescale-body-*` / `label-*` / `title-*` / `headline-small-*` | M3 字号 / 行高 | 同名不变 |
| 尺寸 | `--md-sys-size-touch-target` / `--md-sys-size-control-height` | `48px` / `40px` | 同名不变 |

> 上游文件的完整清单见 `src/style/tokens.css`。

### 3.2 Timeless 语义别名（`alias.css`）

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--background` / `--foreground` | `--md-sys-color-background` / `on-background` | 页面底色与正文 |
| `--card` / `--card-foreground` | `surface-container-low` / `on-surface` | Card 表面 |
| `--popover` / `--popover-foreground` | `surface-container` / `on-surface` | 浮层表面 |
| `--primary` / `--primary-foreground` | `primary` / `on-primary` | 主操作 |
| `--primary-container` / `-foreground` | `primary-container` / `on-primary-container` | Badge / Alert |
| `--secondary` / `--secondary-foreground` | `secondary` / `on-secondary` | 次操作 |
| `--secondary-container` / `-foreground` | `secondary-container` / `on-secondary-container` | Tonal 按钮 / 选中项 |
| `--muted` / `--muted-foreground` | `surface-container-high` / `on-surface-variant` | 弱化底色 / 文字 |
| `--accent` / `--accent-foreground` | `surface-container-highest` / `on-surface` | 强调底色 |
| `--destructive` / `--destructive-foreground` | `error` / `on-error` | 危险操作 |
| `--destructive-container` / `-foreground` | `error-container` / `on-error-container` | 危险容器 |
| `--success` / `--warning` / `--info`（+`-container`） | 手写 M3 对齐色 | 语义状态（M3 无标准档，取 M3 调色板扩展） |
| `--border` / `--input` | `outline-variant` / `outline` | 边框 / 输入框描边 |
| `--ring` / `--ring-width` / `--ring-color` | `primary` / `2px` / `primary` | 焦点环 |
| `--surface-container-lowest…highest` | `surface-container-*` | Card / Menu 层级填充 |
| `--outline` / `--outline-variant` | `outline` / `outline-variant` | M3 描边两档 |
| `--inverse-surface` / `--inverse-surface-foreground` | `inverse-surface` / `inverse-on-surface` | 反色表面 |
| `--state-hover` / `--state-focus` / `--state-pressed` / `--state-dragged` | `state-*-state-layer-opacity` | state layer 不透明度 |
| `--radius` / `-sm` / `-md` / `-lg` / `-xl` / `-pill` | `shape-corner-medium/small/…/full` | 圆角（`pill` = 9999px） |
| `--elevation-1..5`（`--shadow-sm/--shadow/--shadow-lg`） | `elevation-level1..5` | M3 阴影 |
| `--easing-standard` / `--easing-emphasized` / `--duration-short/medium/long` | `motion-*` | 动效 |
| `--disabled-opacity` / `--disabled-container-opacity` | `0.38` / `0.12` | 禁用态 |
| `--font-sans` / `--font-mono` | `ref-typeface-plain` / 等宽栈 | 字体栈 |
| `--font-size` / `--font-size-sm` / `--font-size-xs` | `body-large` / `body-small` / `label-small` | 字号 |
| `--label-size` / `--title-size` | `label-large` / `title-medium` | 组件字号档 |
| `--spacer` / `--spacer-sm` / `--spacer-lg` | `16px` / `8px` / `24px` | 间距 |
| `--control-height` / `-sm` / `-lg` | `40px` / `32px` / `56px` | 控件高度 |

> 组件样式**必须**只引用本表。若发现组件引用了表外的别名，属于规范缺口，应补进本表。

### 3.3 组件级局部 token

定义在各自的 `components/*.css` 里，以组件类为作用域：

- Button：`--m3-btn-container` / `--m3-btn-label` / `--m3-btn-border`
  （形态类只改这三个值，state layer 统一用 `currentColor` + `--state-*`）。

它们的作用域是**声明块所在的选择器**，因此可以安全地按状态改写。

---

## 4. 暗色挂载点

### 4.1 四选择器形式

与 shadcn/weui/bootstrap 同源，暗色必须同时命中「属性在祖先」与「属性在同元素」：

```css
.dark [data-tt-style="material"],
[data-theme="dark"] [data-tt-style="material"],
[data-tt-style="material"].dark,
[data-tt-style="material"][data-theme="dark"] { /* 暗色覆盖 */ }
```

**为什么是四个**：`data-tt-style` 可以挂在 `<html>`（示例应用的用法），也可以挂在任意
包裹元素（多库同页时必须在子树上切换）。前者命中后两个，后者命中前两个。

### 4.2 与应用主题 API 的衔接

`packages/provider-web/src/app.ts` 的 `app.setTheme("light" | "dark" | "system")`
在 `<html>` 上同时设置 `data-theme="dark"`、`style.colorScheme = "dark"` 与 `.dark`。
因此 material 库**不需要任何额外适配**：模块代码不感知主题，只有 token 变。
示例应用（`apps/web-material`）用 `app.toggleTheme()` / `app.setTheme(next)` 切换。

### 4.3 首屏闪烁

与 bootstrap 相同：示例应用在 `<head>` 里放一段内联脚本（读 `localStorage.theme`，
解析 `system`，写 `data-theme` + `.dark` + `colorScheme`），与 `app.setTheme` 写的是
同一组属性。

---

## 5. 作用域与共存

### 5.1 核心约定

> **本库输出的每一条 CSS 规则、每一个 token，都必须处于 `[data-tt-style="material"]`
> 之下。** 没有例外。

具体禁令：

- 不得输出 `html` / `body` / `#root` 规则；
- 不得输出无作用域的 `*` 规则（`*::before` 也必须带 `[data-tt-style="material"] ` 前缀）；
- 不得输出裸 `@keyframes`（用 `m3-` 前缀命名，如 `m3-spin` / `m3-pulse` /
  `m3-progress-stripes`）。

`base.css` 里的重置写在 `[data-tt-style="material"] *` 之下，只在作用域内生效。

### 5.2 多库同页

因为隔离靠属性而非类名前缀，同一页面可以同时加载 `timeless.material.css` 与
`timeless.bootstrap.css`：

```html
<html data-tt-style="bootstrap">
  …bootstrap 组件…
  <div data-tt-style="material">   <!-- 子树切到 Material -->
    …material 组件（class 带 m3- 前缀）…
  </div>
</html>
```

> 注意：shadcn / weui 是「全局库」（token 挂 `:root` / `.weui-*`，带全局规则），
> 不与作用域库混用在同一子树。见 `THEME_PACKAGE_GUIDE.md` 第 2 节。

### 5.3 与真实 Material 实现共存

本库类名（`.m3-btn` / `.m3-card` / `.m3-input` …）是**自定义**的，不与
`@material/web` 的 `md-*` 元素或 Materialize 的 `.btn` 冲突；即便如此，也不要在
同一个子树里把 `data-tt-style="material"` 与其它 Material CSS 框架混用，
以免两套 surface / elevation 定义互相覆盖。

---

## 6. 应用内覆盖 Token 的三种方式

### 方式 A：覆盖上游层（换 seed 配色，保留 M3 结构）

```html
<html data-tt-style="material">
  <style>
    [data-tt-style="material"] {
      --md-sys-color-primary: #00639b;
      --md-sys-color-primary-container: #cbe6ff;
    }
  </style>
</html>
```

### 方式 B：覆盖别名层（只改某类语义，不动上游）

```html
<style>
  [data-tt-style="material"] { --radius: 0.75rem; --state-hover: 0.12; }
</style>
```

### 方式 C：局部子树换肤

```html
<div data-tt-style="material" style="--primary: #d946ef">
  …该子树内的 filled 按钮变品红…
</div>
```

> 三种方式的**特异性都低于**组件样式里「声明块内改写局部 token」的写法，所以
> 组件自身的 hover / active 覆盖不会被应用层意外压掉。

### 方式 D：规范页实时调参（预览孤岛）

`apps/web-material` 的**设计规范页**（左菜单「设计规范」→ `/home/design`）把方式 B / C
做成了可视化编辑器：左侧是从真实 token 读出来的规范表 + 控件，右侧一块预览孤岛。
控件写的是孤岛元素上的**内联 CSS 变量**，所以只影响孤岛，画廊外壳不受影响，
可一键重置。机制与注意事项见 `THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=material`（→ <http://127.0.0.1:3402>，见指南 §8.4）。

本库实际可调的 token（页面按「该 token 在 `<html>` 上是否声明」自动筛选，
共 27 个）：

| 分组 | token |
|---|---|
| 色板 | `--primary` `--secondary` `--destructive` `--background` `--foreground` `--muted` `--muted-foreground` `--border` |
| 圆角 | `--radius` `--radius-sm` `--radius-md` `--radius-lg` |
| 间距 | `--spacer` `--spacer-sm` `--spacer-lg` |
| 尺寸 | `--control-height` `--control-height-sm` `--control-height-lg` |
| 字阶 | `--font-size` `--line-height` |
| 阴影 | `--shadow` `--shadow-sm` `--shadow-lg` |
| 动效 | `--duration-short` `--duration-medium` `--duration-long` `--easing-standard` |

两条边界：

- 页面**不暴露第一层 `--md-sys-*`**，只暴露第二层语义别名（理由见
  `THEME_PACKAGE_GUIDE.md` §5.4）。
- 组件样式里直接读原始 token 的地方不随编辑器变化，这是设计如此。

---

## 7. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/material.css` | 样式入口，`tokens → alias → base → components/*` |
| `src/style/tokens.css` | 上游 `--md-sys-*`（亮/暗） |
| `src/style/alias.css` | Timeless 语义别名 + M3 专有别名 |
| `src/style/base.css` | 作用域内的基础/重置 |
| `src/style/components/*.css` | Tier1 24 + Tier2 17 + Tier3 8 + tree + flow = 51 个组件样式 |
| `src/modules/*.ts` | 薄包装：store 订阅 + 作用域类名 |
| `src/index.ts` | 导出 + 动态 `import("./style/material.css")` |
| `apps/web-material` | 组件画廊示例应用 |

---

## 8. 状态与暗色巡检

51 个模块走同一套状态钩子，巡检口径：`disabled` 属性 / `[aria-invalid="true"]` /
`.is-invalid` / `.is-loading` / `:focus-visible` / `@media (prefers-reduced-motion: reduce)`。

| 状态 | 落点 | 覆盖 |
|---|---|---|
| 禁用 | `[disabled]` / `[aria-disabled="true"]`，内容与描边用 `--md-sys-color-on-surface` 的 38% 透明度 | 29 个样式文件 |
| 校验失败 | `[aria-invalid="true"]`（输入/选择类）或 `.is-invalid`（表单类），用 `--md-sys-color-error` | 14 个样式文件 |
| 加载 | `.is-loading`（按钮、搜索类）；占位符用 `skeleton.css` | button / search-select 等 |
| 键盘焦点 | `:focus-visible` 用 `--md-sys-color-primary` 描边——**不写 `:focus`** | 20 个样式文件 |
| 动效降级 | `base.css` 一条作用域内的兜底：`[data-tt-style="material"] *` 把 animation / transition 压到 `0.01ms` | 29 个样式文件 |

M3 的"状态层"（state layer）不靠 CSS 变量，而是组件样式里按状态叠 `--md-sys-state-*`
透明度的 `::before` 覆盖层，所以 hover / focus / pressed 三层在同一组件内独立可查。

暗色**不使用组件级选择器**：所有组件样式只引用语义别名（`--background` / `--primary` /
`--border` …），暗色只在 `tokens.css` 里换一次声明（第 4 节那 4 个选择器）。

---

## 9. 与其他库的关系

| | 关系 |
|---|---|
| `@timeless/timeless` | 唯一依赖。提供 `ui`（primitive）与 `vm`（core）。 |
| `@timeless/bootstrap` | 兄弟库，模块结构与本库一一对应，仅类名/CSS 不同。 |
| `@timeless/shadcn` | 兄弟库。shadcn 是全局（`:root` + Tailwind），本库是作用域。 |
| `@timeless/weui` | 兄弟库。weui 用 `weui-` 类名前缀隔离，本库用 `data-tt-style` 属性隔离。 |
| `@timeless/fluent` | 同批新增的作用域库，`data-tt-style="fluent"`。 |

---

## 10. 组件覆盖范围

本库按标准组件清单落地，分三档：

- **Tier 1（24，已实现）**：button、input、textarea、label、checkbox、checkbox-group、
  radio、switch、toggle、slider、select、number-input、progress、avatar、badge、
  separator、skeleton、card、alert、kbd、link、aspect-ratio、scroll-area、field。
- **Tier 2（17，已实现）**：dialog、sheet、popover、popconfirm、tooltip、dropdown-menu、
  context-menu、menu、tabs、accordion、steps、toast、table、form、search-select、
  file-picker、resizable-panels。
- **Tier 3（8，已实现）**：date-picker、date-range-picker、time-picker、date-time-picker、
  cascader、scroll-view、affix、waterfall。

另有两个结构复杂组件（已实现，逻辑在共享层，本库只出薄包装 + CSS）：

- **tree**：`vm.TreeCore` + `ui.TreePrimitive`。虚拟滚动、展开/折叠、指针拖拽三区落点、
  悬停自动展开、checkbox 父子联动与半选。行高落在 `--tree-row-height`（40px），
  因为 `ListViewV2` 的 `itemHeight` 是渲染器入参，两边必须一致。
- **flow**：`vm.FlowCanvasModel` / `FlowNodeModel` / `FlowEdgeModel`。节点拖拽、滚轮缩放、
  空白平移、边路径计算全在 core；本库只画 DOM，状态色走 M3 的 container / on-container
  色对，浮层用 `--elevation-*`。流动边用 `.is-animated` + `@keyframes m3-flow-dash`。

累计 **51 / 51** 已实现（24 + 17 + 8 + tree + flow）。

**不在范围**：`llm-provider-form`、`history-panel`、`menu-shared`（辅助，非组件）、
`sonner`（由 `toast` 覆盖）。

### 9.1 Material 3 特征落点

| 特征 | 落点 |
|---|---|
| state layer | Button `::before` 叠 `currentColor`，透明度 `--state-hover/focus/pressed`；Switch / Slider / NumberInput 用扩散 `box-shadow` |
| 全圆角 / pill | Button `--radius-pill`（20px）、Badge / Avatar / Slider thumb / Progress 轨道 |
| surface-container 层级 | Card（low）、浮层（`--popover` → container）、Menu 项 / Select 选中（secondary-container）、Skeleton / Kbd（high） |
| elevation | Card 默认 `--elevation-1`、浮层 `--elevation-2`、Button `--elevated` |
| filled / outlined 输入 | Input、Textarea、Select、NumberInput 的 `variant` |
| 动效 easing | 过渡统一走 `--duration-short` + `--easing-standard`，Switch thumb 走 `--easing-emphasized` |
| 大圆角浮层 | Dialog surface `--radius-xl`（28px）；Sheet 24px（贴边侧为 0） |
| scrim | Dialog / Sheet 遮罩 `--scrim` + 32% 不透明 |
| 底部指示条 / pill | Tabs primary 3px `--primary` 指示条；secondary 用 `--secondary-container` pill |
| 菜单 state layer | Menu / DropdownMenu / ContextMenu 条目 `::before` 叠 `currentColor`（`--state-hover`/`--state-pressed`）+ `--elevation-2` |
| 反色气泡 | Tooltip `--inverse-surface` 底 + `--inverse-surface-foreground` 字 |
| 容器层级 | Toast `--surface-container-high` + `--elevation-3`；Accordion / dropzone `--surface-container-low` |
| 强调态 | Steps current `--primary-container` / completed `--primary`；Accordion 展开标题 `--primary` |
| 分割线 | Table 行分割用 `--outline-variant`，表头字 `--muted-foreground` |
| 日期浮层 | DatePicker / DateRangePicker / TimePicker / DateTimePicker / Cascader 浮层统一 `--surface-container-high` + `--elevation-3` + `--radius-xl`（28px），进场 `--duration-medium` + `--easing-emphasized` |
| 日期单元格 | `40px` 正圆 `.m3-datepicker__cell`：选中 `.is-active` 填 `--primary` / `--primary-foreground`，今天 `.is-today` 用 `inset 0 0 0 1px --primary` 描边 |
| 区间底带 | DateRangePicker `.is-in-range` 用 `::before` 铺 `--primary-container`，端点 `.is-range-start/end` 实心 `--primary`，圆角只落在区间外沿 |
| 时间列 | TimePicker 列由 `ScrollViewPrimitive` 驱动，行高 36px；选中 `.is-active` 用 `--primary-container`，未选中字 `--muted-foreground` |
| 级联面板 | Cascader `.is-active` 项 `--secondary-container`，hover / focus 走 state layer；搜索结果的路径文字用 `.m3-cascader__path` |
| 细滚动条 | ScrollView 复用 ScrollArea 的细滚动条（`--outline` + `--radius-pill`），列内滚动条用 `scrollbar-width: none` 完全隐藏 |
| 固钉 | Affix 固定态 `.is-fixed` 走 `--elevation-3` + `--surface-container-high`，过渡 `--easing-standard` |
| 瀑布流 | Waterfall 列 `flex: 1 1 0`，格子绝对定位（top/height 由模型下发），item 用 `--card` + `--elevation-1` |

Tier 2 / Tier 3 的 CSS 全部落在 `src/style/components/`，`@keyframes` 统一 `m3-` 前缀
（`m3-datepicker-in/out`、`m3-daterangepicker-in/out`、`m3-timepicker-in/out`、
`m3-datetimepicker-in/out`、`m3-cascader-in/out`）；
模块侧沿用 Tier 1 的 store 订阅 + 作用域类名写法，浮层类名与 bootstrap / fluent 同名。

新增组件时必须遵守的骨架与状态要求见 `THEME_PACKAGE_GUIDE.md` 第 6 节。
