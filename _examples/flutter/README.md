# Flutter Todo App

## 运行方式

1. 创建 Flutter 项目: `flutter create todo_app`
2. 将 `todo_app.dart` 复制到 `lib/`
3. 运行项目: `flutter run`

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## Flutter Material 可用组件

### 应用结构组件

| 组件                    | 说明                  |
| ----------------------- | --------------------- |
| **MaterialApp**         | Material 设计应用入口 |
| **CupertinoApp**        | iOS 风格应用入口      |
| **Scaffold**            | 页面脚手架            |
| **AppBar**              | 顶部应用栏            |
| **BottomAppBar**        | 底部应用栏            |
| **Drawer**              | 侧边抽屉导航          |
| **NavigationDrawer**    | 导航抽屉              |
| **BottomNavigationBar** | 底部导航栏            |
| **NavigationBar**       | 导航栏                |
| **TabBar**              | 标签栏                |
| **TabBarView**          | 标签页内容            |

### 布局组件

| 组件             | 说明                                |
| ---------------- | ----------------------------------- |
| **Container**    | 容器（padding、margin、decoration） |
| **Row**          | 水平布局                            |
| **Column**       | 垂直布局                            |
| **Stack**        | 层叠布局                            |
| **IndexedStack** | 索引堆叠                            |
| **GridView**     | 网格视图                            |
| **ListView**     | 列表视图                            |
| **Wrap**         | 自动换行                            |
| **Flow**         | 流式布局                            |
| **Table**        | 表格                                |
| **SliverAppBar** | 滑动应用栏                          |
| **SliverList**   | 滑动列表                            |
| **SliverGrid**   | 滑动网格                            |

### 文本组件

| 组件               | 说明         |
| ------------------ | ------------ |
| **Text**           | 文本显示     |
| **RichText**       | 富文本       |
| **TextField**      | 文本输入框   |
| **TextFormField**  | 表单文本输入 |
| **EditableText**   | 可编辑文本   |
| **SelectableText** | 可选择文本   |

### 按钮组件

| 组件                              | 说明         |
| --------------------------------- | ------------ |
| **ElevatedButton**                | 凸起按钮     |
| **FilledButton**                  | 填充按钮     |
| **FilledTonalButton**             | 音调按钮     |
| **OutlinedButton**                | 轮廓按钮     |
| **TextButton**                    | 文本按钮     |
| **IconButton**                    | 图标按钮     |
| **FloatingActionButton**          | 浮动操作按钮 |
| **FloatingActionButton.extended** | 扩展浮动按钮 |
| **SegmentedButton**               | 分段按钮     |

### 选择组件

| 组件                 | 说明         |
| -------------------- | ------------ |
| **Checkbox**         | 复选框       |
| **Switch**           | 开关         |
| **Radio**            | 单选按钮     |
| **RadioListTile**    | 单选列表项   |
| **Slider**           | 滑块         |
| **RangeSlider**      | 范围滑块     |
| **SwitchListTile**   | 开关列表项   |
| **CheckboxListTile** | 复选框列表项 |

### 输入组件

| 组件                        | 说明             |
| --------------------------- | ---------------- |
| **TextField**               | 单行文本输入     |
| **TextFormField**           | 表单输入         |
| **DropdownButton**          | 下拉按钮         |
| **DropdownButtonFormField** | 表单下拉按钮     |
| **DatePicker**              | 日期选择器       |
| **TimePicker**              | 时间选择器       |
| **CupertinoDatePicker**     | iOS 日期选择器   |
| **CupertinoTimerPicker**    | iOS 计时器选择器 |

### 列表组件

| 组件                   | 说明         |
| ---------------------- | ------------ |
| **ListTile**           | 列表项       |
| **ListView**           | 列表视图     |
| **ListView.builder**   | 动态列表     |
| **ListView.separated** | 带分隔符列表 |
| **GridView**           | 网格视图     |
| **GridView.builder**   | 动态网格     |
| **GridView.count**     | 定数网格     |
| **GridView.extent**    | 最大宽度网格 |
| **SliverList**         | 滑动列表     |
| **SliverGrid**         | 滑动网格     |

### 卡片组件

| 组件                   | 说明           |
| ---------------------- | -------------- |
| **Card**               | 卡片           |
| **ExpansionPanel**     | 可展开面板     |
| **ExpansionTile**      | 可展开列表项   |
| **ExpansionPanelList** | 可展开面板列表 |

### 对话框组件

| 组件                     | 说明             |
| ------------------------ | ---------------- |
| **AlertDialog**          | 警告对话框       |
| **SimpleDialog**         | 简单对话框       |
| **ConfirmationDialog**   | 确认对话框       |
| **BottomSheet**          | 底部表单         |
| **ModalBottomSheet**     | 模态底部表单     |
| **ShowModalBottomSheet** | 显示模态底部表单 |
| **SnackBar**             | 消息条           |
| **CupertinoAlertDialog** | iOS 警告对话框   |

### 进度指示器

| 组件                           | 说明           |
| ------------------------------ | -------------- |
| **LinearProgressIndicator**    | 线性进度条     |
| **CircularProgressIndicator**  | 圆形进度条     |
| **RefreshProgressIndicator**   | 刷新进度指示器 |
| **CupertinoActivityIndicator** | iOS 活动指示器 |

### 装饰组件

| 组件                | 说明       |
| ------------------- | ---------- |
| **Divider**         | 分隔线     |
| **VerticalDivider** | 垂直分隔线 |
| **Chip**            | 标签       |
| **ActionChip**      | 操作标签   |
| **FilterChip**      | 筛选标签   |
| **InputChip**       | 输入标签   |
| **ChoiceChip**      | 选择标签   |
| **Badge**           | 徽章       |

### 导航组件

| 组件                      | 说明       |
| ------------------------- | ---------- |
| **Navigator**             | 导航器     |
| **NavigationStack**       | 导航堆栈   |
| **NavigationDestination** | 导航目的地 |
| **NavigationRail**        | 导航轨道   |
| **NavigationBar**         | 导航栏     |

### 其他组件

| 组件                  | 说明             |
| --------------------- | ---------------- |
| **Image**             | 图片             |
| **Icon**              | 图标             |
| **CircleAvatar**      | 圆形头像         |
| **Tooltip**           | 工具提示         |
| **AboutDialog**       | 关于对话框       |
| **WebView**           | 网页视图         |
| **Hero**              | 英雄动画         |
| **Draggable**         | 可拖动组件       |
| **Dismissible**       | 可滑出组件       |
| **AnimatedContainer** | 动画容器         |
| **AnimatedCrossFade** | 动画交叉淡入淡出 |
| **FutureBuilder**     | 异步构建器       |
| **StreamBuilder**     | 流构建器         |

## 示例代码

### TextField 文本输入

```dart
TextField(
  controller: _controller,
  decoration: InputDecoration(
    hintText: 'Enter text',
    border: OutlineInputBorder(),
  ),
)
```

### ElevatedButton 按钮

```dart
ElevatedButton(
  onPressed: () => print('Pressed'),
  child: Icon(Icons.add),
)
```

### Checkbox 复选框

```dart
Checkbox(
  value: isChecked,
  onChanged: (value) => setState(() => isChecked = value!),
)
```

### ListView.builder 列表

```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(
    title: Text(items[index]),
  ),
)
```

### Row & Column 布局

```dart
Row(
  children: [
    Icon(Icons.star),
    SizedBox(width: 8),
    Text('Label'),
  ],
)

Column(
  children: [
    Text('Title'),
    Text('Subtitle'),
  ],
)
```

### Card 卡片

```dart
Card(
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Text('Card Content'),
  ),
)
```

### GridView 网格

```dart
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
  ),
  itemBuilder: (context, index) => Card(child: Center(child: Text('$index'))),
)
```
