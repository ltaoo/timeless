import { describe, expect, it, vi } from "vitest";

import { DragContainerModel, DragDropModel, DragItemModel } from "@/drag-drop";

describe("DragDropModel", () => {
  it("项可以拖拽放入容器", () => {
    const container = DragContainerModel({ id: "todo" });
    const item = DragItemModel({
      id: "task-1",
      payload: { title: "Task 1" },
    });

    item.methods.startDrag();
    expect(item.state.dragging).toBe(true);

    expect(container.methods.drop(item)).toBe(true);
    item.methods.endDrag();

    expect(item.state.containerId).toBe("todo");
    expect(item.state.index).toBe(0);
    expect(container.state.itemIds).toEqual(["task-1"]);
    expect(container.state.items[0]).toMatchObject({
      id: "task-1",
      kind: "item",
      containerId: "todo",
      index: 0,
    });
  });

  it("项可以在容器之间拖拽放置", () => {
    const left = DragContainerModel({ id: "left" });
    const right = DragContainerModel({ id: "right" });
    const item = DragItemModel({ id: "card" });

    left.methods.append(item);
    expect(left.state.itemIds).toEqual(["card"]);

    item.methods.startDrag();
    expect(right.methods.drop(item, { index: 0 })).toBe(true);
    item.methods.endDrag();

    expect(left.state.itemIds).toEqual([]);
    expect(right.state.itemIds).toEqual(["card"]);
    expect(item.state.containerId).toBe("right");
    expect(item.parent).toBe(right);
  });

  it("同一容器内部可以拖拽重排", () => {
    const container = DragContainerModel({ id: "list" });
    const a = DragItemModel({ id: "a" });
    const b = DragItemModel({ id: "b" });
    const c = DragItemModel({ id: "c" });

    container.methods.append(a);
    container.methods.append(b);
    container.methods.append(c);

    c.methods.startDrag();
    expect(container.methods.drop(c, { index: 0 })).toBe(true);
    c.methods.endDrag();

    expect(container.state.itemIds).toEqual(["c", "a", "b"]);
    expect(c.state.index).toBe(0);
    expect(a.state.index).toBe(1);
    expect(b.state.index).toBe(2);
  });

  it("容器本身可以作为拖拽项放入另一个容器", () => {
    const root = DragContainerModel({ id: "root" });
    const panel = DragContainerModel({ id: "panel" });
    const child = DragItemModel({ id: "inside-panel" });

    panel.methods.append(child);
    panel.methods.startDrag();
    expect(root.methods.drop(panel)).toBe(true);
    panel.methods.endDrag();

    expect(root.state.itemIds).toEqual(["panel"]);
    expect(root.state.items[0]).toMatchObject({
      id: "panel",
      kind: "container",
      containerId: "root",
      index: 0,
    });
    expect(panel.state.containerId).toBe("root");
    expect(panel.state.itemIds).toEqual(["inside-panel"]);
    expect(child.state.containerId).toBe("panel");
  });

  it("容器之间内部项可以互相拖拽放置到指定位置", () => {
    const backlog = DragContainerModel({ id: "backlog" });
    const doing = DragContainerModel({ id: "doing" });
    const a = DragItemModel({ id: "a" });
    const b = DragItemModel({ id: "b" });
    const c = DragItemModel({ id: "c" });

    backlog.methods.append(a);
    backlog.methods.append(b);
    doing.methods.append(c);

    c.methods.startDrag();
    expect(backlog.methods.drop(c, { index: 1 })).toBe(true);
    c.methods.endDrag();

    expect(backlog.state.itemIds).toEqual(["a", "c", "b"]);
    expect(doing.state.itemIds).toEqual([]);
    expect(c.state.containerId).toBe("backlog");
    expect(c.state.index).toBe(1);
  });

  it("不允许容器放入自己或自己的后代容器", () => {
    const root = DragContainerModel({ id: "root" });
    const parent = DragContainerModel({ id: "parent" });
    const child = DragContainerModel({ id: "child" });

    root.methods.append(parent);
    parent.methods.append(child);

    expect(parent.methods.drop(parent)).toBe(false);
    expect(child.methods.drop(parent)).toBe(false);
    expect(root.state.itemIds).toEqual(["parent"]);
    expect(parent.state.itemIds).toEqual(["child"]);
    expect(child.state.itemIds).toEqual([]);
  });

  it("拖拽会话可以记录 active、hover 和 drop", () => {
    const dnd = DragDropModel();
    const source = DragContainerModel({ id: "source" });
    const target = DragContainerModel({ id: "target" });
    const item = DragItemModel({ id: "item" });
    const onDrop = vi.fn();

    dnd.methods.registerContainer(source);
    dnd.methods.registerContainer(target);
    dnd.onDrop(onDrop);
    source.methods.append(item);

    expect(dnd.methods.startDrag(item)).toBe(true);
    expect(dnd.state.active).toEqual({
      id: "item",
      kind: "item",
      sourceContainerId: "source",
      sourceIndex: 0,
    });

    expect(dnd.methods.enterContainer(target, { index: 0 })).toBe(true);
    expect(dnd.state.overContainerId).toBe("target");
    expect(target.state.hovering).toBe(true);

    expect(dnd.methods.dropOn(target, { index: 0 })).toBe(true);
    expect(dnd.state.active).toBe(null);
    expect(dnd.state.overContainerId).toBe(null);
    expect(target.state.hovering).toBe(false);
    expect(source.state.itemIds).toEqual([]);
    expect(target.state.itemIds).toEqual(["item"]);
    expect(item.state.dragging).toBe(false);
    expect(onDrop).toHaveBeenCalledWith({
      node: item,
      container: target,
      index: 0,
    });
  });

  it("容器 accept 函数可以拒绝放置", () => {
    const target = DragContainerModel({
      id: "target",
      accepts: ({ node }) => node.kind === "container",
    });
    const item = DragItemModel({ id: "item" });
    const panel = DragContainerModel({ id: "panel" });

    expect(target.methods.drop(item)).toBe(false);
    expect(target.methods.drop(panel)).toBe(true);

    expect(item.state.containerId).toBe(null);
    expect(panel.state.containerId).toBe("target");
    expect(target.state.itemIds).toEqual(["panel"]);
  });
});
