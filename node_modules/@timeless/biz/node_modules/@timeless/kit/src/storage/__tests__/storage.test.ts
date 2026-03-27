import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { StorageCore } from "../index";

describe("StorageCore", () => {
  const mockClient = {
    setItem: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  type TestStorage = {
    theme: string;
    language: string;
    settings: { notifications: boolean; sound?: boolean };
    items: number[];
  };

  const defaultValues: TestStorage = {
    theme: "light",
    language: "zh-CN",
    settings: { notifications: true },
    items: [],
  };

  describe("构造函数", () => {
    it("初始状态应合并 defaultValues 和 values", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: {
          theme: "dark",
          language: "zh-CN",
          settings: { notifications: true },
          items: [],
        },
        defaultValues,
        client: mockClient,
      });
      expect(storage.values.theme).toBe("dark");
      expect(storage.values.language).toBe("zh-CN");
    });

    it("应设置 key 和 client", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      expect(storage.key).toBe("test-key");
      expect(storage.client).toBe(mockClient);
    });
  });

  describe("state getter", () => {
    it("应返回当前 values", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, theme: "dark" },
        defaultValues,
        client: mockClient,
      });
      expect(storage.state.values.theme).toBe("dark");
    });
  });

  describe("get 方法", () => {
    it("应返回指定 key 的值", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, theme: "dark" },
        defaultValues,
        client: mockClient,
      });
      expect(storage.get("theme")).toBe("dark");
    });

    it("key 不存在时应抛出错误", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      expect(() => storage.get("nonexistent" as any)).toThrow();
    });
  });

  describe("set 方法", () => {
    it("应更新 values", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      storage.set("theme", "dark");
      vi.advanceTimersByTime(150);
      expect(storage.values.theme).toBe("dark");
    });

    it("应调用 client.setItem", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      storage.set("theme", "dark");
      vi.advanceTimersByTime(150);
      expect(mockClient.setItem).toHaveBeenCalledWith(
        "test-key",
        expect.any(String),
      );
    });

    it("应触发 StateChange 事件", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      const handler = vi.fn();
      storage.onStateChange(handler);
      storage.set("theme", "dark");
      vi.advanceTimersByTime(150);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("merge 方法", () => {
    it("应合并对象", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      const result = storage.merge("settings", { sound: false });
      expect(result).toEqual({ notifications: true, sound: false });
    });

    it("应合并数组", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, items: [1, 2] },
        defaultValues,
        client: mockClient,
      });
      const result = storage.merge("items", [3, 4]);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("应支持 reverse 选项", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, items: [1, 2] },
        defaultValues,
        client: mockClient,
      });
      const result = storage.merge("items", [3, 4], { reverse: true });
      expect(result).toEqual([3, 4, 1, 2]);
    });

    it("应支持 limit 选项", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, items: [1, 2] },
        defaultValues,
        client: mockClient,
      });
      const result = storage.merge("items", [3, 4, 5], { limit: 3 });
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("clear 方法", () => {
    it("应重置为默认值", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, theme: "dark" },
        defaultValues,
        client: mockClient,
      });
      storage.clear("theme");
      expect(storage.values.theme).toBe("light");
    });

    it("应调用 client.setItem", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, theme: "dark" },
        defaultValues,
        client: mockClient,
      });
      storage.clear("theme");
      expect(mockClient.setItem).toHaveBeenCalled();
    });
  });

  describe("remove 方法", () => {
    it("应调用 clear", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: { ...defaultValues, theme: "dark" },
        defaultValues,
        client: mockClient,
      });
      storage.remove("theme");
      expect(storage.values.theme).toBe("light");
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应返回取消监听函数", () => {
      const storage = new StorageCore<TestStorage>({
        key: "test-key",
        values: defaultValues,
        defaultValues,
        client: mockClient,
      });
      const handler = vi.fn();
      const unlisten = storage.onStateChange(handler);
      storage.set("theme", "dark");
      vi.advanceTimersByTime(150);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      storage.set("theme", "light");
      vi.advanceTimersByTime(150);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
