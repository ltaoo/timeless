# `@timeless/fluent` 设计规范（Design Token + CSS Variable）

> 本文档描述 `@timeless/fluent` 的 token 体系。
> 阅读前请先看仓库根目录的 `THEME_PACKAGE_GUIDE.md`（分层模型与新建样式库的方法），
> 以及 `packages/bootstrap/THEME_DESIGN.md`（同一骨架在 Bootstrap 原生类名路线的实现）。

---

## 1. 与 shadcn / bootstrap 的根本差异

四个库共享**同一批组件**（`@timeless/ui-primitive` 的组合层 + `@timeless/inner-vm` 的状态机），
差异只在 token 与 CSS。但"作用域"策略不同：

| 维度 | shadcn | bootstrap | **fluent（本库）** |
|---|---|---|---|
| 样式技术 | Tailwind v4 + 工具类 | 纯 CSS + CSS 变量 | **纯 CSS + CSS 变量** |
| 主题挂载点 | `:root` / `.dark` | `[data-tt-style="bootstrap"]` | **`[data-tt-style="fluent"]`** |
| 全局污染 | 有（`@layer base` 改 `*`、`body`） | 无 | **无（属性作用域隔离）** |
| 类名风格 | `tt-` 前缀 + Tailwind 工具类 | Bootstrap 原生类名 `.btn` | **Fluent BEM：`.fl-btn` / `.fl-btn__spinner`** |
| 多库共存 | 需避免与 weui 冲突 | 安全 | **安全（见第 5 节）** |

**一句话**：fluent 库用 Fluent 2 的**设计语义**（1px stroke、中性表面层级、复合品牌色、
分级阴影、32px 控件高度、4px 圆角），但类名是自己的一套 `fl-` 前缀 BEM。
隔离靠 `<html data-tt-style="fluent">` 这一个属性完成，因此永远不会和真实
Fluent UI / Bootstrap / shadcn 的类名打架。

与 bootstrap 的两个关键差异：

1. **不是原生类名**。bootstrap 直接复用 `.btn` / `.form-control`，fluent 不复用
   Fluent UI 的 `.fui-*`，而是新造 `fl-btn` / `fl-control`，避免与上游包冲突。
2. **多一层 Fluent 专有别名**。Fluent 的视觉特征（stroke 分档、shadow 档位、
   表面层级、复合品牌色）无法用通用的 `--primary / --border` 表达，因此在通用别名之外
   额外暴露 `--stroke1 / --surface-3 / --shadow-16 / --compound-brand` 等（见 3.2）。

---

## 2. Token 分层模型

```
① tokens.css   ── 上游原始 token（--colorNeutral* / --colorBrand* / --shadow*…），亮/暗两套
② alias.css    ── Timeless 语义别名（--primary / --background / --stroke1 / --surface-3 …）
③ components/*.css ── 组件样式，只读第 ② 层
```

### ① 上游原始层 — `src/style/tokens.css`

变量名照抄 `@fluentui/tokens` 的 **`webLightTheme` / `webDarkTheme` 键名，保留 camelCase**
（`--colorNeutralBackground1` / `--colorBrandBackground` / `--borderRadiusMedium` …），
因为这套名字本身就是 Fluent 的公开 token 契约，换成短横线反而增加心智负担。

Fluent **没有官方打包的 CSS 变量产物**（`@fluentui/tokens` 只导出 JS 对象），
因此值是从 `webLightTheme` / `webDarkTheme` **手工抄录**到 CSS 里的。只做两处改动：

1. 全部挂在 `[data-tt-style="fluent"]` 之下（而不是 `:root`）；
2. 暗色从 `webDarkTheme` 的 JS 对象改挂到 `.dark` / `[data-theme="dark"]`，
   与 `app.setTheme()` 对齐。

组件代码**不读这一层**。升级 Fluent token 时只动这个文件。

### ② Timeless 语义别名层 — `src/style/alias.css`

组件代码只读这一层。这一层的存在保证了三套作用域库（bootstrap / material / fluent）
的模块代码**形状完全一致**——同一个 `button.ts` 里 `classNames(["fl-btn", ...])` 的写法，
在 bootstrap 里换成 `btn` 即可，无需理解 Fluent 的中性色阶。

别名表**在前半部分与 bootstrap 同名同义**（`--primary` / `--background` / `--border` /
`--radius` / `--font-size` / `--control-height` …），Fluent 专有的视觉语义
（`--stroke1` / `--surface-*` / `--shadow-4` / `--compound-brand`）作为**扩展字段**追加在后半部分。

### ③ 组件样式层 — `src/style/components/*.css`

每个组件一个文件，全部以 `[data-tt-style="fluent"]` 开头。允许在本文件内定义
**组件级局部 token**（如 `--btn-*` / `--card-*`），但必须有合理默认值。

---

## 3. 完整 Token 清单

### 3.1 上游原始 token（`tokens.css`）

| 分组 | 变量 | 亮色值 | 暗色值 |
|---|---|---|---|
| 中性表面 | `--colorNeutralBackground1` | `#ffffff` | `#292929` |
| | `--colorNeutralBackground1Hover` | `#f5f5f5` | `#3d3d3d` |
| | `--colorNeutralBackground2` | `#fafafa` | `#1f1f1f` |
| | `--colorNeutralBackground3` | `#f5f5f5` | `#141414` |
| | `--colorNeutralBackground4` | `#f0f0f0` | `#0a0a0a` |
| | `--colorNeutralBackgroundDisabled` | `#f0f0f0` | `#141414` |
| 中性前景 | `--colorNeutralForeground1` | `#242424` | `#ffffff` |
| | `--colorNeutralForeground2` | `#424242` | `#d6d6d6` |
| | `--colorNeutralForeground3` | `#616161` | `#adadad` |
| | `--colorNeutralForegroundDisabled` | `#bdbdbd` | `#5c5c5c` |
| | `--colorNeutralForegroundOnBrand` | `#ffffff` | `#ffffff` |
| 中性描边 | `--colorNeutralStroke1` | `#d1d1d1` | `#666666` |
| | `--colorNeutralStroke2` | `#e0e0e0` | `#525252` |
| | `--colorNeutralStroke3` | `#f0f0f0` | `#3d3d3d` |
| | `--colorNeutralStrokeAccessible` | `#616161` | `#adadad` |
| | `--colorNeutralStrokeDisabled` | `#e0e0e0` | `#424242` |
| 品牌 | `--colorBrandBackground` | `#0f6cbd` | `#115ea3` |
| | `--colorBrandBackgroundHover` | `#115ea3` | `#0f6cbd` |
| | `--colorBrandBackgroundPressed` | `#0c3b5e` | `#0c3b5e` |
| | `--colorBrandBackground2` | `#ebf3fc` | `#082338` |
| | `--colorBrandForeground1` | `#0f6cbd` | `#479ef5` |
| | `--colorBrandForegroundLink` | `#115ea3` | `#479ef5` |
| | `--colorBrandStroke1` | `#0f6cbd` | `#479ef5` |
| 复合品牌 | `--colorCompoundBrandBackground` | `#0f6cbd` | `#479ef5` |
| | `--colorCompoundBrandBackgroundHover` | `#115ea3` | `#62abf5` |
| | `--colorCompoundBrandBackgroundPressed` | `#0c3b5e` | `#2886de` |
| 状态 | `--colorStatusSuccessBackground3` | `#107c10` | `#107c10` |
| | `--colorStatusSuccessBackground1` | `#f1faf1` | `#052505` |
| | `--colorStatusWarningBackground3` | `#f7630c` | `#f7630c` |
| | `--colorStatusWarningBackground1` | `#fff9f5` | `#4a1e04` |
| | `--colorStatusDangerBackground3` | `#c50f1f` | `#c50f1f` |
| | `--colorStatusDangerBackground1` | `#fdf3f4` | `#3b0509` |
| 字体 | `--fontFamilyBase` | `"Segoe UI", …` | 同名不变 |
| | `--fontFamilyMonospace` | `Consolas, …` | 同名不变 |
| | `--fontSizeBase100/200/300/400/500/600` | `10/12/14/16/20/24px` | 同名不变 |
| | `--fontWeightRegular/Medium/Semibold/Bold` | `400/500/600/700` | 同名不变 |
| | `--lineHeightBase200/300/400/500/600` | `16/20/22/28/32px` | 同名不变 |
| 圆角 | `--borderRadiusNone/Small/Medium/Large/XLarge/Circular` | `0/2/4/6/8/10000px` | 同名不变 |
| 描边宽 | `--strokeWidthThin/Thick` | `1px / 2px` | 同名不变 |
| 阴影 | `--shadow2` | `0 0 2px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.14)` | ambient/key 提到 `.24/.28` |
| | `--shadow4` | `…0 2px 4px…` | 同上 |
| | `--shadow8` | `…0 4px 8px…` | 同上 |
| | `--shadow16` | `…0 8px 16px…` | 同上 |
| | `--shadow28` / `--shadow64` | 浮层用 | 同上 |
| 动效 | `--curveEasyEase` / `--curveDecelerateMid` / `--curveAccelerateMid` | `cubic-bezier(…)` | 同名不变 |
| | `--durationFaster/Fast/Normal/Slow` | `100/150/200/300ms` | 同名不变 |
| 焦点 | `--focusRingWidth` | `2px` | 同名不变 |
| | `--focusRingColor` | `#000000` | `#ffffff` |
| 尺寸 | `--controlHeightSmall/Medium/Large` | `24/32/40px` | 同名不变 |

> 上游文件的完整清单见 `src/style/tokens.css`。以上是组件实际引用到的部分。

### 3.2 Timeless 语义别名（`alias.css`）

**通用别名（与 bootstrap 同名）**

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--background` / `--foreground` | `--colorNeutralBackground1` / `--colorNeutralForeground1` | 页面底色与正文 |
| `--card` / `--card-foreground` | `--colorNeutralBackground1` / `--colorNeutralForeground1` | Card 表面 |
| `--popover` / `--popover-foreground` | `--colorNeutralBackground1` / `--colorNeutralForeground1` | 浮层表面 |
| `--primary` / `--primary-foreground` | `--colorBrandBackground` / `--colorNeutralForegroundOnBrand` | 主操作 |
| `--primary-hover` / `--primary-pressed` | `--colorBrandBackgroundHover` / `Pressed` | 主操作态 |
| `--secondary` / `--secondary-foreground` | `--colorNeutralBackground3` / `--colorNeutralForeground1` | 次操作 |
| `--destructive` (+`-subtle`/`-foreground`) | `--colorStatusDangerBackground3` / `…1` / `…Foreground1` | 危险操作 |
| `--success` / `--warning` / `--info` (+`-subtle`/`-foreground`) | `--colorStatus*` / `--colorBrandBackground2` | 语义状态 |
| `--muted` / `--muted-foreground` | `--colorNeutralBackground3` / `--colorNeutralForeground3` | 弱化底色/文字 |
| `--accent` / `--accent-foreground` | `--colorNeutralBackground1Hover` / `--colorNeutralForeground1` | 强调底色 |
| `--border` / `--input` | `--colorNeutralStroke1` / `--colorNeutralStrokeAccessible` | 边框、输入框描边 |
| `--ring` / `--ring-width` / `--ring-color` | `--colorNeutralStrokeAccessibleSelected` / `--focusRing*` | 焦点环 |
| `--radius` / `--radius-sm` / `--radius-lg` / `--radius-pill` | `--borderRadiusMedium/Small/Large/Circular` | 圆角 |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | `--shadow2` / `--shadow4` / `--shadow8` | 阴影 |
| `--font-sans` / `--font-mono` | `--fontFamilyBase` / `--fontFamilyMonospace` | 字体栈 |
| `--font-size` / `-sm` / `-xs` / `-lg` | `--fontSizeBase300/200/100/400` | 字号（14/12/10/16px） |
| `--line-height` | `--lineHeightBase300` | 行高 |
| `--spacer` / `--spacer-sm` / `--spacer-lg` | `12px` / `8px` / `16px` | 间距 |
| `--control-height` / `-sm` / `-lg` | `--controlHeightMedium/Small/Large` | 控件高度（32/24/40px） |
| `--disabled-opacity` | `1`（Fluent 用 `--foreground-disabled` 表达禁用） | 禁用态 |

**Fluent 专有别名（扩展字段）**

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--stroke1` / `--stroke1-hover` / `--stroke1-pressed` | `--colorNeutralStroke1*` | 1px 中性描边分档 |
| `--stroke2` / `--stroke3` | `--colorNeutralStroke2/3` | 更弱的描边（分组线/键帽） |
| `--stroke-accessible` | `--colorNeutralStrokeAccessible` | 高对比描边（输入框下划线） |
| `--stroke-disabled` | `--colorNeutralStrokeDisabled` | 禁用描边 |
| `--brand-fill` / `-hover` / `-pressed` / `-selected` | `--colorBrandBackground*` | 品牌填充 |
| `--brand-stroke` | `--colorBrandStroke1` | 品牌描边 |
| `--compound-brand` / `-hover` / `-pressed` | `--colorCompoundBrandBackground*` | checkbox/radio/switch/slider 选中色 |
| `--surface-1` / `-1-hover` / `-1-pressed` | `--colorNeutralBackground1*` | 表面层级 1（卡片） |
| `--surface-2` / `--surface-3` / `--surface-4` / `--surface-5` | `--colorNeutralBackground2..5` | 表面层级 2..5（页底/键帽/凹陷） |
| `--surface-disabled` / `--surface-inverted` | `--colorNeutralBackgroundDisabled/Inverted` | 禁用/反色表面 |
| `--foreground-2` / `--foreground-3` / `--foreground-4` / `--foreground-disabled` | `--colorNeutralForeground2..4` / `Disabled` | 文字层级 |
| `--shadow-2` / `-4` / `-8` / `-16` / `-28` / `-64` | `--shadow2..64` | 浮层分级阴影 |
| `--easing-standard` / `-decelerate` / `-accelerate` | `--curveEasyEase` / `DecelerateMid` / `AccelerateMid` | 动效曲线 |
| `--duration-faster` / `-fast` / `-normal` / `-slow` | `--durationFaster..Slow` | 动效时长 |
| `--label-size` / `--title-size` | `--fontSizeBase300` / `--fontSizeBase500` | 表单标签 / 标题 |
| `--disabled-foreground` | `--colorNeutralForegroundDisabled` | 禁用文字 |

> 组件样式**必须**只引用本表。若发现组件引用了表外的别名，属于规范缺口，应补进本表。

### 3.3 组件级局部 token

定义在各自的 `components/*.css` 里，以组件类为作用域，例如：

- Button：`--btn-padding-x` / `--btn-radius` / `--btn-min-width`
- Input / Textarea：`--control-underline`（focus 时的 2px 品牌下划线厚度）
- Card：`--card-padding` / `--card-gap`
- Kbd：键帽底边 2px（`--strokeWidthThick`）表达键程

它们的作用域是**声明块所在的选择器**，不是 token 层，因此可以安全地按状态改写。

---

## 4. 暗色挂载点

### 4.1 四选择器形式

与 shadcn / bootstrap 同源，暗色必须同时命中"属性在祖先"与"属性在同元素"两种情况：

```css
.dark [data-tt-style="fluent"],
[data-theme="dark"] [data-tt-style="fluent"],
[data-tt-style="fluent"].dark,
[data-tt-style="fluent"][data-theme="dark"] { /* 暗色覆盖：webDarkTheme 的对应值 */ }
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

因此 fluent 库**不需要任何额外适配**：模块代码不感知主题，只有 token 变。
示例应用（`apps/web-fluent`）用 `app.toggleTheme()` / `app.setTheme(next)` 切换。

> 暗色下 `--focusRingColor` 从 `#000000` 变 `#ffffff`，这是 Fluent 的规范行为
> （焦点环在深色底上必须是白/亮色）。

### 4.3 首屏闪烁

暗色在 JS 启动前必须就位，否则会闪过一帧亮色。示例应用在 `<head>` 里放了一段
内联脚本（读 `localStorage.theme`，解析 `system`，写 `data-theme` + `.dark` +
`colorScheme`），与 `app.setTheme` 写的是同一组属性。

---

## 5. 作用域与共存

### 5.1 核心约定

> **本库输出的每一条 CSS 规则、每一个 token，都必须处于 `[data-tt-style="fluent"]`
> 之下。** 没有例外。

具体禁令：

- 不得输出 `html` / `body` / `#root` 规则；
- 不得输出无作用域的 `*` 规则（`*::before` 也必须带 `[data-tt-style="fluent"] ` 前缀）；
- 不得输出裸 `@keyframes`（用 `fl-` 前缀命名，如 `fl-spin` / `fl-shimmer` / `fl-progress-stripes`）。

`base.css` 里的重置写在 `[data-tt-style="fluent"] *` 之下，只在作用域内生效。

构建产物 `dist/timeless.fluent.css` 可用脚本校验：全部规则前导符都含
`data-tt-style="fluent"`，`@keyframes` 全部 `fl-` 前缀（Tier 1 + Tier 2 共 23 个 `fl-` 动画）。

### 5.2 多库同页

因为隔离靠属性而非类名前缀，同一页面可以同时加载 `timeless.fluent.css` 与
`timeless.bootstrap.css` / `timeless.shadcn.css`：

```html
<html data-tt-style="fluent">
  …fluent 组件（class 带 fl- 前缀）…
  <div data-tt-style="bootstrap">   <!-- 子树切到 bootstrap -->
    …bootstrap 组件（class 是 .btn / .form-control）…
  </div>
</html>
```

> 注意：切换 `data-tt-style` 只切换**本库自己的**设计与 token。shadcn 的 token 挂在
> `:root`，它不读 `data-tt-style`，所以子树切换对它没有意义——shadcn/weui 是"全局库"，
> bootstrap/material/fluent 是"作用域库"。这一区别见 `THEME_PACKAGE_GUIDE.md` 第 2 节。

### 5.3 与真实 Fluent UI 共存

本库类名（`.fl-btn` / `.fl-control` …）与 `@fluentui/react-components` 的
`.fui-Button` 等**完全不同**，因此：

- 不存在类名冲突，两者可以同时出现在一个文档里而不互相覆盖；
- 但视觉上会不一致（真实 Fluent UI 读自己的 CSS-in-JS 主题，不读本库的 CSS 变量）；
- 正确用法：**不要**在同一个子树里混用两者，要么整体用本库，要么整体用真实 Fluent UI。

---

## 6. 应用内覆盖 Token 的三种方式

### 方式 A：覆盖上游层（换品牌色，保留 Fluent 结构）

```html
<html data-tt-style="fluent">
  <style>
    [data-tt-style="fluent"] {
      --colorBrandBackground: #7c3aed;
      --colorCompoundBrandBackground: #7c3aed;
      --colorBrandForegroundLink: #7c3aed;
    }
  </style>
</html>
```

### 方式 B：覆盖别名层（只改某类语义，不动上游）

```html
<style>
  [data-tt-style="fluent"] { --radius: 8px; --control-height: 40px; --surface-1: #fbfbfb; }
</style>
```

### 方式 C：局部子树换肤

```html
<div data-tt-style="fluent" style="--primary: #d946ef; --compound-brand: #d946ef">
  …该子树内的 primary 按钮与选中态变品红…
</div>
```

> 三种方式的**特异性都低于**组件样式里"声明块内改写局部 token"的写法，所以
> 组件自身的 hover/active 覆盖不会被应用层意外压掉。

### 方式 D：规范页实时调参（预览孤岛）

`apps/web-fluent` 的**设计规范页**（左菜单「设计规范」→ `/home/design`）把方式 B / C
做成了可视化编辑器：左侧是从真实 token 读出来的规范表 + 控件，右侧一块预览孤岛。
控件写的是孤岛元素上的**内联 CSS 变量**，所以只影响孤岛，画廊外壳不受影响，
可一键重置。机制与注意事项见 `THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=fluent`（→ <http://127.0.0.1:3403>，见指南 §8.4）。

本库实际可调的 token（页面按「该 token 在 `<html>` 上是否声明」自动筛选，
共 28 个）：

| 分组 | token |
|---|---|
| 色板 | `--primary` `--secondary` `--destructive` `--background` `--foreground` `--muted` `--muted-foreground` `--border` |
| 圆角 | `--radius` `--radius-sm` `--radius-md` `--radius-lg` |
| 间距 | `--spacer` `--spacer-sm` `--spacer-lg` |
| 尺寸 | `--control-height` `--control-height-sm` `--control-height-lg` |
| 字阶 | `--font-size` `--line-height` |
| 阴影 | `--shadow` `--shadow-sm` `--shadow-lg` |
| 动效 | `--duration-faster` `--duration-fast` `--duration-normal` `--duration-slow` `--easing-standard` |

**调 `--primary` 会连带写 `--brand-fill` 系列。**
本库组件按钮读的是 `--brand-fill`（与 `--primary` 同源的第一层派生别名），
全库没有任何 `var(--primary)` 消费者 —— 只改 `--primary` 按钮不会变。
规范页用 `COMPANION_TOKENS` 映射补齐兄弟别名
（见 `apps/web-fluent/src/pages/design/index.js`，说明见
`THEME_PACKAGE_GUIDE.md` §5.5），这是本库唯一需要它的地方。

两条边界：

- 页面**不暴露第一层 `--colorNeutral*` / `--colorBrand*`**，只暴露第二层语义别名。
- 组件样式里直接读原始 token 的地方不随编辑器变化，这是设计如此。

---

## 7. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/fluent.css` | 样式入口，`tokens → alias → base → components/*` |
| `src/style/tokens.css` | 上游 `--color*` / `--shadow*` / `--borderRadius*`（亮/暗） |
| `src/style/alias.css` | Timeless 语义别名（通用 + Fluent 专有） |
| `src/style/base.css` | 作用域内的基础/重置 |
| `src/style/components/*.css` | 24（Tier 1）+ 17（Tier 2）+ 8（Tier 3）+ tree + flow ＝ 51 个已全部实现 |
| `src/modules/*.ts` | 薄包装：store 订阅 + `fl-` 作用域类名 |
| `src/index.ts` | 导出 + 动态 `import("./style/fluent.css")` |
| `apps/web-fluent` | 组件画廊示例应用 |

---

## 8. 状态与暗色巡检

51 个模块走同一套状态钩子，巡检口径：`disabled` 属性 / `[aria-invalid="true"]` /
`.is-invalid` / `.is-loading` / `:focus-visible` / `@media (prefers-reduced-motion: reduce)`。

| 状态 | 落点 | 覆盖 |
|---|---|---|
| 禁用 | `[disabled]` / `[aria-disabled="true"]`，用 `--colorNeutralForegroundDisabled` + `--colorNeutralBackgroundDisabled` | 25 个样式文件 |
| 校验失败 | `[aria-invalid="true"]` 描边 `--colorPaletteRedBorder2`；表单类用 `.is-invalid` | 14 个样式文件 |
| 加载 | `.is-loading`（按钮、搜索类）；占位符用 `skeleton.css` | button / search-select 等 |
| 键盘焦点 | `:focus-visible` 用 `--colorStrokeFocus2`（双层描边）——**不写 `:focus`** | 24 个样式文件 |
| 动效降级 | `base.css` 一条作用域内的兜底：`[data-tt-style="fluent"] *` 把 animation / transition 压到 `0.01ms` | 27 个样式文件 |

Fluent 2 的状态点集中在**描边**上（`--colorNeutralStrokeAccessible` → hover
`--colorNeutralStrokeAccessibleHover` → focus `--colorStrokeFocus2`），填充色只在
pressed 时下压一档（`--colorNeutralBackground*Pressed`），所以同一控件在四态下的
辨识度靠 stroke 而非大面积变色。

暗色**不使用组件级选择器**：所有组件样式只引用语义别名（`--background` / `--primary`
/ `--stroke1` …），暗色只在 `tokens.css` 里换一次声明（第 4 节那 4 个选择器）。

---

## 9. 与其他库的关系

| | 关系 |
|---|---|
| `@timeless/timeless` | 唯一依赖。提供 `ui`（primitive）与 `vm`（core）。 |
| `@timeless/bootstrap` | 兄弟库，同一批组件。bootstrap 复用 Bootstrap 原生类名，本库用 `fl-` BEM。 |
| `@timeless/shadcn` | 兄弟库。shadcn 是全局（`:root` + Tailwind），本库是属性作用域。 |
| `@timeless/weui` | 兄弟库。weui 用 `weui-` 类名前缀隔离，本库用 `data-tt-style` 属性隔离。 |
| `@timeless/material` | 同批新增的作用域库，`data-tt-style="material"`。 |

---

## 10. 组件覆盖范围

本库按标准组件清单落地，分三档：

- **Tier 1（24，已实现）**：button、input、textarea、label、checkbox、checkbox-group、radio、
  switch、toggle、slider、select、number-input、progress、avatar、badge、separator、
  skeleton、card、alert、kbd、link、aspect-ratio、scroll-area、field。
- **Tier 2（17，已实现）**：dialog、sheet、popover、popconfirm、tooltip、dropdown-menu、
  context-menu、menu、tabs、accordion、steps、toast、table、form、search-select、
  file-picker、resizable-panels。附带 3 个非组件辅助模块：`menu-shared`（菜单项事件
  补丁 + 类名表）、`popper-shared`（浮层箭头定位）、`select-shared`（下拉选项渲染）。
- **Tier 3（8，已实现）**：date-picker、date-range-picker、time-picker、date-time-picker、
  cascader、scroll-view、affix、waterfall。date-picker / time-picker 额外导出可复用的
  组合件（`DateCalendarPanel`、`TimeColumns`、`TimePreview`），date-time-picker 直接复用，
  不重复实现日历与三列滚动。

另有两个结构复杂组件（已实现，逻辑在共享层，本库只出薄包装 + CSS）：

- **tree**：`vm.TreeCore` + `ui.TreePrimitive`。虚拟滚动、展开/折叠、指针拖拽三区落点、
  悬停自动展开、checkbox 父子联动与半选。行高落在 `--tree-row-height`（32px）——刻意
  不吃 `--control-height-sm`：Fluent 的 small 控件是 24px，树行按 24px 会挤掉图标和勾选框
  的呼吸位；落成独立 token 是因为 `ListViewV2` 的 `itemHeight` 是渲染器入参。
- **flow**：`vm.FlowCanvasModel` / `FlowNodeModel` / `FlowEdgeModel`。节点拖拽、滚轮缩放、
  空白平移、边路径计算全在 core；本库只画 DOM，浮层是 1px stroke + `--shadow-*` 分级阴影，
  选中走 `--brand-stroke` 的中心描边，状态色用 `--*-subtle` 浅底 + 同名前景。流动边用
  `.is-animated` + `@keyframes fl-flow-dash`。

合计 **51** 个组件，覆盖率 100%。

**不在范围**：`llm-provider-form`、`history-panel`、`menu-shared`（辅助，非组件）、
`sonner`（由 `toast` 覆盖）。

新增组件时必须遵守的骨架与状态要求见 `THEME_PACKAGE_GUIDE.md` 第 6 节。

### Fluent 2 视觉特征落点（Tier 1）

| 特征 | 落地位置 |
|---|---|
| 32px 固定控件高度 | `--control-height` → Button / Input / Select / NumberInput |
| 4px 圆角 | `--radius` → 所有控件；Card 用 `--radius-lg`(6px) |
| 1px 中性描边 | `--stroke1` → Button secondary / Input / Card 边框 |
| 输入框 focus 2px 品牌下划线 | Input / Textarea / NumberInput：`box-shadow: inset 0 -2px 0 var(--compound-brand)` |
| 20px 复合品牌方块 | Checkbox / Radio：`--compound-brand` |
| 40×20 开关 + 14px 滑块 | Switch / Toggle 的 `__thumb` |
| 分级阴影 | Card 用 `--shadow-4`（hover `--shadow-8`）；Select/Popover 用 `--shadow-16` |
| 键帽底边 2px 键程 | Kbd：`border-bottom-width: var(--strokeWidthThick)` |
| 品牌链接色 | Link：`--colorBrandForegroundLink` + hover 下划线 |
| 状态色勿用纯饱和 | Alert 用 `--colorStatus*Background1`（浅底）+ `Foreground1`（深字） |

### Fluent 2 视觉特征落点（Tier 2）

| 特征 | 落地位置 |
|---|---|
| 浮层 1.5px 描边 | Dialog / Sheet / Popover / Menu / Tooltip 表面：`border: 1.5px solid var(--stroke1)` |
| 大圆角浮层 | Dialog / Sheet / Popconfirm / Menu 用 `--radius-xl`(8px) |
| 分级阴影 | Dialog/Sheet 用 `--shadow-64`；DropdownMenu/ContextMenu 用 `--shadow-16`；Tooltip 用 `--shadow-8` |
| 40% 反色 scrim | Dialog / Sheet 遮罩：`--surface-inverted` + `opacity: .4` |
| 指示条用复合品牌色 | Tabs 活动下划线（`::after`）、Menu 选中项左侧 3px 条：`--compound-brand` |
| 负空间动效曲线 | 浮层进出场用 `--easing-decelerate`（进）/ `--easing-accelerate`（出） |
| 表头弱化表面 | Table `__head` 单元格：`--surface-3` + `--foreground-3` |
| 分组分隔用弱描边 | Table 行线 / Steps 连接线 / Resizable handle：`--stroke2` |
| 焦点环 | 菜单项、Tabs tab、Resizable handle 的 `:focus-visible`：`var(--ring-width) solid var(--ring-color)` |
| 圆形抓手 | Resizable handle 视觉仍 1px，`__grip` 为 `--radius-pill` 胶囊（hover 区域 `::after` 扩到 5px） |
| 拖拽/错误态 | FileDropZone：虚线 `--stroke1` → 拖拽 `--compound-brand` → 无效 `--destructive` |

### Fluent 2 视觉特征落点（Tier 3）

| 特征 | 落地位置 |
|---|---|
| 日期/时间浮层规格 | date-picker / date-range-picker / time-picker / date-time-picker / cascader 表面：`--surface-1` 底 + 1px `--stroke1` + `--radius-xl`(8px) + `--shadow-16` |
| 日历格用圆角方块 | `__cell`：32px 方形 + `--radius`(4px)，不是圆形 |
| 选中日 | `.is-active`：`--compound-brand` 填充 + `--colorNeutralForegroundOnBrand` 白字 |
| 今天 | `.is-today`：1px `--compound-brand` 描边（未选中时生效，避免盖住实心） |
| 非当月 | `.is-outside`：`--foreground-3` |
| 区间底纹 | `.is-in-range`：`color-mix(in srgb, var(--brand-fill) 12%, transparent)`；端点 `.is-range-start/end` 内侧实心、外侧 `--radius` 圆角 |
| 时间列选中 | `.fl-timepicker__option.is-active`：左侧 3px `--compound-brand` 指示条（与 Menu 同规则） |
| 行高即滚动常量 | `.fl-timepicker__option` 固定 32px，与 `time-picker.ts` 的 `ITEM_HEIGHT` 对齐 |
| 级联面板分隔 | `.fl-cascader__panel:not(:first-child)`：1px `--stroke2` 竖线 |
| 细滚动条复用 | `.fl-scroll-view` / `.fl-waterfall` 与 `.fl-scroll-area` 同一套 `--stroke1` thumb（hover → `--stroke-accessible`） |
| 固钉过渡 | `.fl-affix` 用 `--duration-fast` + `--easing-standard` 过渡 top / 底色 / 阴影，固定态补 `--surface-1` + `--shadow-8` |
| 瀑布流列布局 | `.fl-waterfall > div` 变横向 flex 行，列 `flex: 1 1 0`；嵌在 ScrollView 时加 `.is-embedded` 解除 Root 自带滚动与高度 |
| 浮层进出场 | 五个浮层都把自己那支 `fl-*-in` 关键帧**直接挂在 `__content` 上**（`--duration-normal` + `--easing-decelerate`），不依赖 primitive 下发 `is-enter`/`is-exit`（级联不会发这两个类，挂上去会静默失效） |
| 日历格/时间列是原生 `<button>` | primitive 直接渲染 `<button class="fl-datepicker__cell">` / `.fl-timepicker__option`，**不带 `.fl-btn`**，所以不要用 `--btn-*` token 覆盖——那些只对 `.fl-btn` 生效，会静默失效；必须直接写 `height/display/background-color/border` 等元素规则 |
| 时间列宽必须确定 | 浮层 `width: max-content` + 列 `flex:1 1 0` 会在「列 → ScrollView → 100% 宽行」的环里把 max-content 放大到几千 px；列改 `flex:0 0 auto; width:72px` 后正常 |
| 动效降级 | 每个组件块尾附 `@media (prefers-reduced-motion: reduce)` 关闭过渡/动画 |
