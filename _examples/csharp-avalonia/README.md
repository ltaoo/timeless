# C# + Avalonia Todo App

## 运行方式

```bash
cd csharp-avalonia
dotnet restore
dotnet run
```

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## Avalonia 可用组件

### 文本控件

| 组件                    | 说明                |
| ----------------------- | ------------------- |
| **TextBox**             | 单行/多行文本输入框 |
| **TextBlock**           | 只读文本显示        |
| **SelectableTextBlock** | 可选择的只读文本    |

### 按钮控件

| 组件             | 说明         |
| ---------------- | ------------ |
| **Button**       | 普通按钮     |
| **RepeatButton** | 重复点击按钮 |
| **RadioButton**  | 单选按钮     |
| **ToggleButton** | 开关按钮     |
| **PathIcon**     | 矢量图标     |

### 选择控件

| 组件             | 说明       |
| ---------------- | ---------- |
| **CheckBox**     | 复选框     |
| **ComboBox**     | 下拉选择框 |
| **ListBox**      | 列表选择框 |
| **RadioButton**  | 单选按钮   |
| **Slider**       | 滑块       |
| **ToggleSwitch** | 开关       |

### 列表控件

| 组件              | 说明     |
| ----------------- | -------- |
| **ListBox**       | 列表容器 |
| **TreeView**      | 树形列表 |
| **DataGrid**      | 数据表格 |
| **ItemsControl**  | 项容器   |
| **ItemsRepeater** | 重复项   |
| **ListItem**      | 列表项   |

### 布局控件

| 组件              | 说明                  |
| ----------------- | --------------------- |
| **Panel**         | 基础面板              |
| **StackPanel**    | 堆叠面板（水平/垂直） |
| **WrapPanel**     | 自动换行面板          |
| **DockPanel**     | 停靠面板              |
| **Grid**          | 网格布局              |
| **Canvas**        | 画布定位              |
| **Border**        | 边框装饰              |
| **ScrollViewer**  | 滚动容器              |
| **Expander**      | 可展开面板            |
| **RelativePanel** | 相对定位面板          |
| **UniformGrid**   | 均匀网格              |
| **SplitView**     | 分割视图              |

### 导航控件

| 组件           | 说明     |
| -------------- | -------- |
| **TabControl** | 标签页   |
| **TabStrip**   | 标签条   |
| **Carousel**   | 轮播组件 |

### 输入控件

| 组件                | 说明           |
| ------------------- | -------------- |
| **AutoCompleteBox** | 自动完成输入框 |
| **MaskedTextBox**   | 掩码文本框     |
| **NumericUpDown**   | 数字输入       |

### 日期/时间控件

| 组件           | 说明       |
| -------------- | ---------- |
| **Calendar**   | 日历       |
| **DatePicker** | 日期选择器 |
| **TimePicker** | 时间选择器 |

### 菜单控件

| 组件            | 说明     |
| --------------- | -------- |
| **Menu**        | 菜单     |
| **MenuFlyout**  | 弹出菜单 |
| **ContextMenu** | 右键菜单 |
| **NativeMenu**  | 原生菜单 |

### 对话框控件

| 组件               | 说明           |
| ------------------ | -------------- |
| **OpenFileDialog** | 打开文件对话框 |
| **SaveFileDialog** | 保存文件对话框 |
| **Window**         | 窗口           |
| **Flyout**         | 弹出框         |
| **Popup**          | 弹出层         |
| **ToolTip**        | 工具提示       |
| **TrayIcon**       | 系统托盘图标   |

### 进度指示器

| 组件                 | 说明     |
| -------------------- | -------- |
| **ProgressBar**      | 进度条   |
| **RefreshContainer** | 刷新容器 |

### 其他控件

| 组件               | 说明           |
| ------------------ | -------------- |
| **Image**          | 图片显示       |
| **DrawingImage**   | 绘图图像       |
| **Label**          | 标签           |
| **Separator**      | 分隔线         |
| **MarkdownRENDER** | Markdown渲染   |
| **WebView**        | 网页视图       |
| **TreeDataGrid**   | 树形数据表格   |
| **ColorPicker**    | 颜色选择器     |
| **UserControl**    | 自定义用户控件 |

## 示例代码

### TextBox 文本输入

```csharp
new TextBox
{
    Watermark = "Enter text...",
    Width = 200
};
```

### Button 按钮

```csharp
new Button
{
    Content = "Click Me",
    Width = 100
};
```

### ListBox 列表

```csharp
new ListBox
{
    ItemsSource = dataList,
    SelectedIndex = 0
};
```

### CheckBox 复选框

```csharp
new CheckBox
{
    IsChecked = false,
    Content = "Remember me"
};
```

### StackPanel 堆叠布局

```csharp
new StackPanel
{
    Orientation = Orientation.Horizontal,
    Spacing = 8
};
```

### Grid 网格布局

```csharp
new Grid
{
    ColumnDefinitions = new ColumnDefinitions("Auto, *"),
    RowDefinitions = new RowDefinitions("Auto, *")
};
```
