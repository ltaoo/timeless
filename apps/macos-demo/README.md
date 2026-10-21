# macOS 自定义 class 样式

通过 `*.native.css` 为 Timeless 的 macOS 视图设置外观。Button 用 AppKit 视图承载 Timeless 子节点，背景、边框、圆角和文字由样式控制；Input 保留 AppKit 编辑器和输入法，移除系统边框。

Swift 宿主现位于 `packages/timeless-macos/native`，本目录保留示例 JS 和构建命令。`packages/timeless-native/ios/TimelessNativeMac` 的旧 Xcode 示例没有接入这些 Swift 宿主改动。Checkbox、Radio、Select、TabView 等仍使用原有系统控件；本实现不提供浏览器完整 CSS 或现有主题包的直接兼容。

## 运行示例

在仓库根目录执行，需安装 Xcode：

```bash
pnpm build
pnpm --filter @timeless/inner-vite-plugin build
pnpm --filter @timeless/timeless-native build
pnpm --filter @timeless/macos-demo build
pnpm --filter @timeless/macos-demo dev:app
```

示例入口是 [style-demo.js](./src/style-demo.js)，样式在 [styles.native.css](./src/styles.native.css)。可点击按钮切换 class、禁用状态和间距；点击动作按钮后可用 Space / Enter 激活，Tab 切换焦点。业务状态与行为放在 `StylesDemoModel`，View 只渲染状态和调用 Model。

开发时在另一个终端运行 `pnpm --filter @timeless/macos-demo dev`，修改 CSS 会重新打包并由原生宿主热更新。旧组件布局示例保留在 [index.js](./src/index.js)。

## 在应用中使用

在 Vite 配置中加入 `timelessNativeStyles()`，并在 JS 入口导入样式：

```js
import { Button } from "@timeless/timeless";
import "./styles.native.css";

export function SaveButtonView(model) {
  return Button({
    attributes: { n: "save-action" },
    class: "button primary",
    disabled: model.disabled,
    onClick: () => model.save(),
  }, ["保存"]);
}
```

```css
.button { padding: 8px 16px; border-radius: 8px; }
.primary { background-color: #304ffe; color: #fff; }
.primary:hover { background-color: #2440dc; }
.primary:active { background-color: #192fae; }
.button:disabled { opacity: 0.4; }
```

插件把 CSS 编译为 JS 中的规则注册调用，产物不需要额外 CSS 文件，也不依赖 DOM。普通 `.css` 导入仍由 Vite 按浏览器样式处理，请使用 `.native.css`。

## 支持范围

| 项目 | 支持内容 |
| --- | --- |
| 选择器 | `.class`、`.class.other`、逗号分组；后接 `:hover`、`:active`、`:focus`、`:disabled` |
| 状态事件 | View / Button 的 hover、active、focus；Input 的 hover、focus；disabled 来自属性 |
| 布局 | 宽高、最小/最大宽高、padding、margin、gap、Flex 方向/对齐/换行/grow/shrink/basis、relative/absolute 与四边定位、display: flex/none |
| 外观 | background-color、color、border-width、border-color、border-radius、opacity |
| macOS View / Button 轮廓 | outline-style（solid / none）、outline-width、outline-color、outline-offset；独立于 Yoga 布局，跟随 border-radius |
| macOS View / Button 阴影 | `box-shadow: x y blur spread color` 或 `none`；支持单层外阴影、模糊与扩展，不影响 Yoga 布局 |
| 文字 | font-size、font-weight、text-align；传递给后代文字节点 |
| 数值 | 长度支持 px 或无单位数字；宽高及最小/最大宽高支持百分比；width/height/flex-basis 支持 auto |
| 颜色 | `#rgb`、`#rgba`、`#rrggbb`、`#rrggbbaa`、transparent、black、white |

padding / margin 支持 1～4 值缩写。CSS 不支持后代选择器、属性选择器、at-rule、变量、`calc()`、多重或 inset 阴影、动画及 `!important`；编译时会带文件位置报错。布局和文字最终效果以当前 Yoga/AppKit 映射为准，Input 的内部编辑区域仍采用 AppKit 的排版。

相同属性按“组件默认值 → 匹配的 class 规则 → 内联 style”覆盖。class 规则按选择器优先级和样式表顺序决定，不依赖 `class` 字符串中类名的顺序。移除 class 会清除旧声明；变化后的文字重新测量，布局请求在同一轮事件中合并。

## 验证

构建示例后，从仓库根目录执行：

```bash
pnpm exec vitest run --config vitest.platform.config.ts
pnpm exec tsc --noEmit -p packages/timeless-native/tsconfig.json
pnpm --filter @timeless/macos-demo test:app
```

Swift 测试加载真实 `dist/app.js` 到 JavaScriptCore，验证 class 换色、动态文本、禁用恢复、Space 激活、输入框焦点样式、重新布局和样式热更新。`test:app` 为 Yoga 导入启用 C++ 互操作。
