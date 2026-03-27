import { describe, it, expect, vi, beforeEach } from "vitest";

import { TabsCore } from "@/tabs";
import { PresenceCore } from "@/presence";

describe("TabsCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const tabs = new TabsCore();
      expect(tabs.state.curValue).toBe(null);
      expect(tabs.state.orientation).toBe("horizontal");
      expect(tabs.state.dir).toBe("ltr");
    });

    it("应创建 RovingFocusCore 实例", () => {
      const tabs = new TabsCore();
      expect(tabs.roving).toBeDefined();
    });
  });

  describe("appendContent", () => {
    it("应添加内容", () => {
      const tabs = new TabsCore();
      const content = {
        id: 1,
        value: "tab1",
        presence: new PresenceCore(),
      };
      tabs.appendContent(content);
      expect(tabs.contents).toContain(content);
    });

    it("不应重复添加相同内容", () => {
      const tabs = new TabsCore();
      const content = {
        id: 1,
        value: "tab1",
        presence: new PresenceCore(),
      };
      tabs.appendContent(content);
      tabs.appendContent(content);
      expect(tabs.contents.length).toBe(1);
    });
  });

  describe("selectTab", () => {
    it("应选中指定的标签", () => {
      const tabs = new TabsCore();
      const content1 = {
        id: 1,
        value: "tab1",
        presence: new PresenceCore(),
      };
      const content2 = {
        id: 2,
        value: "tab2",
        presence: new PresenceCore(),
      };
      tabs.appendContent(content1);
      tabs.appendContent(content2);

      const handler = vi.fn();
      tabs.onValueChange(handler);

      tabs.selectTab("tab1");
      expect(handler).toHaveBeenCalledWith("tab1");
    });

    it("选中新标签应隐藏之前的标签", () => {
      const tabs = new TabsCore();
      const content1 = {
        id: 1,
        value: "tab1",
        presence: new PresenceCore(),
      };
      const content2 = {
        id: 2,
        value: "tab2",
        presence: new PresenceCore(),
      };
      tabs.appendContent(content1);
      tabs.appendContent(content2);

      tabs.selectTab("tab1");
      tabs.selectTab("tab2");

      expect(content1.presence.visible).toBe(false);
      expect(content2.presence.visible).toBe(true);
    });

    it("选中不存在的标签不应触发事件", () => {
      const tabs = new TabsCore();
      const handler = vi.fn();
      tabs.onValueChange(handler);

      tabs.selectTab("nonexistent");
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("事件监听", () => {
    it("onValueChange 应注册监听器", () => {
      const tabs = new TabsCore();
      const content = {
        id: 1,
        value: "tab1",
        presence: new PresenceCore(),
      };
      tabs.appendContent(content);

      const handler = vi.fn();
      tabs.onValueChange(handler);
      tabs.selectTab("tab1");
      expect(handler).toHaveBeenCalledWith("tab1");
    });

    it("onStateChange 应注册监听器", () => {
      const tabs = new TabsCore();
      const handler = vi.fn();
      tabs.onStateChange(handler);
      // StateChange 需要手动触发
    });
  });
});
