import {
  isRef,
  Ref,
  ref,
  TimelessElement,
  VNodeView,
} from "@timeless/timeless";

import { HostElement } from "./box";

type Item = Record<string, unknown>;
type Entry = {
  row: HTMLDivElement;
  child: TimelessElement | null;
  index: number;
  key: unknown;
  item_ref: Ref<Item>;
  index_ref: Ref<number>;
  cancel_measure: (() => void) | null;
  mount_timer: ReturnType<typeof setTimeout> | null;
};

export type DOMListViewV2 = VNodeView<HTMLDivElement> & {
  t: "list-view-v2";
  render(): HTMLDivElement;
  hydrate(
    elm: TimelessElement,
    element: HTMLDivElement,
    options: { $parent: HTMLElement; offset: number; idx: number },
  ): void;
  destroy(): void;
};

function read_value<T>(value: T): T extends { value: infer R } ? R : T {
  return (isRef(value) ? value.value : value) as any;
}

function read_number(value: unknown, fallback: number): number {
  const raw = read_value(value);
  const number =
    typeof raw === "string"
      ? Number(raw.trim().replace(/px$/, ""))
      : Number(raw);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function request_frame(callback: () => void) {
  if (typeof requestAnimationFrame === "function") {
    const id = requestAnimationFrame(callback);
    return () => {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(id);
    };
  }
  const id = setTimeout(callback, 0);
  return () => clearTimeout(id);
}

export function DOMListViewV2(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): DOMListViewV2 {
  const element = props.elm as any;
  const box$ = HostElement({
    $elm: null,
    t: "list-view-v2",
    build: props.build,
  });
  const rows = new Map<number, Entry>();
  const row_entries = new WeakMap<Element, Entry>();
  const cleanups: (() => void)[] = [];
  let root: HTMLDivElement | null = null;
  let content: HTMLDivElement | null = null;
  let viewport: HTMLDivElement | null = null;
  let resize_observer: ResizeObserver | null = null;
  let cancel_render: (() => void) | null = null;
  let render_pending = false;
  let reached_bottom = false;
  let destroyed = false;
  let last_range = { start: 0, end: 0, visibleStart: 0 };

  function external_scroll_enabled() {
    return (
      read_value(element.config.externalScroll) === true ||
      element.config.scrollTop !== undefined ||
      element.config.viewportHeight !== undefined
    );
  }

  function current_scroll_top() {
    return external_scroll_enabled()
      ? read_number(element.config.scrollTop, 0)
      : Math.max(0, root?.scrollTop || 0);
  }

  function estimated_viewport_height() {
    const size = Math.max(1, Math.floor(read_number(element.config.size, 4)));
    const gutter = read_number(element.config.gutter, 0);
    return element.model.estimatedItemHeight * size + gutter * (size - 1);
  }

  function current_viewport_height() {
    const fallback = root?.clientHeight || estimated_viewport_height();
    return external_scroll_enabled()
      ? Math.max(1, read_number(element.config.viewportHeight, fallback))
      : Math.max(1, fallback);
  }

  function padding_bottom() {
    return read_number(element.config.paddingBottom, 0);
  }

  function scrollable_height() {
    return element.model.getTotalHeight() + padding_bottom();
  }

  function sync_layout() {
    const configured_height = element.config.itemHeight;
    const item_height =
      typeof configured_height === "function"
        ? configured_height
        : Math.max(1, read_number(configured_height, 40));
    element.model.setLayout(item_height, read_number(element.config.gutter, 0));
  }

  function update_content_height() {
    if (!content) return;
    const height = scrollable_height();
    content.style.height = `${height}px`;
    content.style.minHeight = `${height}px`;
  }

  function position_row(entry: Entry) {
    entry.row.style.transform = `translateY(${element.model.getOffset(entry.index)}px)`;
  }

  function update_attributes() {
    if (!root) return;
    root.setAttribute(
      "data-virtual-list-items",
      String(element.model.items.length),
    );
    root.setAttribute(
      "data-virtual-list-range-start",
      String(last_range.start),
    );
    root.setAttribute("data-virtual-list-range-end", String(last_range.end));
    root.setAttribute("data-virtual-list-rendered", String(rows.size));
  }

  function scroll_event() {
    return {
      target: root!,
      scrollTop: current_scroll_top(),
      clientHeight: current_viewport_height(),
      scrollHeight: scrollable_height(),
    };
  }

  function maybe_reach_bottom() {
    if (!element.config.onReachBottom || !element.model.items.length) return;
    const event = scroll_event();
    const threshold = Math.max(
      element.model.estimatedItemHeight * 2,
      read_number(element.config.gutter, 0),
    );
    const near_bottom =
      event.scrollTop + event.clientHeight >= event.scrollHeight - threshold;
    if (near_bottom && !reached_bottom) {
      reached_bottom = true;
      element.config.onReachBottom(event);
    } else if (!near_bottom) {
      reached_bottom = false;
    }
  }

  function unmount_row(index: number) {
    const entry = rows.get(index);
    if (!entry) return;
    entry.cancel_measure?.();
    if (entry.mount_timer) clearTimeout(entry.mount_timer);
    resize_observer?.unobserve(entry.row);
    row_entries.delete(entry.row);
    entry.child?.beforeUnmounted?.();
    entry.child?.onUnmounted?.();
    entry.item_ref.destroy();
    entry.index_ref.destroy();
    entry.row.remove();
    rows.delete(index);
  }

  function measure_row(entry: Entry) {
    if (destroyed || !rows.has(entry.index)) return;
    const measured = element.model.measure(
      entry.index,
      entry.row.getBoundingClientRect().height,
    );
    if (!measured.changed) return;
    const delta = measured.height - measured.previousHeight;
    if (entry.index < last_range.visibleStart && current_scroll_top() > 0) {
      if (external_scroll_enabled()) {
        element.config.onScrollTopAdjust?.(delta);
      } else if (root) {
        root.scrollTop = Math.max(0, root.scrollTop + delta);
      }
    }
    update_content_height();
    rows.forEach(position_row);
    schedule_render();
    element.config.onItemResize?.({
      target: entry.row,
      index: entry.index,
      item: element.model.items[entry.index],
      key: entry.key,
      height: measured.height,
      previousHeight: measured.previousHeight,
    });
  }

  function schedule_measure(entry: Entry) {
    if (entry.cancel_measure) return;
    // ponytail: measure visible rows individually; batch if resize-heavy lists show frame drops.
    entry.cancel_measure = request_frame(() => {
      entry.cancel_measure = null;
      measure_row(entry);
    });
  }

  function mount_row(index: number) {
    if (!viewport) return;
    const item = element.model.items[index];
    const item_ref = ref(item);
    const index_ref = ref(index);
    const child = element.renderItem(item_ref, index_ref);
    const row = document.createElement("div");
    const entry: Entry = {
      row,
      child,
      index,
      key: element.model.getKey(index),
      item_ref,
      index_ref,
      cancel_measure: null,
      mount_timer: null,
    };

    row.setAttribute("data-n", "list-view-v2-item");
    row.setAttribute("data-list-view-item", "");
    row.setAttribute("data-list-view-index", String(index));
    row.setAttribute("data-list-view-key", String(entry.key));
    Object.assign(row.style, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      width: "100%",
      boxSizing: "border-box",
    });
    position_row(entry);
    rows.set(index, entry);
    row_entries.set(row, entry);
    viewport.appendChild(row);

    if (child) {
      const child_host = props.build(child);
      const child_dom = child_host.render();
      if (child_dom) row.appendChild(child_dom);
      entry.mount_timer = setTimeout(() => {
        entry.mount_timer = null;
        child.onMounted?.({ target: child.$elm });
        schedule_measure(entry);
      }, 0);
    }
    resize_observer?.observe(row);
    schedule_measure(entry);
  }

  function render_visible() {
    if (destroyed) return;
    const source = read_value(element.source);
    const next_items = Array.isArray(source) ? source : [];
    const previous_items = element.model.items;
    const items_changed = element.model.setItems(next_items);
    if (items_changed && next_items.length !== previous_items.length) {
      reached_bottom = false;
    }
    update_content_height();

    last_range = element.model.getRange(
      current_scroll_top(),
      current_viewport_height(),
      Math.floor(read_number(element.config.buffer, 0)),
    );

    for (const [index, entry] of rows) {
      if (index < last_range.start || index >= last_range.end) {
        unmount_row(index);
        continue;
      }
      const key = element.model.getKey(index);
      if (!Object.is(entry.key, key)) {
        unmount_row(index);
      } else if (items_changed && entry.item_ref.value !== next_items[index]) {
        entry.item_ref.as(next_items[index]);
      }
    }

    for (let index = last_range.start; index < last_range.end; index += 1) {
      const entry = rows.get(index);
      if (!entry) {
        mount_row(index);
        continue;
      }
      entry.index = index;
      entry.key = element.model.getKey(index);
      entry.index_ref.as(index);
      entry.row.setAttribute("data-list-view-index", String(index));
      entry.row.setAttribute("data-list-view-key", String(entry.key));
      position_row(entry);
    }
    update_attributes();
    maybe_reach_bottom();
  }

  function schedule_render() {
    render_pending = true;
    if (cancel_render) return;
    cancel_render = request_frame(() => {
      cancel_render = null;
      if (!render_pending) return;
      render_pending = false;
      render_visible();
    });
  }

  function subscribe(source: unknown, callback: () => void) {
    if (!isRef(source)) return;
    cleanups.push(
      source.subscribe({
        onPatch: callback,
        onChange: callback,
      }),
    );
  }

  function mount(element_root: HTMLDivElement) {
    root = element_root;
    content = document.createElement("div");
    viewport = document.createElement("div");
    destroyed = false;
    sync_layout();

    root.setAttribute("data-list-view-root", "");
    root.setAttribute("data-virtual-list-view", "dynamic");
    if (!root.style.position) root.style.position = "relative";
    if (!external_scroll_enabled() && !root.style.overflowY) {
      root.style.overflowY = "auto";
    }
    content.setAttribute("data-n", "list-view-v2-content");
    content.setAttribute("data-list-view-content", "");
    Object.assign(content.style, {
      position: "relative",
      width: "100%",
      boxSizing: "border-box",
    });
    viewport.setAttribute("data-n", "list-view-v2-viewport");
    viewport.setAttribute("data-list-view-viewport", "");
    Object.assign(viewport.style, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      width: "100%",
      boxSizing: "border-box",
    });
    content.appendChild(viewport);
    root.appendChild(content);

    const handle_scroll = () => {
      element.config.onScroll?.(scroll_event());
      schedule_render();
      maybe_reach_bottom();
    };
    if (!external_scroll_enabled()) {
      root.addEventListener("scroll", handle_scroll, { passive: true });
      cleanups.push(() => root?.removeEventListener("scroll", handle_scroll));
    }

    if (typeof ResizeObserver === "function") {
      resize_observer = new ResizeObserver((entries) => {
        for (const resize_entry of entries) {
          if (resize_entry.target === root) {
            schedule_render();
            continue;
          }
          const entry = row_entries.get(resize_entry.target);
          if (entry) schedule_measure(entry);
        }
      });
      resize_observer.observe(root);
      cleanups.push(() => resize_observer?.disconnect());
    } else {
      const handle_resize = () => schedule_render();
      window.addEventListener("resize", handle_resize);
      cleanups.push(() => window.removeEventListener("resize", handle_resize));
    }

    subscribe(element.source, schedule_render);
    subscribe(element.config.paddingBottom, schedule_render);
    subscribe(element.config.scrollTop, schedule_render);
    subscribe(element.config.viewportHeight, schedule_render);
    subscribe(element.config.itemHeight, () => {
      sync_layout();
      schedule_render();
    });
    subscribe(element.config.gutter, () => {
      sync_layout();
      schedule_render();
    });
    render_visible();
    element.config.onScroll?.(scroll_event());
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancel_render?.();
    cancel_render = null;
    [...rows.keys()].forEach(unmount_row);
    cleanups.splice(0).forEach((cleanup) => cleanup());
    box$.methods.teardownEventListener(props.elm.events);
    content?.remove();
    resize_observer = null;
    root = null;
    content = null;
    viewport = null;
  }

  return {
    ...box$.methods,
    t: "list-view-v2",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const element_root = document.createElement("div");
      box$.methods.set$elm(element_root);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
      mount(element_root);
      return element_root;
    },
    hydrate(_elm, element_root) {
      box$.methods.set$elm(element_root);
      box$.methods.setupEventListener(props.elm.events);
      element_root.replaceChildren();
      mount(element_root);
    },
    destroy,
  };
}
