/**
 * 跨组件集成测试辅助函数
 *
 * 这些 helper 对每个组件的全部渲染相关 state 做快照，
 * 用于在单测中断言展示效果——无需实际 DOM。
 */
export {
  snapDialog,
  snapSelect,
  snapPopper,
  selectItem,
  createMockPlatform,
} from "./helpers";
