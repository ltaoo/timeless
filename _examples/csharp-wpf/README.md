# C# + WPF Todo App

## 运行方式

```bash
cd csharp-wpf
dotnet restore
dotnet run
```

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## WPF 可用组件

### 布局控件

| 组件                       | 说明           |
| -------------------------- | -------------- |
| **Border**                 | 边框装饰       |
| **BulletDecorator**        | 项目符号装饰   |
| **Canvas**                 | 画布定位       |
| **DockPanel**              | 停靠面板       |
| **Expander**               | 可展开面板     |
| **Grid**                   | 网格布局       |
| **GridSplitter**           | 网格分割器     |
| **GroupBox**               | 分组框         |
| **Panel**                  | 基础面板       |
| **ResizeGrip**             | 调整大小手柄   |
| **ScrollBar**              | 滚动条         |
| **ScrollViewer**           | 滚动查看器     |
| **StackPanel**             | 堆叠面板       |
| **Thumb**                  | 拖动拇指       |
| **Viewbox**                | 视图框         |
| **VirtualizingStackPanel** | 虚拟化堆叠面板 |
| **Window**                 | 窗口           |
| **WrapPanel**              | 自动换行面板   |

### 按钮控件

| 组件             | 说明         |
| ---------------- | ------------ |
| **Button**       | 普通按钮     |
| **RepeatButton** | 重复点击按钮 |

### 数据显示控件

| 组件         | 说明     |
| ------------ | -------- |
| **DataGrid** | 数据表格 |
| **ListView** | 列表视图 |
| **TreeView** | 树形视图 |

### 日期显示和选择

| 组件           | 说明       |
| -------------- | ---------- |
| **Calendar**   | 日历       |
| **DatePicker** | 日期选择器 |

### 菜单控件

| 组件            | 说明     |
| --------------- | -------- |
| **ContextMenu** | 右键菜单 |
| **Menu**        | 菜单     |
| **ToolBar**     | 工具栏   |

### 选择控件

| 组件            | 说明       |
| --------------- | ---------- |
| **CheckBox**    | 复选框     |
| **ComboBox**    | 下拉选择框 |
| **ListBox**     | 列表框     |
| **RadioButton** | 单选按钮   |
| **Slider**      | 滑块       |

### 导航控件

| 组件                 | 说明       |
| -------------------- | ---------- |
| **Frame**            | 框架       |
| **Hyperlink**        | 超链接     |
| **Page**             | 页面       |
| **NavigationWindow** | 导航窗口   |
| **TabControl**       | 标签页控件 |

### 对话框控件

| 组件            | 说明     |
| --------------- | -------- |
| **AccessText**  | 访问文本 |
| **Label**       | 标签     |
| **Popup**       | 弹出框   |
| **ProgressBar** | 进度条   |
| **StatusBar**   | 状态栏   |
| **TextBlock**   | 文本块   |
| **ToolTip**     | 工具提示 |

### 文档控件

| 组件                         | 说明             |
| ---------------------------- | ---------------- |
| **DocumentViewer**           | 文档查看器       |
| **FlowDocumentPageViewer**   | 流文档页面查看器 |
| **FlowDocumentReader**       | 流文档阅读器     |
| **FlowDocumentScrollViewer** | 流文档滚动查看器 |
| **StickyNoteControl**        | 便签控件         |

### 输入控件

| 组件            | 说明       |
| --------------- | ---------- |
| **TextBox**     | 文本输入框 |
| **RichTextBox** | 富文本框   |
| **PasswordBox** | 密码框     |

### 媒体控件

| 组件             | 说明       |
| ---------------- | ---------- |
| **InkCanvas**    | 墨迹画布   |
| **InkPresenter** | 墨迹呈现器 |

### 其他控件

| 组件             | 说明     |
| ---------------- | -------- |
| **Image**        | 图片     |
| **MediaElement** | 媒体元素 |
| **Shape**        | 形状     |
| **Path**         | 路径     |

## 示例代码

### TextBox 文本输入

```xml
<TextBox Width="200" VerticalContentAlignment="Center"/>
```

### Button 按钮

```xml
<Button Content="Click Me" Width="100" Click="Button_Click"/>
```

### ListBox 列表

```xml
<ListBox x:Name="MyListBox"/>
```

### CheckBox 复选框

```xml
<CheckBox Content="Remember me" IsChecked="False"/>
```

### ComboBox 下拉选择

```xml
<ComboBox Width="100" SelectedIndex="0">
    <ComboBoxItem Content="Option 1"/>
    <ComboBoxItem Content="Option 2"/>
</ComboBox>
```

### StackPanel 堆叠布局

```xml
<StackPanel Orientation="Horizontal">
    <TextBox Width="150"/>
    <Button Content="Add" Width="60"/>
</StackPanel>
```

### Grid 网格布局

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto"/>
        <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>
</Grid>
```

### 后端代码操作

```csharp
// 获取输入
var text = InputTextBox.Text;

// 添加到列表
_todos.Add(new TodoItem { Title = text });

// 列表刷新
MyListBox.Items.Refresh();

// 设置选中项
MyListBox.SelectedIndex = 0;
```
