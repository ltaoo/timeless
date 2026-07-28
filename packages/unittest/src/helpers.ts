/**
 * 测试辅助：快照组件全部渲染相关 state
 *
 * 这些 state 在不同宿主平台（DOM/Native/Canvas/SSR/TUI）上直接驱动渲染，
 * 断言了 state 即断言了展示效果。
 */
import type { Platform } from "@timeless/inner-base";
import {
  DialogCore,
  PopperCore,
  SelectCore,
  SelectItemCore,
} from "@timeless/inner-vm";

/** 创建 mock Platform，可指定视口尺寸（模拟 Window 客户区） */
export function createMockPlatform(
  viewport: { width: number; height: number } = { width: 480, height: 360 },
): Platform {
  const noop = () => {};
  return {
    addEventListener: () => noop,
    patchBodyStyle: noop,
    getViewportSize: () => ({ ...viewport }),
    isBrowser: () => false,
    isElement: () => false,
    isHTMLElement: () => false,
    getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    getDimensions: () => ({ width: 0, height: 0 }),
    getElementRects: () => ({
      reference: { x: 0, y: 0, width: 0, height: 0 },
      floating: { x: 0, y: 0, width: 0, height: 0 },
    }),
    getClippingRect: () => ({
      x: 0,
      y: 0,
      ...viewport,
    }),
    getOffsetParent: () => null,
    isRTL: () => false,
    getScale: () => ({ x: 1, y: 1 }),
    getDocumentElement: () => null,
  };
}

/** 创建 SelectItemCore 实例，支持禁用 */
export function selectItem<T>(
  value: T,
  label: string,
  disabled = false,
): SelectItemCore<T> {
  const i = new SelectItemCore<T>({ value, label });
  i.disabled = disabled;
  return i;
}

/** Popper 定位渲染需要的全部状态快照（下拉 style） */
export function snapPopper(p: PopperCore) {
  return {
    strategy: p.state.strategy,
    x: p.state.x,
    y: p.state.y,
    placement: p.state.placement,
    isPlaced: p.state.isPlaced,
    top: p.state.top,
    bottom: p.state.bottom,
    height: p.state.height,
    maxHeight: p.state.maxHeight,
    minWidth: p.state.minWidth,
    margin: p.state.margin,
    availableHeight: p.state.availableHeight,
    availableWidth: p.state.availableWidth,
    canScrollUp: p.state.canScrollUp,
    canScrollDown: p.state.canScrollDown,
    reference: p.state.reference,
    arrow: p.state.arrow ? { ...p.state.arrow } : null,
  };
}

/** Dialog 渲染需要的全部状态快照 */
export function snapDialog(d: DialogCore) {
  return {
    open: d.open,
    title: d.title,
    footer: d.footer,
    closeable: d.closeable,
    mask: d.mask,
    presence: { ...d.presence.state },
    okBtn: { ...d.okBtn.state },
    cancelBtn: { ...d.cancelBtn.state },
    state: { ...d.state },
  };
}

/** Select 渲染需要的全部状态快照 */
export function snapSelect<T>(s: SelectCore<T>) {
  return {
    open: s.open,
    value: s.value,
    placeholder: s.placeholder,
    disabled: s.disabled,
    focused: s.focused,
    allowClear: s.allowClear,
    loading: s.loading,
    status: s.status,
    search: s.search,
    presence: { ...s.presence$.state },
    state: { ...s.state },
    options: s.options.map((o) => ({
      value: o.value,
      label: o.label,
      selected: o.selected,
      focused: o.focused,
      disabled: o.disabled,
    })),
    // 当前选中项
    selectedItem: s.selected_item$
      ? {
          value: s.selected_item$.value,
          label: s.selected_item$.label,
          selected: s.selected_item$.selected,
          focused: s.selected_item$.focused,
        }
      : null,
    // 当前聚焦项
    focusedItem: s.focused_item$
      ? {
          value: s.focused_item$.value,
          label: s.focused_item$.label,
          focused: s.focused_item$.focused,
        }
      : null,
  };
}
