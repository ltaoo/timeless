# Accordion 组件迁移指南

本文档记录了将 Accordion 组件从旧的 theme-based 架构迁移到新的 Core + Primitive + Shadcn 三层架构的过程。

## 架构概览

新架构分为三层：

1. **UI Core 层** (`packages/ui/src/accordion/index.ts`) - 状态管理和业务逻辑
2. **Headless 层** (`packages/timeless/src/accordion.ts`) - 无样式的 UI 组件
3. **Shadcn 层** (`packages/shadcn/src/accordion.ts`) - 带样式的完整组件

## 第一步：创建 UI Core 层

### 文件位置
`packages/ui/src/accordion/index.ts`

### 核心职责
- 管理组件状态（openItems）
- 提供业务逻辑方法（toggle, open, close, isOpen）
- 实现事件系统（onStateChange, onOpenItemsChange）

### 实现要点

```typescript
import { base, Handler } from "@timeless/base";
import { refarr } from "@timeless/reactive";

type AccordionCoreProps = {
  type?: "single" | "multiple";
  defaultOpenItems?: number[];
};

export function AccordionCore(props: AccordionCoreProps = {}) {
  const { type = "single", defaultOpenItems = [] } = props;

  // 使用 refarr 管理响应式数组状态
  const openItems = refarr(defaultOpenItems);

  // 定义状态对象
  const _state = {
    get openItems() {
      return openItems.value;
    },
    get type() {
      return type;
    },
  };

  // 定义事件枚举
  enum Events {
    StateChange,
    OpenItemsChange,
  }

  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.OpenItemsChange]: number[];
  };

  // 创建事件总线
  const bus = base<TheTypesOfEvents>();

  return {
    shape: "accordion" as const,
    type,
    openItems,
    state: _state,

    // 切换展开/收起
    toggle(index: number) {
      if (type === "single") {
        openItems.as(openItems.value.includes(index) ? [] : [index]);
      } else {
        const nextOpenItems = openItems.value.includes(index)
          ? openItems.value.filter((i: number) => i !== index)
          : [...openItems.value, index];
        openItems.as(nextOpenItems);
      }
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    // 展开指定项
    open(index: number) {
      if (type === "single") {
        openItems.as([index]);
      } else {
        if (!openItems.value.includes(index)) {
          openItems.as([...openItems.value, index]);
        }
      }
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    // 收起指定项
    close(index: number) {
      openItems.as(openItems.value.filter((i: number) => i !== index));
      bus.emit(Events.OpenItemsChange, openItems.value);
      bus.emit(Events.StateChange, { ..._state });
    },

    // 判断是否展开
    isOpen(index: number) {
      return openItems.value.includes(index);
    },

    // 事件监听器
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },

    onOpenItemsChange(handler: Handler<TheTypesOfEvents[Events.OpenItemsChange]>) {
      return bus.on(Events.OpenItemsChange, handler);
    },
  };
}

export type AccordionCore = ReturnType<typeof AccordionCore>;
```

### 导出到 packages/ui/src/index.ts

```typescript
export * from "./accordion";
```

## 第二步：创建 Headless 层

### 文件位置
`packages/timeless/src/accordion.ts`

### 核心职责
- 提供无样式的 UI 组件（Root, Item, Trigger, Chevron, Content）
- 连接 UI Core 的状态和事件
- 处理用户交互逻辑

### 迁移对比

**旧架构（theme-based）：**
```typescript
export function Accordion(props: any) {
  const { items, type = "single", theme: t, class: cn, style: st } = props;
  const openItems = refarr(type === "single" ? [0] : []);

  // 状态和逻辑混在一起
  const toggle = () => {
    if (type === "single") {
      openItems.as(openItems.includes(index) ? [] : [index]);
    } else {
      // ...
    }
  };

  // 直接渲染完整的 UI 结构
  return View({ ...merge(tp(t?.root), cn, st) }, [
    ...items.map((item: any, index: number) => {
      // ...
    }),
  ]);
}
```

**新架构（Primitive 组件）：**
```typescript
import { AccordionCore } from "@timeless/ui";
import { View, ViewChildren, ViewProps } from "./view";

// Root 组件 - 容器
export function Root(
  props: ViewProps & { store: AccordionCore },
  children?: ViewChildren,
) {
  const { store, ...rest } = props;
  return View(rest, children);
}

// Item 组件 - 单个手风琴项
export function Item(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;
  return View(rest, children);
}

// Trigger 组件 - 可点击的触发器
export function Trigger(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;

  // 使用 computed 计算响应式状态
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  // 点击切换逻辑
  const toggle = () => {
    if (store.type === "single") {
      store.openItems.as(store.openItems.value.includes(index) ? [] : [index]);
    } else {
      const nextOpenItems = store.openItems.value.includes(index)
        ? store.openItems.value.filter((i: number) => i !== index)
        : [...store.openItems.value, index];
      store.openItems.as(nextOpenItems);
    }
  };

  return View(
    {
      ...rest,
      onClick: toggle,
    },
    children,
  );
}

// Chevron 组件 - 箭头图标
export function Chevron(
  props: ViewProps & { store: AccordionCore; index: number },
  children?: ViewChildren,
) {
  const { store, index, ...rest } = props;
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  return View(
    {
      ...rest,
      class: computed(isOpen, (d) => {
        const baseClass = rest.class || "";
        return typeof baseClass === "string" ? baseClass : "";
      }),
    },
    children || [Txt("▾")],
  );
}

// Content 组件 - 内容区域
export function Content(
  props: ViewProps & { store: AccordionCore; index: number },
  children: ViewChildren,
) {
  const { store, index, ...rest } = props;
  const isOpen = computed(store.openItems, (d) => d.includes(index));

  return View(
    {
      ...rest,
      class: computed(isOpen, (d) => {
        const baseClass = rest.class || "";
        return typeof baseClass === "string" ? baseClass : "";
      }),
    },
    children,
  );
}
```

### 关键改进点

1. **状态管理分离**：状态逻辑移到 UI Core，Headless 层只负责 UI 交互
2. **组件拆分**：从单一组件拆分为 Root、Item、Trigger、Chevron、Content 多个组件
3. **灵活性提升**：每个子组件可以独立使用和定制
4. **类型安全**：明确的 props 类型定义

## 第三步：创建 Shadcn 层

### 文件位置
`packages/shadcn/src/accordion.ts`

### 核心职责
- 组装 Headless 层的 Primitive 组件
- 应用 shadcn/ui 风格的样式
- 提供开箱即用的完整组件

### 迁移对比

**旧架构（theme 配置）：**
```typescript
import { Accordion as H } from "@timeless/timeless";

const t = {
  root: { class: "w-full" },
  item: { class: "border-b border-zinc-200 dark:border-zinc-800" },
  trigger: { class: "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline" },
  chevron: ({ isOpen }) => ({ class: ["text-sm transition-transform duration-200", isOpen ? "rotate-180" : ""].join(" ") }),
  content: ({ isOpen }) => ({ class: isOpen ? "overflow-hidden pb-4 pt-0 text-sm" : "hidden" }),
};

export function Accordion(p: any) {
  return H({ ...p, theme: t });
}
```

**新架构（组件组装）：**
```typescript
import { computed, refobj } from "@timeless/reactive";
import {
  AccordionPrimitive,
  For,
  ViewChildren,
  ViewProps,
  Txt,
} from "@timeless/timeless";
import { AccordionCore } from "@timeless/ui";

type AccordionItem = {
  title: string;
  content: ViewChildren;
};

export function Accordion(
  props: ViewProps & {
    store: AccordionCore;
    items: AccordionItem[];
  },
) {
  const { store, items, ...rest } = props;

  // 使用 refobj 管理状态的响应式引用
  const state_ = refobj(store.state);

  // 监听状态变化
  store.onStateChange((v) => {
    state_.as(v);
  });

  return AccordionPrimitive.Root(
    {
      store,
      class: "w-full",
      ...rest,
    },
    [
      // 使用 For 循环渲染 items
      For({
        each: items,
        render(item: AccordionItem, index: number) {
          return AccordionPrimitive.Item(
            {
              store,
              index,
              class: "border-b border-zinc-200 dark:border-zinc-800",
            },
            [
              // Trigger 区域
              AccordionPrimitive.Trigger(
                {
                  store,
                  index,
                  class:
                    "flex w-full items-center justify-between py-4 font-medium transition-all cursor-pointer hover:underline",
                },
                [
                  Txt(item.title),
                  // Chevron 箭头
                  AccordionPrimitive.Chevron(
                    {
                      store,
                      index,
                      class: computed(state_, (d) => {
                        const isOpen = d.openItems.includes(index);
                        return [
                          "text-sm transition-transform duration-200",
                          isOpen ? "rotate-180" : "",
                        ]
                          .filter(Boolean)
                          .join(" ");
                      }),
                    },
                    [Txt("▾")],
                  ),
                ],
              ),
              // Content 内容区域
              AccordionPrimitive.Content(
                {
                  store,
                  index,
                  class: computed(state_, (d) => {
                    const isOpen = d.openItems.includes(index);
                    return isOpen
                      ? "overflow-hidden pb-4 pt-0 text-sm"
                      : "hidden";
                  }),
                },
                item.content,
              ),
            ],
          );
        },
      }),
    ],
  );
}
```

### 关键改进点

1. **状态响应式**：使用 `refobj` 和 `computed` 实现响应式样式更新
2. **事件监听**：通过 `onStateChange` 监听状态变化
3. **样式动态计算**：根据 `openItems` 状态动态计算样式类
4. **组件组合**：显式组装各个 Primitive 组件，结构清晰

## 使用示例

```typescript
import { AccordionCore } from "@timeless/ui";
import { Accordion } from "@timeless/shadcn";

// 创建 store
const store = AccordionCore({
  type: "single",
  defaultOpenItems: [0],
});

// 使用组件
Accordion({
  store,
  items: [
    {
      title: "Section 1",
      content: [Txt("Content 1")],
    },
    {
      title: "Section 2",
      content: [Txt("Content 2")],
    },
  ],
});
```

## 迁移检查清单

- [ ] 创建 UI Core 层（`packages/ui/src/accordion/index.ts`）
  - [ ] 定义 Props 类型
  - [ ] 使用 `refarr` 管理状态
  - [ ] 实现业务逻辑方法
  - [ ] 实现事件系统
  - [ ] 导出类型

- [ ] 导出 Core 到 `packages/ui/src/index.ts`

- [ ] 创建 Headless 层（`packages/timeless/src/accordion.ts`）
  - [ ] 拆分为多个 Primitive 组件（Root, Item, Trigger, Chevron, Content）
  - [ ] 每个组件接收 `store` 和必要的 props
  - [ ] 使用 `computed` 计算响应式状态
  - [ ] 处理用户交互（onClick 等）

- [ ] 创建 Shadcn 层（`packages/shadcn/src/accordion.ts`）
  - [ ] 导入 Primitive 组件
  - [ ] 使用 `refobj` 管理状态引用
  - [ ] 监听 `onStateChange` 事件
  - [ ] 使用 `For` 循环渲染列表
  - [ ] 应用 shadcn/ui 样式类
  - [ ] 使用 `computed` 动态计算样式

## 参考组件

可以参考以下已迁移的组件：
- `packages/ui/src/switch/index.ts` - 简单的 Core 实现
- `packages/ui/src/tabs/index.ts` - 复杂的 Core 实现（使用 class）
- `packages/shadcn/src/select.ts` - 完整的 Shadcn 层实现
