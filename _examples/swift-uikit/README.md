# Swift + UIKit Todo App

## 运行方式

1. 在 Xcode 中创建新项目，选择 "iOS App"
2. 将 `TodoViewController.swift` 作为 ViewController 使用
3. 运行项目 (⌘R)

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## UIKit 可用组件

### 基础视图

| 组件                 | 说明            |
| -------------------- | --------------- |
| **UIView**           | 基础视图容器    |
| **UIWindow**         | 窗口            |
| **UIViewController** | 视图控制器      |
| **UIScreen**         | 屏幕            |
| **UIScrollView**     | 滚动视图        |
| **UITableView**      | 表格视图        |
| **UICollectionView** | 集合视图        |
| **UITextView**       | 多行文本视图    |
| **WKWebView**        | WebKit 网页视图 |
| **MKMapView**        | 地图视图        |
| **GLKView**          | OpenGL 视图     |

### 文本控件

| 组件                        | 说明           |
| --------------------------- | -------------- |
| **UILabel**                 | 文本标签       |
| **UITextField**             | 单行文本输入框 |
| **UITextView**              | 多行文本视图   |
| **UIActivityIndicatorView** | 活动指示器     |

### 按钮控件

| 组件                | 说明         |
| ------------------- | ------------ |
| **UIButton**        | 按钮         |
| **UIBarButtonItem** | 导航栏按钮项 |
| **UIToolbar**       | 工具栏       |
| **UITabBarItem**    | 标签栏项     |

### 选择控件

| 组件                   | 说明       |
| ---------------------- | ---------- |
| **UISwitch**           | 开关       |
| **UISlider**           | 滑块       |
| **UIStepper**          | 步进器     |
| **UISegmentedControl** | 分段控件   |
| **UIPickerView**       | 选择器视图 |
| **UIDatePicker**       | 日期选择器 |

### 列表控件

| 组件                            | 说明           |
| ------------------------------- | -------------- |
| **UITableView**                 | 表格视图       |
| **UITableViewCell**             | 表格单元格     |
| **UITableViewHeaderFooterView** | 表头/表尾视图  |
| **UICollectionView**            | 集合视图       |
| **UICollectionViewCell**        | 集合视图单元格 |
| **UICollectionReusableView**    | 可重用视图     |

### 导航控件

| 组件                       | 说明           |
| -------------------------- | -------------- |
| **UINavigationController** | 导航控制器     |
| **UINavigationBar**        | 导航栏         |
| **UITabBarController**     | 标签栏控制器   |
| **UITabBar**               | 标签栏         |
| **UIPageViewController**   | 页面视图控制器 |
| **UISplitViewController**  | 分屏视图控制器 |

### 进度控件

| 组件               | 说明     |
| ------------------ | -------- |
| **UIProgressView** | 进度视图 |
| **UIPageControl**  | 页面控制 |

### 搜索控件

| 组件                   | 说明       |
| ---------------------- | ---------- |
| **UISearchBar**        | 搜索栏     |
| **UISearchController** | 搜索控制器 |

### 对话框控件

| 组件                  | 说明       |
| --------------------- | ---------- |
| **UIAlertController** | 警告控制器 |

### 图像控件

| 组件                        | 说明       |
| --------------------------- | ---------- |
| **UIImageView**             | 图片视图   |
| **UIImage**                 | 图片       |
| **UIImagePickerController** | 图片选择器 |

### 颜色选择器

| 组件                            | 说明                 |
| ------------------------------- | -------------------- |
| **UIColorPickerViewController** | 颜色选择器视图控制器 |
| **UIColorWell**                 | 颜色井               |

### 布局控件

| 组件            | 说明     |
| --------------- | -------- |
| **UIStackView** | 堆叠视图 |

### 视觉特效

| 组件                   | 说明         |
| ---------------------- | ------------ |
| **UIVisualEffectView** | 视觉特效视图 |
| **UIVibrancyEffect**   | 鲜艳效果     |
| **UIBlurEffect**       | 模糊效果     |

### 手势识别器

| 组件                                 | 说明         |
| ------------------------------------ | ------------ |
| **UITapGestureRecognizer**           | 点击手势     |
| **UIPanGestureRecognizer**           | 拖动手势     |
| **UIPinchGestureRecognizer**         | 捏合手势     |
| **UIRotationGestureRecognizer**      | 旋转手势     |
| **UILongPressGestureRecognizer**     | 长按手势     |
| **UISwipeGestureRecognizer**         | 滑动手势     |
| **UIScreenEdgePanGestureRecognizer** | 屏幕边缘手势 |

### 自动布局

| 组件                            | 说明             |
| ------------------------------- | ---------------- |
| **NSLayoutConstraint**          | 布局约束         |
| **NSLayoutAnchor**              | 布局锚点         |
| **NSLayoutDimension**           | 布局维度         |
| **UILayoutGuide**               | 布局引导         |
| **UIView.safeAreaLayoutGuide**  | 安全区域布局引导 |
| **UIView.readableContentGuide** | 可读内容布局引导 |

## 示例代码

### UITextField 文本输入

```swift
let textField = UITextField()
textField.placeholder = "Enter text"
textField.borderStyle = .roundedRect
textField.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(textField)
```

### UIButton 按钮

```swift
let button = UIButton(type: .system)
button.setTitle("Click Me", for: .normal)
button.addTarget(self, action: #selector(buttonTapped), for: .touchUpInside)
view.addSubview(button)
```

### UITableView 表格

```swift
let tableView = UITableView()
tableView.translatesAutoresizingMaskIntoConstraints = false
tableView.dataSource = self
tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
view.addSubview(tableView)
```

### UISwitch 开关

```swift
let toggle = UISwitch()
toggle.isOn = false
toggle.addTarget(self, action: #selector(toggleChanged(_:)), for: .valueChanged)
view.addSubview(toggle)
```

### UISegmentedControl 分段控件

```swift
let segment = UISegmentedControl(items: ["Option1", "Option2"])
segment.selectedSegmentIndex = 0
view.addSubview(segment)
```

### UIStackView 堆叠视图

```swift
let stackView = UIStackView(arrangedSubviews: [textField, button])
stackView.axis = .horizontal
stackView.spacing = 8
stackView.alignment = .center
stackView.translatesAutoresizingMaskIntoConstraints = false
view.addSubview(stackView)
```

### NSLayoutConstraint 自动布局

```swift
NSLayoutConstraint.activate([
    textField.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    textField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
    textField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
    button.topAnchor.constraint(equalTo: textField.bottomAnchor, constant: 8),
    button.centerXAnchor.constraint(equalTo: view.centerXAnchor)
])
```

### 自定义 UITableViewCell

```swift
class TodoCell: UITableViewCell {
    let titleLabel = UILabel()
    let checkBox = UISwitch()

    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupUI()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupUI() {
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        checkBox.translatesAutoresizingMaskIntoConstraints = false
        contentView.addSubview(titleLabel)
        contentView.addSubview(checkBox)

        NSLayoutConstraint.activate([
            checkBox.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            checkBox.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            titleLabel.leadingAnchor.constraint(equalTo: checkBox.trailingAnchor, constant: 12),
            titleLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor)
        ])
    }
}
```
