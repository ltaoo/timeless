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
    },
    /**
     * 放置一个 item 到列中
     */
    appendItem($item: WaterfallCellModel<T>) {
      $item.onHeightChange(([original_height, height_difference]) => {
        const idx = _$total_items.findIndex((v) => v.id === $item.id);
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
        bus.emit(Events.CellUpdate, {
          $item,
        });
        methods.refresh();
      });
      $item.onTopChange(() => {
        bus.emit(Events.CellUpdate, {
          $item,
        });
      });
      const idx = _$total_items.length;
      // $item.methods.setIndex(idx);
      $item.methods.setColumnIdx(_index);
      _height += $item.state.height + (_$total_items.length > 0 ? _gutter : 0);
      _$total_items.push($item);
      const $prev = _$total_items[idx - 1];
      // console.log(
      //   "[DOMAIN]waterfall/column - append item",
      //   idx,
      //   $prev?.state.top,
      //   $prev?.state.height,
      //   $prev?.state.top + $prev?.state.height + _gutter
      // );
      if ($prev) {
        $item.methods.setTop($prev.state.top + $prev.state.height + _gutter);
      }
      _$items = _$total_items.slice(_start, _end + _buffer_size);
      bus.emit(Events.HeightChange, _height);
      // bus.emit(Events.StateChange, _state);
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
      $item.onTopChange(() => {});
      const idx = _$total_items.length;
      $item.methods.setColumnIdx(_index);
      _height += $item.height + (_$total_items.length > 0 ? _gutter : 0);
      _$total_items.unshift($item);
      // 新 item 插入到头部，从 index 1 开始所有 top 都需要重算
      _dirty_from = Math.min(_dirty_from, 1);
      methods.recomputeTops();
      // 更新可见列表，与 appendItem 保持一致
      _$items = _$total_items.slice(_start, _end + _buffer_size);
      bus.emit(Events.HeightChange, _height);
      methods.refresh();
    },
    findItemById(id: number) {
      return _$total_items.find((v) => v.id === id);
    },
    deleteCell($item: WaterfallCellModel<T>) {
      const idx = _$total_items.findIndex((v) => v.id === $item.id);
      if (idx === -1) {
        return;
      }
      const $backup = _$total_items[_end];
      const height_difference = $item.height + (_$total_items.length > 1 ? _gutter : 0);
      _height -= height_difference;
      _$total_items = remove_arr_item(_$total_items, idx);
      // 删除后，从该位置开始所有后续 item 的 top 需要重算
      _dirty_from = Math.min(_dirty_from, idx);
      const idx2 = _$items.findIndex((v) => v.id === $item.id);
      if (idx2 !== -1) {
        _$items = remove_arr_item(_$items, idx2);
        if ($backup) {
          _$items.push($backup);
        }
      }
      methods.refresh();
    },
    clean() {
      _$items = [];
      _$total_items = [];
      _height = 0;
      _dirty_from = Infinity;
      bus.emit(Events.StateChange, { ..._state });
    },
    resetRange() {
      _start = 0;
      _end = _size + _buffer_size;
      _$items = _$total_items.slice(_start, _end);
      methods.refresh();
      // methods.calcVisibleRange(0);
    },
    calcVisibleRange(scroll_top: number) {
      // 先批量重算脏区间的 top，保证二分查找数据正确
      methods.recomputeTops();
      console.log(
        "[BIZ]waterfall/column - calcVisibleRange",
        scroll_top,
        _start,
        _end,
        _$items,
      );
      // 找中点需要遍历几万个元素，不是最佳方案
      // const $middle_item = (() => {
      //   return _$total_items.find(($v) => {
      //     console.log(vvv, [$v.state.top - 100, $v.state.top, $v.state.top + 100]);
      //     return inRange(vvv, [$v.state.top - 100, $v.state.top + 100]);
      //   });
      // })();
      // console.log($middle_item?.idx);

      // const items = _$total_items;
      // const $cur_first = _$items[0];
      // if (!$cur_first) {
      //   return {
      //     start: _start,
      //     end: _end,
      //   };
      // }
      // let items_height_total = $cur_first.state.top;
      // console.log("before", this.range, start, end);
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
        start = found;
        end = start + _size;
      })();
      //     const count = this.buffer_size;
      console.log(
        "before Math.max",
        [start, start - _buffer_size],
        [end, _$total_items.length],
      );
      const result = {
        start: Math.max(0, start - _buffer_size),
        end: Math.min(end, _$total_items.length),
      };
      return result;
    },
    update(range: { start: number; end: number }) {
      console.log(
        "[DOMAIN]waterfall/column - update case range is changed",
        range,
      );
      const $visible_items = _$total_items.slice(range.start, range.end);
      const item = $visible_items[0];
      if (!item) {
        return;
      }
      // _range = range;
      _start = range.start;
      _end = range.end;
      _$items = $visible_items;
      methods.refresh();
    },
    handleScrollForce,
    handleScroll: throttle(100, handleScrollForce),
  };

  /** 该列下标 */
  let _index = props.index ?? 0;
  /** 该列累计高度 */
  let _height = 0;
  let _width = 0;
  let _innerTop = 0;
  let _client_height = 0;
  /** 显示的元素 */
  let _$items: WaterfallCellModel<T>[] = [];
  let _$total_items: WaterfallCellModel<T>[] = [];
  /** 默认显示的数量 */
  let _size = props.size ?? 4;
  /** 缓冲的数量 */
  let _buffer_size = props.buffer ?? 1;
  /** 每个元素和下面元素的距离 */
  let _gutter = props.gutter ?? 0;
  let _scroll = { scrollTop: 0 };
  // let _range = { start: 0, end: _size + _buffer_size };
  let _start = 0;
  let _end = _size + _buffer_size;
  /** 标记从哪个下标开始 top 需要重算，Infinity 表示干净 */
  let _dirty_from = Infinity;

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
      return _$items.map((v) => {
        return {
          ...v.state,
          idx: _$total_items.indexOf(v),
        };
      });
    },
    get item_count() {
      return _$items.length;
    },
    get innerTop() {
      return _innerTop;
    },
    //       visibleItems: this.totalItems,
    //       range: this.range,
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
      return _$items;
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
