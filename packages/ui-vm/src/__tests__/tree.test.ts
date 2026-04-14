import { describe, it, expect, vi, beforeEach } from "vitest";

import { TreeCore } from "@/tree";

describe("TreeCore", () => {
  describe("构造函数", () => {
    it("应正确初始化", () => {
      const tree = new TreeCore();
      expect(tree).toBeDefined();
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const tree = new TreeCore();
      const handler = vi.fn();
      const unlisten = tree.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
