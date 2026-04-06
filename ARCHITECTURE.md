# Timeless UI 架构文档

## 概述

Timeless UI 采用三层架构设计，将组件的状态管理、交互逻辑和视觉呈现完全分离。这种架构使得创建功能相同但样式不同的组件变得非常简单。

## 三层架构

```
┌─────────────────────────────────────────────────────────┐
│                    shadcn 层                             │
│              (样式 + 组件组装)                            │
│  - 使用 headless 提供的原语组装完整组件                    │
│  - 添加 CSS 类名和样式                                    │
│  - 定义组件的视觉呈现                                      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  headless 层                             │
│           (无样式原语 + 事件绑定)                          │
│  - 提供组件的基础构建块（Trigger, Content, Item 等）       │
│  - 绑定 DOM 事件到 UI 层的状态管理                         │
│  - 处理可访问性（ARIA）和键盘导航                          │
│  - 不包含任何样式                                         │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                     ui 层                                │
│              (状态管理 + 业务逻辑)                         │
│  - 管理组件的所有状态（open, focused, disabled 等）        │
│  - 实现组件的核心业务逻辑                                  │
│  - 提供状态变更的事件系统                                  │
│  - 与视图层完全解耦                                        │
└─────────────────────────────────────────────────────────┘
```

## 各层职责详解

### UI 层 (`packages/ui`)

**职责**：纯状态管理和业务逻辑

**核心类**：
- `MenuCore`: 菜单状态管理
- `MenuItemCore`: 菜单项状态管理
- `DropdownMenuCore`: 下拉菜单状态管理
- `PopperCore`: 定位逻辑
- `PresenceCore`: 显示/隐藏动画状态

**特点**：
- 继承自 `BaseDomain`，提供事件系统
- 不依赖任何 DOM 或视图框架
- 可以在任何环境中使用（浏览器、Node.js、测试环境）
- 通过事件通知状态变化

**示例**：
```typescript
class MenuItemCore extends BaseDomain {
  _focused = false;
  _open = false;

  get state() {
    return {
      focused: this._focused || this._open,
      open: this._open,
    };
  }

  handlePointerEnter() {
    this._focused = true;
    this.emit(Events.Change, { ...this.state });
  }

  onStateChange(handler) {
    return this.on(Events.Change, handler);
  }
}
```

### Headless 层 (`packages/timeless`)

**职责**：连接 UI 层和 DOM，提供无样式的组件原语

**核心函数**：
- `DropdownMenuPrimitive.Trigger`: 触发器
- `DropdownMenuPrimitive.Content`: 内容容器
- `DropdownMenuPrimitive.Item`: 菜单项
- `DropdownMenuPrimitive.Portal`: 传送门
- `MenuPrimitive.*`: 菜单相关原语

**特点**：
- 接收 `store` 参数（UI 层的实例）
- 绑定 DOM 事件到 store 的方法
- 监听 store 的状态变化，更新视图
- 处理可访问性和键盘交互
- 不包含任何样式

**示例**：
```typescript
export function Item(
  props: ViewProps & { store: MenuItemCore },
  children: ViewChildren,
) {
  return View(
    {
      ...props,
      onClick() {
        props.store.handleClick();
      },
      onMouseEnter() {
        props.store.handlePointerEnter();
      },
      onMouseLeave() {
        props.store.handlePointerLeave();
      },
    },
    children,
  );
}
```

### Shadcn 层 (`packages/shadcn`)

**职责**：组装组件并添加样式

**特点**：
- 使用 headless 层的原语
- 添加 Tailwind CSS 类名
- 定义组件的视觉呈现
- 可以创建多个样式变体

**示例**：
```typescript
export function DropdownMenu(
  props: ViewProps & { store: DropdownMenuCore },
  children?: ViewChildren,
) {
  return Show({
    when: !!children,
    ok() {
      return [
        DropdownMenuPrimitive.Trigger({ store: props.store }, children),
        DropdownMenuPrimitive.Portal({ store: props.store.menu }, [
          DropdownMenuPrimitive.Content(
            {
              store: props.store,
              class: "min-w-[8rem] rounded-md border bg-white p-1 shadow-md",
            },
            [
              For({
                each: computed(state_, (t) => t.items),
                render(item: MenuItemCore) {
                  return DropdownMenuItem({ store: item });
                },
              }),
            ],
          ),
        ]),
      ];
    },
  });
}
```

## 数据流

### 用户交互 → 状态更新

```
用户点击
  ↓
DOM 事件 (onClick)
  ↓
headless 层调用 store.handleClick()
  ↓
ui 层更新状态 (this._open = true)
  ↓
ui 层触发事件 (this.emit(Events.Change))
  ↓
headless 层监听到状态变化
  ↓
更新 DOM (添加/移除类名、显示/隐藏元素)
```

### 状态订阅模式

```typescript
// UI 层：提供状态和事件
class MenuCore {
  state = { open: false };

  show() {
    this.state.open = true;
    this.emit(Events.StateChange, { ...this.state });
  }
}

// Headless 层：订阅状态变化
const state_ = refobj(props.store.state);
props.store.onStateChange((v) => {
  state_.as(v);
});

// Shadcn 层：使用响应式状态
View({
  class: computed(state_, (t) =>
    t.open ? "block" : "hidden"
  ),
})
```

## 组件间通信

### 父子组件通信

```typescript
// 父菜单引用子菜单
class MenuCore {
  cur_item: MenuItemCore | null = null;
}

class MenuItemCore {
  menu: MenuCore | null = null; // 子菜单
}

// 建立双向引用
menu.listen_item(item);
if (item.menu) {
  item.menu.parent_menu = menu; // 子菜单引用父菜单
}
```

### 事件传播

```typescript
// 子菜单项进入时，清除父菜单的定时器
item.onEnter(() => {
  if (this.parent_menu && this.parent_menu.hide_sub_timer) {
    clearTimeout(this.parent_menu.hide_sub_timer);
    this.parent_menu.hide_sub_timer = null;
  }
});
```

## 创建新组件的步骤

### 1. 创建 UI 层状态管理类

```typescript
// packages/ui/src/my-component/index.ts
export class MyComponentCore extends BaseDomain {
  state = {
    open: false,
    value: "",
  };

  toggle() {
    this.state.open = !this.state.open;
    this.emit(Events.StateChange, { ...this.state });
  }

  onStateChange(handler) {
    return this.on(Events.StateChange, handler);
  }
}
```

### 2. 创建 Headless 层原语

```typescript
// packages/timeless/src/my-component.ts
export function Trigger(
  props: ViewProps & { store: MyComponentCore },
  children: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  props.store.onStateChange((v) => {
    state_.as(v);
  });

  return View(
    {
      onClick() {
        props.store.toggle();
      },
    },
    children,
  );
}

export function Content(
  props: ViewProps & { store: MyComponentCore },
  children: ViewChildren,
) {
  const state_ = refobj(props.store.state);

  return Show(
    { when: computed(state_, (t) => t.open) },
    [View(props, children)],
  );
}
```

### 3. 创建 Shadcn 层样式组件

```typescript
// packages/shadcn/src/my-component.ts
export function MyComponent(
  props: ViewProps & { store: MyComponentCore },
  children?: ViewChildren,
) {
  return [
    MyComponentPrimitive.Trigger(
      {
        store: props.store,
        class: "px-4 py-2 bg-blue-500 text-white rounded",
      },
      children,
    ),
    MyComponentPrimitive.Content(
      {
        store: props.store,
        class: "mt-2 p-4 border rounded shadow-lg",
      },
      ["Content here"],
    ),
  ];
}
```

### 4. 使用组件

```typescript
const myComponent = new MyComponentCore();

MyComponent(
  { store: myComponent },
  ["Click me"],
);
```

## 优势

1. **关注点分离**：状态、交互、样式完全分离
2. **可测试性**：UI 层可以独立测试，不需要 DOM
3. **可复用性**：同一个 UI 层可以配合不同的样式层
4. **灵活性**：可以轻松创建样式变体（Material Design、Ant Design 等）
5. **类型安全**：TypeScript 提供完整的类型检查
6. **框架无关**：UI 层不依赖任何视图框架

## 实际案例：DropdownMenu

### UI 层
- `DropdownMenuCore`: 管理下拉菜单的打开/关闭状态
- `MenuCore`: 管理菜单项列表、当前选中项、子菜单
- `MenuItemCore`: 管理单个菜单项的 focused、open 状态

### Headless 层
- `DropdownMenuPrimitive.Trigger`: 绑定点击事件到 `store.toggle()`
- `DropdownMenuPrimitive.Content`: 监听 `store.state.open`，控制显示/隐藏
- `DropdownMenuPrimitive.Item`: 绑定鼠标事件到 `store.handlePointerEnter/Leave()`

### Shadcn 层
- `DropdownMenu`: 组装 Trigger + Portal + Content
- 添加 Tailwind 样式类
- 使用 `For` 循环渲染菜单项
- 处理子菜单的递归渲染

## 最佳实践

1. **UI 层只管理状态**：不要在 UI 层操作 DOM
2. **Headless 层只绑定事件**：不要在 Headless 层添加样式
3. **Shadcn 层只负责呈现**：不要在 Shadcn 层实现业务逻辑
4. **使用响应式状态**：通过 `refobj` 和 `computed` 实现自动更新
5. **事件命名规范**：使用 `onXxx` 命名事件监听器
6. **状态不可变**：每次状态变化都创建新对象 `{ ...this.state }`

## 调试技巧

1. **启用调试日志**：在 Core 类中设置 `debug = true`
2. **追踪事件流**：在 `emit` 和 `on` 中添加 `console.log`
3. **检查状态**：在浏览器控制台访问 `store.state`
4. **使用 React DevTools**：查看组件树和状态变化

## 扩展阅读

- [Radix UI](https://www.radix-ui.com/): 类似的 headless 组件库
- [Headless UI](https://headlessui.com/): Tailwind 团队的 headless 组件
- [shadcn/ui](https://ui.shadcn.com/): 本架构的灵感来源
