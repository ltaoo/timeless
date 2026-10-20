# Windows 原生示例

通过 QuickJS、Yoga、Win32 和 Direct2D / DirectWrite 运行 Timeless 组件与自定义 class 样式。

完整的 Windows 构建、启动、热更新与测试步骤见 [timeless-windows 使用说明](../../packages/timeless-windows/README.md)。应用的 Model / View 在 [src/index.js](./src/index.js)，样式在 [src/styles.native.css](./src/styles.native.css)。

示例包含计数器、输入框、动态 / 分组 / 禁用选项的 Select、Checkbox、Radio，以及嵌套 ScrollView 的双轴滚动、滚轮和“滚到底部”。所有状态与操作由 Model 维护。
