# Swift + SwiftUI Todo App

## 运行方式

1. 在 Xcode 中打开 `TodoApp.swift`
2. 运行项目 (⌘R)

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## SwiftUI 可用组件

### 文本显示

| 组件                           | 说明              |
| ------------------------------ | ----------------- |
| **Text**                       | 文本显示          |
| **Label**                      | 标签（图标+文本） |
| **TextField**                  | 单行文本输入      |
| **TextField with SecureField** | 安全文本输入      |
| **TextEditor**                 | 多行文本编辑器    |
| **AttributedString**           | 富文本字符串      |

### 按钮控件

| 组件                   | 说明       |
| ---------------------- | ---------- |
| **Button**             | 普通按钮   |
| **plain Button**       | 纯文本按钮 |
| **Link**               | 链接       |
| **Menu**               | 菜单按钮   |
| **confirmationDialog** | 确认对话框 |
| **ActionSheet**        | 操作表     |

### 开关/切换

| 组件                        | 说明       |
| --------------------------- | ---------- |
| **Toggle**                  | 开关       |
| **Checkbox** (using Toggle) | 复选框     |
| **RadioButtonGroup**        | 单选按钮组 |

### 选择控件

| 组件                     | 说明         |
| ------------------------ | ------------ |
| **Picker**               | 选择器       |
| **DatePicker**           | 日期选择器   |
| **DatePicker (Multi)**   | 多日期选择器 |
| **TimePicker**           | 时间选择器   |
| **ColorPicker**          | 颜色选择器   |
| **Slider**               | 滑块         |
| **Stepper**              | 步进器       |
| **SegmentedPickerStyle** | 分段选择器   |

### 列表/滚动

| 组件           | 说明           |
| -------------- | -------------- |
| **List**       | 列表视图       |
| **ForEach**    | 循环渲染       |
| **LazyVStack** | 懒加载垂直堆叠 |
| **LazyHStack** | 懒加载水平堆叠 |
| **LazyVGrid**  | 懒加载垂直网格 |
| **LazyHGrid**  | 懒加载水平网格 |
| **ScrollView** | 滚动视图       |
| **LazyColumn** | 懒加载列       |
| **LazyRow**    | 懒加载行       |

### 导航

| 组件                    | 说明         |
| ----------------------- | ------------ |
| **NavigationStack**     | 导航堆栈     |
| **NavigationSplitView** | 导航分割视图 |
| **NavigationLink**      | 导航链接     |
| **TabView**             | 标签页视图   |
| **ToolbarItem**         | 工具栏项     |
| **navigationBarTitle**  | 导航栏标题   |
| **editButton**          | 编辑按钮     |

### 布局容器

| 组件             | 说明         |
| ---------------- | ------------ |
| **VStack**       | 垂直堆叠     |
| **HStack**       | 水平堆叠     |
| **ZStack**       | 深度堆叠     |
| **Group**        | 组           |
| **Section**      | 分组         |
| **Spacer**       | 弹性空白     |
| **Divider**      | 分隔线       |
| **Background**   | 背景         |
| **Overlay**      | 覆盖层       |
| **SafeAreaView** | 安全区域视图 |

### 卡片/容器

| 组件                       | 说明            |
| -------------------------- | --------------- |
| **Card**                   | 卡片（iOS 16+） |
| **List**                   | 列表容器        |
| **GroupBox**               | 分组框          |
| **ContainerRelativeShape** | 容器相对形状    |
| **roundedRectangle**       | 圆角矩形        |

### 进度指示器

| 组件                          | 说明         |
| ----------------------------- | ------------ |
| **ProgressView**              | 进度视图     |
| **ProgressView with value**   | 带值进度条   |
| **CircularProgressViewStyle** | 圆形进度样式 |
| **LinearProgressViewStyle**   | 线性进度样式 |
| **Gauge**                     | 仪表盘       |

### 对话框/弹窗

| 组件                   | 说明       |
| ---------------------- | ---------- |
| **alert**              | 警告对话框 |
| **sheet**              | 底部表单   |
| **fullScreenCover**    | 全屏覆盖   |
| **confirmationDialog** | 确认对话框 |
| **Popover**            | 弹出框     |

### 图像/图标

| 组件           | 说明        |
| -------------- | ----------- |
| **Image**      | 图片        |
| **AsyncImage** | 异步图片    |
| **Label**      | 标签        |
| **SF Symbols** | SF 符号图标 |

### 地图

| 组件           | 说明     |
| -------------- | -------- |
| **Map**        | 地图视图 |
| **MapContent** | 地图内容 |

### 图表

| 组件          | 说明     |
| ------------- | -------- |
| **Chart**     | 图表     |
| **BarMark**   | 柱状标记 |
| **LineMark**  | 线形标记 |
| **PointMark** | 点形标记 |
| **AreaMark**  | 区域标记 |
| **RuleMark**  | 规则标记 |

### 状态管理

| 组件                   | 说明     |
| ---------------------- | -------- |
| **@State**             | 状态变量 |
| **@Binding**           | 绑定属性 |
| **@StateObject**       | 状态对象 |
| **@ObservedObject**    | 观察对象 |
| **@EnvironmentObject** | 环境对象 |
| **@Environment**       | 环境变量 |
| **@Published**         | 发布属性 |

### 手势/交互

| 组件                       | 说明       |
| -------------------------- | ---------- |
| **onTapGesture**           | 点击手势   |
| **onLongPressGesture**     | 长按手势   |
| **onDragGesture**          | 拖动手势   |
| **onMagnificationGesture** | 放大手势   |
| **onRotationGesture**      | 旋转手势   |
| **SimultaneousGesture**    | 同时手势   |
| **SwipeActions**           | 滑动操作   |
| **contextMenu**            | 上下文菜单 |

### 动画/过渡

| 组件                      | 说明         |
| ------------------------- | ------------ |
| **withAnimation**         | 带动画       |
| **animation**             | 动画修饰符   |
| **transition**            | 过渡效果     |
| **matchedGeometryEffect** | 匹配几何效果 |
| **repeat**                | 重复动画     |
| **delay**                 | 延迟         |

### 表单

| 组件           | 说明       |
| -------------- | ---------- |
| **Form**       | 表单容器   |
| **TextField**  | 文本输入   |
| **Picker**     | 选择器     |
| **Toggle**     | 开关       |
| **Stepper**    | 步进器     |
| **DatePicker** | 日期选择器 |
| **Section**    | 表单分组   |

### 其他组件

| 组件             | 说明       |
| ---------------- | ---------- |
| **EmptyView**    | 空视图     |
| **AnyView**      | 任意视图   |
| **TupleView**    | 元组视图   |
| **Optional**     | 可选视图   |
| **ViewThatFits** | 适应视图   |
| **ViewBuilder**  | 视图构建器 |

## 示例代码

### Text 文本

```swift
Text("Hello, World!")
    .font(.largeTitle)
    .foregroundColor(.blue)
    .padding()
```

### TextField 文本输入

```swift
TextField("Enter text", text: $inputText)
    .textFieldStyle(.roundedBorder)
```

### Button 按钮

```swift
Button {
    action()
} label: {
    Image(systemName: "plus.circle.fill")
}
```

### Toggle 开关

```swift
Toggle("Enable", isOn: $isEnabled)
```

### List 列表

```swift
List {
    ForEach(items) { item in
        Text(item.name)
    }
}
```

### VStack / HStack 布局

```swift
VStack(spacing: 16) {
    HStack {
        Text("Label")
        Spacer()
        Toggle("", isOn: $value)
    }
}
```

### NavigationStack 导航

```swift
NavigationStack {
    List(items) { item in
        NavigationLink(value: item) {
            Text(item.name)
        }
    }
    .navigationDestination(for: Item.self) { item in
        DetailView(item: item)
    }
}
```

### TabView 标签页

```swift
TabView {
    HomeView()
        .tabItem { Label("Home", systemImage: "house") }
    SettingsView()
        .tabItem { Label("Settings", systemImage: "gear") }
}
```

### @State 状态管理

```swift
@State private var count = 0
@State private var text = ""

struct ContentView: View {
    @State private var todos: [TodoItem] = []
}
```

### onTapGesture 手势

```swift
Text("Tap me")
    .onTapGesture {
        print("Tapped!")
    }
```

## 可选视图（Conditional View）

SwiftUI 提供多种方式根据条件显示或隐藏视图。

### 使用 if 语句

```swift
struct ContentView: View {
    @State private var showDetail = false

    var body: some View {
        VStack {
            if showDetail {
                DetailView()
            }
        }
    }
}
```

### 使用 if-else 语句

```swift
var body: some View {
    if isLoggedIn {
        HomeView()
    } else {
        LoginView()
    }
}
```

### 使用 if-let 可选绑定

```swift
var body: some View {
    if let user = currentUser {
        Text("Welcome, \(user.name)")
    }
}
```

### 使用 ternary conditional operator

```swift
var body: some View {
    HStack {
        Image(systemName: isEnabled ? "checkmark.circle.fill" : "circle")
        Text(isEnabled ? "Enabled" : "Disabled")
    }
}
```

### ViewThatFits 自动适应

`ViewThatFits` 会尝试按顺序显示子视图，直到找到第一个能完全适配的视图。

```swift
ViewThatFits(in: .horizontal) {
    HStack {
        Image(systemName: "star.fill")
        Text("Long Label Text")
    }
    Image(systemName: "star.fill")
}
```

### Group 组合多个条件视图

```swift
Group {
    if isLoading {
        ProgressView()
    } else if let error = errorMessage {
        Text(error)
            .foregroundColor(.red)
    } else {
        ContentView()
    }
}
```

### @ViewBuilder 自定义构建器

```swift
@ViewBuilder
func buildContent() -> some View {
    if isEmpty {
        EmptyStateView()
    } else {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### Optional 视图

直接使用 Optional 类型的视图：

```swift
var body: some View {
    VStack {
        optionalView  // Optional<some View>
    }
}

// 或者显式解包
var body: some View {
    VStack {
        optionalView ?? Text("Default")
    }
}
```

### 视图装饰器组合

```swift
var body: some View {
    VStack {
        if shouldShow {
            ContentView()
                .transition(.opacity)
                .animation(.easeInOut, value: shouldShow)
        }
    }
}
```

### 懒加载可选视图

使用 `lazy` 延迟视图创建：

```swift
struct ParentView: View {
    @State private var showExpensive = false

    var body: some View {
        VStack {
            Button("Toggle") {
                showExpensive.toggle()
            }

            if showExpensive {
                ExpensiveView()  // 按需创建
            }
        }
    }
}
```

### 动态视图类型

使用 `AnyView` 包装不同类型的视图：

```swift
struct DynamicView: View {
    @State private var viewType: ViewType = .text

    var body: some View {
        Group {
            switch viewType {
            case .text:
                Text("Hello")
            case .image:
                Image(systemName: "star")
            case .button:
                Button("Click") {}
            }
        }
    }
}
```

### 条件修饰符

使用 `.if` 扩展方法按条件应用修饰符：

```swift
extension View {
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

// 使用
Text("Title")
    .if(isBold) { $0.bold() }
    .if(isHighlighted) { $0.background(.yellow) }
```
