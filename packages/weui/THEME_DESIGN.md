# `@timeless/weui` 设计规范（Design Token + CSS Variable）

本文件描述 `@timeless/weui` 的**视觉层**：`--weui-*` 变量体系、四套预设主题、
Less mixin API、组件级 token，以及「变量缺口」清单。

组件**行为**不在这里定义。`@timeless/weui` 与 `@timeless/shadcn` 是同一批
`@timeless/ui-primitive`（无样式 DOM 组合层）+ `@timeless/inner-vm`（状态机）之上的
两套「组合包装 + 样式」。骨架写法见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md)。

WeUI 原始设计规范见腾讯 WeUI 官方仓库；本文件只描述本仓库实际**用到**的那一部分。

---

## 1. 与 shadcn 的根本差异

| | `@timeless/shadcn` | `@timeless/weui` |
|---|---|---|
| 样式语言 | Tailwind v4（构建期编译） | **Less**（构建期编译） |
| 组件写法 | 工具类字符串 | **内联 `style` 对象** + `var(--weui-*)` |
| Token 前缀 | `--primary` / `--border` | `--weui-BRAND` / `--weui-FG-0` |
| 主题挂载点 | `<html class="dark">` / `[data-theme]` | `body` / `.wx-root` 上的 `data-weui-*` |
| 预设主题 | 2（light / dark） | **4**（light / dark / care-light / care-dark） |
| 作用域 | 全局 | 全局（`body` / `.wx-root`） |

WeUI 的组件模块里**没有任何 class 字符串**，视觉全部来自内联 style 引用 CSS 变量。
例如 `src/modules/button.ts:44`：

```ts
const BASE_STYLE = {
  "border-radius": "var(--weui-BTN-RADIUS)",   // ← 见第 5 节：此变量未定义
  "font-size": "var(--weui-FONT-SIZE)",        // ← 见第 5 节：此变量未定义
  transition: "opacity .3s",
};
```

这是 WeUI 路线的**优点**：改一个变量即可换肤，无需重新编译 CSS。
缺点见第 5 节。

---

## 2. `--weui-*` 命名规则

### 2.1 三段式命名

```
--weui-<FAMILY>[-<SERIES>]-<TONE>
        BRAND           BG         100
        RED            (无)        80
        FG                        170
        BG
```

- `<FAMILY>`：颜色族（`BLUE` / `BRAND` / `FG` / `BG` / `SEPARATOR` / `MATERIAL` …）。
- `<SERIES>`：同族内的用途变体，目前只有 `-BG` 一种，表示「用于彩色背景之上」。
- `<TONE>`：色调档位数字，语义见 2.2。

### 2.2 数字后缀语义

色调数字**不是** 0–100 明度百分比，而是「**相对基准色 100 的偏移档位**」：

| 后缀 | 亮色模式下的含义 | 典型用途 |
|---|---|---|
| `-80` | 比 100 **更深**（亮色）/ **更浅**（暗色） | 按压态、强调态 |
| `-90` | 比 100 略深 / 略浅 | 悬停态 |
| `-100` | **基准色** | 正常态 |
| `-120` | 比 100 更浅 / 更深 | 次级强调 |
| `-170` | 最浅 / 最深 | 极弱化的底、装饰 |

**关键**：数字方向在亮/暗之间**翻转**，但**角色保持不变**。

```
             亮色              暗色
BLUE-80   #0c8bcc  (更深)   #3fbeff  (更浅)
BLUE-100  #10aeff  (基准)   #10aeff  (基准)
BLUE-170  #b7e6ff  (最浅)   #04344d  (最深)
```

所以组件里永远写 `var(--weui-BLUE-80)` 表示「按压态」，而不用关心当前是亮是暗。
**这是 WeUI token 体系的核心约定，新增 token 必须沿用。**

`-BG` 系列同理，但档位集合略窄（`-90` / `-100` / `-110` / `-130`）：
`BLUE-BG-100` 是基准，`-90` 更深，`-110` / `-130` 更浅。用于渐变彩色背景。

### 2.3 无数字后缀的族

以下族**不带**色调数字，是单一语义槽位：

| 族 | 成员 |
|---|---|
| `BG` | `BG-0` … `BG-5`（层级底：0 最外、2/5 最内） |
| `FG` | `FG-0` … `FG-4`、`FG-0_5`、`FG-HALF`、`FG-5` |
| `GLYPH` | `GLYPH-0/1/2`、`GLYPH-WHITE-0/1/2/3` |
| `SEPARATOR` | `SEPARATOR-0`、`SEPARATOR-1` |
| `STATELAYER` | `HOVERED`、`PRESSED`、`PRESSEDSTRENGTHENED` |
| `MATERIAL` | `THIN`/`REGULAR`/`THICK`/`TOOLBAR`/`NAVIGATIONBAR`/`ATTACHMENTCOLUMN` |
| `OVERLAY` | `OVERLAY`、`OVERLAY-WHITE` |
| `TAG-*` | `TAG-TEXT-{RED,ORANGE,GREEN,BLUE,BLACK}`、`TAG-BACKGROUND-*` |
| 单色别名 | `RED` / `ORANGE` / `ORANGERED` / `YELLOW` / `GREEN` / `LIGHTGREEN` / `TEXTGREEN` / `BRAND` / `BLUE` / `INDIGO` / `PURPLE` / `LINK` / `WHITE` / `BG` / `FG` |

单色别名是 `-100` 档的简写：`--weui-BRAND` === `--weui-BRAND-100`（值相同但独立声明）。

---

## 3. 四套预设与派发选择器

### 3.1 预设

| 预设 | 定义函数 | 文件 |
|---|---|---|
| light | `.varsLight()` | `style/base/theme/vars/light.less` |
| dark | `.varsDark()` | `style/base/theme/vars/dark.less` |
| care-light | `.varsCareLight()` | `style/base/theme/vars/care-light.less` |
| care-dark | `.varsCareDark()` | `style/base/theme/vars/care-dark.less` |

`care` 是 WeUI 的**关怀模式**（无障碍高对比）：文字更实（`--weui-FG-0` 从
`rgba(0,0,0,0.9)` 提升到纯 `#000`）、品牌色更暗（`--weui-BRAND` 从 `#07c160` 降到 `#018942`）以
提高对比度。

### 3.2 派发规则（`style/base/theme/index.less`）

按文件中的书写顺序：

| # | 选择器 | 生效预设 |
|---|---|---|
| 1 | `body`、`.wx-root` | light |
| 2 | `@media (prefers-color-scheme: dark)` 下的 `body:not([data-weui-theme='light'])`、`.wx-root:not(…)` | dark |
| 3 | `body[data-weui-theme='dark']`、`.wx-root[data-weui-theme='dark']` | dark |
| 4 | `body[data-weui-mode='care']`、`.wx-root[data-weui-mode='care']` | care-light |
| 5 | `@media (prefers-color-scheme: dark)` 下的 `body[data-weui-mode='care']:not([data-weui-theme='light'])` | care-dark |
| 6 | `body[data-weui-mode='care'][data-weui-theme='dark']` | care-dark |

### 3.3 优先级表（同声明块的 CSS 特异性）

| 规则 | 特异性 | 说明 |
|---|---|---|
| 6 `[mode=care][theme=dark]` | `0,2,1` | **最高**，照顾模式+暗色 |
| 5 `[mode=care]:not([theme=light])` | `0,1,2` | 照顾模式 + 系统暗色 |
| 3 `[theme=dark]` | `0,1,1` | 显式暗色 |
| 4 `[mode=care]` | `0,1,1` | 显式照顾模式（与 3 同级，靠**后写**胜出） |
| 2 `body:not([theme=light])` | `0,0,2` | 跟随系统暗色 |
| 1 `body` | `0,0,1` | 兜底亮色 |

由此推出的行为矩阵（`care` 列在 `dark` 行下由规则 5/6 决定，符合直觉）：

| `data-weui-mode` | `data-weui-theme` | 系统暗色 | 实际生效 |
|---|---|---|---|
| — | — | 否 | light |
| — | — | 是 | dark |
| — | `light` | 是 | **light**（`:not()` 排除） |
| — | `dark` | 否 | dark |
| `care` | — | 否 | care-light |
| `care` | — | 是 | care-dark |
| `care` | `light` | 是 | **care-light** |
| `care` | `dark` | — | care-dark |

**注意 4 vs 3 的同级关系**：`body[data-weui-mode='care'][data-weui-theme='dark']`
同时命中规则 3（0,1,1）与规则 4（0,1,1），靠规则 4 写在后面才短暂生效；
最终由规则 6（0,2,1）覆盖为 care-dark。**如果调整 index.less 里的顺序，
必须重新核对这张表。**

### 3.4 与应用主题 API 的衔接

`app.setTheme("dark" | "light" | "system")` 在 `<html>` 上设置 `data-theme` +
`colorScheme` + `.dark`（见 `packages/provider-web/src/app.ts:119-123`）。

**WeUI 的派发选择器挂在 `body` / `.wx-root` 上，不读 `<html>` 的 `data-theme`。**
两者当前**不互通**：

- `app.setTheme("dark")` 只加 `<html class="dark" data-theme="dark">`，
  不会给 `<body>` 加 `data-weui-theme="dark"`。
- 因此 `@timeless/weui` 的暗色目前**只**由系统 `prefers-color-scheme` 或
  应用手工设置 `document.body.dataset.weuiTheme = "dark"` 触发。

**衔接方式**（二选一，推荐 A）：

```ts
// A. 在应用里同时驱动两套（推荐，不改库行为）
app.setTheme(mode);
if (mode === "system") {
  delete document.body.dataset.weuiTheme;
} else {
  document.body.dataset.weuiTheme = mode;   // "dark" | "light"
}
```

```ts
// B. 给 weui 的派发选择器补一条 <html data-theme> 分支
//    即在 theme/index.less 里追加 `html[data-theme='dark'] body { .varsDark(); }`
//    属于改库行为，需同步更新 3.2/3.3 两张表。
```

`apps/web-weui` 目前走的是 A 路线的等价写法（内联脚本读 `localStorage`，
并在 `toggleDark()` 里同时写 `<html>` 与 `document.body[data-weui-theme]`）。

### 3.5 方式 D：规范页实时调参（预览孤岛）

`apps/web-weui` 的**设计规范页**（左菜单「设计规范」→ `/home/design`，
实现在 `src/pages/design/index.js`，样式在 `apps/web-weui/index.html` 的
`.weui-spec-*` 块）把 3.4 的换肤方式做成了可视化编辑器：左侧是从真实 token
读出来的规范表 + 控件，右侧一块预览孤岛。控件写的是孤岛元素上的**内联 CSS 变量**，
所以只影响孤岛，页面壳不受影响，可一键重置。机制与注意事项见
`THEME_PACKAGE_GUIDE.md` §5.4。

启动：`pnpm run docs --lib=weui`（→ <http://127.0.0.1:3405>，见指南 §8.4）。

本库与其它 5 个库不同、页面**强制偏离**的几点：

| 差异 | 原因 |
|---|---|
| 取值根元素是 `document.body`，不是 `<html>` | `--weui-*` 声明在 `body,.wx-root,page` 上，读 `documentElement` 只会得到空串 |
| 亮色选择器要按 `,` 切分后逐项比对 | 亮色声明是逗号组 `body,.wx-root,page`，精确 `===` 永远匹配不上 |
| 没有第二层语义别名、没有 calc 圆角阶梯 | `--weui-*` 就是组件直接消费的那一层；因此没有 `LIB_KEY` / `ALIAS_SELECTOR` / `COMPANION_TOKENS`，规范表改用「亮色声明 / 暗色声明」双列 |
| 关怀模式不另开两列声明 | 4 套预设的差异用「当前」列已能回答；用一个开关切 `body[data-weui-mode]` |
| 孤岛 style 必须是**整对象 Ref** | 宿主层把 style 序列化成 cssText 后整体赋值，逐 key 的 `style[k] = v` 对自定义属性不生效 |
| 旋钮用裸 primitive `<input>`（`Timeless.Input`） | weui 自己的 `Input` 会套一层 weui chrome（allowClear / 图标），套在 range / color 上不成样子 |

两个已知缺口（页面如实标注，不假装支持）：`--weui-FONT-SIZE-*` 在本库**未声明**，
`--weui-BTN-RADIUS` / `--weui-CELL-GAP` 声明了但组件没消费（见第 7 节）。

---

## 4. `vars/` vs `less-vars/`：两侧必须同步

参数化主题通过 **Less mixin**（而非裸 CSS 变量）实现，所以每个主题有**两份**定义：

```
style/base/theme/
├── vars/          ← CSS 自定义属性：.varsLight() { --weui-BRAND-100: #07c160; … }
└── less-vars/     ← 编译期 Less 变量：@LIGHT_BRAND_100: #07C160;
```

| | `vars/*.less` | `less-vars/*.less` |
|---|---|---|
| 内容 | CSS 自定义属性 | Less 编译期变量 |
| 命名 | `--weui-BRAND-100` → `.varsLight()` | `@LIGHT_BRAND_100` → mixin 内联 |
| 何时求值 | **运行时**（浏览器可改） | **编译期**（构建后不可改） |
| 用途 | 组件内联 style、CSS 规则 | 需要在 Less 里做算术/字符串拼接的场合 |

### 必须同步的规则

两份文件里的颜色值**必须逐一对应**。例如：

```
vars/light.less:       --weui-BRAND-100: #07c160;
less-vars/light.less:  @LIGHT_BRAND_100: #07C160;
```

**改一处必须改另一处。** 由于命名规则不同（`--weui-` vs `@LIGHT_`），
没有编译期校验，不一致只能靠 review 发现。这是本库最容易出错的地方。

### 为什么需要两份

`less-vars/` 只服务于**编译期**需要字面量颜色的地方，例如
`overlay()` 混色、`fade()` / `darken()` 计算。`vars/` 服务于运行时可换肤的场合。
新增 token 时，**先问需不需要编译期使用**：不需要就只加 `vars/`，
避免制造必须同步的第二份。

---

## 5. Less mixin API（`style/base/theme/fn.less`）

`fn.less` 导出 5 个 mixin，是**写主题相关 CSS 的唯一入口**。

### 5.1 `.dark(@rule)`

```less
.dark({
  background: #1e1e1e;
});
```

展开为「暗色时才应用」：同时覆盖 `.wx-root[data-weui-theme='dark'] &`、
`body[data-weui-theme='dark'] &`，以及 `@media (prefers-color-scheme: dark)` 下的
`:not([data-weui-theme='light'])` 分支。

### 5.2 `.setColor(@var, @light[, @dark])`

```less
.setColor(--weui-DIALOG-LINE-COLOR, rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
```

**定义一个双色 token**：亮色块 + 暗色块自动生成。三参形式省略 `@dark` 时两色相同。
这是定义新 token 的标准写法，**不要**手写 `body { --x: … } body[data-weui-theme='dark'] { --x: … }`。

### 5.3 `.care(@rule)`

```less
.care({
  font-size: 18px;
});
```

展开为「照顾模式时才应用」。与 `.dark()` 平行的结构。

### 5.4 `.setCareColor(@var, @light[, @dark])`

与 `.setColor` 平行，但生成的是 `[data-weui-mode='care']` 作用域下的双色 token。

### 5.5 `.setThisColor(@var, @light[, @dark])`

**局部作用域**版本：`&` 指向当前选择器本身，而不是 `body` / `.wx-root`。

```less
.my-card {
  .setThisColor(--my-card-bg, #fff, #191919);
}
```

生成：

```css
.my-card { --my-card-bg: #fff; }
body[data-weui-theme='dark'] .my-card { --my-card-bg: #191919; }
@media (prefers-color-scheme: dark) { body:not([data-weui-theme='light']) .my-card { … } }
```

用于「只在这个组件内生效」的私有 token。**新增组件私有颜色优先用它**，
避免往全局 `--weui-*` 命名空间里塞东西。

### 5.6 选择速查

| 想要 | 用 |
|---|---|
| 全局双色 token | `.setColor` |
| 局部队列双色 token | `.setThisColor` |
| 照顾模式双色 token | `.setCareColor` |
| 只在暗色下加规则 | `.dark({ … })` |
| 只在照顾模式下加规则 | `.care({ … })` |

---

## 6. 组件级 token

除全局色板外，各组件在 `style/base/variable/*.less` 与
`style/widget/**/*.less` 里定义**组件级** token：

| Token | 值 | 定义位置 | 说明 |
|---|---|---|---|
| `--weui-BTN-HEIGHT` | `48` | `variable/weui-button.less` | **无单位**，见第 7 节 |
| `--weui-BTN-HEIGHT-MEDIUM` | `40` | 同上 | 无单位 |
| `--weui-BTN-HEIGHT-SMALL` | `32` | 同上 | 无单位 |
| `--weui-BTN-ACTIVE-MASK` | 亮 `rgba(0,0,0,0.2)` / 暗 `rgba(255,255,255,0.2)` | 同上 | 按压遮罩 |
| `--weui-BTN-DEFAULT-ACTIVE-BG` | `overlay(…)` 计算值 | 同上 | 默认按钮按压底 |
| `--weui-BG-COLOR-ACTIVE` | 亮 `#ececec` / 暗 `overlay(rgba(255,255,255,0.05), #2c2c2c)` | `variable/color.less` | 通用按压底 |
| `--weui-DIALOG-LINE-COLOR` | 亮 `rgba(0,0,0,0.1)` / 暗 `rgba(255,255,255,0.1)` | `variable/weui-dialog.less` | 对话框分隔线 |
| `--weui-STEPS-DEFAULT-COLOR` | `var(--weui-FG-3)` | `widget/weui-steps/weui-steps.less` | 步骤条未完成色 |
| `--weui-STEPS-HIGHLIGHT-COLOR` | `var(--weui-BRAND)` | 同上 | 步骤条完成色 |
| `--weui-STEPS-FONT-SIZE` | `17` | 同上 | 无单位 |
| `--weui-STEPS-LINEHEIGHT` | `1.4` | 同上 | |
| `--weui-STEPS-DOT-SIZE` | `calc(8 / var(--weui-STEPS-FONT-SIZE) * 1em)` | 同上 | 依赖 FONT-SIZE |
| `--weui-STEPS-ICON-SIZE` | `40` | 同上 | 无单位 |
| `--weui-STEPS-VERTICAL-DOT-GAP` | `calc((1em - var(--weui-STEPS-DOT-SIZE)) / 2)` | 同上 | |
| `--weui-STEPS-HORIZONAL-DOT-GAP` | `4px` | 同上 | 注意官方拼写为 `HORIZONAL` |
| `--weui-cellMarginLR` | `16px` | `widget/weui-cell/weui-cells__group.less` | **驼峰**，唯一非全大写 token |
| `--weui-cellPaddingLR` | `16px` | 同上 | 驼峰 |

约定：

- 组件级 token 直接写在**使用它的选择器**上（如 `.weui-steps { --weui-STEPS-*: … }`），
  而不是集中到 `variable/`。只有跨组件共享的才进 `variable/`。
- 命名沿用 `--weui-<组件大写>-<属性>`。`STEPS` 系列用的是单数 `STEP` 之外的形式，
  迁移时注意。

---

## 7. ⚠️ 未定义变量缺口清单

以下 token 被 `src/modules/*.ts` 的**内联 style** 引用，但在
`style/base/theme/vars/**` 与 `style/base/variable/**` 中**从未定义**。
浏览器会把这些声明当作无效值丢弃，属性回退到继承值/初始值。

**本轮只记录，不修复**（避免扩大改动面；修复需要先定值，属于设计决策）。

| Token | 引用位置（`src/modules/`） | 引用次数 | 影响 |
|---|---|---|---|
| `--weui-FONT-SIZE` | `button.ts:45`、`input.ts:41`、`textarea.ts:35`、`select.ts:33,136,159`、`card.ts:36`、`tabs.ts:59`、`dialog.ts:107,160,181` | 10 | `font-size` 声明失效，字号跟随继承 |
| `--weui-FONT-SIZE-SM` | `button.ts:31`、`select.ts:228,256`、`card.ts:51`、`dialog.ts:123` | 5 | 同上（小号） |
| `--weui-FONT-SIZE-XS` | `select.ts:85`、`badge.ts:20` | 2 | 同上（超小号） |
| `--weui-BTN-RADIUS` | `button.ts:44` | 1 | `border-radius` 失效 → 按钮**直角** |
| `--weui-CELL-GAP` | `select.ts:32,60,84`、`sheet.ts:85`、`card.ts:23,65,79,81` | 8 | `padding` 失效 → 单元格**无内边距** |

### 附带发现：无单位 token 被当成长度使用

`--weui-BTN-HEIGHT` / `-MEDIUM` / `-SMALL` 定义为**无单位数字**（`48` / `40` / `32`），
在 Less 里配合 `calc()` 做算术是正确用法（见 `weui-button.less:48`）。
但 `src/modules/button.ts:20-26` 直接写：

```ts
height: "var(--weui-BTN-HEIGHT)"     // → 计算值 height: 48  ← 非法
```

`height: 48` 不是合法长度，声明被丢弃，按钮高度回退到内容高度。
**同样只记录，不修复。**

### 与 shadcn 的对比

`@timeless/shadcn` 的 token 全部有定义（见 `../shadcn/THEME_DESIGN.md` 第 2 节），
不存在这类缺口。上述问题只在 `@timeless/weui`。

---

## 8. 全局规则与共存性

`style/base/reset.less` 与 `style/base/theme/index.less` 包含**全局规则**：

```less
html { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
body { line-height: 1.6; font-family: @weuiFontDefault; }
* { margin: 0; padding: 0; outline: 0; }
a { text-decoration: none; }
body, .wx-root { .varsLight(); }
```

这意味着：

1. `@timeless/weui` **不能**与 `@timeless/shadcn` 同时主导同一页面 ——
   两者的 `*` / `body` 规则会互相覆盖（shadcn 的 `@layer base` 见其文档第 7 节）。
2. `@timeless/weui` 与新的 `[data-tt-style="<lib>"]` 作用域库**也不共存于同一子树**：
   weui 的 `body` 级 token 会泄漏到新库的作用域内。
   **实践建议：一个页面只加载一套「全局型」样式库。**
3. 新增的 `bootstrap` / `material` / `fluent` 库必须避免这类全局规则
   （见根目录 [`THEME_PACKAGE_GUIDE.md`](../../THEME_PACKAGE_GUIDE.md) 的隔离禁忌）。

---

## 9. 相关文件

| 文件 | 作用 |
|---|---|
| `src/style/weui.less` | 总入口，按顺序 `@import` 全部 widget |
| `src/style/base/fn.less` | mixin + 变量汇总入口（组件里 `@import "fn"` 即可） |
| `src/style/base/theme/index.less` | 四套预设的派发选择器 |
| `src/style/base/theme/fn.less` | 5 个 mixin（`.dark` / `.setColor` / `.care` / `.setCareColor` / `.setThisColor`） |
| `src/style/base/theme/vars/*.less` | 4 套运行时 CSS 变量 |
| `src/style/base/theme/less-vars/*.less` | 4 套编译期 Less 变量（必须与 `vars/` 同步） |
| `src/style/base/reset.less` | 全局重置（含禁忌的 `*` 规则） |
| `src/style/base/variable/*.less` | 跨组件共享的组件级 token |
| `src/index.ts` | 组件导出；通过 `import("./index.less")` 带上样式 |

构建：`vite.config.ts` 走 Less（`math: "always"`），产物 `dist/timeless.weui.css`，
UMD 全局 `Timeless.weui`。
