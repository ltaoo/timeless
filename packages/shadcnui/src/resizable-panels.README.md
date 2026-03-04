# ResizablePanels 组件

参考 [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) 实现的可调整大小面板组件。

## 架构

该组件遵循 Timeless 的三层架构：

1. **@timeless/ui** - Core 层：提供核心逻辑和状态管理
   - `ResizablePanelsCore`: 管理面板组和调整大小逻辑
   - `ResizablePanelCore`: 管理单个面板的状态

2. **@timeless/headless** - Headless 层：提供无样式的基础组件
   - `Group`: 面板容器组件
   - `Panel`: 单个面板组件
   - `Handle`: 拖拽手柄组件

3. **@timeless/shadcnui** - UI 层：提供带样式的最终组件
   - `ResizablePanels`: 带样式的面板组
   - `ResizablePanel`: 带样式的面板
   - `ResizableHandle`: 带样式的拖拽手柄

## 安装

```bash
npm install @timeless/shadcnui @timeless/ui
```

## 基础用法

### 水平布局

```typescript
import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";
import { ResizablePanels, ResizablePanel, ResizableHandle, View } from "@timeless/shadcnui";

// 创建面板组
const panelsGroup = new ResizablePanelsCore({
  direction: "horizontal",
});

// 创建面板
const leftPanel = new ResizablePanelCore({
  defaultSize: 30,
  minSize: 20,
  maxSize: 50,
});

const rightPanel = new ResizablePanelCore({
  defaultSize: 70,
  minSize: 50,
  maxSize: 80,
});

// 渲染
const App = View({ class: "h-screen" }, [
  ResizablePanels(
    { store: panelsGroup, direction: "horizontal" },
    [
      ResizablePanel(
        { store: leftPanel, group: panelsGroup },
        [View({ class: "p-4" }, ["Left Panel"])],
      ),

      ResizableHandle({
        store: panelsGroup,
        panelBefore: leftPanel,
        panelAfter: rightPanel,
        withHandle: true,
      }),

      ResizablePanel(
        { store: rightPanel, group: panelsGroup },
        [View({ class: "p-4" }, ["Right Panel"])],
      ),
    ],
  ),
]);
```

### 垂直布局

```typescript
const verticalGroup = new ResizablePanelsCore({
  direction: "vertical",
});

const topPanel = new ResizablePanelCore({ defaultSize: 40 });
const bottomPanel = new ResizablePanelCore({ defaultSize: 60 });

const App = View({ class: "h-screen" }, [
  ResizablePanels(
    { store: verticalGroup, direction: "vertical" },
    [
      ResizablePanel({ store: topPanel, group: verticalGroup }, ["Top"]),
      ResizableHandle({
        store: verticalGroup,
        panelBefore: topPanel,
        panelAfter: bottomPanel,
      }),
      ResizablePanel({ store: bottomPanel, group: verticalGroup }, ["Bottom"]),
    ],
  ),
]);
```

### 三栏布局

```typescript
const mainGroup = new ResizablePanelsCore({ direction: "horizontal" });
const leftPanel = new ResizablePanelCore({ defaultSize: 25, minSize: 15 });
const middlePanel = new ResizablePanelCore({ defaultSize: 50, minSize: 30 });
const rightPanel = new ResizablePanelCore({ defaultSize: 25, minSize: 15 });

const App = View({ class: "h-screen" }, [
  ResizablePanels({ store: mainGroup }, [
    ResizablePanel({ store: leftPanel, group: mainGroup }, ["Sidebar"]),
    ResizableHandle({ store: mainGroup, panelBefore: leftPanel, panelAfter: middlePanel }),
    ResizablePanel({ store: middlePanel, group: mainGroup }, ["Content"]),
    ResizableHandle({ store: mainGroup, panelBefore: middlePanel, panelAfter: rightPanel }),
    ResizablePanel({ store: rightPanel, group: mainGroup }, ["Inspector"]),
  ]),
]);
```

## API

### ResizablePanelsCore

```typescript
new ResizablePanelsCore({
  direction?: "horizontal" | "vertical";  // 默认 "horizontal"
  onResize?: (sizes: number[]) => void;   // 调整大小回调
})
```

**方法：**
- `mount(element: HTMLElement)`: 挂载到 DOM 元素
- `unmount()`: 卸载
- `registerPanel(panel: ResizablePanelCore)`: 注册面板
- `unregisterPanel(panel: ResizablePanelCore)`: 注销面板
- `startResize(before, after, event)`: 开始调整大小
- `resize(event)`: 调整大小中
- `endResize()`: 结束调整大小

**事件：**
- `onStateChange(handler)`: 状态变化
- `onPanelResize(handler)`: 面板大小变化

### ResizablePanelCore

```typescript
new ResizablePanelCore({
  defaultSize?: number;      // 默认大小（百分比）
  minSize?: number;          // 最小大小（百分比），默认 10
  maxSize?: number;          // 最大大小（百分比），默认 90
  collapsible?: boolean;     // 是否可折叠，默认 false
  collapsedSize?: number;    // 折叠后大小，默认 0
})
```

**方法：**
- `setSize(size: number)`: 设置大小
- `collapse()`: 折叠面板
- `expand()`: 展开面板

**事件：**
- `onStateChange(handler)`: 状态变化

### ResizableHandle Props

```typescript
{
  store: ResizablePanelsCore;
  panelBefore: ResizablePanelCore;
  panelAfter: ResizablePanelCore;
  withHandle?: boolean;  // 是否显示手柄图标，默认 false
}
```

## 高级用法

### 可折叠面板

```typescript
const collapsiblePanel = new ResizablePanelCore({
  defaultSize: 30,
  minSize: 0,
  collapsible: true,
  collapsedSize: 0,
});

// 编程式控制
collapsiblePanel.collapse();  // 折叠
collapsiblePanel.expand();    // 展开
```

### 监听大小变化

```typescript
const panelsGroup = new ResizablePanelsCore({
  onResize: (sizes) => {
    console.log("Panel sizes:", sizes);
  },
});

// 或者
panelsGroup.onPanelResize(({ panels }) => {
  panels.forEach((panel, index) => {
    console.log(`Panel ${index}: ${panel.state.size}%`);
  });
});
```

### 自定义样式

```typescript
ResizablePanels(
  {
    store: panelsGroup,
    class: "rounded-lg border border-gray-300 shadow-lg",
  },
  [/* ... */],
)

ResizablePanel(
  {
    store: leftPanel,
    group: panelsGroup,
    class: "bg-blue-50 dark:bg-blue-900",
  },
  [/* ... */],
)

ResizableHandle({
  store: panelsGroup,
  panelBefore: leftPanel,
  panelAfter: rightPanel,
  withHandle: true,
  class: "bg-blue-200 hover:bg-blue-300",
})
```

## 特性

- ✅ 水平和垂直布局
- ✅ 拖拽调整大小
- ✅ 最小/最大尺寸限制
- ✅ 可折叠面板
- ✅ 编程式控制
- ✅ 响应式设计
- ✅ 深色模式支持
- ✅ TypeScript 支持
- ✅ 无依赖（除 Timeless 核心包）

## 注意事项

1. 面板大小使用百分比（0-100）
2. 确保所有面板的 `defaultSize` 总和合理
3. `minSize` 和 `maxSize` 应该在合理范围内
4. 使用 `withHandle` 可以显示拖拽手柄图标
5. 面板必须通过 `group` 属性注册到面板组

## 示例

完整示例请参考 `resizable-panels.example.ts`
