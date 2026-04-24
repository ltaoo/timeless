import { describe, it, expect, vi } from "vitest";
import { refarr } from "@timeless/reactive";

import { View } from "@/content/view";

import { For } from "../reactive/for";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

/** 创建一个挂载好的 For 节点，返回 forNode 和用于捕获各操作的 spy */
function setup(initial: Todo[]) {
  const todos = refarr<Todo>(initial, { key: "id" });

  const forNode = For<Todo>({
    key: "id",
    each: todos,
    render: (item, _idx) => {
      return { t: "view", $elm: null, value: item, render: () => null } as any;
    },
  });

  forNode.onMounted({ target: null });

  const refreshSpy = vi.fn();
  const moveSpy = vi.fn();
  const swapSpy = vi.fn();
  forNode.$elm = { refresh: refreshSpy, move: moveSpy, swap: swapSpy };

  return { todos, forNode, refreshSpy, moveSpy, swapSpy };
}

describe("For", () => {
  describe("refresh diff", () => {
    it("should correctly identify added, removed, and moved items", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "Buy groceries", completed: true },
        { id: 2, title: "Study for exam exam exam", completed: false },
        { id: 3, title: "Read a book", completed: false },
      ]);

      // reorder + add + remove
      todos.as([
        { id: 2, title: "Study for exam exam exam", completed: false },
        { id: 1, title: "Buy groceries_update", completed: true },
        { id: 4, title: "Sleep", completed: false },
      ]);

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];

      // id:3 (old idx 2) removed
      expect(removed).toEqual([{ idx: 2 }]);

      // id:4 added at new idx 2
      expect(added).toHaveLength(1);
      expect(added[0].idx).toBe(2);

      // id:2 moved 1→0, id:1 moved 0→1
      expect(moved).toHaveLength(2);
      expect(moved).toContainEqual({ from: 1, to: 0 });
      expect(moved).toContainEqual({ from: 0, to: 1 });

      expect(children).toHaveLength(3);
    });

    it("should handle removing all items and adding new ones", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
      ]);

      todos.as([
        { id: 10, title: "X", completed: false },
        { id: 20, title: "Y", completed: true },
      ]);

      const { added, removed, moved } = refreshSpy.mock.calls[0][0];

      expect(removed).toHaveLength(2);
      expect(removed.map((r: any) => r.idx).sort()).toEqual([0, 1]);

      expect(added).toHaveLength(1);
      expect(added[0].idx).toBe(0);
      expect(added[0].elements).toHaveLength(2);

      // no items survived → no moves
      expect(moved).toHaveLength(0);
    });

    it("should handle adding items without removing any", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "A", completed: false },
      ]);

      todos.as([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];

      expect(removed).toHaveLength(0);

      expect(added).toHaveLength(1);
      expect(added[0].idx).toBe(1);
      expect(added[0].elements).toHaveLength(2);

      // id:1 stays at idx 0 → no move
      expect(moved).toHaveLength(0);

      expect(children).toHaveLength(3);
    });

    it("should handle removing items without adding any", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // keep only id:2
      todos.as([{ id: 2, title: "B", completed: false }]);

      const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];

      expect(removed).toHaveLength(2);
      expect(removed.map((r: any) => r.idx).sort()).toEqual([0, 2]);

      expect(added).toHaveLength(0);

      // id:2 was at old idx 1, now at new idx 0 → moved
      expect(moved).toEqual([{ from: 1, to: 0 }]);

      expect(children).toHaveLength(1);
    });

    it("should report no moves when order is preserved", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // same order, just update titles
      todos.as([
        { id: 1, title: "A_updated", completed: false },
        { id: 2, title: "B_updated", completed: false },
        { id: 3, title: "C_updated", completed: false },
      ]);

      const { added, removed, moved } = refreshSpy.mock.calls[0][0];

      expect(added).toHaveLength(0);
      expect(removed).toHaveLength(0);
      expect(moved).toHaveLength(0);
    });

    it("should report no moves when order is preserved", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "1", completed: false },
        { id: 2, title: "2", completed: false },
        { id: 3, title: "3", completed: false },
        { id: 4, title: "4", completed: false },
        { id: 5, title: "5", completed: false },
        { id: 6, title: "6", completed: false },
        { id: 7, title: "7", completed: false },
        { id: 8, title: "8", completed: false },
        { id: 9, title: "9", completed: false },
        { id: 10, title: "10", completed: false },
        { id: 11, title: "11", completed: false },
        { id: 12, title: "12", completed: false },
        { id: 13, title: "13", completed: false },
        { id: 14, title: "14", completed: false },
        { id: 15, title: "15", completed: false },
        { id: 16, title: "16", completed: false },
        { id: 17, title: "17", completed: false },
        { id: 18, title: "18", completed: false },
        { id: 19, title: "19", completed: false },
        { id: 20, title: "20", completed: false },
        { id: 21, title: "21", completed: false },
        { id: 22, title: "22", completed: false },
        { id: 23, title: "23", completed: false },
        { id: 24, title: "24", completed: false },
        { id: 25, title: "25", completed: false },
        { id: 26, title: "26", completed: false },
        { id: 27, title: "27", completed: false },
        { id: 28, title: "28", completed: false },
        { id: 29, title: "29", completed: false },
        { id: 30, title: "30", completed: false },
        { id: 31, title: "31", completed: false },
        { id: 32, title: "32", completed: false },
        { id: 33, title: "33", completed: false },
        { id: 34, title: "34", completed: false },
        { id: 35, title: "35", completed: false },
        { id: 36, title: "36", completed: false },
        { id: 37, title: "37", completed: false },
        { id: 38, title: "38", completed: false },
        { id: 39, title: "39", completed: false },
        { id: 40, title: "40", completed: false },
        { id: 41, title: "41", completed: false },
        { id: 42, title: "42", completed: false },
        { id: 43, title: "43", completed: false },
        { id: 44, title: "44", completed: false },
        { id: 45, title: "45", completed: false },
        { id: 46, title: "46", completed: false },
        { id: 47, title: "47", completed: false },
        { id: 48, title: "48", completed: false },
        { id: 49, title: "49", completed: false },
        { id: 50, title: "50", completed: false },
      ]);

      todos.as([{ id: 34, title: "34", completed: false }]);

      // same order, just update titles
      todos.as([
        { id: 3, title: "3", completed: false },
        { id: 13, title: "13", completed: false },
        { id: 23, title: "23", completed: false },
        { id: 30, title: "30", completed: false },
        { id: 31, title: "31", completed: false },
        { id: 32, title: "32", completed: false },
        { id: 33, title: "33", completed: false },
        { id: 34, title: "34", completed: false },
        { id: 35, title: "35", completed: false },
        { id: 36, title: "36", completed: false },
        { id: 37, title: "37", completed: false },
        { id: 38, title: "38", completed: false },
        { id: 39, title: "39", completed: false },
        { id: 43, title: "43", completed: false },
      ]);

      const { added, removed, moved } = refreshSpy.mock.calls[0][0];

      expect(added).toHaveLength(0);
      expect(removed.map((r: any) => r.idx).sort()).toEqual(
        expect.arrayContaining([
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37,
          38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        ]),
      );
      expect(removed).toHaveLength(49);
      expect(moved).toEqual([{ from: 33, to: 0 }]);

      todos.as([
        { id: 3, title: "3", completed: false },
        { id: 13, title: "13", completed: false },
        { id: 23, title: "23", completed: false },
        { id: 30, title: "30", completed: false },
        { id: 31, title: "31", completed: false },
        { id: 32, title: "32", completed: false },
        { id: 33, title: "33", completed: false },
        { id: 34, title: "34", completed: false },
        { id: 35, title: "35", completed: false },
        { id: 36, title: "36", completed: false },
        { id: 37, title: "37", completed: false },
        { id: 38, title: "38", completed: false },
        { id: 39, title: "39", completed: false },
        { id: 43, title: "43", completed: false },
      ]);

      const {
        added: added2,
        removed: removed2,
        moved: moved2,
      } = refreshSpy.mock.calls[1][0];

      expect(added2).toHaveLength(2);
      expect(added2[0].idx).toBe(0);
      expect(added2[0].elements).toHaveLength(7);
      expect(added2[1].idx).toBe(8);
      expect(added2[1].elements).toHaveLength(6);
      expect(removed2).toHaveLength(0);
      expect(moved2).toHaveLength(0);
    });

    it("should detect pure reorder with no add/remove", () => {
      const { todos, refreshSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // reverse order
      todos.as([
        { id: 3, title: "C", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 1, title: "A", completed: false },
      ]);

      const { added, removed, moved } = refreshSpy.mock.calls[0][0];

      expect(added).toHaveLength(0);
      expect(removed).toHaveLength(0);

      // id:3: 2→0, id:1: 0→2, id:2 stays at 1
      expect(moved).toHaveLength(2);
      expect(moved).toContainEqual({ from: 2, to: 0 });
      expect(moved).toContainEqual({ from: 0, to: 2 });
    });
  });

  describe("move (onPatch)", () => {
    it("should update internal state and call $elm.move on todos.move()", () => {
      const { todos, forNode, moveSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // move index 2 → index 0: [A,B,C] → [C,A,B]
      todos.move(2, 0);

      expect(moveSpy).toHaveBeenCalledTimes(1);
      expect(moveSpy).toHaveBeenCalledWith(2, 0);

      // internal state should reflect new order
      expect(forNode.children.map((c: any) => c?.value?.id)).toEqual([3, 1, 2]);
    });

    it("should handle up() which delegates to move()", () => {
      const { todos, forNode, moveSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // up(2) → move(2, 1): [A,B,C] → [A,C,B]
      todos.up(2);

      expect(moveSpy).toHaveBeenCalledWith(2, 1);
      expect(forNode.children.map((c: any) => c?.value?.id)).toEqual([1, 3, 2]);
    });

    it("should handle down() which delegates to move()", () => {
      const { todos, forNode, moveSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // down(0) → move(0, 1): [A,B,C] → [B,A,C]
      todos.down(0);

      expect(moveSpy).toHaveBeenCalledWith(0, 1);
      expect(forNode.children.map((c: any) => c?.value?.id)).toEqual([2, 1, 3]);
      expect(todos.value).toStrictEqual([
        { id: 2, title: "B", completed: false },
        { id: 1, title: "A", completed: false },
        { id: 3, title: "C", completed: false },
      ]);
    });

    it("should handle down() which delegates to move() of plain text content", () => {
      const todos = refarr(["Apple", "Banana", "Cherry"]);
      const handleRefresh = vi.fn();
      const for$ = For(
        {
          each: todos,
          render(todo) {
            return View({}, [todo]);
          },
        },
        {
          onRefresh: handleRefresh,
        },
      );
      for$.onMounted({ target: null });
      todos.down(0);
      expect(handleRefresh).toHaveBeenCalledWith({
        added: [],
        removed: [],
        moved: [{ from: 0, to: 1 }],
      });
      expect(todos.value).toStrictEqual(["Banana", "Apple", "Cherry"]);
    });

    it("test diff with reverse", () => {
      const todos = refarr(["Apple", "Banana", "Cherry"]);
      const handleRefresh = vi.fn();
      const for$ = For(
        {
          each: todos,
          render(todo) {
            return View({}, [todo]);
          },
        },
        {
          onRefresh: handleRefresh,
        },
      );
      for$.onMounted({ target: null });
      todos.reverse();
      expect(handleRefresh).toHaveBeenCalledWith(
        expect.objectContaining({
          added: [],
          removed: [],
          moved: [
            { from: 2, to: 0 },
            { from: 0, to: 2 },
          ],
        }),
      );
      expect(todos.value).toStrictEqual(["Cherry", "Banana", "Apple"]);
    });

    it("test diff with reverse on larger list", () => {
      const todos = refarr(["A", "B", "C", "D", "E", "F"]);
      const handleRefresh = vi.fn();
      const for$ = For(
        {
          each: todos,
          render(todo) {
            return View({}, [todo]);
          },
        },
        {
          onRefresh: handleRefresh,
        },
      );
      for$.onMounted({ target: null });
      todos.reverse();
      // A(0)→5, B(1)→4, C(2)→3, D(3)→2, E(4)→1, F(5)→0
      // C(2)↔D(3) stay? No — C was at 2, now at 3; D was at 3, now at 2
      // All items change position except none
      expect(handleRefresh).toHaveBeenCalledWith(
        expect.objectContaining({
          added: [],
          removed: [],
          moved: [
            { from: 5, to: 0 }, // F: 5→0
            { from: 4, to: 1 }, // E: 4→1
            { from: 3, to: 2 }, // D: 3→2
            { from: 2, to: 3 }, // C: 2→3
            { from: 1, to: 4 }, // B: 1→4
            { from: 0, to: 5 }, // A: 0→5
          ],
        }),
      );
      expect(todos.value).toStrictEqual(["F", "E", "D", "C", "B", "A"]);
    });

    it("test diff with reverse on duplicated items", () => {
      const todos = refarr(["A", "B", "A", "C", "A"]);
      const handleRefresh = vi.fn();
      const for$ = For(
        {
          each: todos,
          render(todo) {
            return View({}, [todo]);
          },
        },
        {
          onRefresh: handleRefresh,
        },
      );
      for$.onMounted({ target: null });
      // ["A", "B", "A", "C", "A"] → ["A", "C", "A", "B", "A"]
      // old_map FIFO: "A"→[0,2,4], "B"→[1], "C"→[3]
      // new[0]="A" ← old 0, same pos → no move
      // new[1]="C" ← old 3, 3≠1    → moved {from:3,to:1}
      // new[2]="A" ← old 2, same pos → no move
      // new[3]="B" ← old 1, 1≠3    → moved {from:1,to:3}
      // new[4]="A" ← old 4, same pos → no move
      // Duplicated "A"s pair by FIFO and stay in place; only B↔C swap
      todos.reverse();
      expect(handleRefresh).toHaveBeenCalledWith(
        expect.objectContaining({
          added: [],
          removed: [],
          moved: [
            { from: 3, to: 1 }, // C: 3→1
            { from: 1, to: 3 }, // B: 1→3
          ],
        }),
      );
      expect(todos.value).toStrictEqual(["A", "C", "A", "B", "A"]);
    });
  });

  describe("swap (onPatch)", () => {
    it("should update internal state and call $elm.swap on todos.swap()", () => {
      const { todos, forNode, swapSpy } = setup([
        { id: 1, title: "A", completed: false },
        { id: 2, title: "B", completed: false },
        { id: 3, title: "C", completed: false },
      ]);

      // swap(0, 2): [A,B,C] → [C,B,A]
      todos.swap(0, 2);

      expect(swapSpy).toHaveBeenCalledTimes(1);
      expect(swapSpy).toHaveBeenCalledWith(0, 2);

      expect(forNode.children.map((c: any) => c?.value?.id)).toEqual([3, 2, 1]);
    });
  });
});
