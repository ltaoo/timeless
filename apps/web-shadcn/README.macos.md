# 共享 shadcn 示例与原生构建

当前按共享样式架构从简单页面开始，暂不把完整文档站一次性迁入 native。

- Web 启动器：`index.simple.html` / `index.simple.js`。
- macOS 启动器：`index.macos.html` / `index.macos.js`。
- Windows 复用 native 启动器，由 Vite alias 选择 Windows renderer。
- 三端共用 `src/examples/simple/model.js`、`view.js` 和 `pages/`，直接使用 `@timeless/shadcn` 的真实组件。
- `view.js` 直接导入 `@timeless/shadcn/globals.css`；页面工具类来自 `index.simple.html` 中同一份 Tailwind 源码。没有应用专用的 native CSS，也没有针对 Button 复制一套外观。

共享示例包含侧边菜单、路由工具栏和四个页面：概览（`/home/overview`）、基础组件（`/home/general`，默认）、表单组件（`/home/data_entry`）、布局与容器（`/home/layout`）。基础组件页保留六种 Button 变体、禁用按钮、点击计数和重置；工具栏切换整个应用的明暗主题。布局页使用真实 shadcn Card 展示 Flex 换行。

路由复用 `kit.HistoryCore` / `RouteViewCore`，采用三端一致的内存历史，支持前进、后退和菜单选中态；同一页面重复点击不会新增历史，后退后再导航会截断前进历史。各页面保持挂载，以保留计数、表单输入等状态；路由切换时关闭表单浮层并将内容滚动位置归零。当前不把内存路由同步到浏览器地址栏，刷新后回到基础组件页。原有 Web 文档站 `index.html` / `src/index.js` 保留。

## 表单与宿主能力

表单的 Model 维护输入、选择值、校验和提交结果；View 使用 Input、Textarea、NumberInput、Select、DateRangePicker、FileInput、Checkbox、Switch 和 Label，沿用包内 CSS。提交只生成本地摘要；重置清空日期和文件，切换页面保留输入。

| 组件 | 共享实现 | macOS 宿主支持 |
| --- | --- | --- |
| Input / Textarea / NumberInput | 现有组件与 VM | 输入、数值变更和重置 |
| Select | shadcn 选项 + Primitive Popover / ScrollView | 自定义样式浮层、选项点击、方向键、Enter、Escape |
| DateRangePicker | shadcn 双月日历与范围 Model | 浮层、固定列/等分列 Grid、动态月份节点；完成范围后关闭 |
| FileInput / FilePicker | FilePickerCore 校验、接受类型、多选、清空 | NSOpenPanel 文件窗口，回传 name / type / size / path / lastModified |
| Checkbox / Switch / Label | 共享组件骨架和样式 | 自定义组件绘制、状态更新、Label 内容 |

Select 和 DateRangePicker 无需新增系统原生选择控件；宿主实现的是通用弹层、布局、动态树同步和事件能力。Web 的 Popover 使用浏览器 top layer，并保留原 DOM 祖先以继承主题。FilePicker 调用系统窗口，按钮仍使用共享样式。取消文件窗口保留原选择；当前 native 文件值是描述对象，没有浏览器 File 的 text()/arrayBuffer() API，也不上传内容。

macOS 尚未绘制 CSS 伪元素，因此日期区间中间的 `::before` 连续底色尚不完整，起止日期选中态可用。Windows 入口已包含同一表单页面，JS 冒烟测试覆盖状态和事件；Windows C++ 宿主的 floating 浮层和文件对话框仍需补齐，不能据此认定这些控件已在 Windows 实机可用。

## 样式链路

```text
共享 View → shadcn Button 的 class
  → 原始 shadcn CSS + 共享工具类 CSS
  → Web：浏览器计算、绘制
  → native：通用 CSS 计算 → Yoga 布局 + 宿主绘制
```

`timelessWebStyles` 将普通 CSS 导入转为规则注册，不为某个工具类写特殊映射。运行时处理选择器、状态、CSS 变量和继承，计算出颜色、尺寸、阴影等属性；macOS 和 Windows 按属性绘制。`box-shadow` 不进入 Yoga 尺寸计算。

焦点环遵循包内 `focus-visible:ring-3` / `ring-ring/50`，保持原始 CSS 的零模糊和 3px 扩展值，不增加平台补偿。鼠标聚焦与键盘聚焦按 `focus-visible` 区分。修改包内 CSS 并重新构建后，三端消费同一份变更。

目前验证了该 Button 页所需的选择器与状态、`var()` / `@property`、`calc()`、常见相对长度、OKLCH / 颜色混合和外阴影。尚未实现完整浏览器 CSS（例如动画、伪元素绘制、完整媒体查询、inset 阴影）；后续能力补到通用样式层或宿主，不增加平台专用应用样式。

## 构建

首次准备：

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @timeless/inner-vite-plugin --filter @timeless/timeless-native \
  --filter @timeless/timeless-macos --filter @timeless/timeless-windows -r build
```

Web：

```bash
pnpm --filter ./apps/web-shadcn dev:simple
# 打开 /index.simple.html
pnpm --filter ./apps/web-shadcn build:simple
```

macOS（本机 AppKit / Swift 构建）：

```bash
pnpm --filter ./apps/web-shadcn build:macos:app
pnpm --filter ./apps/web-shadcn start:macos
```

产物为 `build/Timeless Shadcn.app`，包含可执行文件、JS 资源和本地 ad-hoc 签名。

Windows（OrbStack 本地交叉编译）：

```bash
pnpm --filter ./apps/web-shadcn build:windows:orbstack
```

产物在 `build/windows-x64/`，运行时保留 `.exe`、`app.js` 和许可证在同一目录。源码固定提交并缓存在本地，编译步骤不访问网络。交叉编译成功不代表 Windows 实机验收。

## 验证与测试夹具

```bash
pnpm --filter ./apps/web-shadcn test:macos
pnpm --filter ./apps/web-shadcn test:windows
pnpm --filter ./apps/web-shadcn build:test-fixtures
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
TIMELESS_MACOS_LEGACY_GALLERY_BUNDLE="$PWD/apps/web-shadcn/build/fixtures/gallery/app.js" \
  pnpm --filter @timeless/timeless-macos test:host
```

原先独立编写的 native 分类页迁到 `tests/fixtures/legacy-gallery/`，只用于宿主回归测试，不进入生产入口。这样继续覆盖表单、路由、布局和浮层，同时避免把测试夹具当成共享组件已迁移完成的依据。

设置 `TIMELESS_MACOS_SCREENSHOTS` 可额外保存原生测试窗口截图；此项需要本机允许屏幕截图。
