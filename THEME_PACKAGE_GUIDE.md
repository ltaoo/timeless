# 如何新增一套完善的组件库（样式 / 主题包指南）

本文是**操作性指南**：当仓库需要再增加一套「同一批组件、不同视觉风格」的组件库时，
照着做即可。

已有的样式包：

| 包 | 风格 | 样式路线 | 是否作用域隔离 |
|---|---|---|---|
| `@timeless/shadcn` | shadcn/ui | Tailwind v4 + `tt-` 前缀 | 否（全局，历史设计） |
| `@timeless/weui` | 微信 WeUI | Less + `--weui-*` | 否（全局，历史设计） |
| `@timeless/bootstrap` | Bootstrap 5.3 | 纯 CSS + `--bs-*` | 是 `[data-tt-style="bootstrap"]` |
| `@timeless/material` | Material 3 | 纯 CSS + `--md-sys-*` | 是 `[data-tt-style="material"]` |
| `@timeless/fluent` | Fluent 2 | 纯 CSS + `--colorNeutral*` | 是 `[data-tt-style="fluent"]` |
| `@timeless/animal` | animal-island-ui | 纯 CSS + `--animal-*` | 是 `[data-tt-style="animal"]` |

---

## 1. 什么时候新建样式库

### 该建

- 需要一套**与现有库视觉完全不同**的组件（新客户 / 新品牌 / 新平台规范）。
- 需要引入一个**上游设计系统**（Bootstrap、Material、Fluent、Ant…）并与既有 API 对齐。
- 需要**多套风格在同一产品里可切换**（此时必须走 `data-tt-style` 作用域路线）。

### 不该建

- 只是想改颜色 / 圆角 / 字号 → **覆盖 token 就够了**，不要新建包。
  见 `packages/shadcn/THEME_DESIGN.md` 第 6 节、`packages/weui/THEME_DESIGN.md` 第 5 节。
- 只是想在某个组件上加一个变体 → 加到现有库的变体表里。
- 需要一个新的**交互行为**而不是新视觉 → 那要改的是 `packages/ui-vm`（状态机）和
  `packages/ui-primitive`（DOM 绑定），不是样式包。

**判断标准**：如果 `ui-primitive` 里已有的 primitive 能表达你要的交互，
只差视觉 → 新建样式包。否则先去改 `ui-vm` / `ui-primitive`。

---

## 2. 分层模型：组件是共享的，差别只在样式

这是理解整个仓库最重要的一张图：

```
packages/ui-vm/src/<组件>/index.ts          ← 状态机（XxxCore）：值、开关、校验、层级
        │  store: vm.XxxCore
        ▼
packages/ui-primitive/src/modules/<组件>.ts ← 无样式 DOM 组合：XxxPrimitive.Root / .Content / .Loading
        │  ui.XxxPrimitive.Root({ ...attrs, store, class, style }, children)
        ▼
packages/<样式库>/src/modules/<组件>.ts      ← 【本指南要写的东西】组合包装 + 样式
        │  class / 内联 style
        ▼
packages/<样式库>/src/style/**               ← token + 组件样式表
```

由此推出的结论：

1. **组件清单由 `ui-primitive` 决定，不由样式库决定。**
   新库能包出哪些组件，取决于 `packages/ui-primitive/src/index.ts` 导出了哪些
   `XxxPrimitive`。
2. **样式库不写交互逻辑。** 状态订阅、事件、焦点管理都在 store 里。
   样式库只做「把 store 状态翻译成 class / style」。
3. **同一个组件在不同库里的 props 形状应当一致**（都来自 `ui` + `vm` 的类型），
   这样应用换库只需换 import。
4. **不跨库 import。** `bootstrap` 不得 `import ... from "@timeless/material"`。
   共享的东西要么在 `ui-primitive`，要么在 `@timeless/timeless`。

---

## 3. 包脚手架清单

新建 `packages/<lib>/`，文件结构与 `packages/weui` 对齐：

```
packages/<lib>/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── THEME_DESIGN.md            ← 本库 token 规范（见第 4 节）
└── src/
    ├── env.d.ts               ← declare const __Version; declare module "*.css"
    ├── index.ts               ← 导入 modules，动态 import 样式，导出组件
    ├── style/
    │   ├── tokens.css         ← 上游原始 token（亮/暗两套）
    │   ├── alias.css          ← Timeless 语义别名（作用域内）
    │   ├── base.css           ← 作用域内的基础样式（禁止全局规则）
    │   └── components/        ← 每个组件一个 css
    │       ├── button.css
    │       ├── input.css
    │       └── …
    └── modules/
        ├── button.ts
        ├── input.ts
        └── …
```

### 3.1 `package.json`

```json
{
  "name": "@timeless/<lib>",
  "version": "0.33.1",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js"
    },
    "./globals.css": "./dist/timeless.<lib>.css"
  },
  "scripts": { "build": "vite build" },
  "type": "module",
  "files": ["src", "dist"],
  "dependencies": { "@timeless/timeless": "workspace:*" },
  "devDependencies": { "typescript": "^5.9.3" }
}
```

**`version` 必须是根 `package.json` 的版本**。`scripts/build.js:80-84` 会校验
`pkg.version === VERSION`，不一致直接抛错终止整个构建。
发版时所有包一起改。

### 3.2 `vite.config.ts`

抄 `packages/weui/vite.config.ts`，改 4 处：`name`、`fileName`、`assetFileNames`、
以及（若用 Less 之外的预处理器）`css` 段。纯 CSS 库可以删掉 `css.preprocessorOptions`。

```ts
const name = "timeless.<lib>";           // ← 改
const externals = ["@timeless/timeless"] as const;   // ← 只允许这一个 external

export default defineConfig({
  define: { __Version: JSON.stringify(pkg.version) },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: (format) =>
        format === "es" ? "index.esm.js" : format === "umd" ? `${name}.umd.min.js` : "index.js",
      name: `Timeless.<lib>`,            // ← UMD 全局名，改
    },
    minify: "terser",
    terserOptions: { compress: { drop_console: true } },
    cssMinify: true,
    sourcemap: isProd ? false : true,
    rollupOptions: {
      external: externals,
      output: {
        extend: true,
        globals: { "@timeless/timeless": "Timeless" },
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css") ? `timeless.<lib>.css` : (assetInfo.name || "assets/[name]-[hash][extname]"),
      },
    },
  },
  plugins: [
    bundle_analysis_plugin({ package_name: pkg.name, package_root: __dirname, workspace_root: resolve(__dirname, "../..") }),
    dts({ insertTypesEntry: true, rollupTypes: false }),
  ],
});
```

三个关键点：

- `name: "Timeless.<lib>"` + `output.extend: true`：让 UMD 挂到已有 `window.Timeless`
  命名空间上，而不是覆盖它。
- `assetFileNames` 把 CSS 固定输出为 `timeless.<lib>.css`，否则会带 hash，
  `scripts/build.js` 的 `ARTIFACTS` 找不到文件。
- `bundle_analysis_plugin` 必须挂，否则 `pnpm build` 的重复依赖分析缺少本包模块图。

### 3.3 `tsconfig.json`

直接抄 `packages/weui/tsconfig.json`（`noImplicitAny: false`、`strict: false`、
`declaration: true`、`declarationDir: "dist"`）。

### 3.4 `src/env.d.ts`

```ts
declare const __Version: string;
declare module "*.css" {}
```

（用 Less 的话再加 `declare module "*.less" {}`。）

### 3.5 `src/index.ts`

样式用**动态 import** 挂载，保证 SSR / Node 环境 import 本包不会因 CSS 报错：

```ts
import { Button } from "./modules/button";
// …其余 import

try {
  if (typeof window !== "undefined") {
    import("./style/<lib>.css");    // 只包含你真正需要的样式入口
  }
} catch {}

export const Timeless<Lib>Version = __Version;

export { Button, /* … */ };
```

---

## 4. Token 双层设计

### 4.1 为什么是两层

- **第一层：上游原始 token。** 直接照抄上游设计系统的变量名与值，例如
  `--bs-primary` / `--md-sys-color-primary` / `--colorNeutralForeground1`。
  好处：与上游文档一一对应，好核对、好升级。
- **第二层：Timeless 语义别名。** 把上游 token 映射到本仓库组件代码使用的统一名字：
  `--primary` / `--background` / `--border` / `--radius` / `--foreground` / `--muted` …

**组件代码只引用第二层**，样式表里只做映射：

```css
/* style/tokens.css —— 第一层，上游原名 */
[data-tt-style="<lib>"] {
  --bs-primary: #0d6efd;
  --bs-body-bg: #fff;
}

/* style/alias.css —— 第二层，Timeless 语义名 */
[data-tt-style="<lib>"] {
  --primary: var(--bs-primary);
  --background: var(--bs-body-bg);
  --radius: 0.375rem;
}
```

这样带来的三个好处：

1. **换上游版本**只动 `tokens.css`。
2. **跨库语义统一**：`Button` 在三个库里都读 `var(--primary)`，模块代码几乎一致。
3. **应用覆盖**只需要动第二层（或第一层，视粒度）。

### 4.2 必须有的一组别名

跨库保持一致，方便应用迁移与文档对照：

| 别名 | 语义 |
|---|---|
| `--background` | 页面 / 最外层底 |
| `--foreground` | 正文前景 |
| `--card` / `--card-foreground` | 卡片 |
| `--popover` / `--popover-foreground` | 浮层 |
| `--primary` / `--primary-foreground` | 主操作 |
| `--secondary` / `--secondary-foreground` | 次级操作 |
| `--muted` / `--muted-foreground` | 弱化 |
| `--accent` / `--accent-foreground` | 强调 / 悬停 |
| `--destructive` / `--destructive-foreground` | 危险 |
| `--border` | 边框 |
| `--input` | 输入框边框 |
| `--ring` | focus ring |
| `--radius` | 圆角基准 |

必要时可加库特有别名（如 Fluent 的 `--shadow2/4/8/16/64`、
Material 的 `--surface-container-*`、Bootstrap 的 `--bs-btn-*`），
但要**在 `THEME_DESIGN.md` 里登记**。

### 4.3 亮 / 暗两套

每层都要写两套。**暗色选择器同时写 `.dark` 与 `[data-theme="dark"]`**：

```css
[data-tt-style="<lib>"] { /* light 值 */ }

.dark [data-tt-style="<lib>"],
[data-theme="dark"] [data-tt-style="<lib>"],
[data-tt-style="<lib>"].dark,
[data-tt-style="<lib>"][data-theme="dark"] { /* dark 值 */ }
```

原因见 `packages/shadcn/THEME_DESIGN.md` 第 4 节：
`app.setTheme()` 会**同时**设置 `data-theme` 和 `.dark`；而 Tailwind 生态
习惯用 `.dark` 子树做局部暗色。两者都支持才不会出现「切了主题没反应」。

### 4.4 `data-tt-style` 作用域规则（核心约定）

**每库所有 token 与组件样式都必须挂在 `[data-tt-style="<lib>"]` 之下。**

```css
/* ✅ 正确 */
[data-tt-style="bootstrap"] .btn { … }
[data-tt-style="bootstrap"] { --primary: … }

/* ❌ 禁止 */
.btn { … }
:root { --primary: … }
```

应用在 `<html>`（或任意包裹元素）上设置该属性来选择风格：

```html
<html data-tt-style="material">
```

包含自身的规则也支持，用于局部换风格：

```css
[data-tt-style="<lib>"] .btn { … }              /* 后代 */
[data-tt-style="<lib>"].btn { … }               /* 元素自带属性 + 自身类（少用） */
```

这一条让**多库共存天然隔离**，也让新库可以与应用里真实的上游框架共存
（真实 Bootstrap 的 `.btn` 不会命中 `[data-tt-style="bootstrap"] .btn`）。

**类名按上游风格命名**（`.btn` / `.btn-primary` / `.m3-btn` / `.fl-btn`），
隔离靠属性作用域而不是类名前缀。**不要**给类名加库前缀，
那样反而丢掉「与上游文档对齐」这个好处。

### 4.5 隔离禁忌

新库样式表**绝对不允许**出现：

```css
html { … }        /* ❌ */
body { … }        /* ❌ */
#root { … }       /* ❌ */
* { … }           /* ❌ 无作用域 */
*, *::before, *::after { … }   /* ❌ */
```

理由：这些规则会影响整个页面，与同时加载的其他样式库互相覆盖。
需要重置样式时，**只在本库作用域内重置**：

```css
[data-tt-style="<lib>"] *,
[data-tt-style="<lib>"] *::before,
[data-tt-style="<lib>"] *::after {
  box-sizing: border-box;
}
```

也不要输出**无作用域的 `@keyframes` 重名**。`@keyframes` 没有选择器，**没法作用域化**，
只能靠命名隔离 —— 动画名一律带库前缀：

| 用途 | bootstrap | material | fluent | animal |
|---|---|---|---|---|
| 旋转 | `bs-spin` | `m3-spin` | `fl-spin` | `animal-spin` |
| 树的落点指示线 / 跟手浮层 | `bs-tree-*` | `m3-tree-*` | `fl-tree-*` | `animal-tree-*` |
| 流程图的流动虚线 / 运行脉冲 | `bs-flow-dash` / `bs-flow-pulse` | `m3-flow-dash` / `m3-flow-pulse` | `fl-flow-dash` / `fl-flow-pulse` | `animal-flow-dash` / `animal-flow-pulse` |

`pnpm check:scope` 只检查选择器的作用域，**查不出 keyframes 重名**，所以这一条只能靠
命名约定 + review 保证。同理，动画只推 `stroke-dashoffset` / `transform` 这类合成属性，
`stroke-dasharray` 之类的固定值写在静态规则里。

### 4.6 状态类名是四库共享的 DOM 契约

结构复杂组件（`tree` / `flow`）的状态不在各库自己的 CSS 里定义，而是由共享层
（`ui.TreePrimitive` / `vm.FlowCanvasModel`）挂**统一的 `.is-*` 类名**，四个库的样式表
各自去匹配。它们是跨库契约，名字**不能**带库前缀、也**不能**被就地重命名：

| 类名 | 语义 | 出处 |
|---|---|---|
| `.is-before` / `.is-after` | 拖拽落点在目标行上方 / 下方 | tree 落点指示线（`data-tree-line`） |
| `.is-drop-into` | 拖拽落点为「移入该目录」 | tree 行 |
| `.is-lifted` | 拖拽进行中，被拖起那行的原位影子（跟手浮层另算） | tree 行 |
| `.is-checked` / `.is-indeterminate` | checkbox 勾选 / 半选 | tree 多选列 |
| `.is-animated` | 边需要流动虚线动画 | flow（只在 `edge.state.animated` 为真时挂） |

上面这些名字由各库在 `TreeClassNames` / `FlowClassNames` 里给出取值，**取值必须逐字一致**。
跟手浮层、落点指示线本体这类**装饰性**槽位不在这张表里 —— 它们的名字各库自选、允许带库前缀
（findrssui 是 `frui-tree-line` / `frui-tree-ghost` / `frui-tree-ghost-title`；其余六库同构）。
`lineBefore` / `lineAfter` 也常给 `is-before` / `is-after`（同一个类挂在线上与行上、靠选择器区分），
`line` 本身则只吃 `data-tree-line="before|after"` 属性。

**跟手浮层有两种形态**，由 `TreePrimitive.Root` 的 `ghostRow` 选：

| | `ghostRow: false`（默认，四套作用域库 + shadcn） | `ghostRow: true`（findrssui） |
|---|---|---|
| 内容 | `ghost` 盒子 + `icon`（`renderIcon`）+ `ghostTitle` 三个槽位 | 起拖那一刻那一行的 `cloneNode` 快照 |
| 尺寸 | 由库的 CSS 决定（一张紧凑卡片） | 宽度/高度由 primitive 内联成原行的 `rect` |
| 外层 CSS | 卡片样式（底色 / 边框 / 圆角 / 阴影）随便写 | **只许定位 + `pointer-events: none` + z-index**，任何装饰都会跟原行对不上 |

`ghostRow` 是给「行里有宿主自己的东西（头像 `<img>`、未读角标、业务 meta）」的库用的：
重新 `render` 一遍行是做不到逐像素一致的（`<img>` 要重新解码、行内状态类要重算），所以
primitive 直接复制宿主的原始节点。副本会摘掉 `data-tree-row-id` / `data-tree-caret` /
`data-tree-check-id` / `n` / `title`，加 `aria-hidden` —— 命中测试和页面查询都靠这些属性找
「真行」，留着副本就会被误判成一行（`document.querySelectorAll("[data-tree-row-id]")`
会多出一条）。任何用到 `ghostRow` 的库，其行的样式必须**不依赖树容器内的祖先选择器**
（副本经 `Portal` 挂在 `body`）：`[data-tt-style] .tree__row` 这类全局作用域前缀没问题，
`.sidebar .tree__row` 这类就会掉样式。

宿主要「知道右键命中了哪一行」时，**不要**在宿主里自己 `event.target.closest("[data-tree-row-id]")`
做 DOM 考古 —— 那是内部属性契约。`TreePrimitive.Root` 提供
`onRowContextMenu(node | null, event)`（与 `onRowClick` 同族）：命中测试由 primitive 做，
命中行时 `node` 是该行 `TreeNode`，空白处 / 行已被虚拟列表卸载时 `node` 为 `null`
（**空树与列表底部留白因此也能开菜单**，所以「没命中」照样回调，而不是不回调）。它只做
命中测试、**不** `preventDefault` —— 吃不吃浏览器原生菜单由宿主决定（无写权限的宿主不处理
即可）。`Root` 也**不覆盖**宿主自己的原生 `onContextMenu`：两者是**链式叠加**（同一元素同一
事件只能挂一个监听器），宿主要自己再做命中就拿得到透传的原始 `event`。

命中行是文件夹还是叶子，读 `node.type`（`"folder"` / `"subscription"`）即可；叶子的节点上带着
整个 `node.subscription`（源的 url 在 `node.subscription.url`，`node.path` 也是它）。阅读端就是
靠这一处把右键菜单分成两套：叶子只给「刷新 / 编辑 / 取消订阅」，文件夹与空白处才给「新建文件夹 /
添加订阅」（文件夹行再加两条「该文件夹内」的动作）。

**树的高度上限由 `TreeRootProps.maxHeight` 一处说了算**（默认 360，`<= 0` = 不限制）。
不限制时 primitive 会往滚动容器上写**内联** `max-height: none`（而不是省略这条样式）——
因为库里往往自带一条 `max-height`（findrssui 的 `.frui-tree-scroll { max-height: 360px }`
就是 360），只有内联才能压住。容器随内容长高后 `ListViewV2` 的视口 = 实测 `clientHeight`
覆盖全量行，内部滚动条消失，滚动交给外层容器（阅读端侧栏就是 `.feed-list` 一处）。
所以宿主**不要**再在 CSS 里给树的滚动槽钉高度（曾有个 `max-height: … !important` 顶掉了
框架的内联值）；要改上限就改 `maxHeight`。

另外，往浮层里塞宿主原始节点必须走 `onMounted` 的 `event.target.get$elm()`：那里的
`event.target` 是宿主抽象节点（`VNodeView`，只有 `getBoundingClientRect` / `setStyleValue`
之类的代理方法），**不是 DOM 元素**，直接 `appendChild` 会抛 `is not a function`，而异常会被
框架吞掉 —— 现象就是浮层盒子在、里面什么都没有。

树的每行还会按 `row.guides` 渲染若干层级引导线槽位（`[data-tree-guide="<level>"]`）。
它的**类名各库不同**（`tree__guide` / `m3-tree__guide` / `fl-tree__guide` /
`animal-tree__guide` / `frui-tree-guide`），所以不进上面这张共享状态表；但
`data-tree-guide` 属性名、「每一段对应一层祖先缩进槽」以及**什么时候画**的语义是
primitive / `vm.flattenTree` 写死的共享契约，样式库只提供 `guide` 类名与 CSS
（`position: absolute` + `pointer-events: none`）。索引与几何位置（`left`）全部由
`ui.TreePrimitive` 算出，样式库不要另写定位逻辑。

画线判据两条（`flattenTree` 的 `continues`），满足其一就画：① 该层祖先后面还有兄弟
（线要继续到兄弟）；② 该层祖先展开着、且可见子节点 ≥2（线要把子节点连起来）。两条都
不成立（末位、且只有一个子节点）不画 —— 那种线只有一行高、上下都不接，就是「飘线」。
判据 ② 不能省：**只有唯一根的树（阅读端侧栏就是「全部」一棵）判据 ① 永远不成立**，
少了它整棵树一根线都没有。颜色用各库最普通的那支 border token（`--border` /
`--stroke2` / `--outline-variant` / `--frui-color-border`），不要用低不透明度的
「soft」色 —— 1px 线在深色底上会看不见。

两个容易踩的坑：

1. **shadcn 的 `tt-` 前缀插件会无差别改类名。** 构建期 `vite-plugin-tailwind-prefix.ts`
   会把源码 `class` 字符串里的工具类加上 `tt-`，它不区分「Tailwind 工具类」和「库自
   己的 CSS 类」。`.is-animated` 一旦被改写成 `tt-is-animated`，`src/index.css` 里手写
   的 `.flow-edge.is-animated` 就永远选不中（**静默失效**，构建不报错）。
   所以 `is-before` / `is-after` / `is-checked` / `is-indeterminate` / `is-animated`
   必须在插件的 `customClassNames` 白名单里（见 `packages/shadcn/THEME_DESIGN.md` §5）。
2. **响应式 attribute 写不上。** 状态一律走 class，不要用响应式 `dataset`
   （见 6.6 陷阱 2）；`.is-*` 是即时读的静态类名，不参与框架的响应式 diff。

`check:scope` 同样查不出这类失效（选择器本身是带作用域的，只是永远匹配不到）。
改动状态类名后，务必回到浏览器里确认样式真的生效。

---

## 5. 主题挂载点

### 5.1 应用侧做什么

```html
<html data-tt-style="bootstrap">   <!-- 选风格，静态 -->
```

```ts
app.setTheme("dark" | "light" | "system");   // 选明暗，运行时
```

`app.setTheme` 的 web 实现在 `packages/provider-web/src/app.ts:119-123`，
会在 `<html>` 上设置 `colorScheme`、`data-theme`、`.dark`。
**不要另造主题 API。**

### 5.2 库侧要保证什么

1. token 的暗色块同时覆盖 `.dark` 与 `[data-theme="dark"]`（见 4.3）。
2. `data-tt-style` 属性挂在**与主题属性同一个元素或它的祖先**上。
   实践中都挂 `<html>`：

   ```html
   <html data-tt-style="fluent" class="dark" data-theme="dark">
   ```

   此时 CSS 里 `.dark [data-tt-style="fluent"]` **不会**命中
   （因为 `data-tt-style` 就在 `.dark` 上，不是后代）。
   所以 4.3 里那组四段选择器是必要的 —— 其中
   `[data-tt-style="fluent"].dark` 这一段负责这种情况。

3. 首屏防闪烁：在 `<head>` 里放一段内联脚本，样式生效前读
   `localStorage.theme` 决定加不加 `.dark`。参考 `apps/web-shadcn/index.html`。

### 5.3 局部换主题

因为 token 活在 `[data-tt-style]` 上，任意子树都可以换风格：

```html
<div data-tt-style="material" class="dark">   <!-- 只有这块是 Material + 暗色 --> </div>
```

**前提**是库样式没有全局规则（见 4.5）。

### 5.4 规范页：只覆盖第二层语义别名的「预览孤岛」

五套 gallery 各有一个**设计规范页**：`apps/web-{bootstrap,material,fluent,animal}` 的
`/design`（顶栏「设计规范」），以及 `apps/web-shadcn` 的
`src/pages/home/index.design.js`（子页菜单「Design Spec」）。
左侧是从**真实 token 读出来**的只读规范表 + 实时调参控件，
右侧是一块**预览孤岛**：改一个 token 立刻在孤岛看到效果，
画廊外壳与其它页面不受影响，可一键重置。

四条实现要点都不显然，改这个页面之前先读：

1. **覆盖写成孤岛元素上的内联 CSS 变量**，而不是给孤岛挂 `data-tt-style`
   或在别处新写一段 `[data-tt-style]` 规则。内联声明压过 `[data-tt-style="<lib>"]`
   上的别名声明，也压过暗色的那 4 组选择器 —— 这正是 4.3 四段选择器带来的好消息：
   **一个内联值同时压过亮暗两处**，所以覆盖值在切暗色后依然生效，
   而没被覆盖的 token 正常跟随暗色。
2. **孤岛不要挂 `data-tt-style`。** 库组件的选择器是后代选择器
   （`[data-tt-style="bootstrap"] .btn`），`<html data-tt-style=…>` 的后代本来就命中；
   再给孤岛挂一遍等于把整层别名重声明一次，纯属自找冲突。
3. **孤岛的 `style` 必须是 `Ref<对象>`。** DOM host 对 `style` 有两条路径：
   `style` 是 `Ref` → 整串 `cssText` 整体替换（**自定义属性只有这条能生效**）；
   `style` 是普通对象 → 逐 key `$elm.style[k] = v`（**对 `--x` 无效**）。
   同时注意 6.6 陷阱 1：`style` 不能传字符串，也不能包 `computed`
   （「对象建一次、每个 key 是 ref」的写法对自定义属性不管用）。
4. **只有「真的被改过」的 token 才写进孤岛**（每个 token 一个 `dirty` 位）。
   全量写出会把未覆盖的 token 钉死在当前主题的取值上，切暗色后不再跟随。

**只暴露第二层语义别名。** 页面上出现的名字一律是
`--primary` / `--background` / `--border` / `--radius` / `--spacer*` /
`--control-height*` / `--font-size` / `--line-height` / `--shadow*` / 动效时长，
**不暴露 `--bs-*` / `--md-sys-*` / `--colorNeutral*` 这类第一层原始 token**。
理由是 4.1 的契约：第一层是「与上游文档对齐」用的，第二层才是应用的稳定接口；
把第一层摆到调参界面上等于鼓励应用依赖上游私有名，升级上游时直接断。

同理，有组件样式直接读原始 token（例：`tree.css` 里的 `var(--bs-border-width)`），
拖语义别名时它不会变。这是**设计如此**，不要为了「看起来都变了」去改组件 CSS。

**孤岛的能力边界 = 运行时能寻址到的 token 才可调。**
`bootstrap` / `material` / `fluent` / `animal` 的 token 都写在 CSS 里，全部可调；
`shadcn` 是 Tailwind 编译期产物，只有写在 `:root` 上的自定义属性能在运行时覆盖 ——
即**颜色 + `--radius`**（页面连带给派生的
`--radius-sm/md/lg/xl/2xl/3xl/4xl` 写 `calc(var(--radius) * k)`），
间距 / 字阶 / 阴影已被编译进 `tt-*` 工具类，改 token 不再有消费者。
规范页对此如实标注「该库不暴露此类 token（编译期烘焙）」，不假装支持。

两个 shadcn 专属坑：

- 它的颜色默认写成 `oklch()`，而 `<input type="color">` 只认 hex，
  所以取色器要先做一次 **1×1 canvas 像素读回**转成 hex ——
  `getComputedStyle().color` 与 canvas 的 `fillStyle` 都会**原样返回
  `oklch(...)`**，不做颜色空间转换。
- 它的按钮带 `tt-transition-all`，`getComputedStyle().backgroundColor`
  在过渡完成前读到的是中间值，程序化断言要等一会儿再读。

### 5.5 组件的别名与页面暴露的别名不一致时：`COMPANION_TOKENS`

作用域库里组件真正消费的别名，不一定就是页面暴露的那一个。**唯一需要它的库是 Fluent**：
组件按钮读 `--brand-fill`（与 `--primary` 同源的第一层派生别名），
而 fluent 全库**没有任何** `var(--primary)` 消费者 —— 只改 `--primary` 按钮不会变。
规范页为此在每个 app 的应用块里留了一个 `COMPANION_TOKENS` 映射，
调某个 token 时连带写它的兄弟别名：

```js
// apps/web-fluent/src/pages/design/index.js
const COMPANION_TOKENS = {
  "--primary": ["--brand-fill", "--brand-fill-hover", "--brand-fill-pressed"],
};
```

（shadcn 版支持传函数，用于 `--radius` → 派生阶梯。）

**不是每个库都需要它。** animal 就把它留成空对象：

```js
// apps/web-animal/src/pages/design/index.js —— 本库确实不需要
const COMPANION_TOKENS = {};
```

animal 的按钮专有底色叫 `--btn-primary-bg`（上游 `.btn-primary` 是奶油纸底而非
薄荷青实心，见 `packages/animal/THEME_DESIGN.md` §3.2），看起来和 Fluent 同病，
但 `--primary` 在本库**有真实消费者** —— 28 个组件样式文件里都有 `var(--primary)`
（checkbox / radio 选中、slider 轨道、progress 填充、steps 连接线、flow 选中描边…），
改 `--primary` 是有效果的，所以不需要连写。
判断标准只有一条：**这个 token 在组件 CSS 里到底有没有 `var()` 消费者**。

新增作用域库时先 grep 一遍组件 CSS：**若组件不消费页面暴露的别名，
必须在这里补齐兄弟别名**，否则调参界面会出现「改了没反应」——
`bootstrap` / `material` 的组件直接读第二层别名，所以那里是空对象。

---

## 6. 模块编写骨架

`src/modules/<组件>.ts` 只有两种形态。

### 6.1 无状态（直接包 primitive）

适用于 `ui` 层没有 store 的展示型组件（Separator / Skeleton / Card / Label / Badge…）：

```ts
import { ui, ViewProps, ViewChildren, classNames } from "@timeless/timeless";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", class: cls, ...rest } = props;
  return ui.SeparatorPrimitive.Separator({
    ...rest,
    orientation,
    class: classNames([
      "bs-separator",
      orientation === "vertical" ? "bs-separator-v" : "bs-separator-h",
      cls,
    ]),
  });
}
```

要点：

- `classNames([...])` 做 class 合并（最后一个是应用传入的 `class`，必须放最后，
  让应用能覆盖）。
- `...rest` 要透传，保证 `onClick` / `id` / `dataset` 等仍然生效。
- 把语义 props（`orientation` / `variant` / `size`）显式解构出来，
  既用于选 class，也要继续传给 primitive。

### 6.2 有状态（订阅 store）

适用于 `ui.XxxPrimitive.Root` 需要一个 `store: vm.XxxCore` 的交互组件：

```ts
import { ui, vm, ViewProps, ViewChildren, refobj, computed, ListenerManager, classNames } from "@timeless/timeless";

export function Button(
  props: ViewProps & { store: vm.ButtonCore },
  children: ViewChildren = [],
) {
  const { store, class: cls, ...rest } = props;

  // ① 把 store.state 包成响应式引用
  const state_ = refobj(store.state);
  // ② 订阅 store 变更，回写到 state_
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  // ③ 把状态翻译成 class。classNames(...) 的返回值本身就是 ClassNameRef，
  //    直接交给 primitive；会变的部分作为 classNames 的项传 computed。
  //    ⚠️ 不要把 classNames(...) 再包一层 computed（见 6.6 陷阱 1）。
  const classname_ = classNames([
    "bs-btn",
    computed(state_, (s) => `bs-btn-${s.variant || "primary"}`),
    computed(state_, (s) => `bs-btn-${s.size || "md"}`),
    computed(state_, (s) => (s.loading ? "is-loading" : "")),
    computed(state_, (s) => (s.disabled ? "is-disabled" : "")),
    cls,
  ]);

  // ④ 组合 primitive 的子槽位
  return ui.ButtonPrimitive.Root(
    {
      ...rest,
      store,
      class: classname_,
      dataset: {
        // 键名不要再写 "data-" 前缀：DOM host 会自动加（见 6.6 陷阱 2）。
        variant: store.state.variant,
        size: store.state.size,
      },
      onUnmounted() {
        listener$.destroy();            // ⑤ 必须销毁监听
        rest.onUnmounted?.();
      },
    },
    [
      ui.ButtonPrimitive.Loading({ store }, [ /* 自旋图标 */ ]),
      ui.ButtonPrimitive.Content({}, children),
    ],
  );
}
```

**四条铁律**：

1. `refobj(store.state)` + `store.onStateChange(...)` 必须成对出现，
   这是 store 与视图之间唯一的桥。
2. `ListenerManager([state_])` 收集所有需要销毁的订阅。
3. `onUnmounted` 里必须调用 `listener$.destroy()`，并且要
   **透传应用传入的 `rest.onUnmounted`**，否则应用的清理逻辑丢失。
4. 返回的 VNode 结构要沿用 primitive 提供的槽位
   （`Root` / `Content` / `Loading` / `Trigger` / `Indicator` …），
   不要自己拼 `View` 绕过 primitive，否则丢失无障碍属性与键盘行为。

### 6.3 内联 style vs 类名

参考 `packages/weui/src/modules/button.ts:11-48`（内联 style 为主）与
`packages/shadcn/src/modules/button.ts:55-68`（类名为主）两种风格。

本指南推荐**混合**：

- **类名负责**：结构、静态视觉、伪类/伪元素（`:hover` / `:focus-visible` /
  `::before`）、暗色（`dark` 由 CSS 选择器处理）。
- **内联 style 负责**：完全由 store 状态决定的动态值
  （进度条宽度、坐标、尺寸档位）。

原因是伪类与伪元素**无法**用内联 style 表达。凡是需要 `:hover` / `:focus-visible`
的视觉，必须落到 CSS 文件里，否则无障碍焦点态会缺失。

### 6.4 必须覆盖的交互状态

每个组件的 CSS 都要显式处理下列状态（P4 巡检项）：

| 状态 | 选择器 / 属性 | 要求 |
|---|---|---|
| hover | `:hover` | 有可见反馈 |
| active | `:active` | 有按压反馈 |
| focus-visible | `:focus-visible` | **必须有 ring / outline**，且 `outline-offset` 可读 |
| disabled | `[disabled]` / `[data-disabled="true"]` / `.is-disabled` | 降低不透明度 + `pointer-events: none` |
| invalid | `[aria-invalid="true"]` / `[data-invalid]` | 边框/文字变 `--destructive` |
| loading | `[data-loading="true"]` / `.is-loading` | 显示 spinner，禁用指针 |
| checked | `[data-state="checked"]` / `[aria-checked="true"]` | 选中视觉 |
| reduced motion | `@media (prefers-reduced-motion: reduce)` | 关闭动画与过渡 |

### 6.5 组件的 `dataset`

有状态组件应在 primitive root 上写 `dataset`，
把状态以 `data-*` 暴露出来，供 CSS 与测试使用：

```ts
dataset: { variant: s.variant, size: s.size, loading: s.loading || undefined }
```

命名与 `ui-primitive` 已有的约定保持一致（`data-state` / `data-disabled` /
`data-orientation` / `data-slot`）。

注意 `undefined` / `false` 值会被 host 移除对应属性，所以"真值才出现"的布尔状态
（如 `data-checked`）用 `cond ? "" : undefined` 表达。

### 6.6 两个必踩的陷阱

#### 陷阱 1：`class` 是 `computed(() => classNames(...))`

`classNames([...])` 返回的是 **`ClassNameRef`**（带 `__cn_ref`），
primitive 的 `subscribe_props` 对它有专门分支（`state.styleSet = cls.value`，值是数组）。

但如果再包一层 `computed`，`class` 就变成了**普通的 `Ref`**，且其 `.value` 是
`ClassNameRef` 而不是字符串。`subscribe_props` 会走 `isRef` 分支执行
`cls.value.split(" ")`，直接抛：

```
TypeError: t.value.split is not a function
```

组件会渲染为空白（被 ErrorBoundary 吞掉或整棵树挂掉），且报错位置在 UMD 内部，
极难定位。**正确写法**：`classNames` 直接作为 `class`，动态部分作为数组项传 `computed`。

同理，`style` 也**不能传字符串**——`subscribe_props` 对非 Ref 的 style 走
`Object.keys(style)` 逐项订阅，字符串会按下标展开成垃圾样式。必须是对象。

#### 陷阱 2：`dataset` 的键名重复加前缀

DOM host 会对 `dataset` 的每个键自动补 `data-` 前缀：

```ts
// packages/timeless-dom/src/host/box.ts
const k = `data-${key}`;
```

所以键名写 `"data-slot"` 会渲染成 `data-data-slot="..."`，CSS 里的 `[data-slot]`
永远匹配不上。**键名只写裸名**：`{ slot: "button", state: "checked" }`。

排查信号：`attributes` 里有值、但 CSS 选择器不生效。

#### 陷阱 3：module 里写的 `dataset` 可能被 primitive 覆盖

部分 primitive（`CheckboxPrimitive.Box` / `RadioPrimitive.Box` /
`SwitchPrimitive.Root`）在内部对象字面量里把 `dataset` 写在 `...rest` **之后**：

```ts
Button({ ...rest, dataset: { checked: ..., disabled: ... } })
```

后写的键覆盖先展开的，因此 module 层传进去的 `dataset` 会被**整体丢弃**。
要暴露这些状态，要么直接用 primitive 已经写好的 `data-checked` / `data-disabled`，
要么改用 class（`.is-checked` / `.is-disabled`）。CSS 同时匹配 `[data-checked]`
与 `.is-checked` 是最稳的写法。

---

## 7. 多库共存与隔离

### 7.1 允许

- 同一个页面同时**加载**三库 CSS。作用域不同，不会互相覆盖。
- 同一页面不同子树用不同 `data-tt-style`。

### 7.2 禁止

- 同一个元素/子树同时属于两个 `data-tt-style`（后者覆盖前者，行为不可预期）。
- 新库与 `@timeless/shadcn` / `@timeless/weui` **混用在同一子树**：
  这两个库有全局规则（`*` / `body` / `@layer base`），会泄漏进新库作用域。
  **一个页面只加载一套全局型样式库。**
- 新库与**真实上游框架**在同一子树混用（例：`data-tt-style="bootstrap"` 的子树里
  再引入真实 Bootstrap）。类名相同，属性作用域挡不住真实 Bootstrap 的全局规则。
  如需并存，把真实 Bootstrap 放在**另一个**子树。

### 7.3 验证隔离的方法

```bash
# 1) 三库 CSS 里不得出现无作用域的选择器
grep -nE '^\s*(html|body|#root|\*)\s*[,{]' packages/bootstrap/dist/timeless.bootstrap.css packages/material/dist/timeless.material.css packages/fluent/dist/timeless.fluent.css
# 期望：无输出

# 2) 三库 CSS 的每条顶层选择器都应包含 data-tt-style
# （人工抽查，或用一个 node 脚本解析）
```

---

## 8. 构建注册清单

新增一个库要改 **3 个脚本**。

### 8.1 `scripts/build.js`

```js
// ① BUILD_ORDER：追加到 weui 之后（顺序 = 依赖顺序，样式库之间无依赖，可任意排）
const BUILD_ORDER = [ /* … */ "shadcn", "weui", "bootstrap", "material", "fluent", "animal" ];
// `findrssui` 不走本指南的脚手架（它是从 findrss-reader 迁进来的**成品组件库**，
// 见 §13），但同样登记在这三处，于是也排在末尾。

// ② ARTIFACTS：每个库两条（UMD + CSS）
const ARTIFACTS = [
  /* … */
  ["bootstrap", "timeless.bootstrap.umd.min.js"],
  ["bootstrap", "timeless.bootstrap.css"],
  ["material",  "timeless.material.umd.min.js"],
  ["material",  "timeless.material.css"],
  ["fluent",    "timeless.fluent.umd.min.js"],
  ["fluent",    "timeless.fluent.css"],
  ["animal",    "timeless.animal.umd.min.js"],
  ["animal",    "timeless.animal.css"],
  // 若库里带**独立资源文件**（如 animal 的 woff2 字体子集），也要逐条列出，
  // 否则 `pnpm build` 的收集阶段会判定「必需产物缺失」而失败。
  ["animal",    "animal-nunito.woff2"],
  ["animal",    "animal-noto.woff2"],
];

// ③ LOAD_PROFILES：**保持不变**
```

`LOAD_PROFILES` 的语义是「一个合法的浏览器加载组合」。
把新库塞进 `full` 会改变默认加载面（体积、初始化开销），**不要动**。
新增库只作为**清单记录**存在，例如加一个不被默认使用的 profile：

```js
style_libs: [
  "timeless.dom.umd.min.js",
  "timeless.web.umd.min.js",
  "timeless.bootstrap.umd.min.js",
  "timeless.material.umd.min.js",
  "timeless.fluent.umd.min.js",
  "timeless.animal.umd.min.js",
],
```

（`full` 与 `lite` 是互斥方案，跨 profile 的重叠是**有意**的。）

### 8.2 `scripts/dev.js`

```js
// ① artifacts：新增 UMD 条目（web-shadcn 风格的 UMD 应用需要）
{ pkg: "bootstrap", src: "packages/bootstrap/dist/timeless.bootstrap.umd.min.js", dest: "timeless.bootstrap.umd.min.js" },

// ② keepFiles：新增 6 个文件名（3 个 UMD + 3 个 CSS）
"timeless.bootstrap.umd.min.js", "timeless.bootstrap.css",

// ③ cssWhitelist：新增 3 个包名（带字体的库靠它把 dist 里的 .woff2 一并拷走）
const cssWhitelist = new Set(["shadcn", "weui", "bootstrap", "material", "fluent", "animal"]);

// ④ playgroundDir：支持 --app=<name> 切换，默认保持 web-shadcn
```

`④` 的实现要点：`playgroundDir` 目前是硬编码常量（`scripts/dev.js:12`），
改成解析 `--app=`：

```js
const appArg = process.argv.find((a) => a.startsWith("--app="));
const appName = appArg ? appArg.slice("--app=".length) : "web-shadcn";
const playgroundDir = path.join(rootDir, "apps", appName);
```

**默认值必须是 `web-shadcn`**，保证 `pnpm dev` 的既有行为不变。

#### 静态服务器已抽到 `scripts/lib/static-server.js`

`dev.js` 里的 `createStaticServer` / `startStaticServer` 现在住在
`scripts/lib/static-server.js`，由 `dev.js` 与 `scripts/docs.js` 共用 —— 新库**不需要**再
动这部分代码。两个导出：

| 导出 | 用途 |
|---|---|
| `createStaticServer({ root, prefix, mimeTypes, extraMimeTypes })` | 只建 server 不 listen（需要自己控制端口/生命周期时用） |
| `startStaticServer({ root, prefix, port, ... })` | 建 + listen，日志与抽取前逐字一致 |

基础 MIME 表**刻意不含** `.woff2` / `.mjs`（保持 `dev.js` 行为不变）；带字体的库由
`docs.js` 传 `extraMimeTypes` 补齐。

### 8.3 `packages/types/generate.ts`

这一处**最危险**，务必读完整节。

`generate.ts` 做两件事：

1. `collectExports()`（74-114 行）：把各包的导出名收集到 `exportMap`，
   **同名后者覆盖前者**（注释原文：`Later packages override earlier (matching UMD load order)`）。
2. `generate()`（182-266 行）：
   - 219-226 行生成 `declare const Timeless: { … }` 命名空间；
   - 229-240 行生成 **`// === Individual globals ===`**，把每个导出名声明成
     一个**全局变量**；
   - 253-259 行把这些名字写进 `eslint.js` 的 `globals` 白名单。

新库与 shadcn **组件同名**（`Button` / `Input` / `Card` / `Tabs` / `Dialog`…）。
如果照旧注册，会：

- 让 `Button` 全局类型被**最后一个注册的库**覆盖（应用里 `Button` 的类型悄悄变了）；
- 让 eslint 不认识实际使用的库。

**解法**：为 `PACKAGES` 条目加一个 `globals?: false` 标记，
让该包只出现在 `Timeless.<namespace>` 命名空间里，
**跳过**「Individual globals」与 eslint 全局名发射。

```ts
const PACKAGES: { name: string; entry: string; namespace?: string; globals?: boolean }[] = [
  /* … */
  { name: "@timeless/shadcn", entry: "packages/shadcn/src/index.ts", namespace: "shadcn" },
  { name: "@timeless/weui",   entry: "packages/weui/src/index.ts",   namespace: "weui", globals: false },
  { name: "@timeless/bootstrap", entry: "packages/bootstrap/src/index.ts", namespace: "bootstrap", globals: false },
  { name: "@timeless/material",  entry: "packages/material/src/index.ts",  namespace: "material",  globals: false },
  { name: "@timeless/fluent",    entry: "packages/fluent/src/index.ts",    namespace: "fluent",    globals: false },
  { name: "@timeless/animal",    entry: "packages/animal/src/index.ts",    namespace: "animal",    globals: false },
];
```

配套改动：

- 230 行的循环里跳过 `pkg.globals === false`；
- 253 行的 eslint 循环里同样跳过。

另外 `BASE_COMPILER_OPTIONS.paths`（57-70 行）要为每个新包加一条
`"@timeless/<lib>": ["packages/<lib>/src/index.ts"]`，
以及 `PACKAGES` 里加条目，否则 `import("@timeless/<lib>")` 解析失败、
新库在类型里完全消失。

**注册进 `PACKAGES` 是必须的**：漏掉这一条，`Timeless.<namespace>` 在类型层面就完全缺失
（`packages/weui` 曾经漏过，现已补上）。新增库时不要重复这个缺口。

### 8.4 `scripts/docs.js`：每个库一个文档站

新库的用户手册就是它自己的示例应用（`apps/web-<lib>`），启动器是 `scripts/docs.js`，
**lib → app → port 的映射只写在 `DOC_SITES` 这一张表里**（`scripts/docs.js:22-29`）：

```js
const DOC_SITES = {
  shadcn:    { app: "web-shadcn",    port: 3400 },
  bootstrap: { app: "web-bootstrap", port: 3401 },
  material:  { app: "web-material",  port: 3402 },
  fluent:    { app: "web-fluent",    port: 3403 },
  animal:    { app: "web-animal",    port: 3404 },
  weui:      { app: "web-weui",      port: 3405 },
};
```

新库要加的就是这一行 + `packages/<lib>/package.json` 的 `"docs"` 脚本：

```json
{ "scripts": { "docs": "node ../../scripts/docs.js" } }
```

三种入口等价（`resolveLib` 支持 `--lib=` 显式指定，否则从 cwd 的包名推断）：

```bash
pnpm --filter ./packages/<lib> run docs        # 包内，lib 由包名推断
pnpm run docs --lib=<lib> [--port=<n>] [--watch]
node scripts/docs.js --lib=<lib>
```

⚠️ 必须是 `pnpm run docs --lib=x`。`pnpm docs -- --lib=x`（省 `run`、用 `--` 转发）在
pnpm 10 下不会传参，而是把 `--lib=x` 当成包名去 npm 解析，报
`EINVALIDTAGNAME: Invalid tag name "--lib=x"`。

行为：`isStale()` 比对 `apps/<app>/public/timeless/<version>/` 与 `packages/*/{src,dist}`
的 mtime，过期才调 `dev.js --app=<app> --build` 重建，然后起静态服务；
`--watch` 直接把控制权交给 `dev.js`（它自带 buildAll + 监听 + 静态服务）。

### 8.5 文档站的信息架构：antd 分类 + 左侧两级菜单

6 个文档站共用一套导航模型，新库的示例应用要照做：

- **分类** = antd 官网的 6 类（通用 / 布局 / 导航 / 数据录入 / 数据展示 / 反馈）+
  第 7 组「其他」（antd 归类之外的组件）；**空组不渲染**。
- **每个分类一个独立路由页**，左侧是两级菜单（分类分组 → 组内组件）。
- 三处同名、不手写字面量：`components/index.js` 的 `sectionId(title)` 派生区块 DOM id，
  `pages/home/categories.js` 用它写菜单 `anchor`，页面里 `Section(title, …)` 也用它。
- 点组件若不在当前分类页 → 先 `history.push` 切分类，再滚动到区块并高亮
  （`pages/home/anchor.js`：待办 id + `onMounted` 通知 + rAF/轮询兜底）。
- 布局外层必须有**确定高度**（`SplitView` 的根节点硬编码 `height:100%`），
  且页面的滚动容器要用 `height:100%` 而不是 `100vh`（否则与 keep-alive 盒子双重滚动）。

---

## 9. 打包去重约束

承接 `AGENTS.md` 第一节。新库必须满足：

1. **只 external `@timeless/timeless`。** 不要 external 单个 `@timeless/inner-*`，
   也不要直接 import 它们 —— 那会造出第二条打包路径，导致同一个
   `mitt` / `dayjs` 被内嵌进多个产物，`pnpm build` 的重复分析会失败。
2. **禁止互相 import。** `bootstrap` 不得依赖 `material` / `fluent` / `shadcn` / `weui`。
3. **禁止内嵌第三方依赖。** 不要 `import "bootstrap/dist/css/bootstrap.css"`，
   也不要 npm 依赖上游 CSS 包 —— token 与样式一律手抄进 `src/style/`。
   这样才没有版本漂移，也不会把上游的全局规则带进来。
4. **聚合 core 通过源码 alias 构建 workspace 依赖**，不要二次打包别人的 `dist`。

改完必须重跑完整构建：

```bash
pnpm build
```

必须看到：

```
Bundle dependency analysis passed: no duplicate dependencies.
```

且 `dist/timeless/<version>/bundle-analysis.json` 满足：

```json
{ "ok": true, "duplicates": [], "opaque_workspace_bundles": [] }
```

---

## 10. 新增一个库的完整 Checklist

按顺序执行，每步结束仓库都应仍可构建。

### 阶段 A — 文档先行

- [ ] 确定库名 `<lib>`、上游设计系统与版本、token 前缀（`--bs-*` / `--md-sys-*` / …）。
- [ ] 编写 `packages/<lib>/THEME_DESIGN.md`
      （上游 token 表 + 语义别名映射表 + 暗色挂载点 + 与上游规范的对照说明）。
- [ ] 更新 `PACKAGES.md`：为新库加小节。
- [ ] 若是第一批作用域库，确认 `THEME_PACKAGE_GUIDE.md`（本文件）已存在。

### 阶段 B — 包骨架

- [ ] 建目录结构与 5 个配置文件（`package.json` / `vite.config.ts` /
      `tsconfig.json` / `src/env.d.ts` / `src/index.ts`）。
- [ ] `version` 与根一致。
- [ ] 写 `src/style/tokens.css`：上游 token，亮 + 暗。
- [ ] 写 `src/style/alias.css`：全部挂在 `[data-tt-style="<lib>"]` 下。
- [ ] 写 `src/style/base.css`：**只在本库作用域内**做重置。
- [ ] `pnpm --filter ./packages/<lib> run build` 通过（此时 modules 可为空）。

### 阶段 C — 模块（按 Tier 推进）

- [ ] Tier 1（24）：button, input, textarea, label, checkbox, checkbox-group,
      radio, switch, toggle, slider, select, number-input, progress, avatar, badge,
      separator, skeleton, card, alert, kbd, link, aspect-ratio, scroll-area, field
- [ ] Tier 2（17）：dialog, sheet, popover, popconfirm, tooltip, dropdown-menu,
      context-menu, menu, tabs, accordion, steps, toast, table, form, search-select,
      file-picker, resizable-panels
- [ ] Tier 3（8）：date-picker, date-range-picker, time-picker, date-time-picker,
      cascader, scroll-view, affix, waterfall
- [ ] 结构复杂组件（2）：`tree`（`vm.TreeCore` + `ui.TreePrimitive`）、
      `flow`（`vm.FlowCanvasModel` / `FlowNodeModel` / `FlowEdgeModel`）。
      这两个的**逻辑在共享层**，样式库只出薄包装 + CSS，不要重写几何或树算法。
      - 树行高落成本库自己的 `--tree-row-height`（`ListViewV2` 的 `itemHeight` 是
        渲染器入参，必须与 CSS 一致），别吃 `--control-height-*`。
      - 半选用 `.is-indeterminate` 类名，**不要**用 `indeterminate` 属性
        （响应式 attribute 写不上）。
      - 落点指示线 / 流动虚线的动画名按 4.5 加库前缀。
- [ ] **不在范围**：`llm-provider-form`、`history-panel`、`menu-shared`（辅助模块）、
      `sonner`（`toast` 已覆盖）。
- [ ] 每个模块都覆盖 6.4 的交互状态。

### 阶段 D — 注册

- [ ] `scripts/build.js`：`BUILD_ORDER` + `ARTIFACTS`（UMD + CSS 两条）。
- [ ] `scripts/dev.js`：`artifacts` + `keepFiles` + `cssWhitelist`。
- [ ] `scripts/dev.js`：`--app=` 开关（若尚未支持）。
- [ ] `scripts/check-style-scope.mjs`：把新库加进 `SCOPED_LIBS`，`pnpm check:scope` 通过。
- [ ] `packages/types/generate.ts`：`PACKAGES` 条目（`namespace` + `globals: false`）
      + `BASE_COMPILER_OPTIONS.paths` 条目。
- [ ] `pnpm build:types` 通过，且 `packages/types/global.d.ts` 里
      **没有**新库的 individual globals、**有** `Timeless.<lib>`。

### 阶段 E — 示例应用

- [ ] 新建 `apps/web-<lib>/`，骨架抄 `apps/web-shadcn`。
- [ ] `index.html`：
      - `<html data-tt-style="<lib>">`
      - 引 `public/timeless/<version>/timeless.<lib>.css`
      - 引 `timeless.umd.min.js` + `timeless.dom.umd.min.js` + `timeless.web.umd.min.js`
        + `timeless.<lib>.umd.min.js`
      - `Object.assign(window, Timeless); Object.assign(window, Timeless.<lib>);`
      - 暗色开关调 `app.setTheme`
- [ ] 页面用本库组件搭一个组件画廊，覆盖 Tier1 + Tier2 主要组件。
- [ ] `pnpm dev --app=web-<lib>` 能打开，组件正常渲染，`app.setTheme("dark")` 生效。

### 阶段 F — 验证与收尾

- [ ] 跑第 11 节的全部验证。
- [ ] 三库 CSS 同时加载互不串味（作用域验证）。
- [ ] 更新 `PACKAGES.md` / `AGENTS.md` 指针。
- [ ] 确认 `git status` 里没有夹带与本次任务无关的改动。

---

## 11. 验证配方

```bash
# 1. 单包构建
pnpm --filter ./packages/<lib> run build

# 2. 类型生成（改了 generate.ts 之后必跑）
pnpm build:types
grep -n "timeless\|Timeless\." packages/types/global.d.ts | head    # 抽查
grep -c "^declare const Button" packages/types/global.d.ts         # 期望 1（只有 shadcn）

# 3. 发布门禁：生产构建 + 去重分析 + 冒烟
pnpm build
# 必须看到：Bundle dependency analysis passed: no duplicate dependencies.

# 4. 分析报告
cat dist/timeless/*/bundle-analysis.json
# 期望 { "ok": true, "duplicates": [], "opaque_workspace_bundles": [] }

# 5. 各库文档站（端口表见 §8.4；`pnpm dev` 默认仍是 web-shadcn:3000）
pnpm run docs --lib=shadcn      # 3400
pnpm run docs --lib=bootstrap   # 3401
pnpm run docs --lib=material    # 3402
pnpm run docs --lib=fluent      # 3403
pnpm run docs --lib=animal      # 3404
pnpm run docs --lib=weui        # 3405
# 或 pnpm --filter ./packages/<lib> run docs
# 期望：终端打印 "Static server listening on port <port>"，页面 /home/general 渲染正常

# 6. 作用域隔离检查：顶层规则块的选择器里必须都带 [data-tt-style=<lib>]
pnpm check:scope
# 期望：每个库 unscoped = 0，末尾 "Style scope check passed"
# 新库加入 scripts/check-style-scope.mjs 的 SCOPED_LIBS 后自动纳入检查

# 7. 状态钩子巡检（disabled / invalid / loading / focus-visible / reduced-motion）
for l in bootstrap material fluent animal; do echo "== $l";
  for k in disabled aria-invalid is-invalid is-loading focus-visible prefers-reduced-motion; do
    printf "  %-22s %s files\n" "$k" "$(grep -rl "$k" packages/$l/src/style/ | wc -l | tr -d ' ')";
  done; done
# 期望：每一项都 > 0；reduced-motion 至少命中 base.css 的兜底块

# 8. 暗色挂载点必须同时匹配 4 种形态（app.setTheme 会同时设 data-theme / colorScheme / .dark）
# ⚠️ 只对**提供暗色**的库适用。animal 上游未提供暗色主题，本库刻意不写暗色块，
#    所以它在这一步的期望值是 0 —— 见 packages/animal/THEME_DESIGN.md 第 4 节。
grep -c 'data-theme="dark"' packages/{bootstrap,material,fluent}/src/style/tokens.css
# 期望：各 3（1 行注释 + 2 个选择器：后代形态、同元素形态）
grep -c 'data-theme="dark"' packages/animal/src/style/tokens.css
# 期望：0
```

**完成定义**：

- 各库单包构建退出码 0；
- `pnpm build` 退出码 0 且分析报告 `{ok:true,duplicates:[],opaque_workspace_bundles:[]}`；
- 各 app 启动后组件正常渲染、`app.setTheme("dark")` 生效；
- 同一页面同时加载多库 CSS 时互不串味。

---

## 12. 相关文档

| 文档 | 内容 |
|---|---|
| `AGENTS.md` | 打包去重原则、primitive 是 shape 的分层规则 |
| `PACKAGES.md` | 全仓库包索引 |
| `scripts/docs.js` | 每个库的文档站启动器（`DOC_SITES` = lib → app → port 的唯一映射） |
| `scripts/lib/static-server.js` | `dev.js` 与 `docs.js` 共用的静态服务器 |
| `packages/shadcn/THEME_DESIGN.md` | shadcn token 分层、`tt-` 前缀、全局规则注意事项 |
| `packages/weui/THEME_DESIGN.md` | `--weui-*` 语义、4 预设、mixin API、未定义变量缺口 |
| `packages/bootstrap/THEME_DESIGN.md` | Bootstrap 5.3 token 与别名映射 |
| `packages/material/THEME_DESIGN.md` | Material 3 token 与别名映射 |
| `packages/fluent/THEME_DESIGN.md` | Fluent 2 token 与别名映射 |
| `packages/animal/THEME_DESIGN.md` | animal-island-ui token 与别名映射、无暗色的处理、内嵌字体子集流程 |
| `packages/findrssui/THEME_DESIGN.md` | 从 findrss-reader 迁入的组件库：`--frui-*` token、`frui-*` 类名、全局型（无作用域）与消费方式 |

---

## 13. 迁入的成品组件库：`@timeless/findrssui`

前面 12 节讲的都是「在本仓**新造**一套样式库」。这一节反过来：把一个**已经存在**的组件库
搬进来（来源：findrss 阅读端 `findrss-reader/frontend/src/components/` 下约 960 行的单文件
`findrssui.js` + `findrssui_layer.js` + `frontend/src/findrssui.css`），并让原仓引用**构建产物**。
两者共用同一套构建注册机制，但下面这几条**不要**照抄前面：

| | 作用域样式库（bootstrap / material / fluent / animal） | findrssui |
|---|---|---|
| CSS 作用域 | `[data-tt-style="<lib>"]` 属性作用域 | **全局型**：`:root` 挂 `--frui-*`、类名 `frui-*`，没有属性作用域 |
| 组件骨架 | 共享 `ui-primitive` + `inner-vm`，只换视觉层 | **自带实现**（迁入时逐字照搬，`@ts-nocheck`，没顺手补类型） |
| 主题 | 亮 / 暗多套 | **只有暗色一套**预设 |
| 文档站 | `scripts/docs.js` + `apps/web-<lib>` | **没有**：它的画廊是 findrss 仓自己的 `preview/` |
| `scripts/dev.js` | 要加 `artifacts` / `keepFiles` / `cssWhitelist` | **不用动**（monorepo 里没有 app 用它） |
| `src/style/` 里的文件 | 全套 token + 组件样式 | 只有一份 `findrssui.css`（压缩后就是发布的 `timeless.findrssui.css`） |

**消费方式**（就是「引用构建后产物」的落点）。findrss-reader **不** import 源码，只引产物：

```html
<link rel="stylesheet" href="./assets/timeless/0.33.1-tree-compat-2/timeless.findrssui.css">
<script src="./assets/timeless/0.33.1-tree-compat-2/timeless.findrssui.umd.min.js"></script>
```

那份产物由 `pnpm build` 落到 `packages/findrssui/dist/`，再**逐字复制**进
`findrss-reader/public/assets/timeless/<版本目录>/`（两处 sha256 必须相同）。页面侧只有
`frontend/src/components/findrssui.js` 这一层 ESM 绑定读 `globalThis.Timeless.findrssui`，
其余模块照旧从 `@/components/index.js` 取。

**加载顺序有硬约束**：产物在**模块求值期**就会取一次树组件
（`Timeless.FindRSSTree?.TreePrimitive || Timeless.ui.TreePrimitive`，与
`findrss-reader/timeless/index.js` 同链），所以它必须排在 tree 运行时
（`timeless.tree.umd.min.js`）之后——这就是目录名 `0.33.1-tree-compat-2`
的由来。详见 [`packages/findrssui/THEME_DESIGN.md`](./packages/findrssui/THEME_DESIGN.md) §6。

**升级流程**：改 `packages/findrssui/src` → 在 timeless 仓跑 `node scripts/build.js --prod`
（它按 `BUILD_ORDER` 先刷各包的 `dist/`，再把产物收进 `dist/timeless/<版本>/`）
→ 复制 `dist/timeless/<版本>/timeless.findrssui.{umd.min.js,css}` 到 findrss-reader 的
`public/assets/timeless/<版本目录>/`（两处 sha256 必须相同）→ 两个仓各跑一次自己的构建。
**复制源要认准 `dist/timeless/<版本>/` 这份收口产物** —— 单独跑
`pnpm --filter ./packages/findrssui run build` 得到的是未走生产 minify 配置的同名文件，
字节不同（CSS 通常一致，UMD 会差几十字节）。

**tree 运行时怎么重打**。只要改的是 `ui-vm`（数据的 `guides` mask、拖拽状态机
`beginDrag` / `_resolveDrop` / `_applyMove`）或 `ui-primitive`（`data-tree-guide` 的 DOM、
`on_pointer_down` 的拖拽守卫），**只改 findrssui 的类名是不够的** —— 行里永远不会有
`[data-tree-guide]`、`data-tree-line` 也不会出现，因为树的三件套（`TreeCore` /
`TreePrimitive` / 它们构造的 `View`）全部由 `timeless.tree.umd.min.js` 里那份
**自包含 core 副本**提供，与同目录的 `timeless.umd.min.js` 无关。重打步骤：

```bash
cd /Users/mayfair/Documents/other/timeless
node scripts/build.js --prod                       # 产出 dist/timeless/<版本>/timeless.umd.min.js
```

把「前缀 + 新 core + 后缀」拼成一个文件，**原地覆盖** findrss-reader 的
`public/assets/timeless/<版本目录>/timeless.tree.umd.min.js`：

- 前缀：`;(function(){const __findrss_timeless=globalThis.Timeless;globalThis.Timeless={};\n`
- 中段：整份 `dist/timeless/<版本>/timeless.umd.min.js`（全局名 `Timeless`，无前后换行）
- 后缀：`\n;const __findrss_tree=globalThis.Timeless;globalThis.Timeless=__findrss_timeless;globalThis.Timeless.FindRSSTree={TreePrimitive:__findrss_tree.ui.TreePrimitive,TreeCore:__findrss_tree.vm.TreeCore,setPlatform:__findrss_tree.setPlatform};})();`

**后缀里的 `setPlatform` 不能省**。core 副本是一份**独立的模块图**，里面有自己的一份
`platform` 单例（`packages/primitive/src/platform.ts`，默认全空实现：`addEventListener`
返回 noop、`isBrowser()` 为 false）；`timeless-dom` 的 `setPlatform` 只给**主** core 的
那份赋值，副本这份永远不会被碰到。后果只落在指针会话上：`createPointerTracker.handle_down`
里的 `getPlatform().addEventListener("pointermove", …)` 变成空操作，所以**点击照常、拖拽
永远起不来**（点击走元素自身的监听，不经过 platform）。宿主要显式注入 ——
findrss-reader 侧写在自己的 `timeless/index.js`（唯一触碰 `globalThis.Timeless` 的模块）：

```js
if (Timeless.FindRSSTree?.setPlatform && Timeless.DOM?.platform) {
  Timeless.FindRSSTree.setPlatform(Timeless.DOM.platform);   // 组合版：primitive + popper 一起设
}
```

**不要新建 `-compat-3` 目录**：SW 的 `__CACHE_VERSION__` 是预缓存清单里所有文件内容的
sha256（`findrss-reader/build.js`），原地覆盖同目录文件即可触发更新。**不要**用
`scripts/dev.js`（只服务 monorepo 的 `apps/*`，且会按 `keepFiles` 清 `dist/`，删掉
`timeless.umd.min.js` 等）。core、`timeless.dom./web.umd.min.js` 都不动 —— 保持已发布的
版本正是 `-tree-compat` 这个拆分的意义。
