import { describe, it, expect, vi, beforeEach } from "vitest";

import { ButtonCore, ButtonInListCore } from "@/button";

describe("ButtonCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const btn = new ButtonCore();
      expect(btn.state.text).toBe("Click it");
      expect(btn.state.loading).toBe(false);
      expect(btn.state.disabled).toBe(false);
      expect(btn.state.variant).toBe("default");
      expect(btn.state.size).toBe("default");
    });

    it("可以设置 disabled", () => {
      const btn = new ButtonCore({ disabled: true });
      expect(btn.state.disabled).toBe(true);
    });

    it("可以设置 loading", () => {
      const btn = new ButtonCore({ loading: true });
      expect(btn.state.loading).toBe(true);
    });

    it("可以设置 variant", () => {
      const btn = new ButtonCore({ variant: "primary" });
      expect(btn.state.variant).toBe("primary");
    });

    it("可以设置 size", () => {
      const btn = new ButtonCore({ size: "large" });
      expect(btn.state.size).toBe("large");
    });
  });

  describe("click", () => {
    it("正常状态下可以点击", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onClick(handler);
      btn.click();
      expect(handler).toHaveBeenCalled();
    });

    it("disabled 状态下不能点击", () => {
      const btn = new ButtonCore({ disabled: true });
      const handler = vi.fn();
      btn.onClick(handler);
      btn.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it("loading 状态下不能点击", () => {
      const btn = new ButtonCore({ loading: true });
      const handler = vi.fn();
      btn.onClick(handler);
      btn.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("disable / enable", () => {
    it("disable 应设置 disabled 为 true", () => {
      const btn = new ButtonCore();
      btn.disable();
      expect(btn.state.disabled).toBe(true);
    });

    it("enable 应设置 disabled 为 false", () => {
      const btn = new ButtonCore({ disabled: true });
      btn.enable();
      expect(btn.state.disabled).toBe(false);
    });

    it("disable 应触发 StateChange 事件", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onStateChange(handler);
      btn.disable();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("setLoading", () => {
    it("应设置 loading 状态", () => {
      const btn = new ButtonCore();
      btn.setLoading(true);
      expect(btn.state.loading).toBe(true);
    });

    it("相同值不应触发事件", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onStateChange(handler);
      btn.setLoading(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("setVariant", () => {
    it("应设置 variant", () => {
      const btn = new ButtonCore();
      btn.setVariant("primary");
      expect(btn.state.variant).toBe("primary");
    });

    it("相同值不应触发事件", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onStateChange(handler);
      btn.setVariant("default");
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("setSize", () => {
    it("应设置 size", () => {
      const btn = new ButtonCore();
      btn.setSize("large");
      expect(btn.state.size).toBe("large");
    });

    it("相同值不应触发事件", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onStateChange(handler);
      btn.setSize("default");
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("bind", () => {
    it("应绑定数据到按钮", () => {
      const btn = new ButtonCore();
      const data = { id: 1 };
      btn.bind(data);
      expect(btn.cur.value).toBe(data);
    });
  });

  describe("事件监听", () => {
    it("onClick 应注册点击事件监听", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onClick(handler);
      btn.click();
      expect(handler).toHaveBeenCalled();
    });

    it("onStateChange 应注册状态变化监听", () => {
      const btn = new ButtonCore();
      const handler = vi.fn();
      btn.onStateChange(handler);
      btn.disable();
      expect(handler).toHaveBeenCalled();
    });
  });
});

describe("ButtonInListCore", () => {
  describe("bind", () => {
    it("应创建并返回按钮实例", () => {
      const listBtn = new ButtonInListCore();
      const data = { id: 1 };
      const btn = listBtn.bind(data);
      expect(btn).toBeInstanceOf(ButtonCore);
      expect(btn?.cur.value).toBe(data);
    });

    it("相同数据应返回相同的按钮实例", () => {
      const listBtn = new ButtonInListCore();
      const data = { id: 1 };
      const btn1 = listBtn.bind(data);
      const btn2 = listBtn.bind(data);
      expect(btn1).toBe(btn2);
    });
  });

  describe("setLoading", () => {
    it("当 cur 为 null 时应设置所有按钮的 loading", () => {
      const listBtn = new ButtonInListCore();
      listBtn.bind({ id: 1 });
      listBtn.bind({ id: 2 });
      listBtn.setLoading(true);
      for (const btn of listBtn.btns) {
        expect(btn.state.loading).toBe(true);
      }
    });

    it("当 cur 不为 null 时应只设置当前按钮的 loading", () => {
      const listBtn = new ButtonInListCore();
      const btn1 = listBtn.bind({ id: 1 });
      const btn2 = listBtn.bind({ id: 2 });
      listBtn.cur = btn1!;
      listBtn.setLoading(true);
      expect(btn1?.state.loading).toBe(true);
      expect(btn2?.state.loading).toBe(false);
    });
  });

  describe("click", () => {
    it("当 cur 为 null 时不应触发事件", () => {
      const listBtn = new ButtonInListCore();
      const handler = vi.fn();
      listBtn.onClick(handler);
      listBtn.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it("当 cur 不为 null 时应触发当前按钮的点击", () => {
      const listBtn = new ButtonInListCore();
      const handler = vi.fn();
      listBtn.onClick(handler);
      const btn = listBtn.bind({ id: 1 });
      listBtn.cur = btn!;
      listBtn.click();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("应清空当前按钮", () => {
      const listBtn = new ButtonInListCore();
      const btn = listBtn.bind({ id: 1 });
      listBtn.cur = btn!;
      listBtn.clear();
      expect(listBtn.cur).toBe(null);
    });
  });
});
