import { describe, it, expect, vi } from "vitest";

import { TreeCore } from "@/tree";
import type { TreeNode } from "@/tree";

/** 一棵够用的样例树：两个目录 + 一个根级叶子。 */
function sample(): TreeNode[] {
  return [
    {
      key: "dir-a",
      title: "a",
      children: [
        { key: "a-1", title: "a1" },
        { key: "a-2", title: "a2" },
      ],
    },
    {
      key: "dir-b",
      title: "b",
      children: [{ key: "b-1", title: "b1" }],
    },
    { key: "file-c", title: "c" },
  ];
}

/** 取出 rows 里可见行对应的 _id。 */
function rowIds(tree: TreeCore): string[] {
  return tree.rows.map((row) => row.node._id as string);
}

describe("TreeCore", () => {
  describe("构建", () => {
    it("未传 key 时按层级生成稳定 _id", () => {
      const tree = new TreeCore({
        nodes: [{ title: "a", children: [{ title: "a1" }] }],
      });
      expect(rowIds(tree)).toEqual(["d0", "d0/f0"]);
    });

    it("显式 key 优先于下标生成的 _id", () => {
      const tree = new TreeCore({ nodes: sample() });
      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-1",
        "a-2",
        "dir-b",
        "b-1",
        "file-c",
      ]);
    });

    it("接受根节点对象（取其 children）", () => {
      const tree = new TreeCore({ nodes: { title: "root", children: [] } });
      expect(tree.nodes.title).toBe("root");
    });

    it("每次重算 rows 都是新数组（ListViewV2 靠引用变化重绘）", () => {
      const tree = new TreeCore({ nodes: sample() });
      const before = tree.rows;
      tree.collapse("dir-a");
      expect(tree.rows).not.toBe(before);
    });
  });

  describe("展开 / 折叠", () => {
    it("折叠目录后其子树不再出现在 rows 里", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.collapse("dir-a");
      expect(rowIds(tree)).toEqual(["dir-a", "dir-b", "b-1", "file-c"]);
    });

    it("toggleExpand 来回切换", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.toggleExpand("dir-b");
      expect(tree.collapsedKeys.has("dir-b")).toBe(true);
      tree.toggleExpand("dir-b");
      expect(tree.collapsedKeys.has("dir-b")).toBe(false);
    });

    it("expand / collapse 触发 onExpand 回调", () => {
      const onExpand = vi.fn();
      const tree = new TreeCore({ nodes: sample(), onExpand });
      tree.collapse("dir-a");
      expect(onExpand).toHaveBeenCalledWith("dir-a", false);
      tree.expand("dir-a");
      expect(onExpand).toHaveBeenCalledWith("dir-a", true);
    });

    it("非目录不能折叠", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.collapse("file-c");
      expect(tree.collapsedKeys.size).toBe(0);
    });

    it("collapsible=false 时折叠命令无效", () => {
      const tree = new TreeCore({ nodes: sample(), collapsible: false });
      tree.collapse("dir-a");
      expect(tree.collapsedKeys.size).toBe(0);
    });

    it("collapseAll 折叠所有目录，expandAll 全部展开", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.collapseAll();
      expect(tree.collapsedKeys.size).toBe(2);
      expect(rowIds(tree)).toEqual(["dir-a", "dir-b", "file-c"]);
      tree.expandAll();
      expect(tree.collapsedKeys.size).toBe(0);
      expect(rowIds(tree)).toContain("a-1");
    });

    it("受控 expandedKeys 作为初始展开集合", () => {
      const tree = new TreeCore({
        nodes: sample(),
        expandedKeys: new Set(["dir-b"]),
      });
      expect(rowIds(tree)).toContain("b-1");
      expect(rowIds(tree)).not.toContain("a-1");
    });
  });

  describe("数据重建", () => {
    it("setNodes 按 _path 搬运折叠状态", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.collapse("dir-a");
      tree.setNodes(sample());
      expect(tree.collapsedKeys.has("dir-a")).toBe(true);
    });

    it("setNodes 后清掉指向已消失节点的键", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.collapse("dir-b");
      tree.setNodes([{ key: "dir-a", title: "a", children: [] }]);
      expect(tree.collapsedKeys.has("dir-b")).toBe(false);
    });

    it("setResources 按 `/` 拆名建树", () => {
      const tree = new TreeCore();
      tree.setResources([{ title: "x/y/z.txt" }, { title: "x/w.txt" }]);
      expect(rowIds(tree)).toEqual(["d0", "d0/d0", "d0/d0/f0", "d0/f1"]);
      expect(tree.rows.map((row) => row.node.title)).toEqual([
        "x",
        "y",
        "z.txt",
        "w.txt",
      ]);
    });
  });

  describe("勾选", () => {
    it("勾目录会连带上整棵子树", () => {
      const tree = new TreeCore({ nodes: sample(), checkable: true });
      tree.check("dir-a", true);
      expect([...tree.state.checkedKeys].sort()).toEqual([
        "a-1",
        "a-2",
        "dir-a",
      ]);
    });

    it("取消子树里的一个叶子后父目录变半选", () => {
      const tree = new TreeCore({ nodes: sample(), checkable: true });
      tree.check("dir-a", true);
      tree.check("a-1", false);
      const state = tree.state;
      expect(state.halfCheckedKeys.has("dir-a")).toBe(true);
      expect(state.checkedKeys.has("dir-a")).toBe(false);
    });

    it("checkChildNodesAuto=false 时只勾自己", () => {
      const tree = new TreeCore({
        nodes: sample(),
        checkable: true,
        checkChildNodesAuto: false,
      });
      tree.check("dir-a", true);
      expect([...tree.state.checkedKeys]).toEqual(["dir-a"]);
    });

    it("checkable=false 时勾选命令无效", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.check("a-1", true);
      expect(tree.state.checkedKeys.size).toBe(0);
    });

    it("uncheckAll 清空勾选与半选", () => {
      const tree = new TreeCore({ nodes: sample(), checkable: true });
      tree.check("dir-a", true);
      tree.uncheckAll();
      expect(tree.state.checkedKeys.size).toBe(0);
      expect(tree.state.halfCheckedKeys.size).toBe(0);
    });

    it("check 触发 onCheck 并带上勾选信息", () => {
      const onCheck = vi.fn();
      const tree = new TreeCore({ nodes: sample(), checkable: true, onCheck });
      tree.check("a-1", true);
      expect(onCheck).toHaveBeenCalledTimes(1);
      const [key, checked, info] = onCheck.mock.calls[0];
      expect(key).toBe("a-1");
      expect(checked).toBe(true);
      expect(info.checkedKeys.has("a-1")).toBe(true);
    });
  });

  describe("选中", () => {
    it("单选替换当前选中", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.select("a-1");
      tree.select("a-2");
      expect([...tree.state.selectedKeys]).toEqual(["a-2"]);
    });

    it("multiple 下再点同一个节点会取消选中", () => {
      const tree = new TreeCore({ nodes: sample(), multiple: true });
      tree.select("a-1");
      tree.select("a-2");
      expect([...tree.state.selectedKeys].sort()).toEqual(["a-1", "a-2"]);
      tree.select("a-1");
      expect([...tree.state.selectedKeys]).toEqual(["a-2"]);
    });

    it("clickNode 先发 onNodeClick 再选中，目录顺带折叠", () => {
      const onNodeClick = vi.fn();
      const tree = new TreeCore({ nodes: sample(), onNodeClick });
      tree.clickNode("dir-a");
      expect(onNodeClick).toHaveBeenCalledTimes(1);
      expect([...tree.state.selectedKeys]).toEqual(["dir-a"]);
      expect(tree.collapsedKeys.has("dir-a")).toBe(true);
    });
  });

  describe("拖拽", () => {
    it("draggable=false 时 beginDrag 无效", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.beginDrag("a-1");
      expect(tree.state.dragging).toBe(false);
    });

    it("beginDrag 后 state 暴露拖起的节点", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("a-1");
      expect(tree.state.dragging).toBe(true);
      expect(tree.state.draggingKey).toBe("a-1");
      expect(tree.state.draggingNode?.title).toBe("a1");
    });

    it("行内 25/50/25 三区判定 before / into / after", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("file-c");

      tree.updateDrag({ id: "dir-b", ratio: 0.1 });
      expect(tree.state.dropTarget).toMatchObject({ kind: "before" });

      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      expect(tree.state.dropTarget).toMatchObject({ kind: "into", id: "dir-b" });

      tree.updateDrag({ id: "dir-b", ratio: 0.9 });
      expect(tree.state.dropTarget).toMatchObject({ kind: "after" });
    });

    it("非目录行的中间区降级为 after", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "file-c", ratio: 0.5 });
      expect(tree.state.dropTarget).toMatchObject({ kind: "after" });
    });

    it("落点在自己或自己后代的整行上被环防护拒绝", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("dir-a");
      tree.updateDrag({ id: "a-1", ratio: 0.1 });
      expect(tree.state.dropTarget).toBeNull();
    });

    it("commitDrag 把节点移到目标目录并换新树", () => {
      const onMove = vi.fn();
      const tree = new TreeCore({ nodes: sample(), draggable: true, onMove });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      const info = tree.commitDrag();
      expect(info).not.toBeNull();
      expect(info!.to.parentKey).toBe("dir-b");
      expect(onMove).toHaveBeenCalledTimes(1);
      expect(rowIds(tree)).toContain("a-1");
      expect(tree.state.dragging).toBe(false);
      expect(tree.state.dropTarget).toBeNull();
    });

    it("移动后 rows 立刻反映新位置（缩进 / 父节点都换）", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      tree.commitDrag();
      // a-1 从 dir-a 挪到 dir-b 末尾：整棵可见行的顺序都要跟着换。
      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-2",
        "dir-b",
        "b-1",
        "a-1",
        "file-c",
      ]);
      const row = tree.getRow("a-1")!;
      expect(row.depth).toBe(1);
      expect(row.parent?._id).toBe("dir-b");
    });

    it("moveNode 之后 rows 也立刻更新", () => {
      const tree = new TreeCore({ nodes: sample() });
      tree.moveNode("a-1", "dir-b", 0);
      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-2",
        "dir-b",
        "a-1",
        "b-1",
        "file-c",
      ]);
    });

    it("落回原位时 commitDrag 返回 null", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      // 拖 a-2，落到前一个兄弟 a-1 之后 = 回到原位。
      tree.beginDrag("a-2");
      tree.updateDrag({ id: "a-1", ratio: 0.9 });
      expect(tree.state.dropTarget?.noop).toBe(true);
      expect(tree.commitDrag()).toBeNull();
    });

    it("落在自己整行上被环防护拒掉（自身也算自己子树）", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "a-1", ratio: 0.9 });
      expect(tree.state.dropTarget).toBeNull();
    });

    it("cancelDrag 结束会话且不动数据", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.beginDrag("a-1");
      tree.cancelDrag();
      expect(tree.state.dragging).toBe(false);
      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-1",
        "a-2",
        "dir-b",
        "b-1",
        "file-c",
      ]);
    });

    it("移到折叠的目录里会顺手把它展开", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      tree.collapse("dir-b");
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      tree.commitDrag();
      expect(tree.collapsedKeys.has("dir-b")).toBe(false);
      expect(rowIds(tree)).toContain("a-1");
    });

    it("moveNode 编程式移动", () => {
      const tree = new TreeCore({ nodes: sample() });
      const info = tree.moveNode("file-c", "dir-a", 0);
      expect(info).not.toBeNull();
      expect(info!.to.parentKey).toBe("dir-a");
      const a_dir = tree.getNode("dir-a");
      expect((a_dir!.children || []).map((n) => n._id)).toEqual([
        "file-c",
        "a-1",
        "a-2",
      ]);
    });

    it("draggable === false 的行不能作为拖拽源", () => {
      const tree = new TreeCore({
        nodes: [
          { key: "all", title: "全部", draggable: false, children: [] },
          { key: "f1", title: "f1" },
        ],
        draggable: true,
      });
      tree.beginDrag("all");
      expect(tree.state.dragging).toBe(false);
      // 其它行不受影响，而且 draggable:false 的行仍可作为落点。
      tree.beginDrag("f1");
      expect(tree.state.dragging).toBe(true);
      tree.updateDrag({ id: "all", ratio: 0.5 });
      expect(tree.state.dropTarget).toMatchObject({ kind: "into", id: "all" });
    });
  });

  describe("allowRootDrop: false", () => {
    it("根级留白落点被挡掉", () => {
      const tree = new TreeCore({
        nodes: sample(),
        draggable: true,
        allowRootDrop: false,
      });
      tree.beginDrag("a-1");
      tree.updateDrag({ root: true });
      expect(tree.state.dropTarget).toBeNull();
      expect(tree.commitDrag()).toBeNull();
    });

    it("落在根级兄弟旁（「全部」旁边）被挡掉", () => {
      const tree = new TreeCore({
        nodes: sample(),
        draggable: true,
        allowRootDrop: false,
      });
      tree.beginDrag("b-1");
      tree.updateDrag({ id: "file-c", ratio: 0.9 });
      expect(tree.state.dropTarget).toBeNull();
      expect(tree.commitDrag()).toBeNull();
    });

    it("移入目录仍然生效", () => {
      const tree = new TreeCore({
        nodes: sample(),
        draggable: true,
        allowRootDrop: false,
      });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      expect(tree.commitDrag()).not.toBeNull();
      expect(tree.getNode("dir-b")!.children!.map((n) => n._id)).toEqual([
        "b-1",
        "a-1",
      ]);
    });

    it("只挡落点，moveNode 走 _applyMove 不受影响", () => {
      const tree = new TreeCore({ nodes: sample(), allowRootDrop: false });
      const info = tree.moveNode("dir-b", "", 3);
      expect(info).not.toBeNull();
      expect(info!.to.parentKey).toBe("");
      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-1",
        "a-2",
        "file-c",
        "dir-b",
        "b-1",
      ]);
    });
  });

  describe("onMove 的 order 上下文", () => {
    it("移入目录时 order 是目标目录落定后的完整子节点顺序", () => {
      const onMove = vi.fn();
      const tree = new TreeCore({ nodes: sample(), draggable: true, onMove });
      tree.beginDrag("a-1");
      tree.updateDrag({ id: "dir-b", ratio: 0.5 });
      tree.commitDrag();
      const [, context] = onMove.mock.calls[0];
      expect(context.order).toEqual(["b-1", "a-1"]);
      expect(context.order).toHaveLength(2);
      expect(context.order).toContain("a-1");
    });

    it("同级重排时 order 是根级混编后的完整顺序（源可排到文件夹前）", () => {
      const onMove = vi.fn();
      const tree = new TreeCore({ nodes: sample(), draggable: true, onMove });
      // file-c 拖到 dir-b 之前：源排在文件夹前面。
      tree.beginDrag("file-c");
      tree.updateDrag({ id: "dir-b", ratio: 0.1 });
      tree.commitDrag();
      const [, context] = onMove.mock.calls[0];
      expect(context.order).toEqual(["dir-a", "file-c", "dir-b"]);
    });

    it("moveNode 也回传 order", () => {
      const onMove = vi.fn();
      const tree = new TreeCore({ nodes: sample(), onMove });
      tree.moveNode("file-c", "dir-a", 0);
      const [, context] = onMove.mock.calls[0];
      expect(context.order).toEqual(["file-c", "a-1", "a-2"]);
    });
  });

  describe("层级引导线", () => {
    /** 取某行的 guides。 */
    function guidesOf(tree: TreeCore, id: string): boolean[] {
      return tree.getRow(id)!.guides;
    }

    it("guides 长度恒等于 depth", () => {
      const tree = new TreeCore({ nodes: sample() });
      for (const row of tree.rows) {
        expect(row.guides.length).toBe(row.depth);
      }
    });

    it("根级行没有引导线", () => {
      const tree = new TreeCore({ nodes: sample() });
      for (const id of ["dir-a", "dir-b", "file-c"]) {
        expect(guidesOf(tree, id)).toEqual([]);
      }
    });

    it("祖先仍有后续兄弟时该层画线", () => {
      const tree = new TreeCore({ nodes: sample() });
      // dir-a / dir-b 后面都还有根级节点，所以它们的子树在第 0 层都画线。
      expect(guidesOf(tree, "a-1")).toEqual([true]);
      expect(guidesOf(tree, "a-2")).toEqual([true]);
      expect(guidesOf(tree, "b-1")).toEqual([true]);
    });

    it("唯一根的子行也画线", () => {
      // 阅读端侧栏就是这种形状：根只有「全部」一棵，源全在它下面。根没有兄弟可连，
      // 只看「后续兄弟」的话整棵树一根线都没有 —— 所以展开、且可见子节点 ≥2 也要画。
      const tree = new TreeCore({
        nodes: [
          {
            key: "all",
            title: "全部",
            children: [
              { key: "f1", title: "f1" },
              { key: "f2", title: "f2" },
              { key: "f3", title: "f3" },
            ],
          },
        ],
      });
      expect(guidesOf(tree, "all")).toEqual([]);
      expect(guidesOf(tree, "f1")).toEqual([true]);
      expect(guidesOf(tree, "f2")).toEqual([true]);
      expect(guidesOf(tree, "f3")).toEqual([true]);
    });

    it("末位目录的子树不出现飘线（Images/icons 那种结构）", () => {
      // a2 是 a 的最后一个孩子、自己却有子节点：它的子树在 a2 那一层不画线，
      // 否则会在子树旁边飘出一段上下都不连接的竖线。
      const tree = new TreeCore({
        nodes: [
          {
            key: "a",
            title: "a",
            children: [
              {
                key: "a1",
                title: "a1",
                children: [{ key: "a1x", title: "a1x" }],
              },
              {
                key: "a2",
                title: "a2",
                children: [{ key: "a2x", title: "a2x" }],
              },
            ],
          },
          { key: "b", title: "b" },
        ],
      });
      // a1 后面还有兄弟 a2 → 第 0 层画；a1x 在 a1 那一层也继续（a1 后面有 a2）。
      expect(guidesOf(tree, "a1x")).toEqual([true, true]);
      // a2 是末位 → 第 1 层不画，只留第 0 层（a 后面还有 b）。
      expect(guidesOf(tree, "a2x")).toEqual([true, false]);
    });

    it("拖拽重排同级后，祖先仍有后续兄弟的行 key 会变", () => {
      // mask 进 key 的全部理由：重排只换 children 顺序，_id / depth / collapsed /
      // count / _path 全不变，只有 guides 会变；不带 mask 的话该重绘的行不重绘。
      // 用只有一个子节点的 dir-b（子节点 ≥2 时判据 2 恒真，重排就不改 mask 了）。
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      const before = tree.getRow("b-1")!.key;
      expect(guidesOf(tree, "b-1")).toEqual([true]);

      tree.moveNode("dir-b", "", 3); // dir-b 挪到根级末尾
      const after = tree.getRow("b-1")!.key;

      expect(rowIds(tree)).toEqual([
        "dir-a",
        "a-1",
        "a-2",
        "file-c",
        "dir-b",
        "b-1",
      ]);
      expect(guidesOf(tree, "b-1")).toEqual([false]);
      expect(after).not.toBe(before);
    });
  });

  describe("序列化", () => {
    it("toJSON 剥掉 _id / _path 只留业务字段", () => {
      const tree = new TreeCore({ nodes: sample() });
      const plain = tree.toJSON()!;
      expect("_id" in plain.children![0]).toBe(false);
      expect("_path" in plain.children![0]).toBe(false);
      expect(plain.children![0].title).toBe("a");
    });

    it("isTreeEmpty 对空树返回 true", () => {
      expect(new TreeCore().isTreeEmpty()).toBe(true);
      expect(new TreeCore({ nodes: sample() }).isTreeEmpty()).toBe(false);
    });
  });

  describe("事件", () => {
    it("onStateChange 注册监听器并返回卸载函数", () => {
      const tree = new TreeCore({ nodes: sample() });
      const handler = vi.fn();
      const unlisten = tree.onStateChange(handler);
      expect(typeof unlisten).toBe("function");

      tree.collapse("dir-a");
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      tree.collapse("dir-b");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("state 里携带 rows / 拖拽态等结构字段", () => {
      const tree = new TreeCore({ nodes: sample(), draggable: true });
      const seen: unknown[] = [];
      tree.onStateChange((state) => seen.push(state.rows.length));
      tree.beginDrag("a-1");
      expect(seen).toEqual([6]);
    });
  });
});
