# 抽象菜单组件设计文档

## 1. 组件结构

```
Menu (菜单容器)
├── MenuItem (菜单项)
│   ├── MenuCheckboxMenu (复选菜单项)
│   ├── MenuRadioItem (单选菜单项)
│   └── MenuRadioGroupItem (单选组菜单项)
├── MenuGroup (菜单组)
│   └── MenuItem[]
├── MenuSeparator (分割线)
└── SubMenu (子菜单 - 递归 Menu)
```

## 2. 核心状态

### Menu 状态
```ts
MenuState = {
  open: boolean       // 菜单是否展开
  hover: boolean      // 鼠标是否在菜单内
  items: MenuEntry[]  // 菜单项列表
  enter: boolean      // 进入动画状态
  exit: boolean       // 退出动画状态
}
```

### MenuItem 状态
```ts
MenuItemState = {
  label: string       // 文案
  icon: unknown       // 图标
  shortcut: string    // 快捷键
  disabled: boolean   // 是否禁用
  focused: boolean    // 是否聚焦（高亮）
  open: boolean       // 子菜单是否展开
}
```

## 3. 交互场景分类

### 3.1 菜单打开/关闭

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| 点击触发器打开 | trigger.click | menu.show() |
| 点击触发器关闭 | trigger.click && menu.open | menu.hide() |
| 点击菜单外部关闭 | dismissableLayer.dismiss | menu.hide() |
| 按 Escape 关闭 | keydown.Escape | menu.hide() |
| 打开新菜单时关闭其他 | menu.show() | otherOpenMenus.hide() |

```ts
// 伪代码：打开菜单
trigger.onClick = () => {
  menu.toggle()
}

menu.toggle = () => {
  if (state.open) {
    this.hide()
  } else {
    this.show()
  }
}

menu.show = () => {
  if (state.open) return

  // 关闭其他已打开的根菜单
  for (otherMenu of openRootMenus) {
    if (otherMenu !== this) {
      otherMenu.hide()
    }
  }

  openRootMenus.add(this)
  presence.show()
  popper.place()
  emit(Events.Show)
}

menu.hide = () => {
  if (!state.open) return

  emit(Events.Hiding)
  openRootMenus.delete(this)

  // 关闭所有子菜单
  if (cur_item?.menu?.state.open) {
    cur_item.menu.hide()
  }

  presence.hide()
  state.open = false
  emit(Events.StateChange)
}
```

### 3.2 菜单项悬停交互

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| 鼠标进入普通菜单项 | item.pointerEnter | item.focus() |
| 鼠标进入带子菜单的菜单项 | item.pointerEnter && item.menu | item.focus() + item.menu.show() |
| 鼠标离开菜单项 | item.pointerLeave | item.blur() (条件性) |
| 鼠标从菜单项A移到菜单项B | itemA.leave + itemB.enter | itemA.blur() + itemB.focus() |
| 鼠标从菜单项移到子菜单 | item.leave → submenu.enter | 保持 item.focused, 取消隐藏定时器 |

```ts
// 伪代码：菜单项悬停
item.handlePointerEnter = () => {
  if (_enter) return

  _enter = true
  _focused = true
  emit(Events.Enter)
  emit(Events.Change)
}

// 菜单监听 item.onEnter
menu.listen_item(item) {
  item.onEnter(() => {
    // 清除隐藏子菜单的定时器
    if (hide_sub_timer) {
      clearTimeout(hide_sub_timer)
      hide_sub_timer = null
    }

    // 清除父菜单的定时器（防止从菜单项移动到子菜单时被关闭）
    if (parent_menu?.hide_sub_timer) {
      clearTimeout(parent_menu.hide_sub_timer)
      parent_menu.hide_sub_timer = null
    }

    emit(Events.EnterItem, item)

    // 如果有子菜单，显示它
    if (item.menu) {
      item.menu.show()
    }

    // 切换焦点：取消之前菜单项的聚焦，关闭其子菜单
    if (cur_item && cur_item !== item) {
      cur_item.blur()
      if (cur_item.menu) {
        cur_item.menu.hide()
      }
    }

    cur_item = item
  })
}
```

### 3.3 子菜单交互（关键场景）

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| 鼠标进入子菜单 | submenu.popper.onEnter | 清除父菜单 hide_sub_timer |
| 鼠标离开子菜单 | submenu.popper.onLeave | 设置 hide_sub_timer |
| 鼠标从子菜单项移到子菜单内容 | item.leave → submenu.enter | 保持子菜单打开 |
| 鼠标从子菜单移到父菜单 | submenu.leave → parentItem.enter | 关闭子菜单 |
| 鼠标离开整个菜单区域 | menu.handleLeave | 延迟关闭子菜单 (300ms) |

```ts
// 伪代码：子菜单悬停安全区
menu.popper.onEnter = () => {
  state.hover = true

  // 关键：清除父菜单的定时器，防止子菜单被错误关闭
  if (parent_menu?.hide_sub_timer) {
    clearTimeout(parent_menu.hide_sub_timer)
    parent_menu.hide_sub_timer = null
  }

  emit(Events.EnterMenu)
}

menu.popper.onLeave = () => {
  state.hover = false
  emit(Events.LeaveMenu)
}

// 鼠标离开菜单容器
menu.handleLeave = () => {
  if (!cur_item) return

  // 如果当前菜单项有打开的子菜单，延迟关闭
  // 300ms 延迟让用户有时间移动到子菜单
  if (cur_item.menu && cur_item._open) {
    hide_sub_timer = setTimeout(() => {
      hide_sub_timer = null
      // 子菜单关闭逻辑（如需要）
    }, 300)
  }
}
```

### 3.4 菜单项点击

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| 点击普通菜单项 | item.click && !disabled | emit(Click) + menu.hide() |
| 点击禁用菜单项 | item.click && disabled | 无响应 |
| 点击复选菜单项 | checkboxItem.click | toggle checked + emit(Click) |
| 点击单选菜单项 | radioItem.click | setChecked(true) + emit(Click) |
| 点击带子菜单的菜单项 | item.click && item.menu | submenu.toggle() (可选) |

```ts
// 伪代码：菜单项点击
item.handleClick = () => {
  if (_disabled) return
  emit(Events.Click)
}

// Checkbox 特殊处理
checkboxItem.handleClick = () => {
  if (_disabled) return
  this.toggle()  // checked = !checked
  emit(Events.Click)
}

// RadioGroup 特殊处理
radioGroupItem.handleClick = () => {
  if (_disabled) return
  this.setChecked(true)
  // 自动取消同组其他项的选中状态
  this._enforceGroupSelection()
  emit(Events.Click)
}
```

### 3.5 键盘导航

| 场景 | 触发条件 | 行为 |
|------|---------|------|
| ArrowDown | keydown | 聚焦下一个菜单项 |
| ArrowUp | keydown | 聚焦上一个菜单项 |
| ArrowRight (LTR) | keydown && item.menu | 打开子菜单 |
| ArrowLeft (LTR) | keydown && inSubmenu | 关闭子菜单，返回父菜单 |
| Enter / Space | keydown | 触发当前菜单项点击 |
| Home / PageUp | keydown | 聚焦第一个菜单项 |
| End / PageDown | keydown | 聚焦最后一个菜单项 |
| Escape | keydown | 关闭菜单 |

```ts
// 伪代码：键盘导航
const SELECTION_KEYS = ["Enter", " "]
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"]
const LAST_KEYS = ["ArrowUp", "PageDown", "End"]
const SUB_OPEN_KEYS = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"],
}
const SUB_CLOSE_KEYS = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
}

menu.handleKeyDown = (event) => {
  const key = event.key

  if (FIRST_KEYS.includes(key)) {
    focusFirstItem()
    return
  }

  if (LAST_KEYS.includes(key)) {
    focusLastItem()
    return
  }

  if (key === "ArrowDown") {
    focusNextItem()
    return
  }

  if (key === "ArrowUp") {
    focusPrevItem()
    return
  }

  if (SUB_OPEN_KEYS[direction].includes(key)) {
    if (cur_item?.menu) {
      cur_item.menu.show()
      cur_item.menu.focusFirstItem()
    }
    return
  }

  if (SUB_CLOSE_KEYS[direction].includes(key)) {
    if (parent_menu) {
      this.hide()
      parent_menu.cur_item?.focus()
    }
    return
  }

  if (key === "Escape") {
    this.hide()
    return
  }

  if (SELECTION_KEYS.includes(key)) {
    cur_item?.handleClick()
    return
  }
}
```

## 4. 状态转换图

### 4.1 菜单状态机

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
┌─────────┐  show  ┌─────────┐  hide  ┌──────────┐   │ animationEnd
│ Closed  │───────▶│  Open   │───────▶│ Closing  │───┘
└─────────┘        └─────────┘        └──────────┘
     ▲                                      │
     │                                      │
     └──────────────────────────────────────┘
                  onHidden
```

### 4.2 菜单项焦点状态机

```
                    pointerEnter
┌──────────┐  ─────────────────────▶  ┌─────────┐
│ Unfocused│                          │ Focused │
└──────────┘  ◀─────────────────────  └─────────┘
                    pointerLeave
                    (无子菜单或子菜单已关闭)
```

### 4.3 带子菜单的菜单项状态

```
                           pointerEnter
    ┌───────────┐  ────────────────────────▶  ┌────────────────┐
    │ Unfocused │                             │ Focused + Open │
    │ Submenu   │                             │ Submenu Open   │
    │ Closed    │                             │                │
    └───────────┘  ◀────────────────────────  └────────────────┘
                   移到其他菜单项 / 点击外部
                   (延迟 300ms 关闭子菜单)
```

## 5. 完整交互流程示例

### 示例 1：打开菜单 → 悬停菜单项 → 点击

```ts
// 1. 用户点击触发器
trigger.click()
  → menu.toggle()
  → menu.show()
    → presence.show()
    → popper.place()
    → state.open = true
    → emit(Events.Show)

// 2. 用户鼠标移入菜单项 A
itemA.handlePointerEnter()
  → itemA._enter = true
  → itemA._focused = true
  → itemA.emit(Events.Enter)
  → menu.onEnterItem(itemA)
    → menu.cur_item = itemA

// 3. 用户鼠标移入菜单项 B
itemB.handlePointerEnter()
  → itemB._focused = true
  → itemB.emit(Events.Enter)
  → menu.onEnterItem(itemB)
    → itemA.blur()  // 取消 A 的聚焦
    → menu.cur_item = itemB

// 4. 用户点击菜单项 B
itemB.handleClick()
  → itemB.emit(Events.Click)
  → (业务逻辑处理)
  → menu.hide()
    → presence.hide()
    → state.open = false
```

### 示例 2：悬停带子菜单的菜单项 → 移入子菜单

```ts
// 1. 用户鼠标移入带子菜单的菜单项
parentItem.handlePointerEnter()
  → parentItem._focused = true
  → parentItem.emit(Events.Enter)
  → parentMenu.onEnterItem(parentItem)
    → parentItem.menu.show()  // 显示子菜单
    → parentItem._open = true
    → parentMenu.cur_item = parentItem

// 2. 用户鼠标移出菜单项（向子菜单移动）
parentItem.handlePointerLeave()
  → parentItem._enter = false
  → parentItem.emit(Events.Leave)
  // 注意：不立即 blur，因为子菜单可能正在打开

// 3. 用户鼠标移入菜单容器边缘（离开菜单项但还没到子菜单）
parentMenu.handleLeave()
  → // 设置 300ms 延迟定时器
  → parentMenu.hide_sub_timer = setTimeout(() => {
       // 如果定时器到期，关闭子菜单
     }, 300)

// 4. 用户鼠标移入子菜单
submenu.popper.onEnter()
  → submenu.state.hover = true
  → // 关键：清除父菜单的定时器
  → clearTimeout(parentMenu.hide_sub_timer)
  → parentMenu.hide_sub_timer = null
  → submenu.emit(Events.EnterMenu)

// 5. 用户在子菜单中操作...
```

### 示例 3：键盘导航

```ts
// 1. 用户按 ArrowDown
menu.handleKeyDown({ key: "ArrowDown" })
  → focusNextItem()
    → nextItem = items.find(i => i.index > cur_item.index && !i.disabled)
    → cur_item?.blur()
    → nextItem.focus()
    → cur_item = nextItem

// 2. 用户按 ArrowRight 进入子菜单
menu.handleKeyDown({ key: "ArrowRight" })
  → if (cur_item?.menu) {
       cur_item.menu.show()
       cur_item.menu.focusFirstItem()
     }

// 3. 用户按 ArrowLeft 返回父菜单
submenu.handleKeyDown({ key: "ArrowLeft" })
  → if (parent_menu) {
       this.hide()
       parent_menu.cur_item?.focus()
     }

// 4. 用户按 Enter 触发
menu.handleKeyDown({ key: "Enter" })
  → cur_item?.handleClick()
```

## 6. 边界情况处理

| 边界情况 | 处理方式 |
|---------|---------|
| 快速移动鼠标穿过多个菜单项 | 只响应最终停留的菜单项 |
| 从菜单项斜向移动到子菜单 | 300ms 延迟 + 定时器清除机制 |
| 子菜单超出视口 | Popper 自动调整位置 |
| 禁用的菜单项 | 忽略 Enter/Click，不设置焦点 |
| 菜单打开时触发器被移除 | DismissableLayer 自动关闭 |
| 多个根菜单同时存在 | 打开新菜单时自动关闭其他 |
| 动画进行中再次触发 | presence 状态机控制，防止状态冲突 |

## 7. 事件清单

### Menu Events
- `Show` - 菜单显示
- `Hiding` - 菜单开始隐藏（动画开始）
- `Hidden` - 菜单完全隐藏
- `EnterItem` - 鼠标进入菜单项
- `LeaveItem` - 鼠标离开菜单项
- `EnterMenu` - 鼠标进入菜单容器
- `LeaveMenu` - 鼠标离开菜单容器
- `StateChange` - 状态变化

### MenuItem Events
- `Enter` - 鼠标进入
- `Leave` - 鼠标离开
- `Focus` - 获得焦点
- `Blur` - 失去焦点
- `Click` - 点击
- `Change` - 状态变化

## 8. 完整示例代码

```ts
import { ButtonCore } from "@/button";
import { MenuCore } from "@/menu";
import { MenuItemCore } from "@/menu/item";
import { MenuGroupCore } from "@/menu/group";
import { MenuSeparatorCore } from "@/menu/separator";

// ============================================
// 示例 1：基础菜单
// ============================================

// 创建菜单项
const copyItem = new MenuItemCore({
  label: "复制",
  shortcut: "⌘C",
  onClick: () => {
    console.log("复制操作");
  },
});

const pasteItem = new MenuItemCore({
  label: "粘贴",
  shortcut: "⌘V",
  onClick: () => {
    console.log("粘贴操作");
  },
});

const deleteItem = new MenuItemCore({
  label: "删除",
  shortcut: "⌫",
  disabled: true, // 禁用状态
});

// 创建菜单
const menu$ = new MenuCore({
  _name: "editMenu",
  side: "bottom",
  align: "start",
  items: [
    copyItem,
    pasteItem,
    new MenuSeparatorCore(),
    deleteItem,
  ],
});

// 创建触发按钮
const btn$ = new ButtonCore({
  onClick: () => {
    menu$.toggle();
  },
});

// 菜单项点击后关闭菜单
copyItem.onClick(() => {
  menu$.hide();
});
pasteItem.onClick(() => {
  menu$.hide();
});

// ============================================
// 示例 2：带子菜单的菜单
// ============================================

// 创建子菜单
const alignSubMenu = new MenuCore({
  _name: "alignSubMenu",
  items: [
    new MenuItemCore({
      label: "左对齐",
      onClick: () => console.log("左对齐"),
    }),
    new MenuItemCore({
      label: "居中对齐",
      onClick: () => console.log("居中对齐"),
    }),
    new MenuItemCore({
      label: "右对齐",
      onClick: () => console.log("右对齐"),
    }),
  ],
});

// 创建带子菜单的菜单项
const alignItem = new MenuItemCore({
  label: "对齐方式",
  menu: alignSubMenu, // 关联子菜单
});

// 创建主菜单
const formatMenu$ = new MenuCore({
  _name: "formatMenu",
  side: "bottom",
  align: "start",
  items: [
    new MenuItemCore({ label: "加粗", shortcut: "⌘B" }),
    new MenuItemCore({ label: "斜体", shortcut: "⌘I" }),
    new MenuSeparatorCore(),
    alignItem, // 带子菜单的菜单项
  ],
});

const formatBtn$ = new ButtonCore({
  onClick: () => {
    formatMenu$.toggle();
  },
});

// ============================================
// 示例 3：分组菜单
// ============================================

const groupedMenu$ = new MenuCore({
  _name: "groupedMenu",
  side: "bottom",
  align: "start",
  items: [
    new MenuGroupCore({
      label: "编辑",
      items: [
        new MenuItemCore({ label: "撤销", shortcut: "⌘Z" }),
        new MenuItemCore({ label: "重做", shortcut: "⌘⇧Z" }),
      ],
    }),
    new MenuSeparatorCore(),
    new MenuGroupCore({
      label: "视图",
      items: [
        new MenuItemCore({ label: "放大", shortcut: "⌘+" }),
        new MenuItemCore({ label: "缩小", shortcut: "⌘-" }),
      ],
    }),
  ],
});

// ============================================
// 示例 4：复选/单选菜单项
// ============================================

import { MenuCheckboxMenu, MenuRadioGroupItem } from "@/menu/item";

const settingsMenu$ = new MenuCore({
  _name: "settingsMenu",
  side: "bottom",
  align: "start",
  items: [
    // 复选菜单项
    new MenuCheckboxMenu({
      label: "显示工具栏",
      checked: true,
      onCheckedChange: (checked) => {
        console.log("工具栏显示状态:", checked);
      },
    }),
    new MenuCheckboxMenu({
      label: "显示状态栏",
      checked: false,
      onCheckedChange: (checked) => {
        console.log("状态栏显示状态:", checked);
      },
    }),
    new MenuSeparatorCore(),
    // 单选组菜单项
    new MenuRadioGroupItem({
      label: "浅色主题",
      group: "theme",
      checked: true,
    }),
    new MenuRadioGroupItem({
      label: "深色主题",
      group: "theme",
      checked: false,
    }),
    new MenuRadioGroupItem({
      label: "跟随系统",
      group: "theme",
      checked: false,
    }),
  ],
});

// ============================================
// 示例 5：动态更新菜单项
// ============================================

const dynamicMenu$ = new MenuCore({
  _name: "dynamicMenu",
  side: "bottom",
  align: "start",
  items: [],
});

// 动态设置菜单项
function updateMenuItems(files: string[]) {
  const items = files.map(
    (file) =>
      new MenuItemCore({
        label: file,
        onClick: () => {
          console.log("打开文件:", file);
          dynamicMenu$.hide();
        },
      })
  );
  dynamicMenu$.setItems(items);
}

// 模拟获取最近文件
updateMenuItems(["文档1.txt", "文档2.txt", "图片.png"]);

// ============================================
// 示例 6：监听菜单事件
// ============================================

menu$.onShow(() => {
  console.log("菜单打开");
});

menu$.onHiding(() => {
  console.log("菜单开始关闭");
});

menu$.onHide(() => {
  console.log("菜单已关闭");
});

menu$.onEnterItem((item) => {
  console.log("鼠标进入菜单项:", item.label);
});

menu$.onStateChange((state) => {
  console.log("菜单状态变化:", state);
});

// ============================================
// 示例 7：程序化控制
// ============================================

// 显示菜单
menu$.show();

// 隐藏菜单
menu$.hide();

// 切换菜单
menu$.toggle();

// 禁用/启用菜单项
deleteItem.disable();
deleteItem.enable();

// 设置菜单项图标
copyItem.setIcon(CopyIcon);

// 重置菜单状态
menu$.reset();
```

### 视图层绑定示例 (以 Vue 为例)

```vue
<template>
  <div class="menu-container">
    <!-- 触发按钮 -->
    <button ref="triggerRef" @click="btn$.click()">
      {{ btnState.text }}
    </button>

    <!-- 菜单内容 -->
    <Presence :core="menu$.presence">
      <div
        ref="contentRef"
        class="menu-content"
        @mouseenter="menu$.popper.handleEnter()"
        @mouseleave="menu$.handleLeave()"
      >
        <template v-for="item in menuState.items" :key="item.uid">
          <!-- 普通菜单项 -->
          <div
            v-if="item instanceof MenuItemCore"
            class="menu-item"
            :class="{ focused: item.state.focused, disabled: item.state.disabled }"
            @pointerenter="item.handlePointerEnter()"
            @pointerleave="item.handlePointerLeave()"
            @click="item.handleClick()"
          >
            <span class="menu-item-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-item-shortcut">
              {{ item.shortcut }}
            </span>
            <span v-if="item.menu" class="menu-item-arrow">▶</span>

            <!-- 子菜单 (递归) -->
            <MenuView v-if="item.menu" :menu="item.menu" />
          </div>

          <!-- 分割线 -->
          <div v-else-if="item instanceof MenuSeparatorCore" class="menu-separator" />

          <!-- 菜单组 -->
          <div v-else-if="item instanceof MenuGroupCore" class="menu-group">
            <div v-if="item.label" class="menu-group-label">{{ item.label }}</div>
            <!-- 递归渲染组内菜单项 -->
          </div>
        </template>
      </div>
    </Presence>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { MenuItemCore } from '@/menu/item';
import { MenuSeparatorCore } from '@/menu/separator';
import { MenuGroupCore } from '@/menu/group';

const props = defineProps(['btn$', 'menu$']);

const triggerRef = ref(null);
const contentRef = ref(null);

const btnState = reactive({ ...props.btn$.state });
const menuState = reactive({ ...props.menu$.state });

onMounted(() => {
  // 绑定 popper 的 reference 和 floating 元素
  props.menu$.popper.setReference(triggerRef.value);
  props.menu$.popper.setFloating(contentRef.value);

  // 监听状态变化
  props.btn$.onStateChange((state) => {
    Object.assign(btnState, state);
  });
  props.menu$.onStateChange((state) => {
    Object.assign(menuState, state);
  });
});

onUnmounted(() => {
  props.menu$.unmount();
});
</script>

<style>
.menu-content {
  position: fixed;
  min-width: 160px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}

.menu-item.focused {
  background: #f0f0f0;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item-label {
  flex: 1;
}

.menu-item-shortcut {
  margin-left: 24px;
  color: #888;
  font-size: 12px;
}

.menu-item-arrow {
  margin-left: 8px;
  font-size: 10px;
}

.menu-separator {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.menu-group-label {
  padding: 4px 12px;
  font-size: 12px;
  color: #888;
  font-weight: 500;
}
</style>
```
