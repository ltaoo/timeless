import { base, BaseDomain, Handler } from "@timeless/base";
import { throttle } from "@timeless/utils";
import { remove_arr_item, toFixed } from "@timeless/utils";

import { WaterfallCellModel } from "./cell";

export function WaterfallColumnModel<T extends Record<string, unknown>>(props: {
  index?: number;
  size?: number;
  buffer?: number;
  gutter?: number;
}) {
  function handleScrollForce(values: { scrollTop: number }) {
    const { scrollTop } = values;
    _scroll = values;
    if (_scroll.scrollTop < 0) {
      return;
    }
    const range = methods.calcVisibleRange(scrollTop);
    const update = (() => {
      if (scrollTop === 0) {
        return true;
      }
      if (range.start !== _start || range.end !== _end) {
        return true;
      }
      return false;
    })();
    console.log(
      "[]handleScrollForce - before if (!update",
      update,
      scrollTop,
      range,
    );
    if (!update) {
      return;
    }
    methods.update(range);
  }

  /** 初始化固定数量的槽位 */
  function _initSlots() {
    const slotCount = _size + 2 * _buffer_size;
    for (let i = 0; i < slotCount; i++) {
      const slot = WaterfallCellModel<T>({
        uid: -1,
        height: 0,
        payload: {} as T,
        slotId: `slot-col${_index}-${i}`,
      });
      slot.methods.unbind();
      // 槽位的高度变化需要转发给当前绑定的数据 Cell
      slot.onHeightChange(([original_height, height_difference]) => {
        if (!slot.state.bound || slot.state.dataId === undefined) {
          return;
        }
        // 找到对应的数据 Cell 并更新其高度
        const dataCell = _$total_items.find(
          (v) => (v.state.id ?? v.uid) === slot.state.dataId,
        );
        if (dataCell) {
          dataCell.methods.updateHeight(slot.state.height);
          const idx = _$total_items.indexOf(dataCell);
          if (idx !== -1) {
            _dirty_from = Math.min(_dirty_from, idx + 1);
          }
        }
        _height += height_difference;
        bus.emit(Events.HeightChange, _height);
        bus.emit(Events.CellUpdate, { $item: slot });
        methods.refresh();
      });
      _slots.push(slot);
      _freeSlots.push(slot);
    }
  }

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setHeight(h: number) {
      _height = h;
      methods.refresh();
    },
    addHeight(h: number) {
      const height = _height + h;
      methods.setHeight(height);
    },
    setClientHeight(v: number) {
      _client_height = v;
    },
    /**
     * 从 _dirty_from 开始批量重算 top，一次 O(n) 完成
     */
    recomputeTops() {
      if (_dirty_from >= _$total_items.length) {
        _dirty_from = Infinity;
        return;
      }
      const from = Math.max(0, _dirty_from);
      for (let i = from; i < _$total_items.length; i++) {
        const $item = _$total_items[i];
        const $prev = _$total_items[i - 1];
        const newTop = $prev ? $prev.state.top + $prev.state.height + _gutter : 0;
        $item.methods.setTop(newTop);
      }
      _dirty_from = Infinity;
      // 同步已绑定槽位的 top
      _syncBoundSlotTops();
    },
    /**
     * 放置一个 item 到列中
     */
    appendItem($item: WaterfallCellModel<T>) {
      $item.onHeightChange(([original_height, height_difference]) => {
        const dataId = ($item.state as any).id ?? $item.uid;
        // 找到绑定了此数据的槽位，同步高度
        const boundSlot = _slotBindings.get(_dataIdStr(dataId));
        if (boundSlot) {
          // 槽位高度跟随数据 Cell
          // 不需要额外操作，rebind 时会同步
        }
        const idx = _$total_items.findIndex((v) => v === $item);
        if (idx !== -1) {
          _dirty_from = Math.min(_dirty_from, idx + 1);
        }
        console.log(
          "[DOMAIN]appendItem - after this.height += heightDiff",
          "加载完成，发现高度差异为",
          [_index, $item.uid, idx],
          [original_height, height_difference],
        );
        _height += height_difference;
        bus.emit(Events.HeightChange, _height);
        methods.refresh();
      });
      $item.onTopChange(() => {
        // 同步绑定的槽位 top
        const dataId = ($item.state as any).id ?? $item.uid;
        const boundSlot = _slotBindings.get(_dataIdStr(dataId));
        if (boundSlot) {
          boundSlot.methods.setTop($item.state.top);
        }
      });
      const idx = _$total_items.length;
      $item.methods.setColumnIdx(_index);
      _height += $item.state.height + (_$total_items.length > 0 ? _gutter : 0);
      _$total_items.push($item);
      const $prev = _$total_items[idx - 1];
      if ($prev) {
        $item.methods.setTop($prev.state.top + $prev.state.height + _gutter);
      }
      // 如果新 item 落入当前可见范围，绑定到空闲槽位
      if (idx >= _start && idx < _end && _freeSlots.length > 0) {
        const slot = _freeSlots.pop()!;
        const dataId = ($item.state as any).id ?? $item.uid;
        slot.methods.rebind({
          payload: $item.state.payload,
          uid: $item.uid,
          dataId,
          top: $item.state.top,
          height: $item.state.height,
        });
        _slotBindings.set(_dataIdStr(dataId), slot);
      }
      bus.emit(Events.HeightChange, _height);
    },
    /**
     * 往顶部插入一个 item 到列中
     */
    unshiftItem(
      $item: WaterfallCellModel<T>,
      opt: Partial<{ skipUpdateHeight: boolean }> = {},
    ) {
      $item.onHeightChange(([original_height, height_difference]) => {
        _height += height_difference;
        const idx = _$total_items.findIndex((v) => v === $item);
        if (idx !== -1) {
          _dirty_from = Math.min(_dirty_from, idx + 1);
        }
      });
      $item.onTopChange(() => {
        const dataId = ($item.state as any).id ?? $item.uid;
        const boundSlot = _slotBindings.get(_dataIdStr(dataId));
        if (boundSlot) {
          boundSlot.methods.setTop($item.state.top);
        }
      });
      $item.methods.setColumnIdx(_index);
      _height += $item.height + (_$total_items.length > 0 ? _gutter : 0);
      _$total_items.unshift($item);
      // 新 item 插入到头部，从 index 1 开始所有 top 都需要重算
      _dirty_from = Math.min(_dirty_from, 1);
      methods.recomputeTops();
      // 重新计算可见范围并 rebind
      methods.update({ start: _start, end: Math.min(_start + _size + _buffer_size, _$total_items.length) });
      bus.emit(Events.HeightChange, _height);
      methods.refresh();
    },
    findItemById(id: number) {
      return _$total_items.find((v) => (v.state as any).id === id);
    },
    deleteCell($item: WaterfallCellModel<T>) {
      const dataId = ($item.state as any).id ?? $item.uid;
      const idx = _$total_items.findIndex((v) => v === $item);
      if (idx === -1) {
        return;
      }
      // 如果被删除的 Cell 当前绑定了某个槽位，先 unbind
      const boundSlot = _slotBindings.get(_dataIdStr(dataId));
      if (boundSlot) {
        boundSlot.methods.unbind();
        _slotBindings.delete(_dataIdStr(dataId));
        _freeSlots.push(boundSlot);
      }
      const height_difference = $item.height + (_$total_items.length > 1 ? _gutter : 0);
      _height -= height_difference;
      _$total_items = remove_arr_item(_$total_items, idx);
      // 删除后，从该位置开始所有后续 item 的 top 需要重算
      _dirty_from = Math.min(_dirty_from, idx);
      methods.recomputeTops();
      // 重新计算可见范围并 rebind 替补 Cell
      const range = methods.calcVisibleRange(_scroll.scrollTop);
      methods.update(range);
      methods.refresh();
    },
    clean() {
      // unbind 所有槽位
      for (const [key, slot] of _slotBindings) {
        slot.methods.unbind();
        _freeSlots.push(slot);
      }
      _slotBindings.clear();
      _$total_items = [];
      _height = 0;
      _dirty_from = Infinity;
      _start = 0;
      _end = _size + _buffer_size;
      bus.emit(Events.StateChange, { ..._state });
    },
    resetRange() {
      _start = 0;
      _end = _size + _buffer_size;
      // 重新计算范围并 rebind 所有槽位
      const range = { start: _start, end: Math.min(_end, _$total_items.length) };
      methods.update(range);
      methods.refresh();
    },
    calcVisibleRange(scroll_top: number) {
      // 先批量重算脏区间的 top，保证二分查找数据正确
      methods.recomputeTops();
      console.log(
        "[BIZ]waterfall/column - calcVisibleRange",
        scroll_top,
        _start,
        _end,
      );
      let start = _start;
      let end = _end;
      // 二分查找，快速定位第一个 top >= scroll_top 的元素
      (() => {
        const len = _$total_items.length;
        if (len === 0) {
          return;
        }
        let lo = 0;
        let hi = len - 1;
        let found = len; // 默认值：没找到则指向末尾之后
        while (lo <= hi) {
          const mid = (lo + hi) >>> 1;
          if (_$total_items[mid].state.top >= scroll_top) {
            found = mid;
            hi = mid - 1;
          } else {
            lo = mid + 1;
          }
        }
        const baseStart = Math.min(len - 1, Math.max(0, found - 1));
        start = Math.max(0, baseStart - _buffer_size);
        end = Math.min(baseStart + _size + _buffer_size, len);
      })();
      console.log(
        "before Math.max",
        [start, start - _buffer_size],
        [end, _$total_items.length],
      );
      const result = {
        start,
        end,
      };
      return result;
    },
    update(range: { start: number; end: number }) {
      console.log(
        "[DOMAIN]waterfall/column - update case range is changed",
        range,
      );
      _start = range.start;
      _end = range.end;

      const newDataCells = _$total_items.slice(range.start, range.end);
      if (newDataCells.length === 0 && _$total_items.length === 0) {
        return;
      }

      // 构建新数据 Cell 的 dataId Set
      const newDataIdSet = new Set<string>();
      for (const cell of newDataCells) {
        const dataId = (cell.state as any).id ?? cell.uid;
        newDataIdSet.add(_dataIdStr(dataId));
      }

      // 计算 exitingCells（当前绑定但不在 newDataCells 中的）
      const exitingKeys: string[] = [];
      for (const [key, slot] of _slotBindings) {
        if (!newDataIdSet.has(key)) {
          exitingKeys.push(key);
        }
      }

      // 对 exitingCells: slot.unbind()，归还到 _freeSlots
      for (const key of exitingKeys) {
        const slot = _slotBindings.get(key)!;
        slot.methods.unbind();
        _slotBindings.delete(key);
        _freeSlots.push(slot);
      }

      // 计算 enteringCells（在 newDataCells 中但当前未绑定的）
      for (const cell of newDataCells) {
        const dataId = (cell.state as any).id ?? cell.uid;
        const key = _dataIdStr(dataId);
        if (!_slotBindings.has(key)) {
          // 从 _freeSlots 取槽位
          if (_freeSlots.length > 0) {
            const slot = _freeSlots.pop()!;
            slot.methods.rebind({
              payload: cell.state.payload,
              uid: cell.uid,
              dataId,
              top: cell.state.top,
              height: cell.state.height,
            });
            _slotBindings.set(key, slot);
          }
        } else {
          // stayingCells — 仅更新 top/height
          const slot = _slotBindings.get(key)!;
          slot.methods.setTop(cell.state.top);
        }
      }

      methods.refresh();
    },
    handleScrollForce,
    handleScroll: throttle(100, handleScrollForce),
  };

  function _dataIdStr(dataId: number | string): string {
    return String(dataId);
  }

  /** 同步已绑定槽位的 top 值 */
  function _syncBoundSlotTops() {
    for (const [key, slot] of _slotBindings) {
      if (!slot.state.bound) continue;
      const dataCell = _$total_items.find((v) => {
        const did = (v.state as any).id ?? v.uid;
        return _dataIdStr(did) === key;
      });
      if (dataCell) {
        slot.methods.setTop(dataCell.state.top);
      }
    }
  }

  /** 该列下标 */
  let _index = props.index ?? 0;
  /** 该列累计高度 */
  let _height = 0;
  let _width = 0;
  let _innerTop = 0;
  let _client_height = 0;
  /** 固定槽位池 */
  let _slots: WaterfallCellModel<T>[] = [];
  /** 数据 dataId → 绑定的槽位 */
  let _slotBindings = new Map<string, WaterfallCellModel<T>>();
  /** 空闲槽位池 */
  let _freeSlots: WaterfallCellModel<T>[] = [];
  /** 完整数据列表 */
  let _$total_items: WaterfallCellModel<T>[] = [];
  /** 默认显示的数量 */
  let _size = props.size ?? 4;
  /** 缓冲的数量 */
  let _buffer_size = props.buffer ?? 1;
  /** 每个元素和下面元素的距离 */
  let _gutter = props.gutter ?? 0;
  let _scroll = { scrollTop: 0 };
  let _start = 0;
  let _end = _size + _buffer_size;
  /** 标记从哪个下标开始 top 需要重算，Infinity 表示干净 */
  let _dirty_from = Infinity;

  // 初始化槽位
  _initSlots();

  const _state = {
    get width() {
      return _width;
    },
    get height() {
      return _height;
    },
    get size() {
      return _size;
    },
    get items() {
      return _slots.filter((v) => v.state.bound).map((v) => {
        return {
          ...v.state,
        };
      });
    },
    get item_count() {
      return _slotBindings.size;
    },
    get innerTop() {
      return _innerTop;
    },
  };

  enum Events {
    StateChange,
    HeightChange,
    CellUpdate,
  }
  type TheTypesOfEvents = {
    [Events.HeightChange]: number;
    [Events.CellUpdate]: {
      $item: WaterfallCellModel<T>;
    };
    [Events.StateChange]: typeof _state;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    get $cells() {
      return _slots;
    },
    get range() {
      return {
        start: _start,
        end: _end,
      };
    },
    methods,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      bus.on(Events.StateChange, handler);
    },
    onHeightChange(handler: Handler<TheTypesOfEvents[Events.HeightChange]>) {
      bus.on(Events.HeightChange, handler);
    },
    onCellUpdate(handler: Handler<TheTypesOfEvents[Events.CellUpdate]>) {
      bus.on(Events.CellUpdate, handler);
    },
  };
}

export type WaterfallColumnModel<T extends Record<string, unknown>> =
  ReturnType<typeof WaterfallColumnModel<T>>;
