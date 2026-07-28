# Flow 组件设计文档

## 1. 概述

Flow 组件是一个节点图编辑器，提供类似 n8n、ComfyUI 的拖拽节点、连线编辑能力。用户可以在画布上创建节点、拖动节点、通过端口连接节点，形成可视化的流程图。

### 目标

- 可拖拽、可连线的节点图编辑器
- 支持画布平移 (pan) 和缩放 (zoom)
- 支持自定义节点内容
- 支持节点选中、多选
- 提供小地图 (minimap)、控制栏 (controls)
- 遵循 Timeless 框架的 Core/View 模式

---

## 2. 主流方案调研

### 2.1 React Flow / @xyflow/react

**地址：** https://reactflow.dev
**License：** MIT
**特点：**
- 目前最流行的 React 节点图库（npm 周下载量 ~200w）
- 核心概念：`nodes[]` + `edges[]` + `viewport`
- 节点 (Node)：id、type、position、data
- 边 (Edge)：id、source、target、sourceHandle、targetHandle
- Handle（端口）：内置在节点中，分 source/target 两类
- 提供 `useNodesState` / `useEdgesState` hooks 管理状态
- 支持 `onConnect`、`onNodeDrag`、`onSelectionChange` 等回调
- 提供 Background、MiniMap、Controls 等内置插件
- 通过 `nodeTypes` 注册自定义节点组件
- 边渲染基于 SVG，支持 Bezier/Step/Straight 等曲线
- 视口变换通过 CSS transform 实现（性能好）

**优点：** API 设计成熟、文档完善、生态丰富
**缺点：** 强依赖 React

---

### 2.2 Litegraph.js（ComfyUI 方案）

**地址：** https://github.com/jagenjo/litegraph.js
**License：** MIT
**特点：**
- Canvas 2D 渲染（非 DOM），性能极高
- 节点槽位 (slot) 区分 input/output，数据类型可定义
- 支持连接类型校验（只有类型匹配的端口才能连接）
- 内置序列化/反序列化 (JSON)
- Widget 系统：节点内嵌入输入控件（slider、text、combo 等）
- ComfyUI 基于此魔改，支持图像预览、进度等扩展

**优点：** 性能优秀，适合复杂图（AI 工作流）
**缺点：** Canvas 渲染不支持自定义 HTML 节点内容，定制成本高

---

### 2.3 Drawflow

**地址：** https://github.com/jerosoler/Drawflow
**License：** MIT
**特点：**
- 纯 JS，不依赖框架
- DOM 渲染节点，SVG 渲染边
- 数据结构简单：`{ drawflow: { Home: { data: { [nodeId]: NodeData } } } }`
- 支持模块（多画布切换）
- n8n 早期曾使用 Drawflow

**优点：** 轻量，无框架依赖
**缺点：** 功能较基础，自定义能力弱

---

### 2.4 G6（AntV）

**地址：** https://g6.antv.antgroup.com
**License：** MIT
**特点：**
- 阿里 AntV 出品的图可视化引擎
- Canvas + SVG 双引擎
- 定位是通用图分析与可视化（非专门的流程编辑器）
- 支持力导向布局、树形布局等算法布局
- 数据驱动：`{ nodes: [], edges: [], combos: [] }`
- 支持交互行为插件（drag-node、zoom-canvas 等）

**优点：** 功能全面，支持复杂图分析
**缺点：** 包体积大，配置复杂，编辑能力需自行实现

---

### 2.5 方案选型结论

| 特性 | React Flow | Litegraph | Drawflow | G6 |
|------|-----------|-----------|----------|-----|
| 渲染方式 | DOM+SVG | Canvas 2D | DOM+SVG | Canvas/SVG |
| 自定义节点 | ✅ 极佳 | ❌ 受限 | ✅ 良好 | ✅ 良好 |
| 性能 | 良好 | 极佳 | 良好 | 极佳 |
| 编辑能力 | ✅ 完善 | ✅ 完善 | ✅ 基础 | ⚠️ 需扩展 |
| 包体积 | 中 | 小 | 小 | 大 |
| API 设计 | ✅ 最佳 | 一般 | 简单 | 复杂 |

**结论：参考 React Flow 的数据模型和 API 设计**，使用 DOM+SVG 渲染（与 React Flow 一致），适配 Timeless 框架的 Core/View 模式。

---

## 3. 核心概念与数据模型

### 3.1 基础概念

```
Canvas（画布）
├── Viewport（视口）：pan(x,y) + zoom，控制整体平移缩放
├── Nodes（节点列表）：可拖拽的节点集合
│   └── Node（节点）
│       ├── id, type, position(x,y), data
│       └── Handles（端口）
│           ├── Source Handle（输出端口）
│           └── Target Handle（输入端口）
└── Edges（边列表）：连接两个节点端口的线
    └── Edge
        ├── source: { nodeId, handleId }
        └── target: { nodeId, handleId }
```

### 3.2 数据类型定义

```typescript
// 节点定义
interface FlowNode<T = any> {
  id: string;
  type?: string;                    // 自定义节点类型键名
  position: { x: number; y: number };
  data: T;                          // 用户自定义数据
  selected?: boolean;
  dragging?: boolean;
  width?: number;
  height?: number;
}

// 端口定义（Handle）
interface FlowHandle {
  id: string;
  type: "source" | "target";       // 输出端口 / 输入端口
  position?: "top" | "right" | "bottom" | "left";
}

// 边定义
interface FlowEdge {
  id: string;
  source: string;                   // 源节点 id
  sourceHandle?: string;            // 源端口 id，默认第一个 source handle
  target: string;                   // 目标节点 id
  targetHandle?: string;            // 目标端口 id，默认第一个 target handle
  type?: string;                    // 边类型（bezier/step/straight）
  label?: string;
  animated?: boolean;
  selected?: boolean;
}

// 视口
interface Viewport {
  x: number;                        // 平移 x
  y: number;                        // 平移 y
  zoom: number;                     // 缩放比例（0.1 ~ 2）
}

// 连接事件（拖拽连线完成时触发）
interface Connection {
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}
```

---

## 4. 组件架构

遵循 Timeless 框架的 Core/View 分层模式。

### 4.1 Core 层（`@timeless/ui-vm` 新增）

```
ui-vm/src/flow/
├── index.ts           # FlowCore（主画布状态）
├── node.ts            # FlowNodeCore（单节点状态）
└── edge.ts            # FlowEdgeCore（单边状态）
```

### 4.2 View 层（`@timeless/shadcn` 新增）

```
shadcn/src/modules/
└── flow.ts            # Flow 视图组件（FlowView + 辅助组件）
```

### 4.3 组件树结构

```
FlowView（根组件，接受 FlowCore）
├── FlowBackground（可选，网格/点状背景）
├── FlowCanvas（可缩放/平移的视口容器）
│   ├── FlowEdgeLayer（SVG 层，渲染所有边）
│   │   └── FlowEdge × N（单条边，SVG path）
│   └── FlowNodeLayer（DOM 层，渲染所有节点）
│       └── FlowNode × N（单个节点，绝对定位 div）
│           └── [自定义节点内容 via slot]
│               ├── FlowHandle × M（端口，可作为连线起止点）
│               └── ...用户内容
├── FlowMinimap（可选，小地图）
└── FlowControls（可选，缩放控制栏）
```

---

## 5. FlowCore 设计

### 5.1 状态 (State)

```typescript
interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  // 交互状态（不对外暴露，内部用）
  connectingSource: { nodeId: string; handleId: string } | null;
  selectBox: { x: number; y: number; w: number; h: number } | null;
}
```

### 5.2 事件 (Events)

```typescript
enum Events {
  NodesChange = "NodesChange",       // 节点列表变化（增删改位置）
  EdgesChange = "EdgesChange",       // 边列表变化
  Connect = "Connect",               // 连线完成（新增边前触发）
  NodeClick = "NodeClick",           // 节点点击
  NodeDoubleClick = "NodeDoubleClick",
  NodeDragStart = "NodeDragStart",
  NodeDrag = "NodeDrag",
  NodeDragStop = "NodeDragStop",
  EdgeClick = "EdgeClick",
  SelectionChange = "SelectionChange",
  ViewportChange = "ViewportChange",
  StateChange = "StateChange",       // 通用状态变化
}
```

### 5.3 方法 (Methods)

```typescript
class FlowCore extends BaseDomain<TheTypesOfEvents> {
  // --- 节点管理 ---
  addNode(node: Omit<FlowNode, "id"> & { id?: string }): FlowNode;
  removeNode(id: string): void;
  updateNode(id: string, patch: Partial<FlowNode>): void;
  getNode(id: string): FlowNode | undefined;
  setNodes(nodes: FlowNode[]): void;

  // --- 边管理 ---
  addEdge(edge: Omit<FlowEdge, "id"> & { id?: string }): FlowEdge | null;
  removeEdge(id: string): void;
  updateEdge(id: string, patch: Partial<FlowEdge>): void;
  getEdge(id: string): FlowEdge | undefined;
  setEdges(edges: FlowEdge[]): void;

  // --- 视口控制 ---
  setViewport(viewport: Partial<Viewport>): void;
  zoomIn(step?: number): void;
  zoomOut(step?: number): void;
  fitView(options?: { padding?: number; duration?: number }): void;
  resetView(): void;

  // --- 选中管理 ---
  selectNode(id: string, multi?: boolean): void;
  selectEdge(id: string, multi?: boolean): void;
  clearSelection(): void;
  getSelectedNodes(): FlowNode[];
  getSelectedEdges(): FlowEdge[];

  // --- 序列化 ---
  toJSON(): { nodes: FlowNode[]; edges: FlowEdge[]; viewport: Viewport };
  fromJSON(data: { nodes: FlowNode[]; edges: FlowEdge[]; viewport?: Viewport }): void;

  // --- 事件监听 ---
  onConnect(handler: Handler<Connection>): () => void;
  onNodesChange(handler: Handler<FlowNode[]>): () => void;
  onEdgesChange(handler: Handler<FlowEdge[]>): () => void;
  onNodeClick(handler: Handler<{ node: FlowNode; event: MouseEvent }>): () => void;
  onNodeDrag(handler: Handler<{ node: FlowNode; position: { x: number; y: number } }>): () => void;
  onViewportChange(handler: Handler<Viewport>): () => void;
  onStateChange(handler: Handler<FlowState>): () => void;
}
```

### 5.4 连线规则

`FlowCore` 构造函数接受 `isValidConnection` 回调，用于校验是否允许连线：

```typescript
new FlowCore({
  isValidConnection: (connection: Connection) => {
    // 返回 true 允许连线，false 禁止
    return connection.source !== connection.target; // 不允许自环
  }
})
```

---

## 6. FlowNodeCore 设计

每个节点由 `FlowNodeCore` 管理，提供拖拽状态追踪：

```typescript
class FlowNodeCore extends BaseDomain<...> {
  data: FlowNode;

  // 拖拽处理（由 FlowView 调用）
  startDrag(clientX: number, clientY: number): void;
  drag(clientX: number, clientY: number): void;   // 更新 position
  stopDrag(): void;

  // Handle 注册（节点挂载时调用）
  registerHandle(handleId: string, el: HTMLElement): void;
  getHandleRect(handleId: string): DOMRect | null;

  onPositionChange(handler: Handler<{ x: number; y: number }>): () => void;
  onStateChange(handler: Handler<FlowNode>): () => void;
}
```

---

## 7. FlowView 设计

### 7.1 Props

```typescript
interface FlowViewProps extends ViewProps {
  store: FlowCore;
  // 自定义节点类型
  nodeTypes?: Record<string, (props: { node: FlowNode }) => ViewChildren>;
  // 自定义边类型
  edgeTypes?: Record<string, (props: { edge: FlowEdge }) => ViewChildren>;
  // 是否显示背景
  showBackground?: boolean;
  backgroundVariant?: "dots" | "lines" | "cross";
  // 是否显示小地图
  showMinimap?: boolean;
  // 是否显示控制栏
  showControls?: boolean;
  // 是否允许多选
  multiSelect?: boolean;
  // 缩放范围
  minZoom?: number;  // 默认 0.1
  maxZoom?: number;  // 默认 2
  // 是否允许操作
  nodesDraggable?: boolean;   // 默认 true
  nodesConnectable?: boolean; // 默认 true
  elementsSelectable?: boolean; // 默认 true
}
```

### 7.2 交互实现要点

#### 画布平移 (Pan)
- 监听画布区域的 `mousedown` → `mousemove` → `mouseup`
- 按下空格键切换为「平移模式」，此时拖拽移动视口
- 或右键拖拽平移
- 更新 `viewport.x` / `viewport.y`，通过 CSS `transform: translate(x,y) scale(zoom)` 应用

#### 画布缩放 (Zoom)
- 监听 `wheel` 事件
- `deltaY > 0` 缩小，`deltaY < 0` 放大
- 以鼠标位置为缩放中心（计算 `x/y` 偏移补偿）
- 限制范围：`minZoom ~ maxZoom`
- 支持触控板捏合缩放（通过 `ctrlKey + wheel`）

#### 节点拖拽 (Node Drag)
- 节点上 `mousedown` 触发，记录拖拽起始位置
- `mousemove` 计算 `delta / zoom`（注意除以缩放比例，得到图坐标系移动量）
- 更新节点 `position.x/y`，触发 `onNodeDrag`
- `mouseup` 触发 `onNodeDragStop`
- 支持网格吸附 (snap to grid)：`Math.round(x / gridSize) * gridSize`

#### 连线操作 (Connect)
- Handle 上 `mousedown` 开始连线，记录 `connectingSource`
- 全局 `mousemove` 渲染临时连线（跟随鼠标的 SVG path）
- 目标 Handle 上 `mouseup` 触发，校验 `isValidConnection`，创建边
- 目标 Handle 高亮（hover 时）表示可连接

#### 多选 (Selection Box)
- 画布空白区域 `mousedown` + 拖拽 → 渲染选框
- 选框覆盖的节点/边进入 selected 状态
- `Ctrl/Cmd + A` 全选

### 7.3 边渲染（SVG）

边渲染在节点层下方的 SVG 层，坐标已经过视口变换：

```typescript
// Bezier 曲线（默认）
function getBezierPath(
  source: { x: number; y: number },
  target: { x: number; y: number }
): string {
  const dx = Math.abs(target.x - source.x);
  const controlOffset = Math.max(dx * 0.5, 50);
  return `M ${source.x},${source.y} C ${source.x + controlOffset},${source.y} ${target.x - controlOffset},${target.y} ${target.x},${target.y}`;
}
```

边类型：
- `bezier`（默认）：贝塞尔曲线
- `step`：折线（水平+垂直）
- `straight`：直线
- `smoothstep`：带圆角的折线

### 7.4 视口变换

所有节点和边的渲染都在一个被变换的容器内：

```html
<div class="flow-canvas"
     style="transform: translate({x}px, {y}px) scale({zoom})">
  <!-- SVG 边层 -->
  <svg class="flow-edge-layer">...</svg>
  <!-- DOM 节点层 -->
  <div class="flow-node-layer">...</div>
</div>
```

---

## 8. 默认节点组件

当 `nodeTypes` 中没有指定类型时，使用默认节点样式：

```
┌─────────────────────┐
│ ● Node Title        │  ← 节点头部（可拖拽区域）
├─────────────────────┤
│  [自定义内容区]      │
│                     │
└─────────────────────┘
●                     ●  ← Handle（端口圆点）
```

Handle 样式：圆形小圆点，默认左侧为 target（输入），右侧为 source（输出）。

---

## 9. 辅助组件

### 9.1 FlowBackground

```typescript
// 网格背景
<FlowBackground
  variant="dots"     // "dots" | "lines" | "cross"
  gap={16}           // 网格间距
  size={1}           // 点/线大小
  color="#e5e7eb"    // 颜色
/>
```

实现：SVG pattern 或 CSS background-image

### 9.2 FlowMinimap

- 固定在右下角的小地图
- 按比例渲染所有节点（矩形色块）
- 显示当前视口区域（半透明矩形框）
- 可点击/拖拽小地图跳转视口

### 9.3 FlowControls

```
[+] [-] [⟳] [□]
```
- `+`：放大
- `-`：缩小
- `⟳`：重置视口
- `□`：适应视口（fit view）

---

## 10. 文件结构规划

### ui-vm 新增文件

```
packages/ui-vm/src/flow/
├── index.ts        # FlowCore
├── node.ts         # FlowNodeCore
└── edge.ts         # FlowEdgeCore（可选，也可内联在 index.ts）
```

`packages/ui-vm/src/index.ts` 新增导出：
```typescript
export * from "./flow";
export * from "./flow/node";
```

### shadcn 新增文件

```
packages/shadcn/src/modules/
└── flow.ts         # FlowView、FlowHandle、FlowBackground、FlowMinimap、FlowControls
```

`packages/shadcn/src/index.ts` 新增导出：
```typescript
export * from "./modules/flow";
```

---

## 11. 使用示例

```typescript
import { FlowCore } from "@timeless/inner-vm";
import { FlowView } from "@timeless/shadcn";

// 1. 创建 FlowCore
const flow = new FlowCore({
  nodes: [
    { id: "1", position: { x: 100, y: 100 }, data: { label: "Start" } },
    { id: "2", position: { x: 400, y: 200 }, data: { label: "Process" } },
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2" }
  ],
  isValidConnection: (conn) => conn.source !== conn.target,
});

// 2. 监听连线事件
flow.onConnect((conn) => {
  flow.addEdge({
    source: conn.source,
    sourceHandle: conn.sourceHandle,
    target: conn.target,
    targetHandle: conn.targetHandle,
  });
});

// 3. 渲染
<FlowView
  store={flow}
  showBackground
  showMinimap
  showControls
  nodeTypes={{
    custom: ({ node }) => (
      <div>
        <FlowHandle type="target" position="left" id="in" />
        <span>{node.data.label}</span>
        <FlowHandle type="source" position="right" id="out" />
      </div>
    )
  }}
/>
```

---

## 12. 分阶段实现计划

### Phase 1：基础能力（MVP）
- [ ] `FlowCore`：节点/边增删改查，视口状态
- [ ] `FlowView`：基础画布渲染
- [ ] 节点拖拽（位置更新）
- [ ] 画布平移 + 缩放（鼠标滚轮）
- [ ] 边渲染（Bezier 曲线）
- [ ] Handle + 连线操作（拖拽创建边）
- [ ] 节点/边选中（单选）

### Phase 2：增强能力
- [ ] `FlowBackground` 背景组件
- [ ] `FlowControls` 控制栏
- [ ] 多选（框选 + Ctrl+点击）
- [ ] 键盘删除选中节点/边（Delete/Backspace）
- [ ] 自定义节点类型 (`nodeTypes`)
- [ ] 自定义边类型（bezier/step/straight）
- [ ] 序列化/反序列化 (`toJSON`/`fromJSON`)

### Phase 3：高级能力
- [ ] `FlowMinimap` 小地图
- [ ] 网格吸附 (snap to grid)
- [ ] 撤销/重做 (undo/redo)
- [ ] 节点分组 (group)
- [ ] 自动布局（集成 dagre/elkjs）
- [ ] 边标签 (edge label)
- [ ] 边动画 (animated edge)
- [ ] 触控板支持（双指缩放/平移）

---

## 13. 技术决策

| 问题 | 决策 | 理由 |
|------|------|------|
| 渲染方式 | DOM + SVG | 支持自定义 HTML 节点内容，与 React Flow 保持一致 |
| 视口变换 | CSS transform | 性能好，GPU 加速，无需重计算布局 |
| 边曲线 | SVG path | 灵活，支持多种曲线类型 |
| 状态管理 | FlowCore (BaseDomain) | 遵循 Timeless Core/View 模式 |
| 坐标系 | 图坐标系（与视口独立） | 节点 position 始终是图坐标，不受 viewport 影响 |
| 拖拽实现 | 原生鼠标事件 | 无需额外拖拽库，轻量可控 |
| Handle 连接检测 | 元素 getBoundingClientRect | 精确，与 React Flow 一致 |
