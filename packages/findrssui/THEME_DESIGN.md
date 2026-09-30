# `@timeless/findrssui` 设计规范（Design Token + CSS Variable）

本文件描述 `@timeless/findrssui` 的**视觉层**：`--frui-*` 变量体系、`frui-*` 类名约定、
组件的样式归属，以及它与宿主（findrss-reader）之间的**迁移边界**。

组件**行为**不在这里定义。`@timeless/findrssui` 与其他样式库一样，是
`@timeless/ui-primitive`（无样式 DOM 组合层）+ `@timeless/inner-vm`（状态机）之上的
一套「组合包装 + 样式」。骨架写法见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md)。

---

## 1. 来源与定位

`@timeless/findrssui` 不是一套通用设计系统，而是 **findrss-reader 自有组件库的整包迁出**：

| | 说明 |
|---|---|
| 迁出前 | `findrss-reader/frontend/src/components/findrssui.js` + `findrssui_layer.js` + `frontend/src/findrssui.css` |
| 迁出后 | 本包 `src/modules/findrssui.ts` + `src/modules/findrssui-layer.ts` + `src/style/findrssui.css` |
| 消费方 | findrss-reader 通过 UMD 产物 `Timeless.findrssui` 引用（见第 6 节） |

因此它**只有一套预设主题**（FindRSS 的深色主题），没有 light/dark 双套，也没有
`data-tt-style` 作用域 —— 定位与 `@timeless/shadcn` / `@timeless/weui` 一致：**全局型**。

| | `@timeless/shadcn` | `@timeless/weui` | `@timeless/findrssui` |
|---|---|---|---|
| 样式语言 | Tailwind v4 | Less | **纯 CSS** |
| 组件写法 | 工具类字符串 | 内联 `style` + `var(--weui-*)` | **`frui-*` 类名 + `var(--frui-*)`** |
| Token 前缀 | `--primary` / `--border` | `--weui-BRAND` / `--weui-FG-0` | `--frui-color-*` / `--frui-space-*` |
| 预设主题 | 2（light / dark） | 4（light / dark / care-light / care-dark） | **1（FindRSS 深色）** |
| 作用域 | 全局 | 全局 | 全局（`:root`） |

---

## 2. Token 分层模型

只有一层：**`src/style/findrssui.css` 的 `:root`**。组件模块里不写颜色/尺寸字面量，
只用 `frui-*` 类名（类名内部引用 `var(--frui-*)`）。

```
:root 语义变量（--frui-color-* / --frui-space-* / --frui-radius-* …）
  └─ frui-* 类名规则（.frui-button / .frui-card / …）
       └─ 组件模块（src/modules/*.ts）只负责挂类名 + `attributes`
```

换肤方式：覆盖 `:root` 上的 `--frui-*` 即可，**无需重新编译**（第 5 节）。

---

## 3. 完整 Token 清单（`src/style/findrssui.css` 的 `:root`）

### 3.1 品牌色

| 变量 | 值 | 用途 |
|---|---|---|
| `--frui-brand-ink` | `#edf2ff` | 品牌前景（被 `--frui-color-text` 引用） |
| `--frui-brand-orange` | `#ff641a` | 品牌主色（被 `--frui-color-primary` 引用） |

### 3.2 语义颜色

| 变量 | 值 | 用途 |
|---|---|---|
| `--frui-color-canvas` | `#070a12` | 页面底色（输入框背景也用它） |
| `--frui-color-surface` | `#101729` | 卡片 / 弹窗面 |
| `--frui-color-surface-raised` | `#16203b` | 抬升面（按钮、下拉面板、Toast） |
| `--frui-color-surface-hover` | `#202e51` | 悬停面 |
| `--frui-color-text` | `var(--frui-brand-ink)` | 正文 |
| `--frui-color-muted` | `#9ca9c6` | 次要文字 / placeholder |
| `--frui-color-border` | `#35446f` | 常规描边 |
| `--frui-color-border-strong` | `#6687e8` | 悬停/选中描边 |
| `--frui-color-border-soft` | `rgba(132, 154, 216, .12)` | 极淡分隔 |
| `--frui-color-primary` | `var(--frui-brand-orange)` | 主操作 |
| `--frui-color-on-primary` | `#20130d` | 主操作上的文字 |
| `--frui-color-focus` | `#ff9a68` | `:focus-visible` 轮廓 |
| `--frui-color-overlay` | `rgba(4, 8, 17, .66)` | Dialog 遮罩 |
| `--frui-color-skeleton` | `#0d1426` | 骨架块 |

状态三态（各含前景 + 背景）：

| 状态 | 前景 | 背景 |
|---|---|---|
| success | `--frui-color-success` `#b8f0d7` | `--frui-color-success-bg` `rgba(22, 75, 61, .32)` |
| warning | `--frui-color-warning` `#ffd9a3` | `--frui-color-warning-bg` `rgba(92, 63, 16, .5)` |
| danger | `--frui-color-danger` `#ffbdc6` | `--frui-color-danger-bg` `rgba(90, 24, 38, .62)` |

### 3.3 间距 / 圆角 / 控件尺寸 / 字体 / 动效

| 族 | 变量 |
|---|---|
| 间距（4px 基数） | `--frui-space-1` 4px · `-2` 8px · `-3` 12px · `-4` 16px · `-5` 20px · `-6` 24px |
| 圆角 | `--frui-radius-sm` 8px · `-control` 10px · `-card` 16px · `-pill` 999px |
| 控件高度 | `--frui-control-height` 42px · `-sm` 32px · `-lg` 50px |
| 字体 | `--frui-font-family`（Inter → system-ui）· `--frui-font-size` 13px · `-sm` 12px · `-lg` 15px |
| 阴影 | `--frui-shadow-card` `0 16px 48px rgba(0,0,0,.24)` |
| 动效 | `--frui-motion-fast` `160ms ease` |

### 3.4 组件内局部变量（不在 `:root`，由类名自己设）

这两个是**类名下的私有变量**，覆盖时要在对应元素上写：

| 变量 | 设置者 | 语义 |
|---|---|---|
| `--frui-badge-color` / `-bg` / `-border` | `.frui-badge-<variant>` | Badge 变体的三色 |
| `--frui-avatar-hue` | 使用方内联（默认 `220`） | 头像底色 `hsl(var(--frui-avatar-hue) 45% 22%)` |

---

## 4. `frui-*` 类名清单

### 4.1 通用（`src/modules/findrssui.ts`）

| 组件 | 类名 |
|---|---|
| Button | `.frui-button` `-primary` `-quiet` `-danger` `-ghost` `-link`；尺寸 `-default` `-small` `-large`；`-icon` `-loading`；`.frui-spinner` |
| Input | `.frui-input` `-small` `-large` `-bare`；`.frui-input-root` `-small` `-large` `-error` `-warning` `-affixed`；`.frui-input-affix` `-addon` |
| Textarea | `.frui-textarea` `-auto` `-count`（复用 `.frui-input`） |
| Field | `.frui-field` `-label` `-help` `-help-error` `-count` |
| Card | `.frui-card` `-media` `-header` `-titles` `-title` `-description` `-extra` `-body` `-footer` |
| Badge | `.frui-badge`；变体 `-neutral` `-brand` `-success` `-warning` `-danger`；形态 `-solid` `-outline` `-count` `-dot` |
| Alert | `.frui-alert`（+ `-success` `-warning` `-danger`）`-title` `-description` `-closable` `-close` |
| Separator | `.frui-separator` `-vertical` `-labeled` `-line` `-label` |
| Checkbox / Radio | `.frui-choice` `-input` `-label`；`.frui-checkbox-input` / `.frui-radio-input` |
| Switch | `.frui-switch` `-thumb` `-small` `-label` |
| Avatar | `.frui-avatar` `-square` `-sm` `-lg` `-image` |
| Tabs | `.frui-tabs` `-list` `-tab` `-tab-active` `-panel` |
| Tree | `.frui-tree-scroll` `-row`（选中态 = `.selected`）；槽位 `-caret` `-caret-icon` `-icon` `-title` `-meta` `-guide`；拖拽槽位 `.frui-tree-line`（`.is-before` / `.is-after`）`.frui-tree-ghost` `-ghost-title`（浮层 = 被拖行整行快照，外层只定位，见 §6.3 拖拽槽位） |

### 4.2 需要 Portal / 全局宿主（`src/modules/findrssui-layer.ts`）

| 组件 | 类名 |
|---|---|
| Dialog | `.frui-dialog-overlay` `-content` `-header` `-title` `-description` `-close` `-footer` |
| DropdownMenu | `.frui-dropdown-trigger` `-mask` `-menu` `-item`（`-disabled` `-danger`）`-separator` |
| Toast | `.frui-toast-viewport` `.frui-toast`（`-success` `-error` `-warning`）`-message` `-close` |

### 4.3 `FR*` 别名

`FRAlert` / `FRBadge` / `FRButton` / `FRCard` / `FRInput` / `FRSeparator` 是上表同名
组件的**别名导出**（`Alert as FRAlert` 等），为保持 findrss-reader 原有 import 面而保留。
它们不产生新类名，也不产生新行为。

---

## 5. 换肤

### 方式 A：在 `:root` 覆盖（全局换肤）

`@timeless/findrssui` 的 token 全部挂在 `:root`，所以只要**在样式表之后**覆盖同名变量即可：

```html
<link rel="stylesheet" href="./timeless/timeless.findrssui.css" />
<style>
  :root {
    --frui-brand-orange: #4f8cff;      /* 主色换蓝 */
    --frui-color-canvas: #0b1020;
  }
</style>
```

### 方式 B：在局部子树覆盖（区域换肤）

变量是继承的，写在任意容器上即只影响该子树：

```html
<section style="--frui-color-primary:#3ecf8e">
  <!-- 这里的 .frui-button-primary 变绿 -->
</section>
```

注意 `.frui-dialog-*` / `.frui-dropdown-*` / `.frui-toast-*` 渲染在**挂载点的子树之外**
（Dialog 挂在触发组件所在树内，Dropdown 的浮层与 Toast 是 `position: fixed`），
局部覆盖对它们不一定生效 —— 需要整体换肤时用方式 A。

### 方式 C：JS 运行时切换

```js
document.documentElement.style.setProperty("--frui-brand-orange", "#4f8cff");
```

findrss-reader 若要做「主题切换」，这是唯一需要的接线；本包不提供 `toggleDark()`，
因为它只有一套预设。

---

## 6. 消费方式

### 6.1 UMD（findrss-reader 的实际用法）

```html
<link rel="stylesheet" href="./assets/timeless/timeless.findrssui.css" />
<script src="./assets/timeless/timeless.umd.min.js"></script>
<script src="./assets/timeless/timeless.findrssui.umd.min.js"></script>
```

UMD 包装器把导出挂在 `globalThis.Timeless.findrssui`（`extend: true`，不覆盖已有
`Timeless` 命名空间），`@timeless/timeless` 作为 external 映射到全局 `Timeless`：

```js
const { Button, Dialog, Toast } = Timeless.findrssui;
```

### 6.2 ESM

```js
import { Button, Dialog, Toast } from "@timeless/findrssui";
import "@timeless/findrssui/globals.css";
```

`src/index.ts` 里那段 `import("./style/findrssui.css")` **不注入样式**，只是让
`vite build` 把 CSS 提取进 lib 产物；非打包环境下该分支不执行。样式必须由使用方
自己 `<link>`（原生 ES module 不能 import CSS）。

### 6.3 依赖

树的 `TreePrimitive` 来自 `@timeless/timeless`（**不是**顶层具名导出），并且宿主有两种挂法，
产物在求值期按同一条链取：

```js
Timeless.FindRSSTree?.TreePrimitive || Timeless.ui.TreePrimitive
```

- `ui.TreePrimitive`：当前 core 构建（`timeless.umd.min.js`）挂在 `ui` 命名空间下；
- `FindRSSTree.TreePrimitive`：findrss 把 tree 重建包成独立运行时
  （`timeless.tree.umd.min.js`）时，只把结果挂到 `Timeless.FindRSSTree` 上，它那份
  `ui` 会被丢弃 —— 所以 findrss-reader 侧**必须**排在 tree 运行时之后，且只能靠这一项。

先 `FindRSSTree`、后 `ui`：宿主两边都提供时以树重建为准（与
`findrss-reader/timeless/index.js` 的导出链一致）。

**`guide` 槽位（层级引导线）依赖这份宿主**：`tree_classes.guide = "frui-tree-guide"`，
`TreePrimitive` 只在 `classes.guide` 存在、且该行 `row.guides` mask 为 `true` 的层级上渲染
`<div class="frui-tree-guide" data-tree-guide="<level>" style="left:...">`。所以 findrss-reader
的行里能否出现 `[data-tree-guide]`，取决于它所 pin 的 **tree 运行时**是否含这套 primitive
（类名只决定有没有样式，不决定有没有元素）。重打方法见
[`../../THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md) §13。

mask 的语义由 `vm.flattenTree` 定（两条判据，见
[`../../THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md) 的 `.is-*` / 引导线一节）：
① 该层祖先后面还有兄弟；② 该层祖先展开着、且可见子节点 ≥2。阅读端侧栏是「全部」一棵
**唯一根**，判据 ① 永远不成立，线全靠判据 ② —— 所以树运行时里那份 `ui-vm` 若早于这条
判据，侧栏会一根线都没有。

线的横坐标是 primitive 算的 `left = level * indent + indent / 2`（相对行内容盒），而
`.frui-tree-row` 是 `gap: var(--frui-space-1)`（4px）的 flex 行，所以线实际落在**祖先箭头中心
左侧 4px**（实测：indent 18、depth 1 的源行里线 `left = 9px`，侧栏里线 x = 76 而箭头中心
= 80）。这是 primitive 侧「按 indent/2 估算槽心」与行 gap 的系统性偏差，另外四套库的行也有
gap（4–6px），行为一致；要对齐应在 primitive 里改，不要只在本库的 CSS 上补 margin。

颜色用 `--frui-color-border`（常规描边色），与另外四套库拿各自最普通的 border token
（`--border` / `--stroke2` / `--outline-variant`）一致；**不要**退回
`--frui-color-border-soft`（只有 12% 不透明度）—— 1px 线在 `#070a12` 上看不见。

**拖拽槽位**。`tree_classes` 里给七个槽位（同 `guide`，值缺了就是「没样式」而不是「没元素」）：

| 槽位 | 取值 | 挂在哪 |
|---|---|---|
| `rowLifted` | `is-lifted` | 被拖起行的原位影子（跟手浮层已代表它） |
| `rowInto` | `is-drop-into` | 落点是「移入该目录」的那一行 |
| `line` | `frui-tree-line` | 落点指示线本体（绝对定位，`data-tree-line="before\|after"`） |
| `lineBefore` / `lineAfter` | `is-before` / `is-after` | 线的两个落点状态（`.is-*` 是跨库契约名，见 guide §4.6） |
| `ghost` / `ghostTitle` | `frui-tree-ghost` / `-ghost-title` | Portal 渲染的跟手浮层（在树容器之外，z-index 要高于本库的 dropdown / toast）；本库开了 `ghostRow`，外层只做定位，`-ghost-title` 只留给紧凑卡片回退路径 |

**跟手浮层 = 被拖行的整行快照。** `TreePrimitive.Root` 的 `ghostRow: true`（本库的 `Tree`
默认打开）让 primitive 在起拖那一刻 `cloneNode` 下那一行，浮层内容就是这份副本 ——
头像 / 未读角标 / 缩进引导线 / 行高都与原行一致，宽高由 primitive 内联成原行的 rect。
所以 `.frui-tree-ghost` **只留定位与命中穿透**（`position: fixed` + `pointer-events: none`
+ z-index）：任何内边距 / 边框 / 底色 / 阴影都会让浮层与原行看起来不一样 —— 这也是原先
「浮层没有头像、宽高也不同」的原因。副本里的 `data-tree-row-id` / `n` / `title` 等身份钩子
由 primitive 摘掉，免得命中测试或页面查询把副本当成真行。

`is-lifted` / `is-drop-into` / `is-before` / `is-after` 是**七库共享的裸名契约**（不带前缀，
`rowSelected: "selected"` 同理）；只有装饰性的线 / 浮层才带 `frui-` 前缀。这一节的所有元素
同样只由**宿主那份 tree 运行时**产出：pin 的 primitive 里没有拖拽接线时，给了类名也只会得到
空样式。

宿主那份 tree 运行时要能用，还得把 platform 传进去：它是自包含 core 副本，**自带一份
platform 单例**，`timeless-dom` 只设置主 core 的那份 —— 缺了这步则点击正常、拖拽完全不响应
（`addEventListener` 是空实现）。findrss-reader 在 `timeless/index.js` 里
`Timeless.FindRSSTree.setPlatform(Timeless.DOM.platform)`，详见 guide §13。

**顺序由宿主持久化，本包只管样式**。`TreeCore` 落定后回调 `onMove(info, { order })`，
`order` 是目标父节点移动后的完整子节点 key 列表（`folder:<id>` / `feed:<url>`，两类混编）。
findrss-reader 把它整份发给服务端写 `sort_order`，因此「源排在文件夹前面」是合法的自由排序。
`draggable` / `allowRootDrop` 是 `TreeCore` 的 props，不属于本包；`draggable: false` 的行
既不可拖、也不会被 primitive 的 `on_pointer_down` 吞掉点击。

---

## 7. 迁移边界：什么**没有**迁进来

| 留原地的 | 原因 |
|---|---|
| `LazyImg`（`frontend/src/components/lazy-img.js`） | 耦合宿主的 blurhash（`@/biz/blurhash_image.js`）与 DOM 解析（`@/utils.js`），不是纯展示组件 |
| `.lazy-img-*` 相关 CSS（含 `@keyframes frui-shimmer` 与 `prefers-reduced-motion` 分支） | 跟随 `LazyImg` 留在 `findrss-reader/frontend/src/style.css` |

LazyImg 的 CSS 虽然历史上与 `frui-*` 同处一个文件，但它是**业务耦合样式**，
不再属于本包 —— 修改 `LazyImg` 时去 findrss-reader 改，不要在本包里找。

### 类型标注现状

`src/modules/findrssui.ts` 与 `findrssui-layer.ts` 是从 findrss-reader 逐字迁出的
**未标注类型的 JS**，文件头带 `@ts-nocheck`。补类型是独立的一轮工作；当前
`dist/*.d.ts` 的签名因此偏宽泛（`props?: {}`），使用方的类型提示有限。
`DropdownMenu` 单独标了 `: TimelessElement`，因为它的推断类型引用了
`@timeless/inner-primitive` 的内部路径，不标注会让整份 `.d.ts` 无法生成。

---

## 8. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/findrssui.css` | 唯一的样式表：`:root` token + 全部 `frui-*` 规则 |
| `src/modules/findrssui.ts` | 纯展示组件 + ViewModel（Button / Input / Choice / …） |
| `src/modules/findrssui-layer.ts` | 需要 Portal / 全局宿主的三个（Dialog / DropdownMenu / Toast） |
| `src/index.ts` | 导出面 + 触发 CSS 提取的 `import("./style/findrssui.css")` |
| `vite.config.ts` | lib 构建（es/cjs/umd），产物 `dist/timeless.findrssui.css`，UMD 全局 `Timeless.findrssui` |

构建：`pnpm --filter @timeless/findrssui run build` → `dist/`。

---

## 9. 与其他库的关系

`@timeless/findrssui` 是**全局型**样式库：`:root` 上的 token 与 `.frui-*` 类名都是
无前缀作用域的。它只覆盖自己类名命中的元素（没有 `*` / `body` 级重置），
所以与 `@timeless/shadcn` / `@timeless/weui` **同时加载不会互相破坏**；
但三者若都挂在 `:root` 上做整体换肤，会各自独立生效 —— 实践上仍建议
**一个页面只主导一套样式库**（见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md)）。
