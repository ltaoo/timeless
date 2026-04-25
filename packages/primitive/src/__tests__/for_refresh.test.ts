import { describe, it, expect, vi } from "vitest";
import { refarr } from "@timeless/reactive";

import { View } from "@/content/view";

import { For } from "../reactive/for";

type User = {
  id: number;
  name: string;
};

function setup(initial: User[]) {
  const users = refarr<User>(initial, { key: "id" });

  const forNode = For<User>({
    key: "id",
    each: users,
    render: (item, _idx) => {
      return { t: "view", $elm: null, value: item, render: () => null } as any;
    },
  });

  forNode.onMounted({ target: null });

  const refreshSpy = vi.fn();
  const moveSpy = vi.fn();
  const swapSpy = vi.fn();
  forNode.$elm = { refresh: refreshSpy, move: moveSpy, swap: swapSpy };

  return { users, forNode, refreshSpy, moveSpy, swapSpy };
}

describe("For refresh", () => {
  it("should detect item changes and preserve order", () => {
    const { users, refreshSpy } = setup([
      // 0
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
      // 2
      { id: 3, name: "User 3" },
      { id: 4, name: "User 4" },
      { id: 5, name: "User 5" },
      { id: 6, name: "User 6" },
      { id: 7, name: "User 7" },
      { id: 8, name: "User 8" },
      { id: 9, name: "User 9" },
      { id: 10, name: "User 10" },
      { id: 11, name: "User 11" },
      { id: 12, name: "User 12" },
      // 12
      { id: 13, name: "User 13" },
      { id: 14, name: "User 14" },
      { id: 15, name: "User 15" },
      { id: 16, name: "User 16" },
      { id: 17, name: "User 17" },
      { id: 18, name: "User 18" },
      { id: 19, name: "User 19" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      // 29
      { id: 30, name: "User 30" },
      { id: 31, name: "User 31" },
      { id: 32, name: "User 32" },
      // 32
      { id: 33, name: "User 33" },
      { id: 34, name: "User 34" },
      { id: 35, name: "User 35" },
      { id: 36, name: "User 36" },
      { id: 37, name: "User 37" },
      { id: 38, name: "User 38" },
      { id: 39, name: "User 39" },
      { id: 40, name: "User 40" },
      { id: 41, name: "User 41" },
      { id: 42, name: "User 42" },
      // 42
      { id: 43, name: "User 43" },
      { id: 44, name: "User 44" },
      { id: 45, name: "User 45" },
      { id: 46, name: "User 46" },
      { id: 47, name: "User 47" },
      { id: 48, name: "User 48" },
      { id: 49, name: "User 49" },
      { id: 50, name: "User 50" },
    ]);

    users.as([
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);

    const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];

    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(6);
    expect(moved).toHaveLength(0);
    expect(children).toHaveLength(14);
    expect(removed).toStrictEqual([
      { idx: 0, count: 1 },
      { idx: 2, count: 9 },
      { idx: 12, count: 7 },
      { idx: 29, count: 2 },
      { idx: 32, count: 9 },
      { idx: 42, count: 8 },
    ]);
  });

  it("should detect item changes and preserve order2", () => {
    const { users, refreshSpy } = setup([
      // 0
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      // 6
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);

    users.as([{ id: 23, name: "User 23" }]);

    const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];

    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(2);
    expect(moved).toHaveLength(0);
    expect(children).toHaveLength(1);
    expect(removed).toStrictEqual([
      { idx: 0, count: 5 },
      { idx: 6, count: 8 },
    ]);
  });

  it("23 to 2", () => {
    const { users, refreshSpy } = setup([{ id: 23, name: "User 23" }]);
    users.as([
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    const { added, removed, moved, children } = refreshSpy.mock.calls[0][0];
    expect(added).toHaveLength(2);
    expect(removed).toHaveLength(0);
    expect(moved).toHaveLength(0);
    expect(children).toHaveLength(14);
    expect(added[0].idx).toBe(0);
    expect(added[1].idx).toBe(6);
    expect(added[0].elements.map((v: any) => v.value)).toStrictEqual([
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
    ]);
    expect(added[1].elements.map((v: any) => v.value)).toStrictEqual([
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);
  });

  it("series", () => {
    const { users, refreshSpy } = setup([
      // 0
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
      // 2
      { id: 3, name: "User 3" },
      { id: 4, name: "User 4" },
      { id: 5, name: "User 5" },
      { id: 6, name: "User 6" },
      { id: 7, name: "User 7" },
      { id: 8, name: "User 8" },
      { id: 9, name: "User 9" },
      { id: 10, name: "User 10" },
      { id: 11, name: "User 11" },
      { id: 12, name: "User 12" },
      // 12
      { id: 13, name: "User 13" },
      { id: 14, name: "User 14" },
      { id: 15, name: "User 15" },
      { id: 16, name: "User 16" },
      { id: 17, name: "User 17" },
      { id: 18, name: "User 18" },
      { id: 19, name: "User 19" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      // 29
      { id: 30, name: "User 30" },
      { id: 31, name: "User 31" },
      { id: 32, name: "User 32" },
      // 32
      { id: 33, name: "User 33" },
      { id: 34, name: "User 34" },
      { id: 35, name: "User 35" },
      { id: 36, name: "User 36" },
      { id: 37, name: "User 37" },
      { id: 38, name: "User 38" },
      { id: 39, name: "User 39" },
      { id: 40, name: "User 40" },
      { id: 41, name: "User 41" },
      { id: 42, name: "User 42" },
      // 42
      { id: 43, name: "User 43" },
      { id: 44, name: "User 44" },
      { id: 45, name: "User 45" },
      { id: 46, name: "User 46" },
      { id: 47, name: "User 47" },
      { id: 48, name: "User 48" },
      { id: 49, name: "User 49" },
      { id: 50, name: "User 50" },
    ]);
    // input 2 -> filter by 2
    users.as([
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);

    // continue input 3 -> filter by 23
    users.as([{ id: 23, name: "User 23" }]);

    // delete 3 -> filter by 2
    users.as([
      // 0
      { id: 2, name: "User 2" },
      { id: 12, name: "User 12" },
      { id: 20, name: "User 20" },
      { id: 21, name: "User 21" },
      { id: 22, name: "User 22" },
      { id: 23, name: "User 23" },
      { id: 24, name: "User 24" },
      // 7
      { id: 25, name: "User 25" },
      { id: 26, name: "User 26" },
      { id: 27, name: "User 27" },
      { id: 28, name: "User 28" },
      { id: 29, name: "User 29" },
      { id: 32, name: "User 32" },
      { id: 42, name: "User 42" },
    ]);

    // input 4 -> filter by 24
    users.as([{ id: 24, name: "User 24" }]);

    const { added, removed, moved, children } = refreshSpy.mock.calls[3][0];

    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(2);
    expect(moved).toHaveLength(0);
    expect(children).toHaveLength(1);
    expect(removed).toStrictEqual([
      { idx: 0, count: 6 },
      { idx: 7, count: 7 },
    ]);
  });
});
