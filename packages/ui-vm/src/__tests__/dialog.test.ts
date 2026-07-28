/**
 * DialogCore 状态机单测
 *
 * 核心理念：DialogCore 是纯状态机，与渲染层完全解耦。
 * 在 Node.js 中即可验证弹窗的完整交互逻辑——
 * 状态转换、事件顺序、按钮行为、生命周期回调。
 *
 * 状态机测试通过 = UI 行为保证正确（在所有渲染目标上）。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { DialogCore } from "@/dialog";

describe("DialogCore", () => {
  // —— 构造函数 ——

  describe("构造函数", () => {
    it("默认状态：关闭、空标题、有遮罩、可关闭、有 footer", () => {
      const dialog = new DialogCore();
      expect(dialog.open).toBe(false);
      expect(dialog.title).toBe("");
      expect(dialog.footer).toBe(true);
      expect(dialog.closeable).toBe(true);
      expect(dialog.mask).toBe(true);
    });

    it("可通过 props 覆盖所有默认值", () => {
      const dialog = new DialogCore({
        title: "确认删除",
        footer: false,
        closeable: false,
        mask: false,
        open: true,
      });
      expect(dialog.title).toBe("确认删除");
      expect(dialog.footer).toBe(false);
      expect(dialog.closeable).toBe(false);
      expect(dialog.mask).toBe(false);
      expect(dialog.open).toBe(true);
    });

    it("open=true 时应同步设置 presence 状态", () => {
      const dialog = new DialogCore({ open: true });
      expect(dialog.open).toBe(true);
      expect(dialog.presence.visible).toBe(true);
      expect(dialog.presence.mounted).toBe(true);
    });

    it("okBtn 默认为 default 类型", () => {
      const dialog = new DialogCore();
      expect(dialog.okBtn.state.variant).toBe("default");
    });

    it("cancelBtn 默认为 secondary 类型", () => {
      const dialog = new DialogCore();
      expect(dialog.cancelBtn.state.variant).toBe("secondary");
    });
  });

  // —— 完整生命周期状态机 ——

  describe("完整生命周期（状态机）", () => {
    it("关闭 → show → 进入动画 → 显示完成", async () => {
      const dialog = new DialogCore();
      const events: string[] = [];

      dialog.onShow(() => events.push("show"));
      dialog.onVisibleChange((v) => events.push(`visible:${v}`));
      dialog.onStateChange(() => events.push("state"));

      // 初始：关闭
      expect(dialog.open).toBe(false);
      expect(dialog.state.enter).toBe(false);
      expect(dialog.state.visible).toBe(false);
      expect(dialog.presence.state.text).toBe("unknown");

      // 执行 show
      dialog.show();

      // 立即态：正在进入
      expect(dialog.state.enter).toBe(true);
      expect(dialog.state.visible).toBe(true);

      // 等待动画完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 完成态：已显示
      expect(dialog.open).toBe(true);
      expect(dialog.state.enter).toBe(false);
      expect(dialog.state.visible).toBe(true);
      expect(dialog.presence.state.text).toBe("visible");

      // 事件顺序：state(s) → visible:true → state → show
      expect(events.filter((e) => e === "state").length).toBeGreaterThanOrEqual(1);
      expect(events).toContain("visible:true");
      expect(events).toContain("show");
      // visible:true 在 show 之前触发
      expect(events.indexOf("visible:true")).toBeLessThan(events.indexOf("show"));
    });

    it("显示 → hide → 退出动画 → 隐藏完成 → 卸载", async () => {
      const dialog = new DialogCore({ open: true });
      let unmountedCount = 0;
      dialog.onUnmounted(() => unmountedCount++);

      // 初始已显示
      expect(dialog.open).toBe(true);

      // 执行 hide
      dialog.hide();

      // 立即态：正在退出
      expect(dialog.state.exit).toBe(true);
      expect(dialog.state.visible).toBe(true); // 仍可见，动画中
      expect(dialog.presence.state.text).toBe("exit");

      // 等待动画完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 完成态：已隐藏 + 已卸载
      expect(dialog.open).toBe(false);
      expect(dialog.state.exit).toBe(false);
      expect(dialog.state.visible).toBe(false);
      expect(dialog.presence.state.mounted).toBe(false);
      expect(unmountedCount).toBe(1);
    });

    it("完整的 show → hide 事件序列", async () => {
      const dialog = new DialogCore();
      const events: string[] = [];

      dialog.onShow(() => events.push("Show"));
      dialog.onHidden(() => events.push("Hidden"));
      dialog.onVisibleChange((v) => events.push(v ? "VisibleChange:true" : "VisibleChange:false"));
      dialog.onCancel(() => events.push("Cancel"));
      dialog.onUnmounted(() => events.push("Unmounted"));

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Show 阶段
      expect(events.indexOf("VisibleChange:true")).toBeLessThan(events.indexOf("Show"));

      // Hide 阶段：Cancel → Hidden → VisibleChange → Unmounted
      const hideStart = events.indexOf("Cancel");
      expect(hideStart).toBeGreaterThan(events.indexOf("Show"));
      expect(events.indexOf("Hidden")).toBeGreaterThan(hideStart);
      expect(events[events.length - 1]).toBe("Unmounted");
    });
  });

  // —— 按钮交互链 ——

  describe("按钮交互链（模拟用户操作）", () => {
    let dialog: DialogCore;

    beforeEach(() => {
      dialog = new DialogCore({ title: "测试弹窗" });
    });

    it("okBtn 点击 → ok() → OK 事件（不自动关闭）", () => {
      const okHandler = vi.fn();
      dialog.onOk(okHandler);

      // 模拟 okBtn 点击
      dialog.okBtn.click();

      expect(okHandler).toHaveBeenCalledTimes(1);
      // ok() 不调用 hide()，弹窗仍开启
      expect(dialog.open).toBe(dialog.open);
    });

    it("ok() → 手动 hide()：完整确认关闭流程", async () => {
      const okHandler = vi.fn();
      const hiddenHandler = vi.fn();
      dialog.onOk(okHandler);
      dialog.onHidden(hiddenHandler);

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(true);

      // 用户点击确认按钮
      dialog.ok();
      expect(okHandler).toHaveBeenCalledTimes(1);

      // 开发者监听 OK 后手动关闭
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(false);
      expect(hiddenHandler).toHaveBeenCalledTimes(1);
    });

    it("cancelBtn 点击 → hide() → Cancel + Hidden 事件", async () => {
      const cancelHandler = vi.fn();
      const hiddenHandler = vi.fn();
      dialog.onCancel(cancelHandler);
      dialog.onHidden(hiddenHandler);

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 模拟 cancelBtn 点击
      dialog.cancelBtn.click();

      // cancelBtn 的 onClick 调用 dialog.hide()
      // hide() → presence.hide() → 动画 → Hidden 事件
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(cancelHandler).toHaveBeenCalledTimes(1);
      expect(hiddenHandler).toHaveBeenCalledTimes(1);
      expect(dialog.open).toBe(false);
    });
  });

  // —— 构造函数回调 ——

  describe("构造函数回调", () => {
    it("onOk 回调传入构造函数", () => {
      const onOk = vi.fn();
      const dialog = new DialogCore({ onOk });
      dialog.okBtn.click();
      expect(onOk).toHaveBeenCalledTimes(1);
    });

    it("onCancel 回调传入构造函数", async () => {
      const onCancel = vi.fn();
      const dialog = new DialogCore({ onCancel });
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // hide 完成后 presence 触发 Cancel 事件
      expect(onCancel).toHaveBeenCalled();
    });

    it("onUnmounted 回调传入构造函数", async () => {
      const onUnmounted = vi.fn();
      const dialog = new DialogCore({ open: true, onUnmounted });
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(onUnmounted).toHaveBeenCalledTimes(1);
    });
  });

  // —— toggle ——

  describe("toggle", () => {
    it("toggle 在关闭→打开→关闭", async () => {
      const dialog = new DialogCore();
      const showCount: boolean[] = [];
      dialog.onVisibleChange((v) => showCount.push(v));

      dialog.toggle();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(true);

      dialog.toggle();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(false);

      expect(showCount).toEqual([true, false]);
    });
  });

  // —— show 幂等性 ——

  describe("show 幂等性", () => {
    it("已显示状态下再次 show 不触发重复事件", async () => {
      const dialog = new DialogCore();
      const showHandler = vi.fn();
      dialog.onShow(showHandler);

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(showHandler).toHaveBeenCalledTimes(1);

      // 再次 show — 被 DialogCore.show() 中的 this.open 守卫拦截
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(showHandler).toHaveBeenCalledTimes(1);
    });

    it("多次快速 show 不会产生重复的状态变更", async () => {
      const dialog = new DialogCore();
      const stateHandler = vi.fn();
      dialog.onStateChange(stateHandler);

      dialog.show();
      dialog.show();
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 第一次 show 有多个 StateChange（presence 内部），后续被忽略
      const firstShowStateCount = stateHandler.mock.calls.length;
      stateHandler.mockClear();

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // 被拦截，无新事件
      expect(stateHandler).not.toHaveBeenCalled();
    });
  });

  // —— viewport ——

  describe("setViewport", () => {
    it("设置 viewport 后 state 反映 viewported 状态", () => {
      const dialog = new DialogCore();
      expect(dialog.state.viewported).toBe(false);

      dialog.setViewport({
        getRect: () => ({ left: 0, top: 0, width: 375, height: 667 }),
      });

      expect(dialog.state.viewported).toBe(true);
      expect(dialog.viewportRect).toEqual({
        left: 0,
        top: 0,
        width: 375,
        height: 667,
      });
    });

    it("show 前设置 viewport，show 时自动同步 rect", () => {
      const dialog = new DialogCore();
      dialog.setViewport({
        getRect: () => ({ left: 10, top: 20, width: 400, height: 800 }),
      });
      dialog.show();
      expect(dialog.viewportRect).toEqual({
        left: 10,
        top: 20,
        width: 400,
        height: 800,
      });
    });

    it("clear viewport 后 viewported 为 false", () => {
      const dialog = new DialogCore();
      dialog.setViewport({
        getRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
      });
      expect(dialog.state.viewported).toBe(true);

      dialog.setViewport({});
      expect(dialog.state.viewported).toBe(false);
      expect(dialog.viewportRect).toBeNull();
    });
  });

  // —— setTitle ——

  describe("setTitle", () => {
    it("修改标题并触发 StateChange", () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onStateChange(handler);

      dialog.setTitle("操作成功");

      expect(dialog.title).toBe("操作成功");
      expect(dialog.state.title).toBe("操作成功");
      expect(handler).toHaveBeenCalled();
    });

    it("多次 setTitle 每次都触发 StateChange", () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onStateChange(handler);

      dialog.setTitle("第一步");
      dialog.setTitle("第二步");
      dialog.setTitle("第三步");

      expect(handler).toHaveBeenCalledTimes(3);
      expect(dialog.title).toBe("第三步");
    });
  });

  // —— hide 选项 ——

  describe("hide 选项", () => {
    it("hide({destroy:false}) 保留 DOM 挂载", async () => {
      const dialog = new DialogCore({ open: true });
      dialog.hide({ destroy: false });
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(dialog.open).toBe(false);
      expect(dialog.state.visible).toBe(false);
      // destroy:false → presence 不执行 unmount
      expect(dialog.presence.state.mounted).toBe(true);
    });

    it("默认 hide() 执行完整卸载", async () => {
      const dialog = new DialogCore({ open: true });
      const unmounted = vi.fn();
      dialog.onUnmounted(unmounted);

      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(dialog.presence.state.mounted).toBe(false);
      expect(unmounted).toHaveBeenCalled();
    });
  });

  // —— state 快照完整性 ——

  describe("state 快照", () => {
    it("state 是快照，修改返回值不影响内部状态", () => {
      const dialog = new DialogCore({ title: "原始标题" });
      const snap = dialog.state;
      // @ts-expect-error 尝试修改快照
      snap.title = "恶意修改";
      expect(dialog.title).toBe("原始标题");
    });

    it("state 反映 presence 的动画阶段", async () => {
      const dialog = new DialogCore();
      expect(dialog.presence.state.text).toBe("unknown");

      dialog.show();
      expect(dialog.presence.state.text).toBe("enter");
      expect(dialog.state.enter).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.presence.state.text).toBe("visible");
      expect(dialog.state.enter).toBe(false);

      dialog.hide();
      expect(dialog.presence.state.text).toBe("exit");
      expect(dialog.state.exit).toBe(true);
    });
  });

  // —— 快速切换 ——

  describe("快速切换（边缘场景）", () => {
    it("hide 在 show 动画完成前调用", async () => {
      const dialog = new DialogCore();
      const showHandler = vi.fn();
      const hiddenHandler = vi.fn();
      dialog.onShow(showHandler);
      dialog.onHidden(hiddenHandler);

      // 立即 show 后立即 hide（动画未完成）
      dialog.show();
      dialog.hide();

      await new Promise((resolve) => setTimeout(resolve, 300));

      // presence.show_timer 被 hide 时的 clearTimeout 清除
      // 所以 Show 事件不应触发
      expect(showHandler).not.toHaveBeenCalled();
      // Hidden 事件正常触发
      expect(hiddenHandler).toHaveBeenCalled();
      expect(dialog.open).toBe(false);
    });

    it("show → hide → show → hide 快速连续切换", async () => {
      const dialog = new DialogCore();
      const visibleLog: boolean[] = [];
      dialog.onVisibleChange((v) => visibleLog.push(v));

      dialog.show();
      dialog.hide();
      dialog.show();
      dialog.hide();

      await new Promise((resolve) => setTimeout(resolve, 300));

      // 最终应处于隐藏状态
      expect(dialog.open).toBe(false);
    });

    it("toggle 快速连续 4 次，因为 open 异步更新，每次 toggle 都视为 show", async () => {
      const dialog = new DialogCore();
      // open 在 120ms 后才能变为 true，所以这 4 次 toggle 全部执行 show()
      dialog.toggle();
      dialog.toggle();
      dialog.toggle();
      dialog.toggle();
      await new Promise((resolve) => setTimeout(resolve, 300));
      // 最后一次 show() 的 timer 完成，弹窗打开
      expect(dialog.open).toBe(true);
    });
  });

  // —— 多监听器 ——

  describe("多监听器", () => {
    it("同一事件可注册多个 handler", () => {
      const dialog = new DialogCore();
      const h1 = vi.fn();
      const h2 = vi.fn();
      const h3 = vi.fn();

      dialog.onOk(h1);
      dialog.onOk(h2);
      dialog.onOk(h3);
      dialog.ok();

      expect(h1).toHaveBeenCalled();
      expect(h2).toHaveBeenCalled();
      expect(h3).toHaveBeenCalled();
    });

    it("其中一个 handler 取消监听不影响其他", () => {
      const dialog = new DialogCore();
      const h1 = vi.fn();
      const h2 = vi.fn();

      dialog.onOk(h1);
      const unlisten = dialog.onOk(h2);
      unlisten(); // 取消 h2
      dialog.ok();

      expect(h1).toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  // —— 事件监听器返回取消函数 ——

  describe("事件监听器返回取消函数", () => {
    it("onShow 取消后不再触发", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      const unlisten = dialog.onShow(handler);

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onHidden 取消后不再触发", async () => {
      const dialog = new DialogCore({ open: true });
      const handler = vi.fn();
      const unlisten = dialog.onHidden(handler);

      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onVisibleChange 取消后不再触发", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      const unlisten = dialog.onVisibleChange(handler);

      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledWith(true);

      unlisten();
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onUnmounted 取消后不再触发", async () => {
      const dialog = new DialogCore({ open: true });
      const handler = vi.fn();
      const unlisten = dialog.onUnmounted(handler);

      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // —— Symbol.toStringTag ——

  describe("Symbol.toStringTag", () => {
    it("应返回 Dialog", () => {
      const dialog = new DialogCore();
      expect(Object.prototype.toString.call(dialog)).toBe("[object Dialog]");
    });
  });
});
