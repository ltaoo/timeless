import { describe, expect, it, vi } from "vitest";

import { DismissableLayerCore } from "@/dismissable-layer";
import { LayerManager } from "@/layer";

describe("DismissableLayerCore", () => {
  it("outside pointerdown 应关闭当前 layer", () => {
    const layerManager = new LayerManager();
    const layer = new DismissableLayerCore({ layerManager });
    const dismiss = vi.fn();

    layer.setRect(() => ({ x: 50, y: 50, width: 100, height: 100 }));
    layer.onDismiss(dismiss);
    layer.register();

    layerManager.handlePointerDown(10, 10);

    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("outside pointerdown 只关闭栈顶 layer", () => {
    const layerManager = new LayerManager();
    const parent = new DismissableLayerCore({ layerManager });
    const child = new DismissableLayerCore({ layerManager });
    const parentDismiss = vi.fn();
    const childDismiss = vi.fn();

    parent.setRect(() => ({ x: 0, y: 0, width: 200, height: 200 }));
    child.setRect(() => ({ x: 50, y: 50, width: 50, height: 50 }));
    parent.onDismiss(parentDismiss);
    child.onDismiss(childDismiss);

    parent.register();
    child.register();

    layerManager.handlePointerDown(10, 10);

    expect(childDismiss).toHaveBeenCalledTimes(1);
    expect(parentDismiss).not.toHaveBeenCalled();
  });

  it("branch 区域应被视为 inside", () => {
    const layerManager = new LayerManager();
    const layer = new DismissableLayerCore({ layerManager });
    const dismiss = vi.fn();

    layer.setRect(() => ({ x: 100, y: 100, width: 100, height: 100 }));
    layer.addBranch(() => ({ x: 0, y: 0, width: 50, height: 50 }));
    layer.onDismiss(dismiss);
    layer.register();

    layerManager.handlePointerDown(10, 10);

    expect(dismiss).not.toHaveBeenCalled();
  });

  it("子层注销后，下一次 outside pointerdown 应关闭父层", () => {
    const layerManager = new LayerManager();
    const parent = new DismissableLayerCore({ layerManager });
    const child = new DismissableLayerCore({ layerManager });
    const parentDismiss = vi.fn();
    const childDismiss = vi.fn(() => child.unregister());

    parent.setRect(() => ({ x: 0, y: 0, width: 200, height: 200 }));
    child.setRect(() => ({ x: 50, y: 50, width: 50, height: 50 }));
    parent.onDismiss(parentDismiss);
    child.onDismiss(childDismiss);

    parent.register();
    child.register();

    layerManager.handlePointerDown(10, 10);
    layerManager.handlePointerDown(250, 250);

    expect(childDismiss).toHaveBeenCalledTimes(1);
    expect(parentDismiss).toHaveBeenCalledTimes(1);
  });
});
