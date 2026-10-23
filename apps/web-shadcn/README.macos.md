# 共享 shadcn 示例与原生构建

当前按共享样式架构从简单页面开始，暂不把完整文档站一次性迁入 native。

- Web 启动器：`index.simple.html` / `index.simple.js`。
- macOS 启动器：`index.macos.html` / `index.macos.js`。
- Windows 使用 `index.windows.html` / `index.windows.js`，复用同一份示例页面；构建与验证见 [Windows 说明](./README.windows.md)。
- 三端共用 `src/examples/simple/model.js`、`view.js` 和 `pages/`，直接使用 `@timeless/shadcn` 的真实组件。
- `view.js` 直接导入 `@timeless/shadcn/globals.css`；页面工具类来自 `index.simple.html` 中同一份 Tailwind 源码。没有应用专用的 native CSS，也没有针对 Button 复制一套外观。

共享示例包含侧边菜单、路由工具栏和十个页面：概览（`/home/overview`）、基础组件（`/home/general`，默认）、表单组件（`/home/data_entry`）、浮层组件（`/home/floating`）、导航与折叠（`/home/navigation`）、展示与反馈（`/home/data_display`）、布局与容器（`/home/layout`）、表格与分页（`/home/table`）、滚动与虚拟列表（`/home/scroll`）、过渡动画（`/home/transition`）。基础组件页保留六种 Button 变体、禁用按钮、点击计数和重置；侧栏 Timeless 标题右侧的图标切换整个应用的明暗主题。macOS 启动时读取系统主题，切换时同步页面、原生控件和窗口标题栏的外观。布局页使用真实 shadcn Card 展示 Flex 换行。

路由复用 `kit.HistoryCore` / `RouteViewCore`，采用三端一致的内存历史，支持前进、后退和菜单选中态；同一页面重复点击不会新增历史，后退后再导航会截断前进历史。各页面保持挂载，以保留计数、表单输入等状态；路由切换时关闭表单及示例浮层，并将内容滚动位置归零。当前不把内存路由同步到浏览器地址栏，刷新后回到基础组件页。原有 Web 文档站 `index.html` / `src/index.js` 保留。

## 使用浮层示例

启动 macOS 应用后，从左侧选择「浮层组件」。页面复用 `@timeless/timeless` 的 Modal、Popover、Tooltip、Drawer Primitive，以及 `@timeless/shadcn` 的真实 DropdownMenu / ContextMenu；内容使用 shadcn Button、Input、Label 和共享主题工具类。没有另写原生页面或 native 专用 CSS。旧版 shadcn Popover / Tooltip 的 Portal 定位链路仍未迁移。

| 组件 | 交互 | macOS 宿主行为 |
| --- | --- | --- |
| Modal | 编辑名称、校验、保存或取消 | 居中、背景遮罩、焦点进入与恢复、Tab 循环、Esc 与背景关闭 |
| Popover | 点击按钮切换、点击面板按钮关闭 | 跟随锚点、视口边缘翻转与限位、脱离滚动裁剪、外部点击与 Esc 关闭 |
| Tooltip | 悬停或聚焦按钮查看提示 | 不抢焦点、不拦截鼠标、移开与失焦关闭、Esc 关闭 |
| DropdownMenu | 点击或按方向键打开，选择操作、禁用项 | 跟随按钮、方向键 / Home / End 导航、Esc / 外部点击关闭并恢复焦点 |
| ContextMenu | 右键或 Shift+F10 打开，选择操作 | 按指针位置或键盘目标定位、边缘限位；「查看详情」打开 Drawer |
| Drawer | 打开右侧详情抽屉、关闭 | 贴合窗口边缘、全高、背景遮罩、Tab 焦点限制、Esc / 背景关闭 |

浮层状态和输入校验由 `pages/floating-model.js` 维护；`floating-view.js` 只绑定 Model 和渲染。切换路由关闭所有浮层，保留名称与操作结果；浮层内容继承明暗主题。AppKit 浮层解析百分比 `max-width`，按内容计算 `fit-content` 宽度；说明文字按可用宽度换行，按钮保留 `white-space: nowrap`。菜单共用 Primitive Popover，Drawer 由 Modal 组合；Drawer 的开关尚未包装 Transition。

macOS 浮层落点按当前窗口的 backing scale 对齐物理像素，避免触控板的小数坐标使菜单及文字整体模糊；窗口显示倍率变化时重新对齐。`SharedMenuTests` 用非整数右键坐标验证菜单和文字的像素位置，并覆盖明暗主题及键盘操作。

侧栏 SVG 图标的 `currentColor` 跟随菜单文字。样式层输出的八位十六进制颜色会转换为 AppKit SVG 解码器支持的 `rgba()`，固定颜色的 SVG 图形不受影响；像素测试覆盖明暗主题往返切换。

Web 入口使用相同页面，Modal 对应浏览器 dialog，Popover 和 Tooltip 使用浏览器 top layer。Tooltip 不转移焦点，关闭时会移除定位与关闭监听器。

验证生产入口的原生行为：

```bash
pnpm --filter ./apps/web-shadcn test:macos
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test --package-path packages/timeless-macos/native --filter SharedFloatingTests
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test --package-path packages/timeless-macos/native --filter 'SharedMenuTests|NativeIconTests'
```

## 过渡动画与最后一帧

左侧「过渡动画」参考 `src/pages/home/sections.feedback.js`，复用现有 `ui.Transition` 与 shadcn 的 `tt-animate-*` 样式，演示淡入淡出、底部 / 右侧滑入和缩放。状态由 `pages/transition-model.js` 维护。Transition 等收到自身的 `animationend` 后再卸载退场内容，300ms 动画不会被旧的 150ms 兜底计时器截断；切换路由会重置示例。

「消失并保持」直接在 View 上使用 `animation-fill-mode: forwards`，退场后保留最后一帧：内容透明，但节点和布局位置保留。切换主题或重新布局不会让它重新显示；「恢复显示」移除动画 class，恢复基础样式。`both` 同时保留延迟期间的首帧和结束后的末帧；`none` 在结束后恢复基础样式。最后一帧透明与 CSS `opacity: 0` 一样，不等同于 `display: none`。

样式编译器保留 CSS `@keyframes`，通用 native 样式层解析变量、动画时长、延迟、缓动和 fill mode；macOS 使用 Core Animation 播放透明度和二维平移 / 缩放 / 旋转，不修改 Yoga 布局。宿主回传 `animationstart` / `animationend`；快速反向切换会取消旧动画的结束通知，系统开启「减弱动态效果」或时长为零时立即完成。

```bash
pnpm --filter ./apps/web-shadcn test:macos
pnpm exec vitest run --silent --config vitest.platform.config.ts \
  packages/timeless-native/src/__tests__/transition.test.ts
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test --package-path packages/timeless-macos/native --filter 'NativeAnimationTests|SharedTransitionTests'
```

当前支持单个、单次关键帧动画；尚未覆盖多个动画叠加、无限循环、filter、布局属性动画，以及自动响应属性变化的通用 CSS `transition`。Windows 宿主已接入相同关键帧协议，详见 [Windows 覆盖范围](./README.windows.md)。

## 测试更多 shadcn 组件

「导航与折叠」「展示与反馈」参考 `src/pages/home/sections.nav.js`、`sections.general.js`、`sections.data.js` 和 `sections.feedback.js`，直接使用 `@timeless/shadcn` 导出。状态与按钮行为位于 `pages/components-model.js`，页面渲染位于 `pages/components-view.js`。

| 组件 | 验证范围 |
| --- | --- |
| Tabs | 内容替换、选中态、初始化后立即点击、方向键 / Home / End 切换与焦点、路由状态保留 |
| Accordion | 默认展开、单项互斥、多项同时展开、16px SVG 箭头方向、响应式主题 class、Button 键盘激活能力 |
| Steps | 主题圆圈、标题、连接线、完成标记、上一步 / 下一步、索引边界 |
| Badge | default / secondary / outline / destructive 四种变体与明暗主题 |
| Avatar | 无图片时的 S / M / L 兜底、32 / 40 / 48px 尺寸与圆角 |
| Separator | 横向 / 纵向尺寸、自定义属性、方向语义 |
| Alert | 默认与 destructive 样式、标题和描述 |
| Progress | Ref / Store 两种驱动、百分比宽度更新、0–100 边界、ARIA 数值、路由状态保留 |
| Skeleton | 卡片和文本占位尺寸、圆角、明暗主题；macOS 不播放 CSS pulse 动画 |

Avatar 本轮不依赖网络，未据此验证远程图片加载。Slider、Table、Menu、Dropdown Menu、Dialog、Sheet 等其余文档站组件不在本轮测试范围内。

普通文字由 AppKit 的 `NSTextFieldCell` 实际测量，避免 Tabs、Badge、Avatar 与步骤数字在紧凑布局中被裁切；空文字保持零行高。Badge 和 Alert 的默认边框只用于相应变体，避免覆盖透明或错误边框。

```bash
pnpm --filter ./apps/web-shadcn test:macos
pnpm exec vitest run --silent --config vitest.platform.config.ts \
  packages/timeless-native/src/__tests__/shadcn-components.test.ts
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test --package-path packages/timeless-macos/native --filter SharedComponentsTests
```

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

Native 在子树构建和事件处理结束后合并样式计算，避免逐层重复计算整个月历。macOS 滚动时只更新浮层位置，复用锚点和已计算的尺寸；日历这类没有内部滚动容器的非模态浮层会把滚轮交给锚点所在的 ScrollView，Select 则保留自身滚动。模态浮层仍阻止背景滚动。

macOS 尚未绘制 CSS 伪元素，因此日期区间中间的 `::before` 连续底色尚不完整，起止日期选中态可用。Windows C++ 宿主已接入共享浮层和系统文件窗口；Wine 测试与 Windows 实机验收的区别见 [Windows 说明](./README.windows.md)。

## 滚动与虚拟列表

「滚动与虚拟列表」页面（`/home/scroll`）包含双向 ScrollView 和一万条数据的 ListViewV2。支持跳到顶部、中间、末尾，以及切换 100 / 10000 条数据；Model 维护数据和滚动操作，View 直接使用现有 Primitive。

Primitive 没有名为 `VirtualList` 的导出，已有的虚拟列表接口为 `ListView` / `ListViewV2`。本次接入 `ListViewV2`，旧 `ListView` 的 native 映射未迁移。

- `ScrollView` 原已映射到 macOS `NSScrollView`；宿主补齐视口尺寸、程序滚动后的事件和真实边界读取。
- 原生滚动坐标只回传给 JS，程序滚动使用单独的请求。普通布局不夹回越界坐标，让 AppKit 完成弹性回弹；显式跳转或内容、视口尺寸改变时仍校正边界。
- `ListViewV2` 通过 native JS 适配传递数据与行工厂，macOS 宿主使用 `NSScrollView + NSTableView`。原生表格请求可见行，回收时销毁对应 Primitive 子树，不在应用中手动切片，也不另写虚拟滚动算法。
- 原生请求新行时使用共享 `batchNativeStyles`：行构建、挂接到父级和继承样式在同一批次完成，每个节点只计算一次 CSS。性能测试 `SharedVirtualListPerformanceTests` 在 release 构建中对比连续滚动、行创建与布局开销；计时结果包含测试运行循环，不代表真实触控板帧率。
- 支持响应式数据、显式 `itemHeight`（数值或函数）、gutter、底部留白及滚动/触底回调。当前不测量内容驱动的自动行高，不支持 `externalScroll`（显式报错）。`size` / `buffer` 的预取范围由 AppKit 自行管理。
- macOS 和 Windows 均已接入 ListViewV2；Windows 按共享 Model 的可见范围创建和释放行。Web 使用原有 DOMListViewV2。

### 复测交互与滚动耗时

macOS 将一次指针或焦点事件中的样式更新合并计算，复用规则、继承值、变量和视口均未改变的 CSS 结果。隐藏页面不参与原生子树解析和布局；首次显示时创建原生内容，再次隐藏时保留原生控件和页面状态。

局部失效是 `@timeless/timeless-native` 的默认能力，所有页面和组件共用，不需要应用提供优化参数。样式表注册时索引 class、属性、状态和结构依赖；更新时比较修改前后的节点，定位相关祖先、兄弟和目标节点，批次内按父子顺序合并更新。未被选择器引用的属性不计算 CSS；背景、边框和尺寸等不影响继承的变化仅更新自身，继承值、CSS 变量或隐藏内容重新显示时才继续传播。主题和样式表替换按实际影响更新，保留全局样式的正确性。

`style-invalidation.test.ts` 使用同一应用内 40 个无关页面验证更新隔离，覆盖属性和 class 删除、精确 class 属性选择器、peer、`:has()`、`:focus-within`、选中状态、增删移动、文本空值、继承和 CSS 变量。100 行容器的背景、边框或 padding 更新只计算容器自身一次；构建和 HMR 继续执行必要的完整样式计算。

文字更新使用 Yoga 实际调用过的测量约束重新测量：只有影响布局的尺寸均未改变时才跳过整页布局。这样滚动位置文字的更新不再反复重排整个页面，而换行、空文字和内容决定宽度的 Flex 布局仍会更新。

首次滚动还需避免挂载结束后的重复工作：完整渲染和 HMR 的显式布局会取消已经被当前视图覆盖的旧布局任务，原生创建期间产生的新更新继续保留。macOS 在最外层交互批次结束后完成待处理布局，避免切页更新拖到首次滚动；浮层仅在打开状态或模态状态改变时请求布局，Tooltip 挂载时重复设置关闭状态不再重排整页。原生布局回调仅在视口尺寸变化时运行 Yoga，鼠标跟踪区域通过 `inVisibleRect` 自动跟随滚动和缩放并复用同一个区域。`FirstScrollTests` 在可见窗口切换页面后发送首次滚轮事件，验证实际位移、整页解析次数和窗口缩放。

Table 的触控板首滚还覆盖指针首次进入表格的路径：AppKit 会分别通知行、表体、表格及页面祖先进入悬停状态。样式运行时预先索引每个状态可被哪些选择器观察，忽略被动容器的无效样式刷新，同时保留状态供之后的 class 变化使用。行悬停及 `:is` / `:where` / `:not`、group / peer、`:has`、`:focus-within` 继续生效。独立客户端经过系统事件队列的前后对照中，滚动事件排队延迟从约 1.27 秒降至 1–4 ms；该数字衡量事件延迟，不代表屏幕帧率。`TableScrollPerformanceTests` 验证真实示例的祖先进入状态不计算整棵表格、行悬停只更新该行，并验证滚动位移。

分页复用 Model 中的 20 个行位置及单元格 Ref，切页只更新内容。禁用状态的关系选择器检查实际拥有者，普通分页按钮不会触发 `peer-disabled` 引起的整页重算。`TableScrollPerformanceTests` 验证页码、左右按钮和首尾页切换保持全部表格 NSView 的身份，每次最多计算 12 个分页节点、完成一次布局；重复点击当前页不更新视图。同机 Release 原生回归的点击完成耗时从约 420–440ms 降至 25–38ms，重复点击当前页约 0.3ms，不代表屏幕帧率。

2026-10-23 同机 Release 测试的一次优化前后对比：

| 场景 | 优化前 | 优化后 |
| --- | --- | --- |
| 默认按钮点击完成 | 56.9 ms | 26.7 ms |
| 切换到通用组件页完成 | 130.0 ms | 85.5 ms |
| 普通容器连续滚动 80 次 | 729.9 ms，40 次整页布局 | 111.2 ms，0 次整页布局 |
| 虚拟列表连续滚动 80 次 | 829.3 ms，40 次整页布局 | 200.4 ms，1 次整页布局 |

```bash
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test -c release --package-path packages/timeless-macos/native \
  --filter 'ClickLatencyTests|SharedVirtualListPerformanceTests|NativeUpdateTests|FirstScrollTests|TableScrollPerformanceTests'
```

这些数字包含测试运行循环，存在运行间波动，不代表屏幕帧率，也未与 SwiftUI 版本做同口径计时。回归测试约束整页布局次数和新增行数量，不依赖机器速度断言耗时阈值。

```bash
pnpm --filter ./apps/web-shadcn test:macos
TIMELESS_MACOS_TEST_BUNDLE="$PWD/apps/web-shadcn/dist/macos/app.js" \
  swift test --package-path packages/timeless-macos/native --filter SharedVirtualListTests
```

## 样式链路

```text
共享 View → shadcn Button 的 class
  → 原始 shadcn CSS + 共享工具类 CSS
  → Web：浏览器计算、绘制
  → native：通用 CSS 计算 → Yoga 布局 + 宿主绘制
```

`timelessWebStyles` 将普通 CSS 导入转为规则注册，不为某个工具类写特殊映射。运行时处理选择器、状态、CSS 变量和继承，计算出颜色、尺寸、阴影等属性；macOS 和 Windows 按属性绘制。`box-shadow` 不进入 Yoga 尺寸计算。

Button 焦点环遵循包内 `focus-visible:ring-3` / `ring-ring/50`，鼠标聚焦与键盘聚焦按 `focus-visible` 区分。Input 由共享 VM 的 `focus` 状态添加 `ring-3`；macOS 在获得焦点时立即发送事件，无需等待输入文字。Button / View 与原生文本输入框共用 CSS 外阴影和 outline 绘制，并关闭 AppKit 自带的焦点环，装饰不改变布局尺寸。当前 CSS 的 ring 保持零模糊和 3px 扩展值，不增加平台补偿；修改包内 CSS 并重新构建后，三端消费同一份变更。

目前验证了该 Button 页所需的选择器与状态、`var()` / `@property`、`calc()`、常见相对长度、OKLCH / 颜色混合和外阴影，以及 Transition 使用的单次透明度和二维变换关键帧。尚未实现完整浏览器 CSS（例如无限循环动画、filter 动画、伪元素绘制、完整媒体查询、inset 阴影）；后续能力补到通用样式层或宿主，不增加平台专用应用样式。

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
