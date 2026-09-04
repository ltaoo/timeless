import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";

import { Box, BoxProps } from "./box";
import { Fragment } from "./fragment";
import { isElement, TimelessElement, ViewChildren } from "./type";

export type ListViewV2Reactive<T> = T | Ref<T> | DerivedRef<T>;
export type ListViewV2Key<T> = keyof T | ((item: T, index: number) => unknown);
export type ListViewV2ItemHeight<T> =
  | ListViewV2Reactive<number>
  | ((item: T, index: number) => number);

export type ListViewV2ScrollEvent = {
  target: HTMLElement;
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
};

export type ListViewV2ItemResizeEvent<T> = {
  target: HTMLElement;
  index: number;
  item: T;
  key: unknown;
  height: number;
  previousHeight: number;
};

export type ListViewV2Props<T extends Record<string, unknown>> = BoxProps & {
  each: T[] | Ref<T[]> | DerivedRef<T[]>;
  render: (item: Ref<T>, index: Ref<number>) => ViewChildren;
  key?: ListViewV2Key<T>;
  size?: number;
  buffer?: number;
  itemHeight?: ListViewV2ItemHeight<T>;
  gutter?: ListViewV2Reactive<number>;
  paddingBottom?: ListViewV2Reactive<number | string>;
  externalScroll?: ListViewV2Reactive<boolean>;
  scrollTop?: ListViewV2Reactive<number | string>;
  viewportHeight?: ListViewV2Reactive<number | string>;
  onScrollTopAdjust?: (delta: number) => void;
  onItemResize?: (event: ListViewV2ItemResizeEvent<T>) => void;
  onScroll?: (event: ListViewV2ScrollEvent) => void;
  onReachBottom?: (event: ListViewV2ScrollEvent) => void;
};

export type ListViewV2ModelOptions<T extends Record<string, unknown>> = {
  items?: T[];
  key?: ListViewV2Key<T>;
  itemHeight?: number | ((item: T, index: number) => number);
  gutter?: number;
};

function list_view_v2_number(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export function createListViewV2Model<T extends Record<string, unknown>>(
  options: ListViewV2ModelOptions<T> = {},
) {
  let items = [...(options.items || [])];
  let item_height = options.itemHeight;
  let estimated_item_height =
    typeof item_height === "number"
      ? Math.max(1, list_view_v2_number(item_height, 40))
      : 40;
  let gutter = list_view_v2_number(options.gutter, 0);
  let offsets = [0];
  let offsets_dirty = true;
  const measured_heights = new Map<unknown, number>();

  function get_key(index: number): unknown {
    const item = items[index];
    if (typeof options.key === "function") {
      const value = options.key(item, index);
      return value === null || value === undefined ? index : value;
    }
    if (options.key && item) {
      const value = item[options.key];
      return value === null || value === undefined ? index : value;
    }
    return index;
  }

  function get_item_height(index: number): number {
    if (typeof item_height === "function") {
      try {
        const resolved = Number(item_height(items[index], index));
        if (Number.isFinite(resolved) && resolved > 0) return resolved;
      } catch (error) {
        console.error("[ListViewV2] itemHeight failed", error);
      }
    }
    return measured_heights.get(get_key(index)) || estimated_item_height;
  }

  function ensure_offsets(): number[] {
    if (!offsets_dirty && offsets.length === items.length + 1) return offsets;
    offsets = new Array(items.length + 1);
    offsets[0] = 0;
    for (let index = 0; index < items.length; index += 1) {
      offsets[index + 1] =
        offsets[index] +
        get_item_height(index) +
        (index < items.length - 1 ? gutter : 0);
    }
    offsets_dirty = false;
    return offsets;
  }

  function set_items(next_items: T[]): boolean {
    const changed =
      items.length !== next_items.length ||
      next_items.some((item, index) => item !== items[index]);
    if (!changed) return false;
    items = [...next_items];
    const active_keys = new Set(items.map((_, index) => get_key(index)));
    for (const key of measured_heights.keys()) {
      if (!active_keys.has(key)) measured_heights.delete(key);
    }
    offsets_dirty = true;
    return true;
  }

  function set_layout(
    next_item_height: number | ((item: T, index: number) => number),
    next_gutter: number,
  ) {
    item_height = next_item_height;
    if (typeof next_item_height === "number") {
      estimated_item_height = Math.max(
        1,
        list_view_v2_number(next_item_height, 40),
      );
    }
    gutter = list_view_v2_number(next_gutter, 0);
    offsets_dirty = true;
  }

  function measure(index: number, height: number) {
    const measured = Math.ceil(Number(height));
    const previous_height = get_item_height(index);
    if (!Number.isFinite(measured) || measured <= 0) {
      return { changed: false, previousHeight: previous_height, height: 0 };
    }
    measured_heights.set(get_key(index), measured);
    const next_height = get_item_height(index);
    const changed = Math.abs(previous_height - next_height) >= 1;
    if (changed) offsets_dirty = true;
    return { changed, previousHeight: previous_height, height: next_height };
  }

  function get_offset(index: number): number {
    const list_offsets = ensure_offsets();
    return list_offsets[Math.max(0, Math.min(index, items.length))] || 0;
  }

  function get_total_height(): number {
    return ensure_offsets()[items.length] || 0;
  }

  function find_index(offset: number): number {
    if (!items.length) return 0;
    const list_offsets = ensure_offsets();
    const value = Math.max(0, Number(offset) || 0);
    if (value >= list_offsets[items.length]) return items.length - 1;
    let low = 0;
    let high = items.length - 1;
    let result = 0;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      if (list_offsets[middle + 1] <= value) {
        low = middle + 1;
      } else {
        result = middle;
        high = middle - 1;
      }
    }
    return result;
  }

  function get_range(scroll_top: number, viewport_height: number, buffer = 0) {
    if (!items.length) return { start: 0, end: 0, visibleStart: 0 };
    const visible_start = find_index(scroll_top);
    const visible_end = find_index(scroll_top + viewport_height) + 1;
    const range_buffer = Math.max(0, Math.floor(buffer));
    return {
      start: Math.max(0, visible_start - range_buffer),
      end: Math.min(items.length, visible_end + range_buffer),
      visibleStart: visible_start,
    };
  }

  return {
    get items() {
      return items;
    },
    get estimatedItemHeight() {
      return estimated_item_height;
    },
    getKey: get_key,
    getItemHeight: get_item_height,
    getOffset: get_offset,
    getTotalHeight: get_total_height,
    getRange: get_range,
    setItems: set_items,
    setLayout: set_layout,
    measure,
  };
}

export type ListViewV2Model<T extends Record<string, unknown>> = ReturnType<
  typeof createListViewV2Model<T>
>;

export type ListViewV2Config<T extends Record<string, unknown>> = Pick<
  ListViewV2Props<T>,
  | "key"
  | "size"
  | "buffer"
  | "itemHeight"
  | "gutter"
  | "paddingBottom"
  | "externalScroll"
  | "scrollTop"
  | "viewportHeight"
  | "onScrollTopAdjust"
  | "onItemResize"
  | "onScroll"
  | "onReachBottom"
>;

export type ListViewV2Element<T extends Record<string, unknown>> =
  TimelessElement & {
    source: ListViewV2Props<T>["each"];
    config: ListViewV2Config<T>;
    model: ListViewV2Model<T>;
    renderItem(item: Ref<T>, index: Ref<number>): TimelessElement | null;
  };

export function ListViewV2<T extends Record<string, unknown>>(
  props: ListViewV2Props<T>,
): ListViewV2Element<T> {
  const {
    each,
    render,
    key,
    size = 4,
    buffer = 0,
    itemHeight = 40,
    gutter = 0,
    paddingBottom = 0,
    externalScroll = false,
    scrollTop,
    viewportHeight,
    onScrollTopAdjust,
    onItemResize,
    onScroll,
    onReachBottom,
    attributes,
    onMounted,
    beforeUnmounted,
    onUnmounted,
    ...root_props
  } = props;
  const initial_items = isRef(each) ? each.value : each;
  const initial_item_height = isRef(itemHeight) ? itemHeight.value : itemHeight;
  const box$ = Box(
    {
      ...root_props,
      attributes: { n: "list-view-v2", ...(attributes || {}) },
    },
    {},
  );
  const model = createListViewV2Model({
    items: initial_items,
    key,
    itemHeight: initial_item_height,
    gutter: isRef(gutter) ? gutter.value : gutter,
  });
  let host: any = null;
  let mounted_cleanup: (() => void) | undefined;
  let destroyed = false;

  box$.methods.subscribe_props();
  box$.methods.add_event();

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    host?.destroy?.();
    mounted_cleanup?.();
    onUnmounted?.();
    box$.methods.destroy();
    host = null;
  }

  return {
    t: "list-view-v2",
    get $elm() {
      return host;
    },
    set $elm(value) {
      host = value;
      box$.methods.set$elm(value);
    },
    state: box$.state,
    events: box$.events,
    children: [],
    source: each,
    config: {
      key,
      size,
      buffer,
      itemHeight,
      gutter,
      paddingBottom,
      externalScroll,
      scrollTop,
      viewportHeight,
      onScrollTopAdjust,
      onItemResize,
      onScroll,
      onReachBottom,
    },
    model,
    renderItem(item, index) {
      const child = render(item, index);
      if (child === null || child === undefined) return null;
      return isElement(child) ? child : Fragment({}, child);
    },
    onMounted(event: MountedEvent) {
      box$.state.rendered = true;
      const cleanup = onMounted?.(event);
      if (typeof cleanup === "function") mounted_cleanup = cleanup;
    },
    beforeUnmounted() {
      beforeUnmounted?.();
    },
    onUnmounted: destroy,
    destroy,
  };
}
