# Windows 原生构建与验证

Windows 入口使用 C++20、Win32、Direct2D / DirectWrite、QuickJS-NG 和 Yoga，不加载 WebView。页面直接复用 `src/examples/simple` 的 Model、View、真实 shadcn 组件和 CSS。

**当前覆盖十个共享示例页，尚未迁移 `index.html` / `src/index.js` 的完整文档站。** OrbStack 执行的是 Linux 交叉编译和 Wine 验证；它不提供 Windows 内核，也不能替代 Windows 实机的输入法、辅助技术和多显示器 DPI 验收。

当前环境已成功运行完整集成测试并导出截图，但重复验证也出现过 `rosetta error: invalid gdt selector index 5`、进程退出码 133。同一容器再次运行可通过，异常原因尚未定位，不能据此宣称 Windows 实机稳定性已验收。失败容器和日志保留在本机，脚本不会自动重试来隐藏失败。

## 在 OrbStack 构建和测试

前提：本机已安装 pnpm 和 OrbStack，Docker 中存在 `orbstack` context。在仓库根目录执行：

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm --filter ./apps/web-shadcn test:windows:orbstack
```

命令构建共享 JS、运行 JS 冒烟测试、使用 MinGW 生成 Windows x64 程序，再创建 `timeless-shadcn-windows-<时间戳>` 测试容器。Wine 在虚拟显示器和桌面合成器内运行 QuickJS/Yoga 与 HWND/Direct2D 集成测试，包括真实鼠标和键盘消息、连续十次模态焦点循环、图片解码及遮罩像素检查。测试阶段禁用网络，失败返回非零退出码并保留容器；只有通过验证的程序和截图会替换输出目录。

仅构建程序：

```bash
pnpm --filter ./apps/web-shadcn build:windows:orbstack
```

QuickJS-NG、Yoga、NanoSVG 均固定提交，源码缓存于 `build/windows-sources/`。首次需要联网下载源码和基础镜像；C++ 编译步骤禁用网络。Wine 镜像包含 Wine 字体和 CJK 字体，不依赖本机 Windows 字体安装。

## 运行程序

产物位于 `apps/web-shadcn/build/windows-x64/`：

- `Timeless-Shadcn.exe`：Windows x64 原生程序。
- `app.js`：共享 Model / View / CSS 编译结果，需放在 exe 旁边。
- `*LICENSE.txt`：随程序分发的许可证。
- `timeless_shadcn_test.exe`：QuickJS/Yoga 集成测试程序。
- `screenshots/`：容器验证成功后导出的明暗主题、日历、弹窗、表格等截图。

将目录复制到 Windows 后双击 exe，或者在 PowerShell 运行：

```powershell
.\Timeless-Shadcn.exe
.\timeless_shadcn_test.exe app.js
.\Timeless-Shadcn.exe --test-shadcn app.js
```

## 使用 Windows MSVC 构建

安装 Visual Studio 的 C++ 桌面开发工具、Windows SDK、CMake 3.24+ 和 pnpm。在仓库根目录运行：

```powershell
pnpm build
pnpm --filter @timeless/inner-vite-plugin --filter @timeless/timeless-native --filter @timeless/timeless-windows -r build
pnpm --filter ./apps/web-shadcn test:windows
cmake -S packages/timeless-windows/native -B apps/web-shadcn/build/windows-msvc -DTIMELESS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/windows/app.js"
cmake --build apps/web-shadcn/build/windows-msvc --config Release --target timeless-windows timeless_shadcn_test --parallel
.\apps\web-shadcn\build\windows-msvc\Release\timeless_shadcn_test.exe apps/web-shadcn/dist/windows/app.js
.\apps\web-shadcn\build\windows-msvc\Release\timeless-windows.exe --test-shadcn apps/web-shadcn/dist/windows/app.js
```

## 共享页面覆盖

| 页面 | Windows 宿主实现 |
| --- | --- |
| 概览、基础组件、布局 | 相同 View / CSS、按钮变体、明暗主题、圆角、边框、阴影、焦点环 |
| 表单 | 原生 EDIT、共享 Select / 日历浮层、Checkbox / Switch、系统文件窗口 |
| 浮层 | Modal / Popover / Tooltip / Drawer、共享 DropdownMenu / ContextMenu、锚点定位与边缘限位 |
| 导航与折叠 | 共享 Tabs、Accordion、Steps 的状态和布局 |
| 展示与反馈 | Badge、Avatar 兜底、Separator、Alert、Progress、Skeleton 静态外观 |
| 表格与分页 | 共享 Table 树、20 行分页、等宽列和滚动容器 |
| 滚动与虚拟列表 | 原生 HWND 滚动裁剪；ListViewV2 使用共享 Model 的可见范围，只保留可见行 |
| 过渡动画 | 单次透明度、平移、缩放关键帧；animationend 回传和 forwards / both 最后一帧 |

`index.windows.js` 是独立 Windows 启动器。构建消费与 Web 共享示例相同的 CSS 来源，宿主按属性绘制，不维护应用专用的 Windows 配色和间距副本。`attributes.n` 保留在原生节点中供集成测试定位。

## 当前边界

- 浏览器和 DirectWrite 的字体与光栅化可能不同，应在同一台 Windows、相同字体和 DPI 下完成最终视觉对照。原生 EDIT 内部排版由 Windows 处理，ScrollView 使用系统滚动条。
- CSS 支持页面所需子集，没有完整浏览器排版、伪元素绘制、通用属性 transition 或无限循环动画。动画显示组暂不支持内部交互 HWND 的缩放变换。
- Table 使用等宽列，没有内容驱动列宽或跨行跨列。ListViewV2 使用声明的行高，不支持 externalScroll。
- Image 使用 WIC 解码位图，远程图片通过 WinHTTP 异步加载；SVG 图标使用 NanoSVG。远程网络、真实文件窗口、输入法、屏幕阅读器和多 DPI 显示器仍需 Windows 实机验收。
- SplitView / TabView 可解码并布局，完整分隔条拖拽和宿主标签页交互尚未完成。
- 完整文档站中的 DOM 锚点、CSSOM / Canvas、拖拽看板、网络和其他浏览器能力仍需迁移，不属于共享示例验收结果。
