import { describe, it, expect, vi, beforeEach } from "vitest";

import { AccordionCore } from "@/accordion";

describe("AccordionCore", () => {
  describe("构造函数", () => {
    it("默认类型为 single", () => {
      const accordion = AccordionCore();
      expect(accordion.type).toBe("single");
    });

    it("可以设置类型为 multiple", () => {
      const accordion = AccordionCore({ type: "multiple" });
      expect(accordion.type).toBe("multiple");
    });

    it("默认 openItems 为空数组", () => {
      const accordion = AccordionCore();
      expect(accordion.openItems.value).toEqual([]);
    });

    it("可以设置默认打开的项", () => {
      const accordion = AccordionCore({ defaultOpenItems: [0, 1] });
      expect(accordion.openItems.value).toEqual([0, 1]);
    });
  });

  describe("single 模式", () => {
    let accordion: ReturnType<typeof AccordionCore>;

    beforeEach(() => {
      accordion = AccordionCore({ type: "single" });
    });

    it("toggle 应打开指定项", () => {
      accordion.toggle(0);
      expect(accordion.openItems.value).toEqual([0]);
    });

    it("toggle 应关闭已打开的项", () => {
      accordion.toggle(0);
      accordion.toggle(0);
      expect(accordion.openItems.value).toEqual([]);
    });

    it("toggle 应切换到新项", () => {
      accordion.toggle(0);
      accordion.toggle(1);
      expect(accordion.openItems.value).toEqual([1]);
    });

    it("open 应打开指定项", () => {
      accordion.open(0);
      expect(accordion.openItems.value).toEqual([0]);
    });

    it("open 应切换到新项", () => {
      accordion.open(0);
      accordion.open(1);
      expect(accordion.openItems.value).toEqual([1]);
    });

    it("close 应关闭指定项", () => {
      accordion.open(0);
      accordion.close(0);
      expect(accordion.openItems.value).toEqual([]);
    });

    it("isOpen 应返回正确的状态", () => {
      expect(accordion.isOpen(0)).toBe(false);
      accordion.open(0);
      expect(accordion.isOpen(0)).toBe(true);
    });

    it("toggle 应触发 OpenItemsChange 事件", () => {
      const handler = vi.fn();
      accordion.onOpenItemsChange(handler);
      accordion.toggle(0);
      expect(handler).toHaveBeenCalledWith([0]);
    });

    it("toggle 应触发 StateChange 事件", () => {
      const handler = vi.fn();
      accordion.onStateChange(handler);
      accordion.toggle(0);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("multiple 模式", () => {
    let accordion: ReturnType<typeof AccordionCore>;

    beforeEach(() => {
      accordion = AccordionCore({ type: "multiple" });
    });

    it("toggle 应打开指定项", () => {
      accordion.toggle(0);
      expect(accordion.openItems.value).toEqual([0]);
    });

    it("toggle 应关闭已打开的项", () => {
      accordion.toggle(0);
      accordion.toggle(0);
      expect(accordion.openItems.value).toEqual([]);
    });

    it("toggle 应支持同时打开多项", () => {
      accordion.toggle(0);
      accordion.toggle(1);
      expect(accordion.openItems.value).toEqual([0, 1]);
    });

    it("open 应打开指定项", () => {
      accordion.open(0);
      expect(accordion.openItems.value).toEqual([0]);
    });

    it("open 应支持同时打开多项", () => {
      accordion.open(0);
      accordion.open(1);
      expect(accordion.openItems.value).toEqual([0, 1]);
    });

    it("open 不应重复添加已打开的项", () => {
      accordion.open(0);
      accordion.open(0);
      expect(accordion.openItems.value).toEqual([0]);
    });

    it("close 应关闭指定项", () => {
      accordion.open(0);
      accordion.open(1);
      accordion.close(0);
      expect(accordion.openItems.value).toEqual([1]);
    });

    it("isOpen 应返回正确的状态", () => {
      expect(accordion.isOpen(0)).toBe(false);
      accordion.open(0);
      expect(accordion.isOpen(0)).toBe(true);
    });
  });

  describe("事件监听", () => {
    it("onOpenItemsChange 应返回取消监听函数", () => {
      const accordion = AccordionCore();
      const handler = vi.fn();
      const unlisten = accordion.onOpenItemsChange(handler);
      accordion.toggle(0);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      accordion.toggle(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const accordion = AccordionCore();
      const handler = vi.fn();
      const unlisten = accordion.onStateChange(handler);
      accordion.toggle(0);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      accordion.toggle(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
