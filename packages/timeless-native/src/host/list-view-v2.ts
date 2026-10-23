import {
  destroyElement,
  isRef,
  ref,
  View,
  type Ref,
  type ListViewV2Element,
  type TimelessElement,
  type VNodeView,
} from "@timeless/timeless";
import {
  batchNativeStyles,
  refreshNativeStyles,
  requestNativeLayout,
} from "../stylesheet";
import { NativeScrollView } from "./scroll-view";

// The native host requests only visible rows and owns their scroll viewport.
export function NativeListViewV2(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}) {
  const element = props.elm as ListViewV2Element<Record<string, unknown>>;
  const host = NativeScrollView(props);
  const node = host.get$elm() as any;
  // shortcut: Use declared itemHeight; add native measurement for content-driven row heights.
  const rows = new Map<
    number,
    {
      child: TimelessElement;
      dom: any;
      item: Ref<Record<string, unknown>>;
      index: Ref<number>;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  const cleanups: (() => void)[] = [];
  const read = (value: any) => (isRef(value) ? value.value : value);
  function readNumber(value: unknown) {
    const raw = read(value);
    const number =
      typeof raw === "string"
        ? Number(raw.trim().replace(/px$/, ""))
        : Number(raw);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }
  let destroyed = false;
  let reachedBottom = false;

  function release(index: number) {
    const row = rows.get(index);
    if (!row) return;
    clearTimeout(row.timer);
    row.child.beforeUnmounted?.();
    destroyElement(row.child);
    row.item.destroy();
    row.index.destroy();
    node.children = node.children.filter((child: any) => child !== row.dom);
    row.dom.parentNode = null;
    rows.delete(index);
  }

  function sync() {
    if (destroyed) return;
    const source = read(element.source);
    element.model.setItems(Array.isArray(source) ? source : []);
    element.model.setLayout(
      read(element.config.itemHeight) ?? 40,
      readNumber(element.config.gutter),
    );
    node.rowCount = element.model.items.length;
    node.contentHeight =
      element.model.getTotalHeight() + readNumber(element.config.paddingBottom);
    node.revision += 1;
    reachedBottom = false;
    requestNativeLayout();
  }

  Object.assign(node, {
    type: "list-view-v2",
    horizontal: "hidden",
    revision: 0,
    _rowHeight: (index: number) =>
      element.model.getOffset(index + 1) - element.model.getOffset(index),
    _rowOffset: (index: number) => element.model.getOffset(index),
    _visibleRange: (top: number, height: number) =>
      element.model.getRange(top, height, 2),
    _renderRow(index: number) {
      if (destroyed || index < 0 || index >= element.model.items.length)
        return null;
      if (rows.has(index)) return rows.get(index)!.child.$elm.get$elm();
      return batchNativeStyles(() => {
        const item = ref(element.model.items[index]);
        const position = ref(index);
        const child = View(
          {
            attributes: { n: "virtual-list-row", "data-index": String(index) },
          },
          [element.renderItem(item, position)],
        );
        const dom = props.build(child).render();
        dom.parentNode = node;
        node.children.push(dom);
        refreshNativeStyles(dom);
        const timer = setTimeout(
          () => child.onMounted?.({ target: child.$elm }),
          0,
        );
        rows.set(index, { child, dom, item, index: position, timer });
        return dom;
      });
    },
    _releaseRow: release,
  });

  return {
    ...host,
    t: "list-view-v2" as const,
    // Preserve the scroll coordinate accessors when extending the host.
    get scrollTop() {
      return host.scrollTop;
    },
    set scrollTop(value: number) {
      host.scrollTop = value;
    },
    get scrollLeft() {
      return host.scrollLeft;
    },
    set scrollLeft(value: number) {
      host.scrollLeft = value;
    },
    get scrollHeight() {
      return host.scrollHeight;
    },
    get scrollWidth() {
      return host.scrollWidth;
    },
    setScrollTop(value: number) {
      host.scrollTop = value;
    },
    render() {
      // shortcut: Native lists own their scroll viewport; add external-scroll integration when needed.
      if (
        read(element.config.externalScroll) ||
        element.config.scrollTop !== undefined ||
        element.config.viewportHeight !== undefined
      ) {
        throw new Error("Native ListViewV2 requires its own scroll viewport");
      }
      host.render();
      node.horizontal = "hidden";
      node.listeners.scroll = (event: any) => {
        element.config.onScroll?.({ ...event, target: node });
        const nearBottom =
          node.rowCount > 0 &&
          event.scrollTop + event.clientHeight >=
            node.contentHeight - element.model.estimatedItemHeight * 2;
        if (nearBottom && !reachedBottom)
          element.config.onReachBottom?.({ ...event, target: node });
        reachedBottom = nearBottom;
      };
      for (const source of [
        element.source,
        element.config.itemHeight,
        element.config.gutter,
        element.config.paddingBottom,
      ]) {
        if (isRef(source))
          cleanups.push(source.subscribe({ onChange: sync, onPatch: sync }));
      }
      sync();
      return node;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanups.splice(0).forEach((cleanup) => cleanup());
      [...rows.keys()].forEach(release);
      node.listeners = {};
    },
  };
}
