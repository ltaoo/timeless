# HarmonyOS ArkTS Todo App

## 运行方式

1. 在 DevEco Studio 中创建新项目
2. 将 `Index.ets` 作为入口页面使用
3. 运行项目

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示删除按钮，点击移除 todo

## ArkTS 可用组件

### 基础组件

| 组件       | 说明     |
| ---------- | -------- |
| **Text**   | 文本显示 |
| **Span**   | 内联文本 |
| **Image**  | 图片显示 |
| **Symbol** | 符号图标 |
| **Blank**  | 空白填充 |

### 输入组件

| 组件          | 说明         |
| ------------- | ------------ |
| **TextInput** | 单行文本输入 |
| **TextArea**  | 多行文本输入 |
| **Search**    | 搜索框       |
| **TextField** | 文本字段     |

### 按钮组件

| 组件              | 说明     |
| ----------------- | -------- |
| **Button**        | 按钮     |
| **Radio**         | 单选按钮 |
| **Checkbox**      | 复选框   |
| **CheckboxGroup** | 复选框组 |
| **Toggle**        | 切换按钮 |
| **Switch**        | 开关     |

### 选择器组件

| 组件           | 说明       |
| -------------- | ---------- |
| **Select**     | 下拉选择器 |
| **Picker**     | 选择器基类 |
| **DatePicker** | 日期选择器 |
| **TimePicker** | 时间选择器 |
| **TextPicker** | 文本选择器 |

### 列表组件

| 组件              | 说明       |
| ----------------- | ---------- |
| **List**          | 列表容器   |
| **ListItem**      | 列表项     |
| **ListItemGroup** | 列表项分组 |
| **ForEach**       | 循环渲染   |

### 布局组件

| 组件                  | 说明     |
| --------------------- | -------- |
| **Column**            | 垂直布局 |
| **Row**               | 水平布局 |
| **Stack**             | 层叠布局 |
| **Flex**              | 弹性布局 |
| **Grid**              | 网格布局 |
| **GridItem**          | 网格项   |
| **RelativeContainer** | 相对容器 |

### 导航组件

| 组件               | 说明       |
| ------------------ | ---------- |
| **Tabs**           | 标签页     |
| **TabContent**     | 标签页内容 |
| **Navigation**     | 导航       |
| **NavRouter**      | 导航路由   |
| **NavDestination** | 导航目的地 |

### 容器组件

| 组件                | 说明       |
| ------------------- | ---------- |
| **ScrollView**      | 滚动视图   |
| **Refresh**         | 刷新组件   |
| **Swiper**          | 轮播组件   |
| **AlphabetIndexer** | 字母索引器 |

### 弹窗组件

| 组件             | 说明         |
| ---------------- | ------------ |
| **AlertDialog**  | 警告对话框   |
| **ActionSheet**  | 操作表       |
| **CustomDialog** | 自定义对话框 |
| **Toast**        | 轻提示       |
| **PickerDialog** | 选择器对话框 |

### 进度指示器

| 组件                | 说明       |
| ------------------- | ---------- |
| **Progress**        | 进度条     |
| **LoadingProgress** | 加载进度   |
| **Bullet**          | 优惠券样式 |

### 动画组件

| 组件           | 说明     |
| -------------- | -------- |
| **animateTo**  | 显式动画 |
| **transition** | 过渡效果 |

### 形状组件

| 组件         | 说明     |
| ------------ | -------- |
| **Rect**     | 矩形     |
| **Circle**   | 圆形     |
| **Ellipse**  | 椭圆     |
| **Line**     | 直线     |
| **Polyline** | 折线     |
| **Polygon**  | 多边形   |
| **Path**     | 路径     |
| **Shape**    | 形状容器 |

### 状态管理装饰器

| 组件             | 说明         |
| ---------------- | ------------ |
| **@State**       | 状态变量     |
| **@Link**        | 双向链接     |
| **@Prop**        | 属性传递     |
| **@StorageProp** | 本地存储属性 |
| **@StorageLink** | 本地存储链接 |
| **@Watch**       | 监听变化     |

### 生命周期装饰器

| 组件           | 说明       |
| -------------- | ---------- |
| **@Entry**     | 入口组件   |
| **@Component** | 自定义组件 |
| **@Builder**   | 构建器方法 |
| **@Extend**    | 扩展样式   |

## 示例代码

### Text 文本

```typescript
Text("Hello World").fontSize(20).fontWeight(FontWeight.Bold);
```

### TextInput 文本输入

```typescript
TextInput({ placeholder: "Enter text", text: this.inputText }).onChange(
  (value) => {
    this.inputText = value;
  },
);
```

### Button 按钮

```typescript
Button("Click Me").onClick(() => {
  /* handle click */
});
```

### Checkbox 复选框

```typescript
Checkbox({ name: "cb1", group: "todos" })
  .select(true)
  .onChange((checked) => {
    /* handle change */
  });
```

### List 列表

```typescript
List() {
  ForEach(this.items, (item) => {
    ListItem() {
      Text(item.title)
    }
  }, (item) => item.id.toString())
}
```

### Column / Row 布局

```typescript
Column() {
  Row() {
    Text('Label')
    Blank()
    Toggle(...)
  }
}
.padding(16)
```

### Select 下拉选择

```typescript
Select(["Option1", "Option2"])
  .value(this.selected)
  .onSelect((index) => {
    this.selected = index;
  });
```

### @State 状态管理

```typescript
@State private items: TodoItem[] = []
@State private inputText: string = ''
```
