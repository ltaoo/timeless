import { describe, expect, it, vi } from "vitest";
import { TreeCore } from "@timeless/inner-vm";

import { ref } from "../core";
import { Root, Scroll } from "@/modules/tree";

function make_store() {
  return new TreeCore({
    nodes: [
      {
        key: "folder:f1",
        title: "Folder",
        children: [{ key: "feed:a", title: "Feed" }],
      },
    ],
  });
}

/** 命中测试用的假 target：只有 `closest` / `getAttribute` 是渲染层会碰的。 */
function hit_target(id: string | null) {
  return {
    target: {
      closest: () =>
        id === null ? null : { getAttribute: () => id },
    },
  } as unknown as MouseEvent;
}

describe("TreePrimitive Root onRowContextMenu", () => {
  it("命中行时回调收到该节点与同一个 event 对象", () => {
    const store = make_store();
    const onRowContextMenu = vi.fn();
    const el = Root({ store, onRowContextMenu });

    const event = hit_target("folder:f1");
    el.events.onContextMenu?.(event);

    expect(onRowContextMenu).toHaveBeenCalledTimes(1);
    const [node, received] = onRowContextMenu.mock.calls[0];
    expect(node).toBe(store.getNode("folder:f1"));
    expect(received).toBe(event);
  });

  it("空白处（closest 命中不到）回调收到 null", () => {
    const store = make_store();
    const onRowContextMenu = vi.fn();
    const el = Root({ store, onRowContextMenu });

    el.events.onContextMenu?.(hit_target(null));

    expect(onRowContextMenu).toHaveBeenCalledTimes(1);
    expect(onRowContextMenu.mock.calls[0][0]).toBeNull();
  });

  it("只给原生 onContextMenu：处理器照旧被调用", () => {
    const store = make_store();
    const raw = vi.fn();
    const el = Root({ store, onContextMenu: raw });

    const event = hit_target("folder:f1");
    el.events.onContextMenu?.(event);

    expect(raw).toHaveBeenCalledTimes(1);
    expect(raw.mock.calls[0][0]).toBe(event);
  });

  it("两个都没给时不挂处理器", () => {
    const el = Root({ store: make_store() });
    expect(el.events.onContextMenu).toBeUndefined();
  });
});

describe("TreePrimitive Scroll maxHeight", () => {
  /** Scroll 只在 render 回调里碰 store / runtime，构造期只用这几个 props。 */
  function scroll_style(maxHeight?: number) {
    return Scroll({
      store: make_store(),
      runtime: {} as never,
      rows: ref([]) as never,
      ...(maxHeight === undefined ? {} : { maxHeight }),
    }).state.style;
  }

  it("默认 / 正数：写成 px 上限", () => {
    expect(scroll_style()).toEqual({ "max-height": "360px" });
    expect(scroll_style(240)).toEqual({ "max-height": "240px" });
  });

  it("0 或负数：显式 none（压住主题自带的 max-height），而不是省略", () => {
    expect(scroll_style(0)).toEqual({ "max-height": "none" });
    expect(scroll_style(-1)).toEqual({ "max-height": "none" });
  });
});
