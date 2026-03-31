# 组件迁移清单

本文档列出了 `packages/timeless/src` 中需要从 theme-based 架构迁移到 Core + Primitive + Shadcn 三层架构的组件。

## 迁移状态说明

- ✅ 已完成
- 🔄 进行中
- ⏳ 待处理
- ⏭️ 跳过（不需要迁移）

## 已迁移组件

| 组件 | 状态 | UI Core | 说明 |
|------|------|---------|------|
| accordion.ts | ✅ | AccordionCore | 已拆分为 Root, Item, Trigger, Chevron, Content |
| dialog.ts | ✅ | DialogCore | 已拆分为 Root, Overlay, Content, Header, Title, Body, Footer, Close, Cancel, OK |

## 需要迁移的组件

### 高优先级（交互复杂组件）

| 组件 | 状态 | UI Core | 优先级 | 说明 |
|------|------|---------|--------|------|
| tabs.ts | ⏳ | TabHeaderCore | P0 | 标签页组件，需要拆分为 Root, List, Tab, Content, Indicator |
| menu.ts | ⏳ | MenuCore | P0 | 菜单组件，需要拆分为 Root, Item, SubMenu, Separator 等 |
| toast.ts | ⏳ | ToastCore | P1 | 提示组件，需要拆分为 Root, Item, Title, Description, Close |
| sheet.ts | ⏳ | 需确认 | P1 | 抽屉组件，类似 dialog |
| context-menu.ts | ⏳ | ContextMenuCore | P1 | 右键菜单，依赖 MenuCore |

### 中优先级（表单组件）

| 组件 | 状态 | UI Core | 优先级 | 说明 |
|------|------|---------|--------|------|
| toggle.ts | ⏳ | ToggleCore | P2 | 切换按钮，已部分使用 Core |
| slider.ts | ⏳ | 需确认 | P2 | 滑块组件 |
| input.ts | ⏳ | InputCore | P2 | 输入框，已有 Root 函数，需完善 |
| textarea.ts | ⏳ | InputCore | P2 | 文本域，使用 InputCore |

### 低优先级（其他组件）

| 组件 | 状态 | UI Core | 优先级 | 说明 |
|------|------|---------|--------|------|
| progress.ts | ⏳ | ProgressCore | P3 | 进度条组件 |

## 不需要迁移的组件（纯展示组件）

这些组件没有复杂的状态管理和交互逻辑，可以保持 theme-based 架构：

| 组件 | 状态 | 说明 |
|------|------|------|
| alert.ts | ⏭️ | 纯展示组件，无状态管理 |
| avatar.ts | ⏭️ | 纯展示组件，无状态管理 |
| badge.ts | ⏭️ | 纯展示组件，无状态管理 |
| card.ts | ⏭️ | 纯展示组件，无状态管理 |
| label.ts | ⏭️ | 纯展示组件，无状态管理 |
| separator.ts | ⏭️ | 纯展示组件，无状态管理 |
| skeleton.ts | ⏭️ | 纯展示组件，无状态管理 |
| table.ts | ⏭️ | 纯展示组件，无状态管理 |

## 迁移步骤（参考 MIGRATION.md）

对于每个需要迁移的组件：

1. **检查 UI Core 层**
   - 确认 `packages/ui/src/{component}/index.ts` 是否存在
   - 如果不存在，需要先创建 Core 层

2. **改造 Headless 层**
   - 将单一函数拆分为多个 Primitive 组件
   - 移除 theme 相关代码
   - 使用 `computed` 处理响应式状态
   - 每个 Primitive 接收 `store` 参数

3. **更新导出配置**
   - 在 `packages/timeless/src/index.ts` 中
   - 将 `export * from "./component"` 改为 `export * as ComponentPrimitive from "./component"`

4. **改造 Shadcn 层**
   - 在 `packages/shadcn/src/{component}.ts` 中
   - 使用 `ComponentPrimitive` 组装
   - 使用 `refobj` 管理状态
   - 使用 `computed` 计算动态样式
   - 添加 shadcn/ui 风格的样式类

5. **测试验证**
   - 确保组件功能正常
   - 确保样式正确应用
   - 确保事件处理正常

## 迁移优先级建议

1. **第一批**：tabs.ts, menu.ts（高频使用的交互组件）
2. **第二批**：toast.ts, sheet.ts, context-menu.ts（弹出层组件）
3. **第三批**：toggle.ts, slider.ts, input.ts, textarea.ts（表单组件）
4. **第四批**：progress.ts（其他组件）

## 注意事项

- 迁移前先阅读 `packages/ui/src/accordion/MIGRATION.md`
- 确保 UI Core 层已经存在且功能完整
- 保持向后兼容性，避免破坏现有使用
- 每完成一个组件的迁移，更新本清单的状态
