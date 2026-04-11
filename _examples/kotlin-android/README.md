# Kotlin + Android Todo App

## 运行方式

1. 在 Android Studio 中创建新项目
2. 将 `MainActivity.kt` 复制到 `app/src/main/java/com/example/todo/`
3. 运行项目

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## Android SDK 可用组件

### 文本显示

| 组件                          | 说明             |
| ----------------------------- | ---------------- |
| **TextView**                  | 文本显示         |
| **EditText**                  | 文本输入         |
| **AutoCompleteTextView**      | 自动完成输入     |
| **MultiAutoCompleteTextView** | 多重自动完成输入 |

### 按钮控件

| 组件               | 说明         |
| ------------------ | ------------ |
| **Button**         | 按钮         |
| **ImageButton**    | 图片按钮     |
| **CompoundButton** | 复合按钮基类 |
| **CheckBox**       | 复选框       |
| **RadioButton**    | 单选按钮     |
| **ToggleButton**   | 开关按钮     |
| **Switch**         | 开关         |

### 选择控件

| 组件                 | 说明         |
| -------------------- | ------------ |
| **Spinner**          | 下拉选择器   |
| **DropDownListView** | 下拉列表     |
| **ListPopupWindow**  | 列表弹出窗口 |
| **PopupMenu**        | 弹出菜单     |

### 列表控件

| 组件                   | 说明             |
| ---------------------- | ---------------- |
| **AbsListView**        | 抽象列表视图基类 |
| **ListView**           | 列表视图         |
| **GridView**           | 网格视图         |
| **ExpandableListView** | 可展开列表视图   |
| **RecyclerView**       | 回收站视图       |
| **AdapterView**        | 适配器视图基类   |
| **Gallery**            | 画廊（已弃用）   |

### 布局控件

| 组件                     | 说明               |
| ------------------------ | ------------------ |
| **ViewGroup**            | 视图组基类         |
| **LinearLayout**         | 线性布局           |
| **RelativeLayout**       | 相对布局           |
| **FrameLayout**          | 帧布局             |
| **TableLayout**          | 表格布局           |
| **GridLayout**           | 网格布局           |
| **ConstraintLayout**     | 约束布局           |
| **AbsoluteLayout**       | 绝对布局（已弃用） |
| **ScrollView**           | 滚动视图           |
| **HorizontalScrollView** | 水平滚动视图       |
| **NestedScrollView**     | 嵌套滚动视图       |
| **SlidingDrawer**        | 滑动抽屉（已弃用） |

### 容器控件

| 组件           | 说明       |
| -------------- | ---------- |
| **TabHost**    | 标签页主机 |
| **TabWidget**  | 标签页部件 |
| **RadioGroup** | 单选按钮组 |
| **Space**      | 空白间距   |

### 进度指示器

| 组件            | 说明           |
| --------------- | -------------- |
| **ProgressBar** | 进度条         |
| **SeekBar**     | 拖动进度条     |
| **AbsSeekBar**  | 抽象拖动进度条 |
| **RatingBar**   | 评分条         |

### 日期/时间控件

| 组件             | 说明               |
| ---------------- | ------------------ |
| **DatePicker**   | 日期选择器         |
| **TimePicker**   | 时间选择器         |
| **CalendarView** | 日历视图           |
| **Chronometer**  | 计时器             |
| **AnalogClock**  | 模拟时钟（已弃用） |
| **DigitalClock** | 数字时钟（已弃用） |

### 对话框

| 组件                 | 说明           |
| -------------------- | -------------- |
| **AlertDialog**      | 警告对话框     |
| **ProgressDialog**   | 进度对话框     |
| **DatePickerDialog** | 日期选择对话框 |
| **TimePickerDialog** | 时间选择对话框 |

### 菜单

| 组件            | 说明       |
| --------------- | ---------- |
| **Menu**        | 菜单       |
| **MenuItem**    | 菜单项     |
| **SubMenu**     | 子菜单     |
| **ContextMenu** | 上下文菜单 |

### 工具栏

| 组件               | 说明         |
| ------------------ | ------------ |
| **Toolbar**        | 工具栏       |
| **ActionMenuView** | 操作菜单视图 |
| **SearchView**     | 搜索视图     |

### 其他视图

| 组件                    | 说明               |
| ----------------------- | ------------------ |
| **ImageView**           | 图片视图           |
| **ImageSwitcher**       | 图片切换器         |
| **VideoView**           | 视频视图           |
| **WebView**             | 网页视图           |
| **SurfaceView**         | 表面视图           |
| **TextureView**         | 纹理视图           |
| **ZoomButton**          | 缩放按钮           |
| **ZoomControls**        | 缩放控制           |
| **include**             | 布局引用           |
| **ViewStub**            | 视图存根           |
| **CheckedTextView**     | 带复选框的文本视图 |
| **TextClock**           | 文本时钟           |
| **ViewFlipper**         | 视图翻转器         |
| **AdapterViewAnimator** | 适配器视图动画器   |
| **AdapterViewFlipper**  | 适配器视图翻转器   |
| **StackView**           | 堆叠视图           |

### 适配器

| 组件                    | 说明           |
| ----------------------- | -------------- |
| **BaseAdapter**         | 基础适配器     |
| **ArrayAdapter**        | 数组适配器     |
| **CursorAdapter**       | 游标适配器     |
| **SimpleAdapter**       | 简单适配器     |
| **SimpleCursorAdapter** | 简单游标适配器 |

## 示例代码

### EditText 文本输入

```kotlin
val editText = EditText(context).apply {
    hint = "Enter text"
    inputType = InputType.TYPE_CLASS_TEXT
}
```

### Button 按钮

```kotlin
val button = Button(context).apply {
    text = "Click Me"
    setOnClickListener { /* handle click */ }
}
```

### ListView 列表

```kotlin
val listView = ListView(context).apply {
    adapter = MyAdapter(items)
    onItemClickListener = AdapterView.OnItemClickListener { _, _, position, _ ->
        // Handle item click
    }
}
```

### CheckBox 复选框

```kotlin
val checkBox = CheckBox(context).apply {
    isChecked = false
    setOnCheckedChangeListener { _, isChecked ->
        // Handle check changed
    }
}
```

### LinearLayout 线性布局

```kotlin
val linearLayout = LinearLayout(context).apply {
    orientation = LinearLayout.VERTICAL
    setPadding(16, 16, 16, 16)
}
```

### Spinner 下拉选择

```kotlin
val spinner = Spinner(context).apply {
    val adapter = ArrayAdapter(context, android.R.layout.simple_spinner_item, items)
    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
    this.adapter = adapter
}
```

### 自定义适配器

```kotlin
class MyAdapter(private val items: List<String>) : BaseAdapter() {
    override fun getCount() = items.size
    override fun getItem(position: Int) = items[position]
    override fun getItemId(position: Int) = position.toLong()

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        return TextView(context).apply {
            text = items[position]
            setPadding(16, 16, 16, 16)
        }
    }
}
```

### ConstraintLayout 约束布局

```kotlin
val constraintLayout = ConstraintLayout(context).apply {
    val button = Button(context).apply { id = View.generateViewId() }
    val textView = TextView(context).apply { id = View.generateViewId() }

    addView(button)
    addView(textView)

    ConstraintSet().apply {
        clone(this@apply)
        connect(button.id, ConstraintSet.TOP, ConstraintSet.PARENT_ID, ConstraintSet.TOP, 16)
        connect(textView.id, ConstraintSet.TOP, button.id, ConstraintSet.BOTTOM, 8)
        applyTo(this@apply)
    }
}
```
