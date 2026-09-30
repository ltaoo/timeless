# `@timeless/animal` 设计规范（Design Token + CSS Variable）

> 本文档描述 `@timeless/animal` 的 token 体系。
> 阅读前请先看仓库根目录的 `THEME_PACKAGE_GUIDE.md`（分层模型与新建样式库的方法），
> 以及 `packages/fluent/THEME_DESIGN.md`（同一骨架的另一套作用域库实现）。

---

## 0. 上游来源与授权

本库的**设计 token 取值**参考 [`guokaigdg/animal-island-ui`](https://github.com/guokaigdg/animal-island-ui)
（「岛屿 / 田园」风格组件库，薄荷青主色 + 奶油羊皮纸底 + 2px 描边的暖色系）。

上游仓库的代码是 **CC BY-NC 4.0（非商业）** 授权，因此本库：

- **不复制**其 Less / CSS / JSX 源文件（那会形成 NC 传染的衍生作品）；
- 只取**设计 token 的取值**（颜色、尺寸、时长这类事实性数据）作为第一层变量；
- 选择器、规则、组件实现全部**按本仓库的约定自行重写**（`animal-` 前缀 BEM + `data-tt-style` 作用域）。

上游资料里有两份互相矛盾的 token 说明（编译期 `src/styles/variables.less` 与运行时
`src/styles/themes/default.less` 产物，以及 `docs/design-system/` 下的文档），
**本库一律以「`variables.less` + `themes/default.less` 这一对」为准**，
分歧处逐条记录在第 3 节。

---

## 1. 与其他库的根本差异

六套样式库共享**同一批组件**（`@timeless/ui-primitive` 的组合层 + `@timeless/ui-vm` 的状态机），
差异只在 token 与 CSS。作用域策略分两类：

| 维度 | shadcn / weui | bootstrap / material / fluent | **animal（本库）** |
|---|---|---|---|
| 主题挂载点 | `:root` / `.dark` | `[data-tt-style="<lib>"]` | **`[data-tt-style="animal"]`** |
| 全局污染 | 有（改 `*` / `body`） | 无 | **无（属性作用域隔离）** |
| 类名风格 | `tt-` / `weui-` 前缀 | 原生类名 / `m3-` / `fl-` | **`animal-` 前缀 BEM** |
| 多库共存 | 需避免互相冲突 | 安全 | **安全（见第 5 节）** |
| 暗色主题 | 有 | 有 | **无（上游未提供，见第 4 节）** |
| 第一层 token 名 | 自有 | `--bs-*` / `--md-sys-*` / `--colorNeutral*` | **`--animal-*`（逐字照抄上游）** |

**一句话**：animal 库用 animal-island-ui 的**设计语义**（薄荷青品牌色、暖棕文字、
羊皮纸底、2px 描边、胶囊圆角、primary 按钮的堆叠立体阴影、永不用蓝的黄色焦点环），
类名是自己的一套 `animal-` 前缀 BEM，隔离靠 `<html data-tt-style="animal">` 这一个属性完成。

与另两套作用域库的两个关键差异：

1. **第一层 token 名是上游公开契约**。bootstrap 的 `--bs-*` 是 Bootstrap 自己的名字，
   fluent 的 `--colorNeutral*` 是 Fluent 的名字；而 animal 的 `--animal-*` —— 尽管
   animal-island-ui 并未像前两者那样把它当作稳定的公开 API —— 本库仍然**逐字照抄**
   （含上游把 `--animal-text-color-muted` 错映射成与 `--animal-text-color` 同值这种瑕疵），
   理由是「上游用户已经在用 `--animal-*.xxx` 覆盖样式」，改名会让他们的覆盖写法静默失效。
2. **本库多一层「风格专有别名」**。这一风格最有辨识度的部分（立体阴影三色、
   黄色焦点、胶囊圆角、岛屿色板）在通用别名（`--primary` / `--border`）里表达不了，
   因此在通用别名之外额外暴露 `--shadow-btn` / `--shadow-input` / `--shadow-switch` /
    `--focus-yellow` / `--palette-*` 等（见 3.2）。

---

## 2. Token 分层模型

```
① tokens.css   ── 上游原始 token（--animal-*），亮色一套（无暗色）
② alias.css    ── Timeless 语义别名（--primary / --background / --border / --shadow-btn …）
③ components/*.css ── 组件样式，只读第 ② 层
```

### ① 上游原始层 — `src/style/tokens.css`

变量名照抄上游 `--animal-*`，值来自编译期 `variables.less` 与产物 `themes/default.less`。
全部挂在 `[data-tt-style="animal"]` 之下（而不是 `:root`）。

组件代码**不读这一层**。升级上游 token 时只动这个文件。

### ② Timeless 语义别名层 — `src/style/alias.css`

组件代码只读这一层。这一层的存在保证了四套作用域库的模块代码**形状完全一致** ——
同一个 `button.ts` 里 `classNames(["animal-btn", ...])` 的写法，在 fluent 里换成
`classNames(["fl-btn", ...])` 即可，无需理解动物岛的暖棕/薄荷色阶。

别名表**前半部分与 bootstrap / material / fluent 同名同义**（`--primary` / `--background` /
`--border` / `--radius` / `--font-size` / `--control-height` …），animal 的视觉专有语义
（`--shadow-btn` / `--focus-yellow` / `--palette-*` / `--tile-radius` / `--input-bg-rest` …）
作为**扩展字段**追加在后半部分。

### ③ 组件样式层 — `src/style/components/*.css`

每个组件一个文件，全部以 `[data-tt-style="animal"]` 开头。允许在本文件内定义
**组件级局部 token**（如 `--btn-*` / `--card-*`），但必须有合理默认值。

---

## 3. 完整 Token 清单

### 3.1 上游原始 token（`tokens.css`）

**A. 照抄上游产物 `themes/default.less`（48 个）**

| 分组 | 变量 | 亮色值 |
|---|---|---|
| 品牌 | `--animal-primary-color` | `#19c8b9` |
| | `--animal-primary-color-hover` | `#3dd4c6` |
| | `--animal-primary-color-active` | `#50b9ab` |
| | `--animal-primary-color-bg` | `#e6f9f6` |
| 成功 | `--animal-success-color` | `#6fba2c` |
| | `--animal-success-color-hover` / `-active` | `#85cc45` / `#5a9e1e` |
| 警告 | `--animal-warning-color` | `#f5c31c` |
| | `--animal-warning-color-hover` / `-active` | `#f7d04a` / `#dba90e` |
| 错误 | `--animal-error-color` | `#e05a5a` |
| | `--animal-error-color-hover` / `-active` | `#e87878` / `#c94444` |
| 文字 | `--animal-text-color` | `#794f27` |
| | `--animal-text-color-secondary` | `#9f927d` |
| | `--animal-text-color-muted` | `#794f27` ⚠️ 见下方「上游瑕疵」 |
| | `--animal-text-color-disabled` | `#c4b89e` |
| 描边 | `--animal-border-color` | `#dcd8d1` |
| | `--animal-border-color-hover` | `#827157` |
| | `--animal-border-color-light` | `#e8e2d6` |
| 背景 | `--animal-bg-color` | `#f8f8f0` |
| | `--animal-bg-color-secondary` | `#f0e8d8` |
| | `--animal-bg-color-disabled` | `#f0ece2` |
| 遮罩 | `--animal-mask-bg` | `rgba(0,0,0,.35)` |
| 字体 | `--animal-font-family` | `Nunito, "Noto Sans SC", …` ⚠️ 见下方「有意偏离」 |
| | `--animal-font-size-sm` / `-base` / `-lg` | `12 / 14 / 16px` |
| | `--animal-line-height-base` | `1.5715` |
| 间距 | `--animal-spacing-xs/sm/md/lg/xl` | `4 / 8 / 12 / 16 / 24px` |
| 圆角 | `--animal-border-radius-sm` / `-base` / `-lg` | `16 / 18 / 24px` |
| 描边宽 | `--animal-border-width` | `2px` |
| 阴影 | `--animal-shadow-sm` | `0 2px 4px 0 rgba(61,52,40,.06)` |
| | `--animal-shadow-base` | `0 3px 10px 0 rgba(61,52,40,.1)` |
| | `--animal-shadow-lg` | `0 8px 24px 0 rgba(61,52,40,.14)` |
| 动效 | `--animal-motion-duration-fast` / `-base` / `-slow` | `0.15s / 0.25s / 0.35s` |
| | `--animal-motion-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 尺寸 | `--animal-height-sm` / `-base` / `-lg` | `32 / 40 / 48px` |

**B. 补上游「独立实现契约」里声明、但打包产物漏掉的 token（11 个）**

来源：上游 `docs/design-system/css-variables.md`。补它们的理由是它们承载本风格
最有辨识度的部分（立体阴影厚度色、黄色焦点、胶囊圆角）——不补就只能把 `#bdaea0`
这类值硬编码进组件 CSS，无法被应用覆盖。

| 变量 | 值 | 说明 |
|---|---|---|
| `--animal-radius-pill` | `50px` | 按钮 / 输入恒为胶囊 |
| `--animal-shadow-btn` | `#bdaea0` | primary 按钮堆叠阴影的「厚度色」 |
| `--animal-shadow-input` | `#d4c9b4` | 输入框堆叠阴影的厚度色 |
| `--animal-shadow-switch` | `#5a9e1e` | switch 轨道内阴影的厚度色 |
| `--animal-focus-yellow` | `#f5c31c` | 焦点黄（永不用蓝） |
| `--animal-focus-yellow-d` | `#e0b800` | 焦点黄·深 |
| `--animal-text-body` | `#725d42` | 正文（比 `--animal-text-color` 略淡） |
| `--animal-bg-content` | `rgb(247,243,223)` | 内容区羊皮纸底（Card / 浮层表面） |
| `--animal-bg-input` | `#fffbe7` | 输入框 hover / focus 底 |
| `--animal-bg-input-disabled` | `#ece8dc` | 输入框禁用底 |
| `--animal-border-input` | `#c4b89e` | 输入框描边（比卡片描边深） |

> ⚠️ **只补产物没有的**。与产物同名但取值不同的那批（`--animal-border` / `--animal-primary` /
> `--animal-text` / `--animal-bg` / `--animal-success` / `--animal-warning` / `--animal-error` /
> `--animal-radius` / `--animal-ease` / `--animal-duration*` / `--animal-text-muted` / …）
> 一律**不定义**，以 `-color` / `-base` 后缀的产物名称为准。

### 3.2 Timeless 语义别名（`alias.css`）

**通用别名（与另三套作用域库同名）**

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--background` / `--foreground` | `--animal-bg-color` / `--animal-text-color` | 页面底色与正文 |
| `--card` / `--card-foreground` | `--animal-bg-content` / `--animal-text-body` | Card 表面 |
| `--popover` / `--popover-foreground` | `--animal-bg-content` / `--animal-text-body` | 浮层表面 |
| `--primary` / `--primary-foreground` | `--animal-primary-color` / `#fff` | 主操作（薄荷青） |
| `--primary-hover` / `--primary-pressed` | `--animal-primary-color-hover` / `-active` | 主操作态 |
| `--secondary` / `--secondary-foreground` | `--animal-bg-color-secondary` / `--animal-text-color` | 次操作 |
| `--destructive`(+`-subtle`/`-foreground`) | `--animal-error-color` / `color-mix(…12%, bg)` / `-active` | 危险操作 |
| `--success` / `--warning` / `--info`(+`-subtle`/`-foreground`) | `--animal-{success,warning}-color` / `--animal-primary-color` | 语义状态 |
| `--muted` / `--muted-foreground` | `--animal-bg-color-secondary` / `--animal-text-color-secondary` | 弱化底色/文字 |
| `--accent` / `--accent-foreground` | `--animal-primary-color-bg` / `--animal-primary-color` | 强调底色 |
| `--border` / `--border-subtle` / `--border-strong` | `--animal-border-color{,-light,-hover}` | 描边三档 |
| `--input` / `--ring` / `--ring-width` | `--animal-border-input` / `--animal-focus-yellow` / `2px` | 输入框描边 / 焦点环 |
| `--border-width` / `--border-width-input` / `--border-width-input-lg` | `2px` / `2.5px` / `3px` | 描边宽度分档 |
| `--surface-1` / `-2` / `-3` / `--surface-disabled` | `--animal-bg-color{,-secondary}` / `--animal-bg-content` / `--animal-bg-color-disabled` | 表面层级 |
| `--radius` / `-sm` / `-md` / `-lg` / `-pill` | `--animal-border-radius-{base,sm,base,lg}` / `--animal-radius-pill` | 圆角（按钮输入用 pill） |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | `--animal-shadow-{sm,base,lg}` | 柔和高度阴影 |
| `--font-sans` / `--font-mono` | `--animal-font-family` / 系统等宽栈 | 字体栈 |
| `--font-size` / `-sm` / `-lg` | `--animal-font-size-{base,sm,lg}` | 字号（14/12/16px） |
| `--line-height` | `--animal-line-height-base` | 行高 |
| `--spacer` / `-xs` / `-sm` / `-lg` / `-xl` | `--animal-spacing-{md,xs,sm,lg,xl}` | 间距 |
| `--control-height` / `-sm` / `-lg` | `--animal-height-{base,sm,lg}` | 控件高度（40/32/48px） |
| `--foreground-disabled` / `--disabled-opacity` | `--animal-text-color-disabled` / `.5` | 禁用态 |
| `--easing-standard` / `--duration-fast` / `-normal` / `-slow` | `--animal-motion-*` | 动效 |

**animal 专有别名（扩展字段）**

| 别名 | 映射到 | 用途 |
|---|---|---|
| `--shadow-btn` | `--animal-shadow-btn` | primary 按钮堆叠阴影厚度色 |
| `--shadow-input` | `--animal-shadow-input` | 输入框堆叠阴影厚度色 |
| `--shadow-switch` | `--animal-shadow-switch` | switch 轨道内阴影厚度色 |
| `--focus-yellow` / `--focus-yellow-d` | `--animal-focus-yellow{,-d}` | 焦点黄（`:focus-visible` 专用） |
| `--pill-radius` | `--animal-radius-pill` | 胶囊别名（与 `--radius-pill` 同源；number-input 等读它） |
| `--btn-primary-bg` / `-fg` / `-shadow` | `--animal-bg-color` / `--animal-text-color` / `--animal-shadow-btn` | 上游 `.btn-primary` 的奶油纸底 + 堆叠阴影 |
| `--input-bg` / `-bg-disabled` / `-bg-rest` | `--animal-bg-input` / `-disabled` / `rgb(250,248,243)` | 输入框底色三态 |
| `--tile-radius` / `--tile-dashed-*` / `--tile-hover-border` | `20px` / `#e8dcc8` / `#d4c4a8` / `rgb(250,248,242)` | Card 专有形状 |
| `--pattern-dot` / `-dot-soft` | `rgba(196,184,158,.15)` / `(.1)` | 虚线卡片的圆点纹理 |
| `--palette-*` / `--palette-*-fg` | 上游 Card `color` prop 的 13 组取值 | 岛屿色板（pink / purple / blue / … / warm-peach-pink） |
| `--tree-row-height` | `40px` | 树行高（见第 8 节） |

> 组件样式**必须**只引用本表。若发现组件引用了表外的别名，属于规范缺口，应补进本表。

### 3.3 组件级局部 token

定义在各自的 `components/*.css` 里，以组件类为作用域，例如：

- Button：`--btn-padding-x` / `--btn-radius` / `--btn-shadow` / `--btn-hover-shadow` /
  `--btn-active-shadow` / `--btn-hover-lift` / `--btn-active-lift` / `--btn-height` …
  （每个 variant 只改这组局部 token，公共规则读它们 —— 所以「立体阴影只给 primary」
  在实现上就是只有 `.animal-btn--primary` 声明了非柔和的 `--btn-shadow`）
- Card：`--card-bg` / `--card-fg`（+ 引用别名层的 `--tile-radius` / `--tile-dashed-*`）

它们的作用域是**声明块所在的选择器**，不是 token 层，因此可以安全地按状态改写。

### 3.4 与上游的两处分歧（逐条交代，不静默选择）

| # | 分歧点 | 上游两处说法 | 本库取法 | 理由 |
|---|---|---|---|---|
| 1 | `--animal-text-color-muted` | 产物 `default.less` 把它映射到 `@text-color`（与 `--animal-text-color` **同值**）；`docs/design-system/design-tokens.md` 说它是另一个棕色 | **照抄产物**（同值 `#794f27`） | 「以 `variables.less` + 产物为准」的裁决；这是上游自己的 bug，本库如实复刻并在注释里标注 |
| 2 | `@focus-yellow` | 契约文档写 `#ffcc00`；编译期 `variables.less` 是 `@focus-yellow: @warning-color` = `#f5c31c` | 取 **`#f5c31c`** | 同上，编译期来源优先于文档 |
| 3 | `@border-color` | 契约文档 `#dcd8d1` vs `design-tokens.md` 的 `#9f927d` | 取 **`#dcd8d1`** | 同上 |

**一处有意偏离**：上游 `@font-family` 末尾带 `!important`。映射进自定义属性时
`!important` 无意义，且会让 token 无法被应用覆盖，故本库**去掉**。这是唯一的字段级偏离
（见 `tokens.css` 注释）。

---

## 4. 暗色主题：本库没有

> **上游 animal-island-ui 未提供暗色主题。** 其 `src/styles/variables.less` 与
> `src/styles/themes/default.less` **都只有一套亮色 token，没有任何暗色块**
> （对比 fluent 有 `webLightTheme` / `webDarkTheme` 两套，material 有 light/dark 两套）。

因此本库：

- `tokens.css` **不写**暗色分支；
- `alias.css` 只有一套亮色值；
- 组件 CSS 里**没有**任何 `.dark` / `[data-theme="dark"]` 选择器（第四节的四写法在本库不适用）。

**行为**：应用调用 `app.setTheme("dark")` 时，`<html>` 上会出现 `.dark` / `data-theme="dark"`，
但 animal 子树**保持亮色外观** —— 这是**预期行为**，不是 bug。

示例应用 `apps/web-animal` 把这个约束显式化：顶栏的暗色按钮**刻意保留但置为 disabled**，
文案是「暗色（上游未提供）」，页面与设计规范页均有说明。直接删掉按钮会让人误以为「漏做了」。

若将来上游补上暗色，落地方式与另三套库一致：在 `tokens.css` 里按四写法补一组覆盖块即可，
组件 CSS 一行都不用改（因为它们只读第二层别名）。

---

## 5. 作用域与共存

### 5.1 核心约定

> **本库输出的每一条 CSS 规则、每一个 token，都必须处于 `[data-tt-style="animal"]`
> 之下。** 没有例外。

具体禁令：

- 不得输出 `html` / `body` / `#root` 规则；
- 不得输出无作用域的 `*` 规则（`*::before` 也必须带 `[data-tt-style="animal"] ` 前缀）；
- 不得输出裸 `@keyframes`（用 `animal-` 前缀命名，如 `animal-spin` / `animal-input-spin` / `animal-flow-dash`）。
- `@font-face` 是例外：它是顶级 at-rule，无选择器、无法作用域化，按「命名隔离」处理
  （字体族名 `Nunito` / `Noto Sans SC` 是上游公开契约，保持不变）。

`base.css` 里的重置写在 `[data-tt-style="animal"] *` 之下，只在作用域内生效。

构建产物 `dist/timeless.animal.css` 可用脚本校验：

```bash
pnpm check:scope
# bootstrap: 638 blocks, unscoped = 0
# material:  718 blocks, unscoped = 0
# fluent:    700 blocks, unscoped = 0
# animal:    897 blocks, unscoped = 0
```

`scripts/check-style-scope.mjs` 会跳过所有以 `@` 开头的顶层块（`@font-face` / `@keyframes` /
`@media` 的外层），只检查深度 1 的规则块。

### 5.2 多库同页

因为隔离靠属性而非类名前缀，同一页面可以同时加载 `timeless.animal.css` 与
`timeless.bootstrap.css` / `timeless.material.css` / `timeless.fluent.css`：

```html
<html data-tt-style="animal">
  …animal 组件（class 带 animal- 前缀）…
  <div data-tt-style="bootstrap">   <!-- 子树切到 bootstrap -->
    …bootstrap 组件（class 是 .btn / .form-control）…
  </div>
</html>
```

已实测：四个库的 CSS 同时加载后，animal 子树的计算样式**逐字节不变**，
bootstrap / material / fluent 子树各自拿到自己的取值（蓝 `#0d6efd` / 紫 `#6750a4` / `#0f6cbd`），
互不干扰。`scripts/build.js` 的 `LOAD_PROFILES.style_libs` 就把这四套 UMD 列在一起，
作为构建期的重复依赖检查组合。

> 注意：切换 `data-tt-style` 只切换**本库自己的**设计与 token。shadcn / weui 的 token 挂在
> `:root`，它们不读 `data-tt-style` —— 那两套是「全局库」，bootstrap / material / fluent / animal
> 是「作用域库」。这一区别见 `THEME_PACKAGE_GUIDE.md` 第 2 节。

### 5.3 与真实 animal-island-ui 共存

本库类名（`.animal-btn` / `.animal-control` …）虽然带 `animal-` 前缀，但**不是**上游的
类名（上游用 Less Modules 编译出的局部类名）。因此：

- 不存在类名冲突，两者可以同时出现在一个文档里而不互相覆盖；
- 但视觉上会不一致（真实 animal-island-ui 读自己的 Less 变量图标，不读本库的 CSS 变量）；
- 正确用法：**不要**在同一个子树里混用两者，要么整体用本库，要么整体用上游。

---

## 6. 应用内覆盖 Token 的三种方式

### 方式 A：覆盖上游层（换品牌色，保留动物岛结构）

```html
<html data-tt-style="animal">
  <style>
    [data-tt-style="animal"] {
      --animal-primary-color: #7c3aed;
      --animal-primary-color-hover: #8b5cf6;
      --animal-primary-color-active: #6d28d9;
    }
  </style>
</html>
```

> 这一写法**正是逐字照抄 `--animal-*` 名的回报**：上游用户已有的覆盖写法在本库继续生效。

### 方式 B：覆盖别名层（只改某类语义，不动上游）

```html
<style>
  [data-tt-style="animal"] { --radius: 12px; --radius-pill: 12px; --control-height: 44px; }
</style>
```

### 方式 C：局部子树换肤

```html
<div data-tt-style="animal" style="--primary: #d946ef; --shadow-btn: #b06fd6">
  …该子树内的 primary 按钮变品红、堆叠阴影跟着换色…
</div>
```

> 三种方式的**特异性都低于**组件样式里「声明块内改写局部 token」的写法，所以
> 组件自身的 hover / active 覆盖不会被应用层意外压掉。

### 方式 D：规范页实时调参（预览孤岛）

`apps/web-animal` 的**设计规范页**（左菜单「设计规范」→ `/home/design`）把方式 B / C
做成了可视化编辑器：左侧是从真实 token 读出来的规范表 + 控件，右侧一块预览孤岛。
控件写的是孤岛元素上的**内联 CSS 变量**，所以只影响孤岛，画廊外壳不受影响，可一键重置。
机制与注意事项见 `THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=animal`（→ <http://127.0.0.1:3404>，见指南 §8.4）。

本库实际可调的 token（页面按「该 token 在 `<html>` 上是否声明」自动筛选，共 32 个）：

| 分组 | token |
|---|---|
| 色板 | `--primary` `--secondary` `--destructive` `--background` `--foreground` `--muted` `--muted-foreground` `--border` `--shadow-btn` `--shadow-input` `--shadow-switch` `--focus-yellow` |
| 圆角 | `--radius` `--radius-sm` `--radius-md` `--radius-lg` `--radius-pill` |
| 间距 | `--spacer` `--spacer-sm` `--spacer-lg` |
| 尺寸 | `--control-height` `--control-height-sm` `--control-height-lg` |
| 字阶 | `--font-size` `--line-height` |
| 阴影 | `--shadow` `--shadow-sm` `--shadow-lg` |
| 动效 | `--duration-fast` `--duration-normal` `--duration-slow` `--easing-standard` |

**本库不需要 `COMPANION_TOKENS`。** 组件按钮读的是 `--btn-primary-bg` 等 alias，
而 `--primary` 也有真实消费者（步骤条、slider、switch 的选中色），
所以改 `--primary` 是有意义的（对比 fluent 必须把 `--primary` 映射到 `--brand-fill` 才会生效）。
`COMPANION_TOKENS` 为空对象，仍保留该机制以备将来需要。

两条边界：

- 页面**不暴露第一层 `--animal-*`**，只暴露第二层语义别名。
- 组件样式里直接读第一层原始 token 的地方不随编辑器变化，这是设计如此。

---

## 7. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/animal.css` | 样式入口，`tokens → alias → base → fonts → components/*` |
| `src/style/tokens.css` | 上游 `--animal-*`（48 照抄 + 11 契约补，亮色一套） |
| `src/style/alias.css` | Timeless 语义别名（通用 + animal 专有） |
| `src/style/base.css` | 作用域内的基础/重置 |
| `src/style/fonts.css` | 两个 `@font-face`（Nunito / Noto Sans SC 可变字体） |
| `src/style/components/*.css` | 51 个组件样式（Tier 1/2/3 + tree + flow） |
| `src/modules/*.ts` | 54 个薄包装（51 组件 + menu-shared / popper-shared / select-shared） |
| `src/assets/fonts/*.woff2` | 内嵌字体子集（见第 9 节） |
| `src/index.ts` | 导出 + 动态 `import("./style/animal.css")` |
| `apps/web-animal` | 组件画廊 + 设计规范页示例应用 |

---

## 8. 状态与「暗色巡检」

51 个模块走同一套状态钩子，巡检口径：`disabled` 属性 / `[aria-invalid="true"]` /
`.is-invalid` / `.is-loading` / `:focus-visible` / `@media (prefers-reduced-motion: reduce)`。

| 状态 | 落点 | 覆盖 |
|---|---|---|
| 禁用 | `[disabled]` / `.is-disabled`，用 `--foreground-disabled` + `--surface-disabled` | 44 个样式文件 |
| 校验失败 | `[aria-invalid="true"]` / `.is-invalid`，描边与堆叠阴影转 `--destructive` | 18 个样式文件 |
| 加载 | `.is-loading`（按钮、搜索类）；占位符用 `skeleton.css` | button / search-select 等 |
| 键盘焦点 | `:focus-visible` 用 `var(--ring-width) solid var(--ring)`（**黄色**） | 43 个样式文件 |
| 动效降级 | `base.css` 一条作用域内的兜底 + 各组件块尾的 `@media (prefers-reduced-motion: reduce)` | 50 个样式文件 |

**焦点一律是黄色，永不用蓝色** —— 这是上游 design-tokens 的硬指标。组件里的
`:focus-visible` 全部引 `--ring`（= `--animal-focus-yellow`），没有任何一处用浏览器默认的蓝色 outline。

暗色巡检在本库**只需要确认「不生效」**：切暗色后 animal 子树保持亮色（见第 4 节）。

---

## 9. 内嵌字体

上游 `src/assets/fonts/` 里的 Noto Sans SC 是**未子集化的整包**（1.1MB/字重，
三档共 3.5MB）。本库改为「按本仓库用到的字符集子集化 + 可变字体」：

| 文件 | 大小 | 覆盖 |
|---|---|---|
| `animal-nunito.woff2` | 38 KB | Nunito，`wght 200–1000`（拉丁 + 标点） |
| `animal-noto.woff2` | 314 KB | Noto Sans SC，`wght 100–900`（933 个 CJK 表意字 + 拉丁 + 标点） |
| **合计** | **348 KB** | 预算 400 KB ✅ |

**为什么用可变字体**：上游用到的档位是 Nunito 500/700/900、Noto 400/500/700，
六份静态子集共 544 KB（超预算）。可变字体把同一批轮廓的 `gvar` 增量合并存放，
两份合计 348 KB，且 `font-weight: 600` 这类中间档位也能**真实渲染**
（静态方案下 600 会退到最近的 700 做合成加粗）。`@font-face` 里的
`font-weight: 200 1000` / `100 900` 就是声明取值范围。

**可复现命令**（一次性，不入仓库工具链；需要 `uvx` 与网络）：

```bash
LATIN="U+0000-00FF,U+0131,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2193,U+2212,U+2215,U+221A,U+2264-2265,U+FEFF,U+FFFD"

# 1) 取源（OFL 授权，Google Fonts 变量字体）
curl -o '/tmp/Nunito[wght].ttf'     'https://raw.githubusercontent.com/google/fonts/main/ofl/nunito/Nunito%5Bwght%5D.ttf'
curl -o '/tmp/NotoSansSC[wght].ttf' 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf'

# 2) 扫出本仓库用到的 CJK 字符并集（含全角标点），写成 /tmp/animal-cjk.txt
node -e '
const fs=require("fs"),path=require("path");
const dirs=["packages/animal","apps/web-animal"];
const chars=new Set();
const walk=(d)=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);
  if(f.isDirectory()){ if(!/node_modules|dist|\.git/.test(f.name)) walk(p); }
  else if(/\.(js|ts|css|html|json|md)$/.test(f.name)){ for(const c of fs.readFileSync(p,"utf8")) if(c.charCodeAt(0)>0x2000) chars.add(c); }}};
dirs.forEach(walk);
fs.writeFileSync("/tmp/animal-cjk.txt",[...chars].sort().join(""));
console.log("chars:",chars.size);
'

# 3) 子集化 + 转 woff2（**不**实例化字重，保留 wght 轴）
uvx --with brotli --from fonttools pyftsubset '/tmp/Nunito[wght].ttf' \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --unicodes="$LATIN" --output-file=packages/animal/src/assets/fonts/animal-nunito.woff2

uvx --with brotli --from fonttools pyftsubset '/tmp/NotoSansSC[wght].ttf' \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --unicodes="$LATIN" --text-file=/tmp/animal-cjk.txt \
  --output-file=packages/animal/src/assets/fonts/animal-noto.woff2
```

字体旁放 `OFL.txt`（Nunito 与 Noto Sans SC 均为 SIL Open Font License 1.1）。

**大字表外怎么办**：未收录的生僻字会沿字体栈回退到系统字体
（`-apple-system` → `PingFang SC` → `Hiragino Sans GB` → `Microsoft YaHei` → `sans-serif`），
不会出现豆腐块。若项目用字超出本仓库，按上面第 2 步重扫即可。

**jsDelivr 发布注意**：字体是**独立文件**、与 CSS 平铺在 dist 根，CSS 用
`url("./animal-*.woff2")` 相对引用。vite 的 lib 模式默认会把资源**内联成 base64**
（`shouldInline()` 里 `if (environment.config.build.lib) return true;`，早于
`assetsInlineLimit` 判断）—— `fonts.css` 里每个 url 的 `?no-inline` 查询串就是用来
关掉内联的；`vite.config.ts` 的 `experimental.renderBuiltUrl` 则保证 url 不被重写成
绝对路径 `/animal-*.woff2`（那会导致从子路径加载时取不到字体）。
`scripts/dev.js` 的 `keepFiles` 白名单里也必须列这两个文件名，否则每次
`copyArtifacts` 都会把它们从 `public/timeless/<version>/` 删掉 —— 症状是
「本地打开没字体、重新构建又好一阵」。

---

## 10. 与其他库的关系

| | 关系 |
|---|---|
| `@timeless/timeless` | 唯一依赖。提供 `ui`（primitive）与 `vm`（core）。 |
| `@timeless/bootstrap` | 兄弟库，同一批组件。bootstrap 复用 Bootstrap 原生类名，本库用 `animal-` BEM。 |
| `@timeless/material` | 兄弟库。material 用 `m3-` 前缀 + Material 3 语义色。 |
| `@timeless/fluent` | 兄弟库。fluent 用 `fl-` 前缀 + Fluent 2 的中性表面层级。 |
| `@timeless/shadcn` / `@timeless/weui` | 兄弟库。那两套是全局（`:root`），本库是属性作用域。 |

---

## 11. 组件覆盖范围

本库按标准组件清单落地，分三档：

- **Tier 1（24）**：button、input、textarea、label、checkbox、checkbox-group、radio、
  switch、toggle、slider、select、number-input、progress、avatar、badge、separator、
  skeleton、card、alert、kbd、link、aspect-ratio、scroll-area、field。
- **Tier 2（17）**：dialog、sheet、popover、popconfirm、tooltip、dropdown-menu、
  context-menu、menu、tabs、accordion、steps、toast、table、form、search-select、
  file-picker、resizable-panels。附带 3 个非组件辅助模块：`menu-shared`（菜单项事件
  补丁 + 类名表）、`popper-shared`（浮层箭头定位）、`select-shared`（下拉选项渲染）。
- **Tier 3（8）**：date-picker、date-range-picker、time-picker、date-time-picker、
  cascader、scroll-view、affix、waterfall。date-picker / time-picker 额外导出可复用的
  组合件（`DateCalendarPanel`、`TimeColumns`、`TimePreview`），date-time-picker 直接复用，
  不重复实现日历与三列滚动。

另有两个结构复杂组件（逻辑在共享层，本库只出薄包装 + CSS）：

- **tree**：`vm.TreeCore` + `ui.TreePrimitive`。虚拟滚动、展开/折叠、指针拖拽三区落点、
  悬停自动展开、checkbox 父子联动与半选。行高落在 `--tree-row-height`（**40px**）——
  刻意不吃 `--control-height`（40px 恰好同值，但语义不同）：`ListViewV2` 的 `itemHeight`
  是渲染器入参，必须与 CSS 行高数值一致，所以给它一个专有 token；半选用 `.is-indeterminate`。
- **flow**：`vm.FlowCanvasModel` / `FlowNodeModel` / `FlowEdgeModel`。节点拖拽、滚轮缩放、
  空白平移、边路径计算全在 core；本库只画 DOM，浮层是 2px `--border` 描边 + `--shadow-sm`，
  流动边用 `.is-animated` + `@keyframes animal-flow-dash`。

合计 **51** 个组件，覆盖率 100%。

**不在范围**：`llm-provider-form`、`history-panel`、`menu-shared`（辅助，非组件）、
`sonner`（由 `toast` 覆盖）。

新增组件时必须遵守的骨架与状态要求见 `THEME_PACKAGE_GUIDE.md` 第 6 节。

### animal-island-ui 视觉特征落点

| 特征 | 落地位置 |
|---|---|
| 2px 描边（输入类 2.5px，大号 3px） | `--border-width` / `--border-width-input` / `--border-width-input-lg` |
| 胶囊按钮与输入 | `--radius-pill`（50px）→ Button / Input / Select / NumberInput / SearchSelect |
| 圆角阶梯 16/18/24px | `--radius-sm` / `--radius` / `--radius-lg`；Card 用 `--tile-radius`(20px) |
| **立体阴影只给 primary** | Button `.animal-btn--primary`：`0 5px 0 0 var(--shadow-btn)`，hover `0 6px`，active `0 1px`；危险实心版 `.animal-btn--danger.animal-btn--primary` 同形，厚度色换 `--destructive-subtle-foreground` |
| 其余按钮用柔和高度阴影 | `default` / `dashed` / `text` / `link` / `ghost` / `success` / `warning` / `info`：`--shadow-sm` / `--shadow` |
| 输入框堆叠内阴影 | `.animal-control`：`box-shadow: 0 3px 0 0 var(--shadow-input)`，hover 加深到 `--input`，active 压到 `0 1px` |
| Card 默认**无** box-shadow | 层次来自 2px 描边 + 羊皮纸底，不是海拔 |
| Switch 只轨道有内阴影 | `.animal-switch`（轨道即根元素）OFF：`inset 0 2px 4px` 暖棕 15%；ON：`inset 0 2px 4px color-mix(in srgb, var(--shadow-switch) 24%, transparent)`。滑块 `.animal-switch__thumb` 无外阴影 |
| hover 上浮 / active 下压 | 控件 `translateY(-1px)`（卡片 `-2px`）→ `translateY(2px)`；`--duration-normal` + `--easing-standard` |
| 焦点**永远是黄色** | `:focus-visible` → `var(--ring-width) solid var(--ring)`（`--focus-yellow`）；全库无蓝色 outline |
| 浮层用羊皮纸底 | Dialog / Sheet / Popover / Menu 表面：`--popover` 底 + 2px `--border` 描边 + `--shadow-lg`（Tooltip 用房 `--shadow`） |
| 遮罩 | Dialog / Sheet / Drawer：`--animal-mask-bg` |
| 表头弱化表面 | Table `thead th`：`--secondary` 米色带 + `--muted-foreground` 文字 |
| 岛屿色板 | Card `color` prop → `.animal-card--app-pink` 等 13 组 `--palette-*` |
| 拖拽/错误态 | FileDropZone：虚线 `--tile-dashed-border` → 拖拽 `--accent` → 无效 `--destructive` |
| 动效降级 | 每个组件块尾附 `@media (prefers-reduced-motion: reduce)` 关闭过渡/动画 |
