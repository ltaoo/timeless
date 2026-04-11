# Objective-C + UIKit Todo App

## 运行方式

1. 在 Xcode 中创建新项目，选择 "iOS App" (Objective-C)
2. 将 `TodoViewController.m` 作为 ViewController 使用
3. 运行项目 (⌘R)

## 功能

- 输入框 + 添加按钮
- 可滚动 todo 列表（checkbox + title）
- 选中时 title 显示删除线
- 选中时显示归档按钮，点击移除 todo

## UIKit 可用组件

### 基础视图

| 组件                 | 说明               |
| -------------------- | ------------------ |
| **UIView**           | 基础视图容器       |
| **UIWindow**         | 窗口               |
| **UIViewController** | 视图控制器         |
| **UIScreen**         | 屏幕               |
| **UIScrollView**     | 滚动视图           |
| **UITableView**      | 表格视图           |
| **UICollectionView** | 集合视图           |
| **UITextView**       | 多行文本视图       |
| **UIWebView**        | 网页视图（已弃用） |
| **WKWebView**        | WebKit 网页视图    |
| **MKMapView**        | 地图视图           |

### 文本控件

| 组件            | 说明           |
| --------------- | -------------- |
| **UILabel**     | 文本标签       |
| **UITextField** | 单行文本输入框 |
| **UITextView**  | 多行文本视图   |
| **UITextField** | 文本字段       |

### 按钮控件

| 组件                | 说明         |
| ------------------- | ------------ |
| **UIButton**        | 按钮         |
| **UIBarButtonItem** | 导航栏按钮项 |
| **UIToolbar**       | 工具栏       |

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

### 布局控件

| 组件                        | 说明       |
| --------------------------- | ---------- |
| **UIStackView**             | 堆叠视图   |
| **UIActivityIndicatorView** | 活动指示器 |
| **UIProgressView**          | 进度视图   |
| **UIPageControl**           | 页面控制   |

### 搜索控件

| 组件                   | 说明       |
| ---------------------- | ---------- |
| **UISearchBar**        | 搜索栏     |
| **UISearchController** | 搜索控制器 |

### 对话框控件

| 组件                  | 说明               |
| --------------------- | ------------------ |
| **UIAlertController** | 警告控制器         |
| **UIActionSheet**     | 操作表（已弃用）   |
| **UIAlertView**       | 警告视图（已弃用） |

### 图像控件

| 组件            | 说明     |
| --------------- | -------- |
| **UIImageView** | 图片视图 |
| **UIImage**     | 图片     |

### 其他视图

| 组件                             | 说明         |
| -------------------------------- | ------------ |
| **UISwitch**                     | 开关         |
| **UIVisualEffectView**           | 视觉特效视图 |
| **UIVisualEffect**               | 视觉特效     |
| **UIControl**                    | 控件基类     |
| **UITouch**                      | 触摸         |
| **UIGestureRecognizer**          | 手势识别器   |
| **UIPanGestureRecognizer**       | 拖动手势     |
| **UIPinchGestureRecognizer**     | 捏合手势     |
| **UIRotationGestureRecognizer**  | 旋转手势     |
| **UITapGestureRecognizer**       | 点击手势     |
| **UILongPressGestureRecognizer** | 长按手势     |

### 自动布局

| 组件                           | 说明             |
| ------------------------------ | ---------------- |
| **NSLayoutConstraint**         | 布局约束         |
| **NSLayoutAnchor**             | 布局锚点         |
| **UILayoutGuide**              | 布局引导         |
| **UIView.safeAreaLayoutGuide** | 安全区域布局引导 |

### 颜色与动画

| 组件                       | 说明         |
| -------------------------- | ------------ |
| **UIColor**                | 颜色         |
| **UIImage**                | 图片资源     |
| **UIViewPropertyAnimator** | 视图属性动画 |
| **UIVisualEffect**         | 视觉效果     |
| **UIMotionEffect**         | 运动效果     |

## 示例代码

### UITextField 文本输入

```objc
UITextField *textField = [[UITextField alloc] init];
textField.placeholder = @"Enter text";
textField.borderStyle = UITextBorderStyleRoundedRect;
textField.translatesAutoresizingMaskIntoConstraints = NO;
[self.view addSubview:textField];
```

### UIButton 按钮

```objc
UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
[button setTitle:@"Click Me" forState:UIControlStateNormal];
[button addTarget:self action:@selector(buttonTapped) forControlEvents:UIControlEventTouchUpInside];
[self.view addSubview:button];
```

### UITableView 表格

```objc
UITableView *tableView = [[UITableView alloc] initWithFrame:CGRectZero style:UITableViewStylePlain];
tableView.dataSource = self;
tableView.delegate = self;
[tableView registerClass:[UITableViewCell class] forCellReuseIdentifier:@"Cell"];
[self.view addSubview:tableView];
```

### UISwitch 开关

```objc
UISwitch *toggle = [[UISwitch alloc] init];
toggle.on = NO;
[toggle addTarget:self action:@selector(toggleChanged:) forControlEvents:UIControlEventValueChanged];
[self.view addSubview:toggle];
```

### UISegmentedControl 分段控件

```objc
UISegmentedControl *segment = [[UISegmentedControl alloc] initWithItems:@[@"Option1", @"Option2"]];
segment.selectedSegmentIndex = 0;
[self.view addSubview:segment];
```

### UIStackView 堆叠视图

```objc
UIStackView *stackView = [[UIStackView alloc] init];
stackView.axis = UILayoutConstraintAxisHorizontal;
stackView.spacing = 8;
stackView.alignment = UIStackViewAlignmentCenter;
[stackView addArrangedSubview:textField];
[stackView addArrangedSubview:button];
[self.view addSubview:stackView];
```

### NSLayoutConstraint 自动布局

```objc
[NSLayoutConstraint activateConstraints:@[
    [textField.topAnchor constraintEqualToAnchor:self.view.safeAreaLayoutGuide.topAnchor constant:16],
    [textField.leadingAnchor constraintEqualToAnchor:self.view.leadingAnchor constant:16],
    [textField.trailingAnchor constraintEqualToAnchor:self.view.trailingAnchor constant:-16],
    [button.topAnchor constraintEqualToAnchor:textField.bottomAnchor constant:8],
    [button.centerXAnchor constraintEqualToAnchor:self.view.centerXAnchor]
]];
```

### 自定义 UITableViewCell

```objc
@interface TodoCell : UITableViewCell
@property (nonatomic, strong) UILabel *titleLabel;
@property (nonatomic, strong) UISwitch *checkBox;
@end

@implementation TodoCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {
        _titleLabel = [[UILabel alloc] init];
        _checkBox = [[UISwitch alloc] init];
        // Setup constraints...
    }
    return self;
}

@end
```
