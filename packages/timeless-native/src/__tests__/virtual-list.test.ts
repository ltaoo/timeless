import { afterEach, expect, it, vi } from "vitest";
import {
  computed,
  ListViewV2,
  ref,
  ScrollView,
  View,
} from "@timeless/timeless";
import { buildAndRender } from "../renderer";
import * as webStyles from "../web-styles";

afterEach(() => {
  vi.restoreAllMocks();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it("resolves each node's styles once when mounting a virtual row", () => {
  vi.useFakeTimers();
  const list = ListViewV2({
    each: [{ id: 1 }],
    render: () =>
      View({ class: "flex", attributes: { n: "outer" } }, [
        View({ class: "text-sm", attributes: { n: "inner" } }, ["Item"]),
      ]),
  });
  const { dom } = buildAndRender(list);
  const compute = vi.spyOn(webStyles, "computeWebStyle");
  const row = dom._renderRow(0);
  const countNodes = (node: any): number =>
    1 +
    (node.children ?? []).reduce(
      (sum: number, child: any) => sum + countNodes(child),
      0,
    );
  expect(compute).toHaveBeenCalledTimes(countNodes(row));
  list.onUnmounted();
});

it("builds only requested native rows, disposes them and updates source and layout", () => {
  vi.useFakeTimers();
  const items = ref(
    Array.from({ length: 10000 }, (_, index) => ({ id: index })),
  );
  const height = ref(48);
  const unmount = vi.fn();
  const mounted = vi.fn();
  const list = ListViewV2({
    each: items,
    key: "id",
    itemHeight: height,
    render: (item) =>
      View(
        {
          onMounted: mounted,
          onUnmounted: unmount,
          attributes: { n: "row-content" },
        },
        [computed(item, (value) => String(value.id))],
      ),
  });
  const { dom } = buildAndRender(list);
  expect(dom.type).toBe("list-view-v2");
  expect(dom.rowCount).toBe(10000);
  expect(dom.contentHeight).toBe(480000);
  expect(dom.children).toHaveLength(0);
  const row = dom._renderRow(5000);
  expect(dom.children).toHaveLength(1);
  expect(dom._renderRow(5000)).toBe(row);
  vi.runOnlyPendingTimers();
  expect(mounted).toHaveBeenCalledOnce();
  dom._releaseRow(5000);
  dom._releaseRow(5000);
  expect(unmount).toHaveBeenCalledOnce();
  expect(dom.children).toHaveLength(0);
  expect(dom._renderRow(-1)).toBeNull();
  expect(dom._renderRow(10000)).toBeNull();
  height.as(60);
  expect(dom.contentHeight).toBe(600000);
  expect(dom._rowHeight(0)).toBe(60);
  items.as([{ id: 12 }]);
  expect(dom.rowCount).toBe(1);
  expect(dom.contentHeight).toBe(60);
  dom._renderRow(0);
  list.onUnmounted();
  expect(dom.children).toHaveLength(0);
  const revision = dom.revision;
  items.as([]);
  expect(dom.revision).toBe(revision);
  expect(dom._renderRow(0)).toBeNull();
  expect(unmount).toHaveBeenCalledTimes(2);
});

it("preserves scroll coordinates and reach-bottom events through the native host", () => {
  vi.useFakeTimers();
  const reach = vi.fn();
  const scroll = vi.fn();
  const list = ListViewV2({
    each: [{ id: 1 }, { id: 2 }],
    itemHeight: 50,
    onReachBottom: reach,
    onScroll: scroll,
    render: () => null,
  });
  const { dom } = buildAndRender(list);
  list.$elm.setScrollTop(80);
  expect(dom.scrollTop).toBe(80);
  dom.listeners.scroll({ scrollTop: 50, clientHeight: 50, scrollHeight: 100 });
  dom.listeners.scroll({ scrollTop: 50, clientHeight: 50, scrollHeight: 100 });
  expect(reach).toHaveBeenCalledOnce();
  expect(scroll).toHaveBeenCalledTimes(2);
  list.onUnmounted();

  const view = ScrollView({}, [
    View({ attributes: { n: "scroll-content" } }, []),
  ]);
  const result = buildAndRender(view);
  result.dom._getBoundingClientRect = () => ({ width: 320, height: 200 });
  expect(view.$elm.getBoundingClientRect()).toEqual({
    width: 320,
    height: 200,
  });
  view.methods.scrollTo(40, 80);
  expect(result.dom.scrollLeft).toBe(40);
  expect(result.dom.scrollTop).toBe(80);
  expect(result.dom.scrollRequest).toEqual({ left: 40, top: 80 });
  // Native observations can arrive before the pending programmatic request is applied.
  result.dom.scrollTop = -20;
  expect(result.dom.scrollRequest.top).toBe(80);
  view.onUnmounted();
});
