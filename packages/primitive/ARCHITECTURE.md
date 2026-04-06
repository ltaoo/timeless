# Primitive VNode Tree 架构重构方案

## Context

`@packages/primitive/` 当前的组件（View、For、Show 等）在 `render()` 时直接调用 `HeadlessHost` 创建宿主节点（DOM/TuiNode/CanvasNode），没有中间抽象层。这导致：
- 组件层与平台强耦合，无法在不执行的情况下序列化或检查 UI 树
- 三个宿主（TUI/Canvas/Stub）各自重复实现了近乎相同的节点树操作（~800行重复代码）
- `HeadlessHost` 接口有 40+ 方法，本质是 DOM API 的翻版，不是真正的抽象
- Signal 订阅直接修改宿主节点，无法批量更新或调度优化

**目标**：将 primitive 重构为纯 VNode 树抽象。组件产出 VNode，宿主渲染器消费 VNode 树进行平台渲染。

```
当前: Component → host.createElement() → 平台节点树
目标: Component → VNode 树 → HostRenderer.commit() → 平台节点树
```

**更新模型**：Timeless 不需要 diff/reconciliation。更新由 Signal 直接驱动——Signal 精确知道"哪个节点的哪个属性变了"，直接修改 VNode 属性并通知宿主渲染器 patch。

---

## 一、VNode 数据类型

### 核心节点类型

```typescript
// packages/primitive/src/vnode/types.ts

type VNodeKind = "element" | "text" | "fragment";
type VNodeKey = string | number;

interface VNodeBase {
  kind: VNodeKind;
  key?: VNodeKey;
  parent: VNodeElement | null;
  nextSibling: VNode | null;
  /** 宿主渲染器在此挂载平台节点 */
  _hostNode?: any;
}

interface VNodeElement extends VNodeBase {
  kind: "element";
  tag: string;              // 原子标签（仅最底层原生元素，见下文）
  style: VNodeStyle;        // 内联视觉样式（不含布局，布局由布局组件表达）
  stylePresets: string[];   // 样式预设名称列表（见下文"样式预设系统"）
  attrs: Record<string, string | boolean | number>;  // id, aria-*, data-*
  props: Record<string, any>;   // value, checked, disabled 等组件属性
  events: VNodeEvents;      // 平台无关的事件处理
  children: VNode[];
  focusable?: boolean;
  draggable?: boolean;

  // 无障碍（所有平台）
  a11y?: VNodeA11y;

  // 平台特定逃逸口（各宿主只读取自己的字段，忽略其他）
  platform?: {
    web?: Record<string, any>;       // cursor, userSelect 等 web-only 属性
    ios?: Record<string, any>;       // cornerCurve, clipsToBounds 等
    android?: Record<string, any>;   // elevation, rippleColor 等
    macos?: Record<string, any>;
    windows?: Record<string, any>;
  };
}

/** 无障碍属性（映射到各平台原生 a11y API） */
interface VNodeA11y {
  label?: string;           // iOS: accessibilityLabel, Android: contentDescription, web: aria-label
  hint?: string;            // iOS: accessibilityHint, web: aria-describedby
  role?: string;            // iOS: accessibilityTraits, web: role, Android: className
  hidden?: boolean;         // iOS: !isAccessibilityElement, web: aria-hidden
  value?: string;           // iOS: accessibilityValue, web: aria-valuenow
  live?: "polite" | "assertive";  // web: aria-live, iOS: notification, Android: announceForAccessibility
}

interface VNodeText extends VNodeBase {
  kind: "text";
  text: string;
}

interface VNodeFragment extends VNodeBase {
  kind: "fragment";
  children: VNode[];
}

type VNode = VNodeElement | VNodeText | VNodeFragment;
```

### tag 与 Component 的分层

`tag` 只用于 VNode 树的**原子叶子节点**——各平台最底层的原生元素。
ScrollView、Waterfall、Checkbox 等**不是 tag**，而是**组件函数（ComponentFn）**，
由各平台的组件库提供实现，产出各自的 VNode 子树。

```
用户代码:  h(ScrollView, { height: 300 }, [ h(View, {}, [...]) ])
                ↑ ComponentFn                     ↑ ComponentFn

展开后(web):  VNodeElement(tag="div", style={overflow:auto, height:300})
                └─ VNodeElement(tag="div")
                     └─ ...

展开后(iOS):  VNodeElement(tag="scroll-view")    ← iOS 宿主的原子元素
                └─ VNodeElement(tag="ui-view")
                     └─ ...
```

**原子 tag**：各宿主能直接 `createNode()` 的最底层元素。不同平台的原子 tag 不同：

| 平台 | 原子 tag 示例 |
|---|---|
| **DOM** | `"div"`, `"span"`, `"input"`, `"button"`, `"img"`, `"textarea"`, `"select"`, `"canvas"` |
| **iOS** | `"ui-view"`, `"ui-label"`, `"ui-image-view"`, `"ui-text-field"`, `"ui-scroll-view"`, `"ui-button"` |
| **Android** | `"view"`, `"text-view"`, `"image-view"`, `"edit-text"`, `"scroll-view"`, `"button"` |
| **TUI** | `"box"`, `"text"` |
| **Canvas** | `"rect"`, `"text"`, `"image"` |

**复合组件（ComponentFn）**：由各平台的组件库实现，用户代码面对的是统一的组件接口：

```typescript
// ─── 统一接口（@timeless/primitive 定义） ─────────────────
interface ScrollViewProps {
  height?: number | string;
  horizontal?: boolean;
  showsIndicator?: boolean;
  onScroll?: (e: ScrollEventData) => void;
  style?: VNodeStyle;
}

// ─── Web 实现（@timeless/web 提供） ──────────────────────
// ScrollView 是组件函数，内部用 web 原子 tag 构建
function ScrollView(props: ScrollViewProps, children: ChildDescriptor[]): VNode {
  // 产出 VNode 树：div + 滚动事件监听 + 滚动条样式 + ...
  return createElement("div", {
    style: { overflow: "auto", height: props.height, ...props.style },
    events: { onScroll: props.onScroll },
  }, mountChildren(children));
}

// ─── iOS 实现（@timeless/ios 提供） ──────────────────────
function ScrollView(props: ScrollViewProps, children: ChildDescriptor[]): VNode {
  // 产出 VNode 树：UIScrollView 原子元素
  return createElement("ui-scroll-view", {
    props: {
      showsVerticalScrollIndicator: props.showsIndicator,
      isDirectionalLockEnabled: true,
    },
    style: { height: props.height, ...props.style },
    events: { onScroll: props.onScroll },
  }, mountChildren(children));
}
```

**核心原则**：
- `h(ScrollView, props, children)` — 用户代码统一，不区分平台
- `ScrollView` 是 `ComponentFn`，各平台提供各自实现
- 组件内部使用各自平台的原子 tag 构建 VNode 子树
- `tag` 只出现在 VNode 树的叶子层，用户代码中不直接使用 tag

**包结构**：

```
@timeless/primitive       - VNode 类型、h()、mount()、组件接口定义（ScrollViewProps 等）
@timeless/web            - Web 平台组件实现 + DOM HostRenderer
@timeless/ios            - iOS 平台组件实现 + iOS HostRenderer
@timeless/android        - Android 平台组件实现 + Android HostRenderer
@timeless/tui            - TUI 平台组件实现 + TUI HostRenderer
@timeless/canvas         - Canvas 平台组件实现 + Canvas HostRenderer
```

### 样式类型（纯视觉样式，不含布局）

布局（Flex/Grid/栅格）不属于 VNodeStyle，而是由**布局组件**表达（见下文"布局组件"部分）。
VNodeStyle 只描述视觉外观，各宿主各自翻译：DOM → CSS style，TUI → ANSI 序列，Canvas → 绘制参数，
iOS → UIView properties，Android → View attributes。

**所有属性必须是结构化数据，禁止 CSS 字符串**——native 平台无法解析 CSS 字符串。

```typescript
interface VNodeStyle {
  // 尺寸
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;

  // 间距
  margin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;
  padding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  // 定位
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;

  // 颜色与背景
  color?: string;
  backgroundColor?: string;
  opacity?: number;

  // 边框（结构化，不用 border 简写字符串）
  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;

  // 文字
  fontSize?: number;
  fontWeight?: number | "bold" | "normal";
  fontFamily?: string;
  fontStyle?: "normal" | "italic";
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "line-through";
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  maxLines?: number;             // native: numberOfLines / maxLines; web: 通过 -webkit-line-clamp 实现
  overflow?: "visible" | "hidden";

  // 交互
  pointerEvents?: "auto" | "none";   // native: isUserInteractionEnabled

  // 变换（结构化，不用 CSS transform 字符串）
  transforms?: VNodeTransform[];

  // 阴影（结构化，不用 CSS boxShadow 字符串）
  shadows?: VNodeShadow[];

  // 扩展逃逸口
  [key: string]: any;
}

/** 结构化变换（替代 CSS transform 字符串） */
interface VNodeTransform {
  translate?: { x?: number; y?: number; z?: number };
  rotate?: number;           // 角度（度）
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number | { x?: number; y?: number };
  skew?: { x?: number; y?: number };
}
// DOM 宿主: 编译为 "translateX(10px) rotate(45deg) scale(1.5)"
// iOS 宿主: 映射为 CGAffineTransform / CATransform3D
// Android 宿主: 映射为 View.translationX / rotation / scaleX

/** 结构化阴影（替代 CSS boxShadow 字符串） */
interface VNodeShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;     // 仅 DOM 支持，native 忽略
}
// DOM 宿主: 编译为 "2px 4px 8px rgba(0,0,0,0.2)"
// iOS 宿主: 映射为 CALayer shadowColor/shadowOffset/shadowRadius/shadowOpacity
// Android 宿主: 映射为 elevation + OutlineProvider
// Canvas 宿主: 映射为 ctx.shadowColor/shadowBlur/shadowOffsetX/Y
```

**从 VNodeStyle 中移除的 web-only 属性**：

| 移除的属性 | 原因 | 替代方案 |
|---|---|---|
| `cursor` | 仅桌面浏览器有光标概念 | 移入 `VNodeElement.platform.web` |
| `userSelect` | 仅 web 概念 | 移入 `VNodeElement.platform.web` |
| `whiteSpace` | CSS 特有概念 | 用 `maxLines` + 文本组件行为处理 |
| `textOverflow` | CSS 特有概念 | 用 `maxLines` 替代（native: numberOfLines） |
| `transform: string` | CSS 字符串格式 | 用 `transforms: VNodeTransform[]` |
| `transition: string` | CSS 字符串格式 | 用动画系统（见下文） |
| `animation: string` | CSS 字符串格式 | 用动画系统（见下文） |
| `boxShadow: string` | CSS 字符串格式 | 用 `shadows: VNodeShadow[]` |
| `border: string` | CSS 简写字符串 | 用 `borderWidth` + `borderColor` + `borderStyle` |

### 动画系统（替代 CSS transition/animation 字符串）

CSS 的 `transition` 和 `animation` 是字符串格式，native 无法解析。
动画应该是**独立的命令式 API**，而非样式属性：

```typescript
// packages/primitive/src/vnode/animation.ts

interface AnimationConfig {
  property: keyof VNodeStyle;       // 要动画的属性
  from?: any;                       // 起始值（省略则从当前值开始）
  to: any;                          // 目标值
  duration: number;                 // 毫秒
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  delay?: number;
}

/** 命令式动画 API——由宿主实现 */
interface HostRenderer {
  // ... 已有方法 ...

  /** 执行动画，返回 Promise（动画完成时 resolve） */
  animate(vnode: VNode, animations: AnimationConfig[]): Promise<void>;

  /** 取消动画 */
  cancelAnimation(vnode: VNode): void;
}

// DOM 宿主: 使用 Web Animations API 或生成 CSS transition
// iOS 宿主: 使用 UIView.animate / CABasicAnimation
// Android 宿主: 使用 ObjectAnimator / ValueAnimator
// TUI 宿主: 忽略或用 setInterval 模拟颜色渐变
// Canvas 宿主: 用 requestAnimationFrame 逐帧插值
```

### 样式预设系统（替代 className）

`className` 是 DOM 独有概念（CSS 选择器 + 样式表）。其本质是**一组可复用样式的命名集合**。
在终端没有 CSS，在 Canvas 没有样式表，在 Native 也没有。因此抽象为 **StylePreset**：

```typescript
// packages/primitive/src/vnode/style-preset.ts

/** 样式预设：一组 VNodeStyle 的命名集合 */
type StylePreset = VNodeStyle;

/** 全局样式预设注册表 */
interface StylePresetRegistry {
  /** 定义一个样式预设 */
  define(name: string, style: StylePreset): void;

  /** 定义多个样式预设 */
  defineMany(presets: Record<string, StylePreset>): void;

  /** 获取一个样式预设 */
  get(name: string): StylePreset | undefined;

  /** 检查是否存在 */
  has(name: string): boolean;
}

/** 创建样式预设注册表 */
function createStylePresetRegistry(): StylePresetRegistry;

/** 获取全局注册表 */
function getStylePresets(): StylePresetRegistry;
```

**使用示例**：

```typescript
// 定义预设（应用启动时）
const presets = getStylePresets();
presets.define("btn-primary", {
  backgroundColor: "#3b82f6",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
});
presets.define("text-muted", {
  color: "#9ca3af",
  fontSize: 14,
});

// 使用预设（组件中）
h("div", { stylePresets: ["btn-primary"], style: { opacity: 0.8 } }, ["Click me"])
```

**样式解析优先级**（与 CSS 一致的逻辑）：
1. 按 `stylePresets` 数组顺序合并预设样式（后面覆盖前面）
2. `style`（内联样式）覆盖预设样式
3. 最终得到一个完整的 `VNodeStyle` 用于渲染

```typescript
/** 解析节点的最终样式 */
function resolveComputedStyle(vnode: VNodeElement, registry: StylePresetRegistry): VNodeStyle {
  let result: VNodeStyle = {};
  // 1. 合并预设
  for (const name of vnode.stylePresets) {
    const preset = registry.get(name);
    if (preset) Object.assign(result, preset);
  }
  // 2. 内联样式覆盖
  Object.assign(result, vnode.style);
  return result;
}
```

**各宿主如何处理 stylePresets**：

| 宿主 | 处理方式 |
|---|---|
| **DOM** | 可选两种策略：(a) 调用 `resolveComputedStyle()` 合并为内联 style（简单）；(b) 将预设注入 `<style>` 标签生成 CSS 类，在元素上设 className（高性能，大量节点复用时更优） |
| **TUI** | 调用 `resolveComputedStyle()` 得到最终样式，映射为 ANSI 颜色/属性 |
| **Canvas** | 调用 `resolveComputedStyle()` 得到最终样式，映射为 Canvas 绘制参数 |
| **Native** | 调用 `resolveComputedStyle()` 得到最终样式，映射为平台原生样式 |

DOM 宿主可以选择策略 (b) 作为优化——检测到 stylePresets 时自动生成 CSS 类名并注入样式表，
这样大量节点复用同一预设时只需设置 className 而非逐个设置内联样式。这是**宿主内部的优化细节**，
对 VNode 层完全透明。

### 布局组件（Flex / Grid / 栅格）

布局是**组件级抽象**，而非样式属性。各宿主根据自身能力实现布局：
- **DOM**：通过 CSS `display: flex/grid` + 相应属性实现
- **TUI**：根据终端 `cols × rows` 窗口尺寸，自行计算子节点占位
- **Canvas**：根据画布宽高，自行计算子节点绘制位置

```typescript
// ─── Flex 布局组件 ─────────────────────────────────────────
// VNode kind = "element", tag = "flex"
// 宿主渲染器识别 tag="flex" 后按各自方式实现弹性布局
interface FlexProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  gap?: number | string;
  style?: VNodeStyle;   // 视觉样式（颜色、边框等）
}
function Flex(props: FlexProps, children: ViewChildren): TimelessElement;

// ─── Grid 布局组件 ─────────────────────────────────────────
// VNode tag = "grid"
interface GridProps {
  columns?: number | string;   // 列定义（数字 = 等分，字符串 = 模板）
  rows?: number | string;      // 行定义
  gap?: number | string;
  autoFlow?: "row" | "column" | "dense";
  style?: VNodeStyle;
}
function Grid(props: GridProps, children: ViewChildren): TimelessElement;

// ─── Grid 子项 ────────────────────────────────────────────
interface ColumnProps {
  span?: number;     // 占几列
  start?: number;    // 起始列
  end?: number;      // 结束列
  rowSpan?: number;  // 占几行
}
function Column(props: ColumnProps, children: ViewChildren): TimelessElement;
```

**宿主如何处理布局节点**：

| 布局节点 | DOM 渲染器 | TUI 渲染器 | Canvas 渲染器 |
|---|---|---|---|
| `tag="flex"` | 创建 div，设置 `display:flex` + flex 属性 | 读取 direction/gap，按终端宽高计算每个子节点的行列位置 | 读取 direction/gap，按画布尺寸计算每个子节点的绘制矩形 |
| `tag="grid"` | 创建 div，设置 `display:grid` + grid 属性 | 将 columns/rows 按终端字符宽度分割，计算单元格位置 | 将 columns/rows 按画布像素分割，计算单元格矩形 |
| `tag="column"` | 创建 div，设置 `grid-column/grid-row` | 在父级 grid 计算结果中定位 | 在父级 grid 计算结果中定位 |

布局属性通过 VNodeElement 的 `attrs` 或 `props` 传递（如 `props.direction = "row"`），宿主渲染器读取这些属性来执行布局。

### 平台无关事件类型

事件抽象需覆盖所有平台：web（鼠标+键盘）、移动端（触摸+手势）、桌面 native（鼠标+键盘）。
采用 **Pointer 统一层**——web 的 PointerEvent 已经统一了 mouse/touch/pen，native 端各宿主负责将平台事件映射为 PointerEventData。

```typescript
// packages/primitive/src/vnode/events.ts

/** 统一指针事件（覆盖鼠标、触摸、手写笔） */
interface PointerEventData {
  clientX: number; clientY: number;
  offsetX: number; offsetY: number;
  button: number;
  pointerId?: number;
  pointerType: "mouse" | "touch" | "pen";   // 区分输入设备
  pressure?: number;                         // 压力（支持 3D Touch / Force Touch）
  isPrimary: boolean;                        // 多点触控时标识主触点
  target: VNode; currentTarget: VNode;
  preventDefault(): void;
  stopPropagation(): void;
}

/** 手势事件（移动端常用，桌面端可选） */
interface GestureEventData {
  type: "tap" | "doubletap" | "longpress" | "swipe" | "pinch" | "rotate" | "pan";
  clientX: number; clientY: number;
  // swipe
  direction?: "up" | "down" | "left" | "right";
  velocity?: number;
  // pinch/rotate
  scale?: number;
  rotation?: number;
  // pan
  translationX?: number;
  translationY?: number;
  target: VNode;
  preventDefault(): void;
}

interface KeyEventData {
  key: string; code: string;
  altKey: boolean; ctrlKey: boolean; shiftKey: boolean; metaKey: boolean;
  target: VNode;
  preventDefault(): void; stopPropagation(): void;
}

interface FocusEventData { target: VNode; relatedTarget: VNode | null; }
interface InputEventData { value: string; target: VNode; }
interface ScrollEventData { scrollTop: number; scrollLeft: number; target: VNode; }

interface VNodeEvents {
  // ─── Pointer 统一层（所有平台） ─────────────────
  onPointerDown?: (e: PointerEventData) => void;
  onPointerMove?: (e: PointerEventData) => void;
  onPointerUp?: (e: PointerEventData) => void;
  onPointerEnter?: (e: PointerEventData) => void;
  onPointerLeave?: (e: PointerEventData) => void;
  onPointerCancel?: (e: PointerEventData) => void;

  // ─── 手势（移动端原生支持，web 端可由宿主合成） ──
  onTap?: (e: GestureEventData) => void;         // 替代 onClick
  onDoubleTap?: (e: GestureEventData) => void;    // 替代 onDoubleClick
  onLongPress?: (e: GestureEventData) => void;
  onSwipe?: (e: GestureEventData) => void;
  onPinch?: (e: GestureEventData) => void;
  onRotate?: (e: GestureEventData) => void;
  onPan?: (e: GestureEventData) => void;

  // ─── 通用事件（所有平台） ─────────────────────
  onFocus?: (e: FocusEventData) => void;
  onBlur?: (e: FocusEventData) => void;
  onKeyDown?: (e: KeyEventData) => void;
  onKeyUp?: (e: KeyEventData) => void;
  onInput?: (e: InputEventData) => void;
  onChange?: (e: InputEventData) => void;
  onScroll?: (e: ScrollEventData) => void;

  // 扩展逃逸口
  [key: `on${string}`]: ((e: any) => void) | undefined;
}
```

**各宿主的事件映射**：

| VNode 事件 | DOM 宿主 | iOS 宿主 | Android 宿主 | TUI 宿主 |
|---|---|---|---|---|
| `onTap` | 合成自 click | UITapGestureRecognizer | GestureDetector.onSingleTapUp | 键盘 Enter |
| `onDoubleTap` | 合成自 dblclick | UITapGestureRecognizer(taps:2) | GestureDetector.onDoubleTap | - |
| `onLongPress` | 合成自 pointerdown + timer | UILongPressGestureRecognizer | GestureDetector.onLongPress | - |
| `onSwipe` | 合成自 pointer 序列 | UISwipeGestureRecognizer | GestureDetector.onFling | 方向键 |
| `onPinch` | 合成自多点 pointer | UIPinchGestureRecognizer | ScaleGestureDetector | - |
| `onPointerDown` | pointerdown | touchesBegan | onTouchEvent(DOWN) | - |
| `onKeyDown` | keydown | pressesBegan | onKeyDown | raw stdin |
```

---

## 二、VNode 工厂方法与树操作

```typescript
// packages/primitive/src/vnode/create.ts

/** 创建元素节点 */
function createElement(tag: string, config?: {
  key?: VNodeKey;
  style?: VNodeStyle;
  stylePresets?: string[];
  attrs?: Record<string, string | boolean | number>;
  props?: Record<string, any>;
  events?: VNodeEvents;
  draggable?: boolean;
  focusable?: boolean;
}, children?: VNode[]): VNodeElement;

/** 创建文本节点 */
function createText(text: string): VNodeText;

/** 创建片段节点 */
function createFragment(children: VNode[]): VNodeFragment;

/** 树操作 */
function appendChild(parent: VNodeElement | VNodeFragment, child: VNode): void;
function removeChild(parent: VNodeElement | VNodeFragment, child: VNode): void;
function insertBefore(parent: VNodeElement | VNodeFragment, child: VNode, before: VNode | null): void;
function replaceChild(parent: VNodeElement | VNodeFragment, newChild: VNode, oldChild: VNode): void;
function clearChildren(parent: VNodeElement | VNodeFragment): void;

/**
 * replaceChildren：替换节点的全部子内容（抽象的"内容替换"语义）
 * 这是 innerHTML 的平台无关抽象：
 * - DOM 宿主可用 innerHTML 实现
 * - TUI/Canvas 宿主则清除旧子节点、插入新子节点
 */
function replaceChildren(parent: VNodeElement, newChildren: VNode[]): void;
```

---

## 三、响应式集成

Timeless 没有 diff 过程。更新由 Signal 直接驱动 VNode 属性变更，再通知宿主渲染器 patch。

```typescript
// packages/primitive/src/vnode/reactive.ts

/** 调度器：批量收集 VNode 脏标记，微任务刷新到宿主渲染器 */
interface RendererScheduler {
  markDirty(vnode: VNode): void;
  scheduleFlush(): void;
  flush(): void;
}

/** 将 Signal 绑定到 VNode 属性 */
function bindStyle(vnode: VNodeElement, key: keyof VNodeStyle, ref: Signal<any>, scheduler: RendererScheduler): void;
function bindStylePresets(vnode: VNodeElement, ref: Signal<string[]>, scheduler: RendererScheduler): void;
function bindAttr(vnode: VNodeElement, name: string, ref: Signal<any>, scheduler: RendererScheduler): void;
function bindProp(vnode: VNodeElement, name: string, ref: Signal<any>, scheduler: RendererScheduler): void;
function bindText(vnode: VNodeText, ref: Signal<string>, scheduler: RendererScheduler): void;
```

**响应式更新流程**：

```
Signal 变化
  → subscribe 回调
  → 直接修改 vnode.style.color = newValue
  → scheduler.markDirty(vnode)
  → renderer.patchNode(vnode, { style: { color: newValue } })
  → 平台节点更新

无 diff。无 reconciliation。Signal 精确知道"哪个节点的哪个属性变了"。
```

---

## 四、宿主渲染器契约（替代 40+ 方法的 HeadlessHost）

```typescript
// packages/primitive/src/vnode/host-renderer.ts

interface HostRenderer {
  kind: string;
  platform: "web" | "tui" | "canvas" | "ios" | "android" | "macos" | "windows";

  // 挂载/卸载
  createNode(vnode: VNode): void;      // 根据 tag 创建平台组件，存入 vnode._hostNode
  removeNode(vnode: VNode): void;      // 移除平台节点

  // 增量更新
  patchNode(vnode: VNode, changes: VNodePatch): void;

  // 树操作
  insertChild(parent: VNode, child: VNode, before: VNode | null): void;
  removeChild(parent: VNode, child: VNode): void;

  // 查询
  getBoundingRect(vnode: VNode): BoundingRect;
  getViewportSize(): { width: number; height: number };
  focus(vnode: VNode): void;
  blur(vnode: VNode): void;
  getBody(): VNodeElement;

  // 动画（替代 CSS transition/animation）
  animate(vnode: VNode, animations: AnimationConfig[]): Promise<void>;
  cancelAnimation(vnode: VNode): void;

  // 平台服务
  setTimeout(handler: () => void, ms: number): any;
  clearTimeout(id: any): void;
  addGlobalEventListener(type: string, handler: (e: any) => void, options?: any): void;
  removeGlobalEventListener(type: string, handler: (e: any) => void, options?: any): void;

  // 平台能力（可选，native 宿主实现）
  getSafeAreaInsets?(): { top: number; right: number; bottom: number; left: number };
}

interface VNodePatch {
  style?: Partial<VNodeStyle>;
  stylePresets?: string[];
  attrs?: Record<string, string | boolean | number | null>;  // null = 删除
  props?: Record<string, any>;
  text?: string;
  a11y?: Partial<VNodeA11y>;
}
```

### 各宿主实现映射

宿主渲染器只处理**原子 tag**——各平台自己的底层元素。复合组件（ScrollView 等）在 mount 阶段
已经被组件函数展开为原子 tag 的 VNode 树。

| VNode 操作 | DOM（原子 tag: div/span/input...） | iOS（原子 tag: ui-view/ui-label...） | Android（原子 tag: view/text-view...） | TUI（原子 tag: box/text） |
|---|---|---|---|---|
| `createNode` | `document.createElement(tag)` | `UIView()/UILabel()/...` | `new View()/TextView()/...` | 内存节点 |
| `patchNode({style})` | `el.style.X = ...` | `view.backgroundColor = ...` | `view.setBackgroundColor()` | ANSI 重绘 |
| `patchNode({a11y})` | `el.setAttribute("aria-*")` | `view.accessibilityLabel = ...` | `view.contentDescription = ...` | - |
| `insertChild` | `parent.insertBefore()` | `addSubview()` | `addView()` | 内存树操作 |
| `getBoundingRect` | `getBoundingClientRect()` | `view.frame` | `view.getLocationOnScreen()` | 从布局计算 |
| `animate` | Web Animations API | `UIView.animate()` | `ObjectAnimator` | 忽略/简化 |
| 事件分发 | addEventListener | UIGestureRecognizer | OnTouchListener | raw stdin |

---

## 五、提交阶段

```typescript
// packages/primitive/src/vnode/commit.ts

/** 初始挂载：深度优先遍历 VNode 树，创建平台节点 */
function commitTree(root: VNode, renderer: HostRenderer): void {
  renderer.createNode(root);
  if (root.kind === "element" || root.kind === "fragment") {
    for (const child of root.children) {
      commitTree(child, renderer);
      renderer.insertChild(root, child, null);
    }
  }
}

/** 批量提交脏节点（来自响应式更新） */
function commitPatches(dirty: Set<VNode>, patches: Map<VNode, VNodePatch>, renderer: HostRenderer): void;
```

---

## 六、元素描述符与 h() 函数

### 为什么需要描述符

当前 Timeless 的调用方式：
```typescript
View({ style: { color: "red" } }, [Txt("hello")])
// → 立即执行 View 函数，立即执行 Txt 函数
```

描述符方式：
```typescript
h(View, { style: { color: "red" } }, [h(Txt, {}, ["hello"])])
// → 不执行 View/Txt，只返回纯数据描述符
// → 框架在 mount 时才展开执行
```

**Timeless 不需要 diff/reconciliation**——更新由 Signal 直接驱动。
描述符的价值仅在于：

| 优势 | 说明 |
|---|---|
| **惰性求值** | Show 的 false 分支永远不执行，零成本 |
| **可序列化** | 纯数据，SSR 直接序列化，无需 stub host |

### 描述符类型

```typescript
// packages/primitive/src/vnode/descriptor.ts

const ELEMENT_TYPE = Symbol.for("timeless.element");

interface ElementDescriptor {
  $$typeof: typeof ELEMENT_TYPE;
  type: ComponentType;             // 组件函数 或 原生标签字符串
  props: Record<string, any>;
  children: ChildDescriptor[];
  key?: VNodeKey;
}

/** 组件函数：接收 props + children，返回 VNode */
type ComponentFn = (props: Record<string, any>, children: ChildDescriptor[]) => VNode;

type ComponentType = ComponentFn | string;
// string → 原生元素（"div", "span", "flex", "grid"...）
// function → 复合组件（Button, Select...）

type ChildDescriptor = ElementDescriptor | string | number | null;
```

### h() 函数

```typescript
// packages/primitive/src/vnode/h.ts

function h(
  type: ComponentType,
  props?: Record<string, any> | null,
  children?: ChildDescriptor[],
): ElementDescriptor {
  return {
    $$typeof: ELEMENT_TYPE,
    type,
    props: props ?? {},
    children: children ?? [],
    key: props?.key,
  };
}

function isDescriptor(v: unknown): v is ElementDescriptor {
  return v !== null && typeof v === "object" && (v as any).$$typeof === ELEMENT_TYPE;
}
```

### mount：描述符展开为 VNode 树

没有 diff，没有 reconciler。mount 就是一次性展开描述符、创建 VNode、建立 Signal 绑定。
后续更新全靠 Signal 直接驱动 VNode 属性变更。

```typescript
// packages/primitive/src/vnode/mount.ts

/**
 * 展开描述符树为 VNode 树（一次性，无 diff）
 * 展开过程中：
 *   1. 原生标签 → 直接创建 VNodeElement
 *   2. 组件函数 → 调用函数得到 VNode
 *   3. Signal props → 建立 subscribe 绑定
 */
function mount(descriptor: ElementDescriptor): VNode {
  const { type, props, children } = descriptor;

  if (typeof type === "string") {
    // 原生元素
    const vnode = createElement(type, {
      key: descriptor.key,
      style: props.style,
      stylePresets: props.stylePresets,
      attrs: props.attrs,
      events: extractEvents(props),
    });

    // Signal 绑定（响应式更新直接修改 vnode 属性）
    setupReactiveBindings(vnode, props);

    // 递归展开子描述符
    for (const child of children) {
      if (child === null) continue;
      if (typeof child === "string" || typeof child === "number") {
        appendChild(vnode, createText(String(child)));
      } else if (isDescriptor(child)) {
        appendChild(vnode, mount(child));
      }
    }
    return vnode;
  }

  // 复合组件：调用组件函数，返回 VNode
  const componentFn = type as ComponentFn;
  return componentFn(props, children);
}
```

### 完整流程

```
初始渲染:  h() → 描述符 → mount() → VNode 树 → commitTree() → 平台节点

更新:  Signal 变化
         → subscribe 回调
         → 直接修改 vnode.style.color = newValue
         → scheduler.markDirty(vnode)
         → renderer.patchNode(vnode, { style: { color: newValue } })
         → 平台节点更新
```

### 使用示例

```typescript
// 原生元素用字符串 tag
h("div", { style: { color: "red" } }, [
  "hello",
  h(Show, {
    when: visible,
    ok() {
      return [h("div", { style: { padding: 8 } }, ["content"])]; // visible=false 时不执行
    },
  }),
])

// 布局组件
h(Flex, { direction: "column", gap: 8 }, [
  h("div", { stylePresets: ["btn-primary"] }, ["Button 1"]),
  h("div", { stylePresets: ["btn-primary"] }, ["Button 2"]),
])
```

### SSR

```typescript
// packages/primitive/src/vnode/serialize.ts

/** 描述符 → HTML 字符串（不需要 host，不需要 DOM） */
function renderToString(descriptor: ElementDescriptor): string;

/** VNode → JSON（hydration 数据） */
function vnodeToJSON(vnode: VNode): object;
```

---

## 七、文件结构

```
packages/primitive/src/
  vnode/
    types.ts          - VNode, VNodeElement, VNodeText, VNodeFragment, VNodeStyle, VNodeA11y
    events.ts         - PointerEventData, GestureEventData, KeyEventData 等平台无关事件
    style-preset.ts   - StylePreset, StylePresetRegistry（替代 className）
    animation.ts      - AnimationConfig, VNodeTransform, VNodeShadow
    descriptor.ts     - ElementDescriptor, ELEMENT_TYPE, ChildDescriptor
    h.ts              - h() 函数（描述符工厂）
    create.ts         - createElement, createText, createFragment, 树操作（VNode 层）
    mount.ts          - mount()：描述符 → VNode 展开（无 diff）
    commit.ts         - commitTree, commitPatches：VNode → 平台节点
    reactive.ts       - bindStyle, bindStylePresets, RendererScheduler
    host-renderer.ts  - HostRenderer 接口, VNodePatch 类型
    serialize.ts      - renderToString, vnodeToJSON (SSR)
    index.ts          - 统一导出
  host/
    index.ts          - getRenderer()/setRenderer()（替代 getHost()/setHost()）
    stub.ts           - StubRenderer（测试用）
    legacy-adapter.ts - LegacyHostAdapter（过渡期兼容旧 HeadlessHost）
```

---

## 八、分阶段迁移策略

| 阶段 | 内容 | 影响范围 | 破坏性 |
|---|---|---|---|
| **Phase 1** | 新增 `vnode/` 目录，定义所有类型和工厂方法 | 纯新增 | 无 |
| **Phase 2** | 改造 View/For/Show/Match/Fragment/Txt 产出 VNode | primitive/ 核心 | 内部 |
| **Phase 3** | 创建 `LegacyHostAdapter`，让新组件兼容旧宿主 | host/ | 无 |
| **Phase 4** | 逐个迁移 53 个 module 组件 | modules/ | 内部 |
| **Phase 5** | 迁移 12 个 native 组件 | native/ | 内部 |
| **Phase 6** | 重写 DOM/TUI/Canvas 宿主为 HostRenderer | 三个宿主包 | 内部 |
| **Phase 7** | 删除旧 HeadlessHost、TuiNode、CanvasNode、Stub | 全局清理 | 有 |

---

## 九、验证方式

1. **Phase 1 完成后**：编写单元测试，验证 VNode 工厂方法、树操作、序列化输出正确
2. **Phase 2-3 完成后**：用 LegacyHostAdapter + 旧 DOM host 运行现有 demo，确保渲染结果一致
3. **Phase 6 完成后**：分别在 DOM、TUI、Canvas 环境运行 demo，验证三端渲染正确
4. **全程**：TypeScript 编译通过，现有测试不回归
