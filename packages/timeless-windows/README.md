# Timeless Windows

Windows 原生宿主：QuickJS 执行业务 JS，Yoga 计算布局，Win32 承载窗口与交互，Direct2D / DirectWrite 绘制 Timeless 外观和文字。复用 `@timeless/timeless-native` 的节点、响应式行为和 `.native.css` 样式协议。

当前实现需要 Windows 10 1703+。支持 View、Text、Button、Input、Textarea、NumberInput、ScrollView、Select、Checkbox、Radio、Row、Column、AspectRatio，以及 For / Show / Fragment 等逻辑容器。现已接入共享 shadcn 示例所需的 SVG Icon、位图 Image、Form、Table、CSS Grid、浮层、虚拟列表和单次关键帧动画。SplitView / TabView 暂仅支持解码和布局。

共享 shadcn 应用的构建、OrbStack / Wine 验证和覆盖边界见 [Windows 应用说明](../../apps/web-shadcn/README.windows.md)。该入口目前覆盖十个共享示例页，尚未覆盖完整 Web 文档站。

## 在 Windows 上运行

安装 Node.js 22、pnpm 10、Git、CMake 3.24+ 和 Visual Studio 2022 的“使用 C++ 的桌面开发”（包含 Windows SDK）。在仓库根目录执行：

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @timeless/inner-vite-plugin --filter @timeless/timeless-native --filter @timeless/timeless-windows --filter @timeless/windows-demo -r build
pnpm --filter @timeless/windows-demo build:host
pnpm --filter @timeless/windows-demo start
```

CMake 首次配置会下载固定版本的 QuickJS-NG、Yoga 和 NanoSVG。使用 Visual Studio 默认生成器时，程序在 `apps/windows-demo/build/Release/timeless-windows.exe`；同目录的 `app.js` 是应用 bundle，两者一起复制即可运行。直接双击 `.exe` 会读取旁边的 `app.js`。

可显式指定其他应用 bundle：

```powershell
.\apps\windows-demo\build\Release\timeless-windows.exe path\to\app.js
```

## 编写应用和样式

示例的 [Model / View](../../apps/windows-demo/src/index.js) 与 [CSS](../../apps/windows-demo/src/styles.native.css) 分开维护业务状态和外观。入口从 `@timeless/timeless-windows` 导入 `render`，组件继续从 `@timeless/timeless` 导入：

```js
import { Button } from "@timeless/timeless";
import { render } from "@timeless/timeless-windows";
import "./styles.native.css";

export function CounterView(model) {
  return Button({
    attributes: { n: "increment", "aria-label": "增加计数" },
    class: "button primary",
    disabled: model.disabled,
    onClick: () => model.increment(),
  }, [model.count]);
}
```

在 Vite 配置中加入 `timelessNativeStyles()`，即可使用与 macOS 相同的 class 样式子集：背景、文字、边框、圆角、透明度和 Flex 布局，以及 `:hover` / `:active` / `:focus` / `:disabled`。参见 [macOS 样式范围](../../apps/macos-demo/README.md#支持范围)。本库的 JS 入口直接转导出公共 native runtime，不复制渲染器或样式解析器。

Button 使用原生 BUTTON 的 owner-draw 模式，外观由 Timeless 绘制，Windows 负责点击、键盘焦点和可访问性。普通文字由 owner-draw STATIC 承载，可供辅助技术读取。Input 使用无边框 EDIT，保留文本选择、剪贴板、撤销和输入法。输入框内部文字仍由 Windows 编辑器绘制，其透明度和内边距不保证与浏览器一致。

样式尺寸使用 DIP；窗口跨 DPI 显示器时更新绘制比例、控件字体和位置。节点使用稳定 ID 更新 HWND，切换 class、调整窗口尺寸时保留输入框和模型状态。文字测量使用 DirectWrite。

## 滚动与表单控件

| 组件 | Windows 行为 |
| --- | --- |
| ScrollView | 独立 HWND 裁剪子控件；双轴滚动条、嵌套滚轮、Shift + 滚轮横向滚动、方向键 / PageUp / PageDown / Home / End；Tab 聚焦子控件时滚动到可见区域 |
| Select | 原生 COMBOBOX 保留键盘与辅助技术接口；自绘外观、占位项、单选、分组选项、禁用项、响应式选项和值；方向键跳过禁用项 |
| Checkbox | 自绘方框、勾选和 indeterminate；原生 BUTTON 提供 Space 切换、焦点和可访问状态 |
| Radio | 自绘圆点；相同 `name` 的组互斥，方向键切换组内可用项，checked 可响应 Model 更新 |

ScrollView 的 `horizontal` / `vertical`：`auto` 在溢出时显示滚动条，`hidden` 隐藏该轴滚动条并禁止滚轮和方向键滚动该轴，`visible` / `scroll` 请求始终显示。滚动条采用 Windows 原生样式，内容继续使用 class；内容尺寸和滚动距离使用 DIP。`contentWidth` / `contentHeight` 可设置内容的最小滚动范围。原生子窗口始终按矩形边界裁剪。

通过组件返回对象的 `methods.scrollTo(x, y)`、`scrollToTop()`、`scrollToBottom()` 控制滚动；`onScroll` 同时收到 `scrollTop`、`scrollLeft`。位置会在内容缩小后自动收敛到有效范围；class 更新、窗口调整和 HMR 保留同一节点的滚动位置与 HWND。

Select 使用现有 Primitive 的 `value: ref(["value"])` 契约，`onChange` 从 `event.target.value` 读取单个字符串。`options` 可以是数组或 Ref；选项分组在原生列表中显示为“组名 — 选项名”。当前 Windows Select 支持单选，尚未实现 `multiple`。Checkbox / Radio 的 `onChange` 从 `event.target.checked` 读取布尔值。

示例同时展示了动态新增选项、禁用表单控件、勾选与分组单选、嵌套双轴滚动和滚到底部。

## 开发与热更新

在第一个终端运行：

```powershell
pnpm --filter @timeless/windows-demo dev
```

在第二个终端运行 `pnpm --filter @timeless/windows-demo start`。宿主监听 bundle 修改时间，清理旧定时器并在原 QuickJS 上下文执行新 bundle；开发构建使用现有 native HMR 插件保留 ref。修改 C++ 宿主需要重新运行 `build:host`。

宿主提供 console、setTimeout / setInterval、clearTimeout / clearInterval、queueMicrotask 和 Promise 任务泵。没有浏览器 DOM 或网络 API；加载的 JS 是本地应用代码，不作为不可信插件沙箱使用。JS 异常会报告到宿主，UI 事件有执行时间限制，运行时有内存与栈限制。

## 验证

在 Windows 上先构建示例，然后运行：

```powershell
pnpm --filter @timeless/windows-demo test:host
```

CTest 包含两项：

- `windows-runtime`：真实 QuickJS 执行 bundle，验证 class、文本、表单值、动态选项、禁用项、勾选与分组单选、滚动范围和偏移、输入、布局、定时器、Promise、错误处理和 HMR；文本测量使用确定性的测试回调。
- `windows-controls`：隐藏窗口内创建真实 HWND，验证 owner-draw 按钮、鼠标 hover、Enter、原生 EDIT / COMBOBOX / Checkbox / Radio、选项键盘导航、嵌套 HWND、滚动条和滚轮、尺寸变化、可访问名称和 Direct2D 绘制。

[Windows CI](../../.github/workflows/windows-native.yml) 使用 MSVC 构建并执行这两项测试，成功时生成 `.exe` 与 `app.js` 构建附件。新增 workflow 不代表它已经在当前分支执行。

macOS / Linux 可以构建和运行公共 C++ 桥接测试：

```bash
cmake -S packages/timeless-windows/native -B apps/windows-demo/build -DCMAKE_BUILD_TYPE=Debug
cmake --build apps/windows-demo/build --target timeless_windows_test --parallel
ctest --test-dir apps/windows-demo/build --output-on-failure
```

安装 MinGW 后可交叉编译 Windows 程序，但不能据此声称 Windows 交互已经实测：

```bash
cmake -S packages/timeless-windows/native -B apps/windows-demo/build-cross \
  -DCMAKE_TOOLCHAIN_FILE=cmake/mingw.cmake -DCMAKE_BUILD_TYPE=Release
cmake --build apps/windows-demo/build-cross --target timeless-windows timeless_windows_test --parallel
```
