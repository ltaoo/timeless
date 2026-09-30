# `@timeless/shadcn` 设计规范（Design Token + CSS Variable）

本文件描述 `@timeless/shadcn` 的**视觉层**：token 体系、CSS variable 命名、暗色挂载点、
Tailwind 集成方式，以及应用侧覆盖 token 的入口。

组件**行为**不在这里定义。`@timeless/shadcn` 只是
`@timeless/ui-primitive`（无样式 DOM 组合层）+ `@timeless/inner-vm`（状态机）之上的一层
「组合包装 + 样式」，与 `@timeless/weui`、`@timeless/bootstrap` 等库共享同一批组件骨架。
骨架写法见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md)。

---

## 1. Token 分层模型

shadcn 的 token 分三层，从下往上依次是：

```
① 语义变量层   :root / .dark / [data-theme="dark"]      纯 CSS 自定义属性
                     ↓  @theme inline 映射
② Tailwind 主题层   --color-* / --radius-* 命名空间      生成工具类
                     ↓  工具类被组件字符串引用
③ 组件类名层     modules/*.ts 里的 "bg-primary text-primary-foreground"
```

### ① 语义变量层 — `src/styles/globals.css` 的 `:root`

真正的值只在这里出现。名称为「语义」而非「颜色」：`--primary` 而不是 `--blue-500`。
组件不直接写 `oklch(...)`，只引用语义名，所以换色只需覆盖这一层。

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* … */
}
```

### ② Tailwind 主题层 — `@theme inline`

`@theme inline` 把语义变量映射成 Tailwind 的命名空间，从而**生成工具类**：

```css
@theme inline {
  --color-primary: var(--primary);   /* → bg-primary / text-primary / border-primary … */
  --radius-lg: var(--radius);        /* → rounded-lg */
}
```

`inline` 关键字很关键：它让工具类直接输出 `var(--primary)` 本身，而不是再包一层
`var(--color-primary)`。这样应用在**运行时**改 `--primary` 就能立即换肤，无需重新编译 CSS。

### ③ 组件类名层

组件的 `modules/*.ts` 里用工具类字符串组合出样式，例如
`src/modules/button.ts:14`：

```ts
const VARIANTS = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
  outline: "border-border bg-background hover:bg-muted …",
};
```

构建期 `vite-plugin-tailwind-prefix` 会给这些工具类加上 `tt-` 前缀（见第 5 节），
最终产物是 `.tt-bg-primary` 之类的普通类。因此本库**不要求**应用侧启用 Tailwind；
`dist/timeless.shadcn.css` 已经是编译好的普通 CSS。

---

## 2. 完整 Token 清单

### 2.1 语义颜色（`:root` 亮色 / `.dark, [data-theme="dark"]` 暗色）

| Token | 用途 | 亮色 | 暗色 |
|---|---|---|---|
| `--background` | 页面底色 | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `--foreground` | 正文前景 | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--card` | 卡片底 | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--card-foreground` | 卡片前景 | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--popover` | 浮层底 | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| `--popover-foreground` | 浮层前景 | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--primary` | 主操作 | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` |
| `--primary-foreground` | 主操作上的文字 | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--secondary` | 次级操作 | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--secondary-foreground` | 次级操作文字 | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--muted` | 弱化底 | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--muted-foreground` | 弱化文字 | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` |
| `--accent` | 悬停/强调底 | `oklch(0.97 0 0)` | `oklch(0.371 0 0)` |
| `--accent-foreground` | 强调文字 | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `--destructive` | 危险操作 | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` |
| `--destructive-foreground` | 危险操作文字 | `oklch(0.97 0.01 17)` | `oklch(0.58 0.22 27)` |
| `--border` | 边框 | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` |
| `--input` | 输入框边框 | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` |
| `--ring` | focus ring | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` |

**暗色不是简单反相**：`--border` / `--input` 从实色变成半透明白（`oklch(1 0 0 / 10%)`），
这让边框叠在任意底色上都成立。应用侧覆盖时要保持这个「半透明」语义。

### 2.2 图表色（`--chart-1` … `--chart-5`）

| Token | 亮色 | 暗色 |
|---|---|---|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

### 2.3 侧边栏色（`--sidebar-*`）

`--sidebar`、`--sidebar-foreground`、`--sidebar-primary`、`--sidebar-primary-foreground`、
`--sidebar-accent`、`--sidebar-accent-foreground`、`--sidebar-border`、`--sidebar-ring`。
结构与 `--background/--primary/--accent/--border/--ring` 一一对应，只是独立成组，
便于「侧边栏始终深色」这类需求单独覆盖。

### 2.4 非颜色 token

| Token | 值 | 说明 |
|---|---|---|
| `--radius` | `0.625rem` | 圆角基准，派生见 2.5 |
| `--table-fixed-shadow` | 亮 `rgba(0,0,0,0.2)` / 暗 `rgba(255,255,255,0.25)` | 表格固定列投影 |

### 2.5 `--radius-*` 推导

`@theme inline` 里 **只定义 `--radius` 一个基准值**，其余全部按比例推导：

```css
--radius-sm:  calc(var(--radius) * 0.6);  /* 0.375rem */
--radius-md:  calc(var(--radius) * 0.8);  /* 0.5rem   */
--radius-lg:  var(--radius);              /* 0.625rem */
--radius-xl:  calc(var(--radius) * 1.4);  /* 0.875rem */
--radius-2xl: calc(var(--radius) * 1.8);  /* 1.125rem */
--radius-3xl: calc(var(--radius) * 2.2);  /* 1.375rem */
--radius-4xl: calc(var(--radius) * 2.6);  /* 1.625rem */
```

意义：应用只改一个 `--radius`，整套组件圆角按比例缩放。
**不要**在应用里单独覆盖 `--radius-lg` —— 会与 `--radius` 脱钩。

---

## 3. 变体（`@custom-variant`）

`globals.css` 顶部定义 10 个 `@custom-variant`，把 headless 层输出的
`data-*` / `aria-*` 属性翻译成 Tailwind 变体语法：

| 变体 | 选择器展开 | 对应 headless 状态 |
|---|---|---|
| `dark` | `&:is(.dark *)` | 暗色模式 |
| `data-open` | `[data-state="open"]` 或 `[data-open]:not([data-open="false"])` | 展开中 |
| `data-closed` | `[data-state="closed"]` 或 `[data-closed]:not([data-closed="false"])` | 已收起 |
| `data-checked` | `[data-state="checked"]` 或 `[data-checked]:not([data-checked="false"])` | 选中 |
| `data-unchecked` | `[data-state="unchecked"]` 或 `[data-unchecked]:not([data-unchecked="false"])` | 未选中 |
| `data-selected` | `[data-selected="true"]` | 列表项选中 |
| `data-disabled` | `[data-disabled="true"]` 或 `[data-disabled]:not([data-disabled="false"])` | 禁用 |
| `data-active` | `[data-state="active"]` 或 `[data-active]:not([data-active="false"])` | 激活 |
| `data-horizontal` | `[data-orientation="horizontal"]` | 横向 |
| `data-vertical` | `[data-orientation="vertical"]` | 纵向 |

每个变体都兼容**两种**书写：Radix 风格的 `data-state="open"`，以及布尔风格的
`[data-open]` / `[data-open="false"]`。这是为了同时兼容 `@timeless/inner-vm`
里不同历史阶段的状态机输出。

**新增变体的规则**：先在 `packages/ui-vm` 确认状态机真的会输出该属性，
再在 `globals.css` 顶部加 `@custom-variant`。不要在组件里写裸属性选择器。

---

## 4. 暗色挂载点

```css
.dark,
[data-theme="dark"] {
  --background: oklch(0.145 0 0);
  /* …全部语义变量 */
}
```

**同时匹配两个选择器**，原因：

- `[data-theme="dark"]` — `app.setTheme()` 在 `<html>` 上设置（见
  `packages/kit/src/app/index.ts:172`，web 实现 `packages/provider-web/src/app.ts:119-123`）。
- `.dark` — Tailwind 生态惯例，以及应用里常见的「局部暗色子树」
  （例如 `<div class="dark">` 里强制暗色）。

配合 `@custom-variant dark (&:is(.dark *))`，**组件内部**的暗色覆盖写作
`dark:bg-input/30`，翻译成 `.dark .tt-bg-input\/30`，因此局部 `.dark` 子树同样生效。

### 与应用主题 API 的衔接

```ts
app.setTheme("dark" | "light" | "system");
```

三者行为：

- `light` / `dark` → `<html>` 上设 `data-theme`、`colorScheme`、并切换 `.dark` class。
- `system` → 读 `prefers-color-scheme`，同样落到 `data-theme` + `.dark`。

本库不需要额外适配，只要保证 token 的双选择器写法即可。
`apps/web-shadcn/index.html` 里那段内联脚本就是「首屏防闪烁」版本：
在样式生效前先读 `localStorage.theme`，决定加不加 `.dark`。

---

## 5. `tt-` 前缀机制与白名单

### 为什么需要前缀

`bg-primary`、`flex`、`border` 这类工具类是**全局类名**。如果应用本身也用 Tailwind，
两套工具类的定义会互相覆盖。所以本库在构建期把组件字符串里的工具类统一改写成
`tt-bg-primary` / `tt-flex` / `tt-border`，并且编译出的 CSS 也只包含带前缀的版本。

实现在 `packages/shadcn/build/vite-plugin-tailwind-prefix.ts`，
由 `vite.config.ts` 的 `prefixTailwindClassesPlugin(resolve(__dirname, "src"))` 挂载。

它同时处理两侧：

1. **TS 侧**：扫描 `src/**/*.ts` 里形如 `class: "…"` 的字符串字面量，
   逐个 token 加 `tt-` 前缀。
2. **CSS 侧**：PostCSS 阶段给生成的工具类选择器加同样的前缀。

### 白名单

并非所有 token 都该加前缀。插件内置两张表：

- `customClassNames` — **自定义语义类**，不加前缀。包括 `alert-icon`、`animate-dash`、
  `cascader__content`、`cascader__panel`、`cn-menu-target`、`cn-menu-translucent`、
  `cn-rtl-flip`、`dark`、`flow-node-content`、`is-after`、`is-animated`、`is-before`、
  `is-checked`、`is-indeterminate`、`no-scrollbar`、`overlay-scrollbar`、
  `scroll-view`、`select__content`、`t-file-dropzone`、`t-file-input`、`t-menu-item-wrap`、
  `t-input`。
  其中 `is-*` 是**状态类名**：Tree 的落点指示线（`is-before` / `is-after`）、勾选态
  （`is-checked` / `is-indeterminate`）和 Flow 的流动边（`is-animated`）都靠它们，
  而对应的规则写在 `src/index.css`（不经 Tailwind，因此不会被打上 `tt-`）。
  两侧必须同名，所以这些名字**不能**被插件改写。
- `bareTailwindUtilities` — **无变体、无修饰符的裸工具类**（`absolute`、`flex`、`grid`、
  `hidden`、`relative`、`rounded`、`shadow`、`truncate` …）。
  这些在应用里出现频率极高，加前缀反而妨碍应用直接使用；插件对它们做特殊识别，
  保证 `bg-primary` 会被改写而 `flex` 不会误伤字符串里的普通单词。

### 新增自定义类时

如果组件里需要一个新的自定义类名（不走 Tailwind），
**必须**把它加进 `customClassNames`，否则插件会尝试给它加前缀而失效。

### 运行时的注意

因为 CSS 已经编译完毕且类名带前缀，应用侧**不需要**、也**不应该**再加载一份 Tailwind
来「补齐」样式 —— 会引入第二套未加前缀的全局工具类，与本库冲突。

---

## 6. 应用内覆盖 Token 的四种方式

### 方式 A：在 `:root` 覆盖（全局换肤）

```html
<style>
  :root {
    --primary: oklch(0.55 0.2 264);
    --primary-foreground: oklch(0.985 0 0);
    --radius: 0.25rem;      /* 整套圆角一起变方 */
  }
</style>
```

顺序很重要：这段 `<style>` 必须在 `timeless.shadcn.css` **之后**加载，否则会被覆盖。

### 方式 B：在局部子树覆盖（区域换肤）

```html
<div style="--primary: #7c3aed; --radius: 1rem;">
  <div id="themed-area"></div>
</div>
```

因为工具类输出的是 `var(--primary)`（`@theme inline` 的作用），
局部覆盖会沿着 DOM 树往下继承，该子树内的组件全部换色，其他区域不受影响。

### 方式 C：JS 运行时切换

```ts
app.setTheme("dark");                    // 整体暗色
document.documentElement.style.setProperty("--primary", "#7c3aed");  // 改品牌色
```

`@theme inline` 保证了这两者都是纯运行时行为，不触发重新构建。

### 方式 D：规范页实时调参（预览孤岛）

`apps/web-shadcn` 的**设计规范页**（左菜单「其他 → Design Spec」→
`/home/index/design`，实现在 `src/pages/home/index.design.js`）把方式 B / C
做成了可视化编辑器：左侧是从真实 token 读出来的规范表 + 控件，右侧一块预览孤岛。
控件写的是孤岛元素上的**内联 CSS 变量**，所以只影响孤岛，画廊外壳不受影响，
可一键重置。机制与注意事项见 `THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=shadcn`（→ <http://127.0.0.1:3400>，见指南 §8.4）。

**能力边界（重要）**：本库的间距 / 字阶 / 阴影已经被编译进 `tt-*` 工具类，
运行时不经过任何 `var()`，因此**不可调**。规范页对这些分组如实标注
「该库不暴露此类 token（编译期烘焙）」，不假装支持。可调集合只有：

| 分组 | token |
|---|---|
| 色板 | `--background` `--foreground` `--card` `--card-foreground` `--popover` `--primary` `--primary-foreground` `--secondary` `--secondary-foreground` `--muted` `--muted-foreground` `--accent` `--accent-foreground` `--destructive` `--destructive-foreground` `--border` `--input` `--ring` `--chart-1`…`--chart-5` `--sidebar` `--sidebar-primary` `--sidebar-accent` `--sidebar-border` `--sidebar-ring` |
| 圆角 | `--radius`（调它时**连带写派生阶梯** `--radius-sm/md/lg/xl/2xl/3xl/4xl = calc(var(--radius) * k)`，k 取 2.5 节的同值，效果不依赖 `@theme inline` 的解引用行为） |
| 其余分组 | 不可调（编译期烘焙） |

页面**只暴露第二层语义别名**，不暴露 `@theme inline` 里那层 `--color-*` 映射名。

两个本库特有的实现坑：

- 颜色默认写成 `oklch()`，而 `<input type="color">` 只认 hex。取色器要先做一次
  **1×1 canvas 像素读回**转 hex —— `getComputedStyle().color` 与 canvas 的
  `fillStyle` 都会**原样返回 `oklch(...)`**，不做颜色空间转换。
  带 alpha 的颜色转不出 hex，页面让它们退回文本框（`--border` / `--input` /
  `--sidebar-border` 就是这种情况）。
- 预览标本**一律用内联 `var()`，不要用 Tailwind 工具类**。
  `apps/web-shadcn/index.html` 用的是运行时 `@tailwindcss/browser`，
  它的 theme 里没有本包的 `@theme inline` 映射，运行时生成的
  `bg-primary` / `rounded-lg` 不会跟 token 走。

---

## 7. `@layer base` 的全局规则注意事项

`globals.css` 末尾有：

```css
@layer base {
  html, body, #root { width: 100%; height: 100%; }
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
  button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }
}
```

这是**全局规则**（`html` / `body` / `*`，不带任何作用域）。对 `@timeless/shadcn`
自身是合理的：它从设计上就是「应用唯一一套样式」。但有两条约束必须知道：

1. **`* { @apply border-border }` 会给所有元素设默认边框色**。
   元素只有在设置 `border-width` 后才可见边框，所以通常无害；
   但如果应用依赖「浏览器默认边框色」，会看到颜色变化。
2. **`* { @apply outline-ring/50 }` 会改所有元素的默认 outline 色**，包括原生控件。

### 对新增样式库的约束

`@timeless/bootstrap` / `@timeless/material` / `@timeless/fluent` **不允许**照抄这一节。
它们必须是**可共存**的：所有 token 与样式挂在 `[data-tt-style="<lib>"]` 之下，
不得输出无作用域的 `html` / `body` / `#root` / `*` 规则。
`@timeless/shadcn` 保持现状是**有意的例外**，不破坏既有行为。

---

## 8. 相关文件

| 文件 | 作用 |
|---|---|
| `src/styles/globals.css` | 语义变量、`@theme inline`、`@custom-variant`、`@layer base`、sonner 样式 |
| `src/index.css` | `.overlay-scrollbar` / `.no-scrollbar` 两个自定义类 |
| `build/vite-plugin-tailwind-prefix.ts` | `tt-` 前缀改写 + 白名单 |
| `tailwind.config.js` | 仅声明 `content: ["./src/**/*.{ts,tsx}"]`，不扩展 theme |
| `postcss.config.js` | `@tailwindcss/postcss` + `autoprefixer` |
| `vite.config.ts` | 产物名 `timeless.shadcn.css`、UMD 全局 `Timeless.shadcn` |

---

## 9. 与其他库的关系

| 库 | 样式路线 | 作用域 | 可共存 |
|---|---|---|---|
| `@timeless/shadcn` | Tailwind v4 + `tt-` 前缀 | 无（全局） | 本库独占样式时可用 |
| `@timeless/weui` | Less + `--weui-*` | 依赖 `body` / `.wx-root` | 见 `../weui/THEME_DESIGN.md` |
| `@timeless/bootstrap` | 纯 CSS + `--bs-*` | `[data-tt-style="bootstrap"]` | 可 |
| `@timeless/material` | 纯 CSS + `--md-sys-*` | `[data-tt-style="material"]` | 可 |
| `@timeless/fluent` | 纯 CSS + `--colorNeutral*` | `[data-tt-style="fluent"]` | 可 |

新增样式库的完整流程见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md)。
