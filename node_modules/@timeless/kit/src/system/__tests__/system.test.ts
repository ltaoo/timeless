import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { CurSystem } from "../index";

describe("CurSystem", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    Object.defineProperty(global, "navigator", {
      value: {
        userAgent: "Mozilla/5.0",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe("构造函数", () => {
    it("初始状态 connection 应为 unknown", () => {
      const system = new CurSystem();
      expect(system.connection).toBe("unknown");
    });
  });

  describe("query_network", () => {
    it("没有 connection 信息时应返回 unknown", () => {
      const system = new CurSystem();
      const result = system.query_network();
      expect(result).toBe("unknown");
    });

    it("应从 UA 中提取 NetType", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          userAgent: "Mozilla/5.0 NetType/WIFI",
        },
        writable: true,
        configurable: true,
      });
      const system = new CurSystem();
      const result = system.query_network();
      expect(result).toBe("WIFI");
    });
  });
});
