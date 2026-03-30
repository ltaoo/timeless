---
description: "使用 Timeless 库开发应用时使用。当需要使用组件、新增页面、调用接口、构建自定义组件时使用本技能。"
---

# Timeless 视图构建指南

本技能指导使用 Timeless Vanilla JS 框架构建 UI。

## 触发条件

当用户需要以下内容时触发：

- 使用 UI 组件（输入框、按钮、选择器、对话框等）
- 新增页面
- 调用接口（HTTP 请求）
- 构建自定义组件
- 路由与导航

## 使用方式

1. 查看「全局变量」了解可用的 API
2. 需要具体组件用法时，读取对应的 reference 文件
3. 控制流（Show/For/Switch）必须使用 `h()` 包裹 children

## 全局变量（无需 import）

- `Timeless.ui.*` — Core 类：ButtonCore, InputCore, NumberInputCore, SelectCore, CascaderCore, CheckboxCore, CheckboxGroupCore, RadioGroupCore, DialogCore, DropdownMenuCore, ContextMenuCore, MenuCore, MenuItemCore, PopoverCore, ToastCore, ScrollViewCore, TableCore, TabHeaderCore, AccordionCore, StepCore, PresenceCore, SingleFieldCore, ObjectFieldCore, DatePickerCore, DateRangePickerCore, TimePickerCore 等
- `Timeless.icons.*` — 图标
- `Timeless.lazy(path)` — 懒加载
- `Timeless.buildRoutes(config)` — 构建路由
- `Timeless.Result` — `Result.Ok(v)` / `Result.Err(msg)`
- `Timeless.kit.*` — 工具包：RequestCore, ListCore, RouteMenusModel, request_factory
- 响应式：`ref()`, `refobj()`, `refarr()`, `computed()`, `effect()`
- 布局/控制流：`View()`, `Flex()`, `Show()`, `For()`, `Switch()`, `Match()`, `h()`
- 路由：`KeepAliveSubViews()`
- 工具：`cn()` — class name 合并

## Reference 文件索引

| 用户需要        | 读取文件                          |
| --------------- | --------------------------------- |
| Button          | `references/button.md`            |
| Input           | `references/input.md`             |
| Textarea        | `references/textarea.md`          |
| NumberInput     | `references/number-input.md`      |
| FileInput       | `references/file-input.md`        |
| Label           | `references/label.md`             |
| Select          | `references/select.md`            |
| SearchSelect    | `references/search-select.md`     |
| Cascader        | `references/cascader.md`          |
| Checkbox        | `references/checkbox.md`          |
| CheckboxGroup   | `references/checkbox-group.md`    |
| RadioGroup      | `references/radio-group.md`       |
| Dialog          | `references/dialog.md`            |
| Sheet           | `references/sheet.md`             |
| Popover         | `references/popover.md`           |
| Tooltip         | `references/tooltip.md`           |
| DropdownMenu    | `references/dropdown-menu.md`     |
| ContextMenu     | `references/context-menu.md`      |
| Toast           | `references/toast.md`             |
| DatePicker      | `references/date-picker.md`       |
| DateRangePicker | `references/date-range-picker.md` |
| TimePicker      | `references/time-picker.md`       |
| DateTimePicker  | `references/date-time-picker.md`  |
| Tabs            | `references/tabs.md`              |
| Accordion       | `references/accordion.md`         |
| Table           | `references/table.md`             |
| Badge           | `references/badge.md`             |
| Card            | `references/card.md`              |
| Progress        | `references/progress.md`          |
| Skeleton        | `references/skeleton.md`          |
| Avatar          | `references/avatar.md`            |
| Separator       | `references/separator.md`         |
| AspectRatio     | `references/aspect-ratio.md`      |
| ScrollView      | `references/scroll-view.md`       |
| ScrollArea      | `references/scroll-area.md`       |
| Flex            | `references/flex.md`              |
| Steps           | `references/steps.md`             |
| Form            | `references/form.md`              |
| Page            | `references/page.md`              |
| Navigation      | `references/navigation.md`        |
| Request         | `references/request.md`           |
| ControlFlow     | `references/control-flow.md`      |
| Reactive        | `references/reactive.md`          |
| defineModel     | `references/define-model.md`      |
| PageView        | `references/page-view.md`         |
