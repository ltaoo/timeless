# Timeless Shadcn Swift

使用 SwiftUI + AppKit 实现的独立 macOS 客户端，对照 [`web-shadcn/index.macos.html`](../web-shadcn/index.macos.html) 及其 [`simple` 页面](../web-shadcn/src/examples/simple) 的十个页面。需要 macOS 14 或更新版本和 Xcode 工具链；无第三方 Swift 依赖。

## 构建与启动

在仓库根目录执行：

```bash
bash apps/swift-shadcn/scripts/build-app.sh
open "apps/swift-shadcn/build/Timeless Shadcn Swift.app"
```

构建脚本先编译 release 版本、装入图标资源并做本机签名，成功后替换应用。原有 `web-shadcn/build/Timeless Shadcn.app` 可以同时运行作对照。发布给其他机器前仍需开发者签名和公证。

开发时可以直接运行：

```bash
swift run --package-path apps/swift-shadcn
```

## 页面与交互对照

| 页面 | 实现的内容 | 状态行为 |
| --- | --- | --- |
| 概览 | 导航说明、卡片 | 与侧栏及路径同步 |
| 基础组件 | 六种按钮变体、禁用、计数、重置 | 切换页面后保留计数 |
| 表单组件 | 姓名、邮箱、角色、双月日期范围、附件、1–99 席位、简介、勾选和开关 | 相同提交校验与重置；附件只记录选择结果，不读取或上传 |
| 浮层组件 | Modal、Popover、Tooltip、DropdownMenu、ContextMenu、右侧 Drawer | Esc、外部点击、菜单键盘导航、禁用项；切换页面关闭浮层并保留输入 |
| 导航与折叠 | 三个标签、单项及多项 Accordion、三步 Steps | 保留选择，步骤限制在 1–3 |
| 展示与反馈 | Badge、三种 Avatar、两向 Separator、Alert、双 Progress、Skeleton | 进度每次增减 10，限制在 0–100 |
| 布局与容器 | 三张 224pt 卡片、窗口变窄时换行 | 固定侧栏、独立内容滚动 |
| 表格与分页 | 同一组 200 条账单、每页 20 条、10 页 | 表格区域随窗口伸缩，统计与分页在底部两端对齐 |
| 滚动与虚拟列表 | 1000×220 双向滚动、48pt 行高虚拟列表、跳转及 100/10000 条切换 | `NSTableView` 复用可见行；回报滚动位置 |
| 过渡动画 | 300ms 淡入淡出、底部及右侧滑动、缩放、退场后保持隐藏 | 常规退场移除内容；最后一帧示例保留布局，支持系统减少动态效果 |

主题按钮位于侧栏 Timeless 标题右侧，前进、后退使用圆形箭头图标。路由同原版使用内存历史；刷新应用回到基础组件页，数据仅保留在本次运行中。

颜色来自 `packages/shadcn/src/styles/globals.css` 的 OKLCH token，图标复制自仓库 Lucide SVG。布局沿用 192pt 侧栏、16/24pt 间距、32pt 按钮和原有圆角。界面与状态均由 Swift 实现，运行时不加载 HTML、CSS、JavaScript 或原来的渲染器；页面中的对照文案保留原版措辞。

## 验证

```bash
swift test --package-path apps/swift-shadcn
```

测试覆盖历史和保留状态、表单校验、日期和月份边界、200 条账单无重复分页、进度与步骤边界、动画取消、SVG 解码、虚拟列表复用、实际鼠标点击、Esc 和模态输入焦点。十个页面各生成明暗截图到 `build/previews/`，并检查 560/720/960pt 高度下的窗口布局。

系统文件选择框由 `NSOpenPanel` 提供。未自动操作真实文件选择对话框，未做逐像素一致性断言；系统文字栅格化、滚动条及弹出层边框可能与原渲染器存在细微差异。

## 修改入口

- [`Models.swift`](Sources/TimelessShadcnSwift/Models.swift)：路由和各页面状态。
- [`Theme.swift`](Sources/TimelessShadcnSwift/Theme.swift)：颜色、图标、按钮、输入及布局组件。
- [`Application.swift`](Sources/TimelessShadcnSwift/Application.swift)：窗口、侧栏、工具栏和页面路由。
- `ComponentPages.swift` / `FormPage.swift` / `FloatingPage.swift` / `DataPages.swift`：各页面与 AppKit 控件。
