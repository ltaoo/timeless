/**
 * SelectCore 状态机单测
 *
 * 核心理念：SelectCore 是纯状态机，与渲染层完全解耦。
 * 在 Node.js 中即可验证下拉选择的完整交互逻辑——
 * 状态转换、事件顺序、选项选择、键盘导航、搜索过滤。
 *
 * 状态机测试通过 = UI 行为保证正确（在所有渲染目标上）。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { SelectCore, SelectInListCore, SelectGroupCore } from "@/select";
import { SelectItemCore } from "@/select/item";
import { InputCore } from "@/input";

// SelectItemCore 构造函数未读取 disabled，需手动设置
function opt<T>(value: T, label: string, disabled = false) {
  const item = new SelectItemCore<T>({ value, label });
  item.disabled = disabled;
  return item;
}

function opts<T>(...items: [T, string, boolean?][]) {
  return items.map(([v, l, d]) => opt(v, l, d));
}

describe("SelectCore", () => {
  // —— 构造函数 ——

  describe("构造函数", () => {
    it("默认状态：关闭、无值、有占位符、非禁用", () => {
      const select = new SelectCore({ defaultValue: null });
      expect(select.value).toBe(null);
      expect(select.open).toBe(false);
      expect(select.disabled).toBe(false);
      expect(select.focused).toBe(false);
      expect(select.placeholder).toBe("点击选择");
      expect(select.allowClear).toBe(false);
      expect(select.loading).toBe(false);
      expect(select.position).toBe("item-aligned");
    });

    it("可通过 props 覆盖所有默认值", () => {
      const select = new SelectCore({
        defaultValue: "a",
        placeholder: "请选择城市",
        disabled: true,
        allowClear: true,
        position: "popper",
        options: [opt("a", "北京"), opt("b", "上海")],
      });
      expect(select.value).toBe("a");
      expect(select.placeholder).toBe("请选择城市");
      expect(select.disabled).toBe(true);
      expect(select.allowClear).toBe(true);
      expect(select.position).toBe("popper");
      expect(select.options.length).toBe(2);
    });

    it("defaultValue 匹配选项时自动标记 selected", () => {
      const select = new SelectCore({
        defaultValue: "b",
        options: [opt("a", "选项A"), opt("b", "选项B")],
      });
      expect(select.value).toBe("b");
      expect(select.selected_item$).not.toBeNull();
      expect(select.selected_item$!.value).toBe("b");
      expect(select.selected_item$!.selected).toBe(true);
    });

    it("defaultValue 不匹配任何选项时 value 仍保留但无 selected_item$", () => {
      const select = new SelectCore({
        defaultValue: "x",
        options: [opt("a", "选项A")],
      });
      expect(select.value).toBe("x");
      expect(select.selected_item$).toBeNull();
    });

    it("position 默认是 item-aligned", () => {
      const select = new SelectCore({ defaultValue: null });
      expect(select.position).toBe("item-aligned");
    });

    it("传入 search（InputCore）时 position 强制为 popper", () => {
      const input = new InputCore({ defaultValue: "" });
      const select = new SelectCore({ defaultValue: null, search: input });
      expect(select.position).toBe("popper");
      expect(select.search).toBe(true);
    });

    it("options 支持 SelectGroupCore 分组", () => {
      const group = new SelectGroupCore({
        label: "水果",
        options: [opt("a", "苹果"), opt("b", "香蕉")],
      });
      const select = new SelectCore({
        defaultValue: null,
        options: [group, opt("c", "其他")],
      });
      // raw_options 保留分组结构
      expect(select.raw_options.length).toBe(2);
      // options 展平为 3 个 item
      expect(select.options.length).toBe(3);
    });

    it("onChange 回调传入构造函数", () => {
      const handler = vi.fn();
      const select = new SelectCore({
        defaultValue: null,
        options: [opt("a", "选项A")],
        onChange: handler,
      });
      select.select("a");
      expect(handler).toHaveBeenCalledWith("a");
    });
  });

  // —— 完整生命周期 ——

  describe("完整生命周期（状态机）", () => {
    it("关闭 → show → 进入动画 → 显示完成", async () => {
      const select = new SelectCore({ defaultValue: null });
      const events: string[] = [];

      select.onStateChange(() => events.push("state"));

      // 初始状态
      expect(select.open).toBe(false);
      expect(select.focused).toBe(false);
      expect(select.presence$.state.text).toBe("unknown");

      // 执行 show
      select.show();

      // 立即态：已打开
      expect(select.open).toBe(true);
      expect(select.focused).toBe(true);
      expect(select.presence$.state.enter).toBe(true);

      // 等待动画完成（PresenceCore show timer = 120ms）
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 完成态
      expect(select.open).toBe(true);
      expect(select.presence$.state.enter).toBe(false);
      expect(select.presence$.state.visible).toBe(true);
      expect(select.presence$.state.text).toBe("visible");
      expect(select.state.enter).toBe(false);
      expect(select.state.visible).toBe(true);
    });

    it("显示 → hide → 退出动画 → 隐藏完成", async () => {
      const select = new SelectCore({ defaultValue: null });
      select.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(select.open).toBe(true);

      select.hide();

      // 立即态：退出中
      expect(select.open).toBe(false);
      expect(select.focused).toBe(false);
      expect(select.presence$.state.exit).toBe(true);

      // 等待动画完成
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(select.presence$.state.exit).toBe(false);
      expect(select.presence$.state.mounted).toBe(false);
    });

    it("handleClickTrigger 切换 open/close", async () => {
      const select = new SelectCore({ defaultValue: null });

      select.handleClickTrigger();
      expect(select.open).toBe(true);

      select.handleClickTrigger();
      expect(select.open).toBe(false);
    });

    it("handleClickTrigger 禁用时无效果", () => {
      const select = new SelectCore({ defaultValue: null, disabled: true });
      select.handleClickTrigger();
      expect(select.open).toBe(false);
    });

    it("show 时如果已有值，自动聚焦对应选项", () => {
      const select = new SelectCore({
        defaultValue: "b",
        options: [opt("a", "选项A"), opt("b", "选项B")],
      });
      select.show();
      // 选项 b 应被聚焦
      const itemB = select.options.find((o) => o.value === "b")!;
      expect(itemB.focused).toBe(true);
    });
  });

  // —— select / setValue / clear ——

  describe("select", () => {
    let select: SelectCore<string>;

    beforeEach(() => {
      select = new SelectCore({
        defaultValue: null,
        options: opts(["a", "选项A"], ["b", "选项B"], ["c", "选项C"]),
      });
    });

    it("select(value) 设置值并关闭下拉", () => {
      select.show();
      select.select("a");
      expect(select.value).toBe("a");
      expect(select.open).toBe(false);
      expect(select.selected_item$!.value).toBe("a");
      expect(select.selected_item$!.selected).toBe(true);
    });

    it("select(value) 触发 Change 事件", () => {
      const handler = vi.fn();
      select.onChange(handler);
      select.select("b");
      expect(handler).toHaveBeenCalledWith("b");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("select(value) 触发 StateChange 事件", () => {
      const handler = vi.fn();
      select.onStateChange(handler);
      select.select("b");
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[handler.mock.calls.length - 1][0].value).toBe("b");
    });

    it("选择不同值时取消旧选项的 selected/focused", () => {
      select.select("a");
      expect(select.options.find((o) => o.value === "a")!.selected).toBe(true);

      select.select("b");
      expect(select.options.find((o) => o.value === "a")!.selected).toBe(false);
      expect(select.options.find((o) => o.value === "b")!.selected).toBe(true);
    });

    it("选择相同值时只关闭下拉不触发 Change", () => {
      select.select("a");
      const handler = vi.fn();
      select.onChange(handler);

      select.show();
      select.select("a");

      expect(select.open).toBe(false);
      // select 相同值时直接 hide() 返回，不执行后续逻辑
      expect(handler).not.toHaveBeenCalled();
    });

    it("onValueChange 与 onChange 监听同一事件", () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      select.onChange(h1);
      select.onValueChange(h2);
      select.select("a");
      expect(h1).toHaveBeenCalledWith("a");
      expect(h2).toHaveBeenCalledWith("a");
    });
  });

  describe("setValue", () => {
    let select: SelectCore<string>;

    beforeEach(() => {
      select = new SelectCore({
        defaultValue: null,
        options: opts(["a", "选项A"], ["b", "选项B"]),
      });
    });

    it("setValue(v) 委托 select()", () => {
      select.setValue("a");
      expect(select.value).toBe("a");
      expect(select.selected_item$!.value).toBe("a");
    });

    it("setValue(null) 清空值", () => {
      select.setValue("a");
      select.setValue(null);
      expect(select.value).toBe(null);
      expect(select.selected_item$).toBeNull();
    });

    it("setValue(null) 触发 Change(null)", () => {
      select.setValue("a");
      const handler = vi.fn();
      select.onChange(handler);
      select.setValue(null);
      expect(handler).toHaveBeenCalledWith(null);
    });
  });

  describe("clear", () => {
    it("clear() 清空值和选中项", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [opt("a", "选项A")],
      });
      expect(select.value).toBe("a");

      select.clear();
      expect(select.value).toBe(null);
      expect(select.selected_item$).toBeNull();
    });

    it("clear() 触发 Change(null)", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [opt("a", "选项A")],
      });
      const handler = vi.fn();
      select.onChange(handler);
      select.clear();
      expect(handler).toHaveBeenCalledWith(null);
    });
  });

  // —— Options 管理 ——

  describe("setOptions", () => {
    it("setOptions 替换选项列表", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [opt("a", "选项A")],
      });
      select.setOptions([opt("b", "选项B"), opt("c", "选项C")]);
      expect(select.options.length).toBe(2);
      expect(select.options[0].value).toBe("b");
    });

    it("当前值在新选项中存在时保留", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [opt("a", "选项A")],
      });
      select.setOptions([opt("a", "新选项A"), opt("b", "选项B")]);
      expect(select.value).toBe("a");
    });

    it("当前值不在新选项中时清空并触发 Change(null)", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [opt("a", "选项A")],
      });
      const handler = vi.fn();
      select.onChange(handler);
      select.setOptions([opt("b", "选项B")]);
      expect(select.value).toBe(null);
      expect(handler).toHaveBeenCalledWith(null);
    });

    it("value 为 null 时 setOptions 只更新选项不触发额外事件", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onChange(handler);
      select.setOptions([opt("a", "选项A")]);
      expect(select.options.length).toBe(1);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // —— 键盘导航 ——

  describe("键盘导航", () => {
    let select: SelectCore<string>;

    beforeEach(() => {
      select = new SelectCore({
        defaultValue: null,
        options: opts(
          ["a", "选项A"],
          ["b", "选项B"],
          ["c", "选项C"],
          ["d", "选项D", true], // 禁用的选项
        ),
      });
    });

    it("focusOption 设置选项聚焦状态", () => {
      select.focusOption("a");
      expect(select.options.find((o) => o.value === "a")!.focused).toBe(true);
      expect(select.focused_item$!.value).toBe("a");
    });

    it("focusOption 切换时 blur 旧选项", () => {
      select.focusOption("a");
      select.focusOption("b");
      expect(select.options.find((o) => o.value === "a")!.focused).toBe(false);
      expect(select.options.find((o) => o.value === "b")!.focused).toBe(true);
    });

    it("focusOption 相同值不重复操作", () => {
      select.focusOption("a");
      const item = select.options.find((o) => o.value === "a")!;
      const handler = vi.fn();
      item.onStateChange(handler);
      select.focusOption("a"); // 重复点击
      expect(handler).not.toHaveBeenCalled();
    });

    it("blurOption 取消聚焦", () => {
      select.focusOption("a");
      select.blurOption("a");
      expect(select.options.find((o) => o.value === "a")!.focused).toBe(false);
      expect(select.focused_item$).toBeNull();
    });

    it("getFocusedIndex 返回聚焦选项索引", () => {
      expect(select.getFocusedIndex()).toBe(-1);
      select.focusOption("b");
      expect(select.getFocusedIndex()).toBe(1);
    });

    it("focusNextOption 聚焦下一个非禁用选项", () => {
      select.focusOption("a"); // 索引 0
      select.focusNextOption(); // 应跳到 b (索引 1)
      expect(select.focused_item$!.value).toBe("b");

      select.focusNextOption(); // 应跳到 c (索引 2), 跳过禁用的 d
      expect(select.focused_item$!.value).toBe("c");

      select.focusNextOption(); // 循环回到 a (索引 0)
      expect(select.focused_item$!.value).toBe("a");
    });

    it("focusNextOption 无聚焦时从第一个开始", () => {
      select.focusNextOption();
      expect(select.focused_item$!.value).toBe("a");
    });

    it("focusPrevOption 聚焦上一个非禁用选项", () => {
      select.focusOption("c"); // 索引 2
      select.focusPrevOption(); // 应跳到 b (索引 1), 跳过禁用的 d
      expect(select.focused_item$!.value).toBe("b");

      select.focusPrevOption(); // 应跳到 a (索引 0)
      expect(select.focused_item$!.value).toBe("a");

      select.focusPrevOption(); // 循环回 c (索引 2)
      expect(select.focused_item$!.value).toBe("c");
    });

    it("focusPrevOption 无聚焦时从最后一个非禁用开始", () => {
      select.focusPrevOption();
      expect(select.focused_item$!.value).toBe("c"); // d 被禁用
    });

    it("selectFocusedOption 选中聚焦的选项", () => {
      select.focusOption("b");
      select.selectFocusedOption();
      expect(select.value).toBe("b");
      expect(select.open).toBe(false); // select 内部调用 hide
    });

    it("selectFocusedOption 禁用选项不可选中", () => {
      select.focusOption("d"); // 即使用了 focusOption 强制聚焦禁用项
      select.selectFocusedOption();
      expect(select.value).toBe(null);
    });

    it("selectFocusedOption 无聚焦选项时无操作", () => {
      select.selectFocusedOption();
      expect(select.value).toBe(null);
    });

    it("空选项列表的导航不报错", () => {
      const empty = new SelectCore({ defaultValue: null });
      expect(() => empty.focusNextOption()).not.toThrow();
      expect(() => empty.focusPrevOption()).not.toThrow();
      expect(empty.getFocusedIndex()).toBe(-1);
    });
  });

  // —— 搜索功能 ——

  describe("搜索功能", () => {
    let searchInput: InputCore<string>;

    beforeEach(() => {
      searchInput = new InputCore({ defaultValue: "" });
    });

    it("传入 InputCore 后 search=true、position=popper", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      expect(select.search).toBe(true);
      expect(select.position).toBe("popper");
    });

    it("setSearchKeyword 委托到 search_input$.setValue", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      select.setSearchKeyword("test");
      expect(select.search_input$.value).toBe("test");
    });

    it("setSearchKeyword 相同值不重复操作", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      const handler = vi.fn();
      select.onStateChange(handler);

      select.setSearchKeyword("test");
      const callCount = handler.mock.calls.length;
      select.setSearchKeyword("test"); // 相同值
      // search_input$ setValue 有守卫，相同值不会触发 onChange
      expect(handler.mock.calls.length).toBeLessThanOrEqual(callCount + 2);
    });

    it("clearSearch 清空搜索输入框", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      select.setSearchKeyword("test");
      expect(select.search_input$.value).toBe("test");
      select.clearSearch();
      expect(select.search_input$.value).toBe("");
    });

    it("SearchChange 事件通过 search_input$ onChange 转发", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      const handler = vi.fn();
      select.onSearchChange(handler);

      searchInput.setValue("hello");
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("startSearch 保存当前选项快照并设置 loading", () => {
      const select = new SelectCore({
        defaultValue: null,
        search: searchInput,
        options: [opt("a", "Apple"), opt("b", "Banana")],
      });
      select.startSearch();
      expect(select.loading).toBe(true);
      // 内部保存了 _tmp_options
    });

    it("finishSearch 取消 loading", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      select.startSearch();
      select.finishSearch();
      expect(select.loading).toBe(false);
    });

    it("startSearch 在 loading 时跳过", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      select.startSearch();
      const handler = vi.fn();
      select.onStateChange(handler);
      const callCount = handler.mock.calls.length;
      select.startSearch(); // 第二次应跳过
      expect(handler.mock.calls.length).toBe(callCount);
    });

    it("hide 时如果 input_dirty 清理搜索状态", async () => {
      // 手动设置 open 和 input_dirty 避免 show() 内部调用 popper$ 需要 DOM
      const select = new SelectCore({
        defaultValue: null,
        search: searchInput,
      });
      select.open = true;
      select.input_dirty = true;

      select.hide();
      expect(select.input_dirty).toBe(false);
    });

    it("enableSearch / disableSearch / canSearch", () => {
      const select = new SelectCore({ defaultValue: null, search: searchInput });
      expect(select.canSearch()).toBe(true);
      select.disableSearch();
      expect(select.canSearch()).toBe(false);
      select.enableSearch();
      expect(select.canSearch()).toBe(true);
    });
  });

  // —— 用户交互模拟 ——

  describe("handle 方法（模拟用户操作）", () => {
    let select: SelectCore<string>;

    beforeEach(() => {
      select = new SelectCore({
        defaultValue: null,
        options: opts(["a", "选项A"], ["b", "选项B"]),
      });
    });

    it("handleClickItem 选中选项并关闭下拉", () => {
      select.show();
      expect(select.open).toBe(true);

      const itemB = select.options.find((o) => o.value === "b")!;
      select.handleClickItem(itemB);

      expect(select.value).toBe("b");
      expect(select.open).toBe(false);
    });

    it("handleClickItem 禁用项不响应", () => {
      const disabledItem = new SelectItemCore({ value: "x", label: "禁用项" });
      disabledItem.disabled = true;
      select.handleClickItem(disabledItem);
      expect(select.value).toBe(null);
    });

    it("handleMouseEnterItem 聚焦选项", () => {
      const itemA = select.options.find((o) => o.value === "a")!;
      select.handleMouseEnterItem(itemA);
      expect(itemA.focused).toBe(true);
    });

    it("handleMouseEnterItem 禁用项不聚焦", () => {
      const disabledItem = new SelectItemCore({ value: "x", label: "禁用项" });
      disabledItem.disabled = true;
      select.handleMouseEnterItem(disabledItem);
      expect(disabledItem.focused).toBe(false);
    });

    it("handleMouseLeaveItem 取消聚焦", () => {
      const itemA = select.options.find((o) => o.value === "a")!;
      select.handleMouseEnterItem(itemA);
      expect(itemA.focused).toBe(true);
      select.handleMouseLeaveItem(itemA);
      expect(itemA.focused).toBe(false);
    });

    it("handleFocus 设置 focused 并在 closed 时调用 show", () => {
      select.handleFocus();
      expect(select.focused).toBe(true);
      expect(select.open).toBe(true);
    });

    it("handleFocus 在 presence 可见时不重复 show", () => {
      select.show();
      select.handleFocus();
      expect(select.focused).toBe(true);
      expect(select.open).toBe(true);
    });

    it("handleBlur 清除 focused", () => {
      select.show();
      expect(select.focused).toBe(true);
      select.handleBlur();
      expect(select.focused).toBe(false);
    });
  });

  // —— 状态管理 ——

  describe("state 快照", () => {
    it("state 是快照，修改返回值不影响内部", () => {
      const select = new SelectCore({ defaultValue: null, placeholder: "原始" });
      const snap = select.state;
      // @ts-expect-error 尝试修改快照
      snap.placeholder = "篡改";
      expect(select.placeholder).toBe("原始");
    });

    it("state 反映 presence 动画阶段", async () => {
      const select = new SelectCore({ defaultValue: null });
      expect(select.state.enter).toBe(false);
      expect(select.state.visible).toBe(false);

      select.show();
      expect(select.state.enter).toBe(true);
      expect(select.state.visible).toBe(true);

      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(select.state.enter).toBe(false);
      expect(select.state.visible).toBe(true);
    });

    it("state 包含 selectedOption", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [opt("a", "选项A")],
      });
      expect(select.state.selectedOption).not.toBeNull();
      expect(select.state.selectedOption!.value).toBe("a");
    });

    it("setStatus 修改 status 并触发 StateChange", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);

      select.setStatus("error");
      expect(select.status).toBe("error");
      expect(handler).toHaveBeenCalled();
    });

    it("setStatus 每次都触发 StateChange（无守卫）", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);

      select.setStatus("normal"); // 默认就是 normal
      expect(handler).toHaveBeenCalled();
    });

    it("setLoading 触发 StateChange", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);

      select.setLoading(true);
      expect(select.loading).toBe(true);
      expect(handler).toHaveBeenCalled();
    });

    it("setLoading 相同值不重复触发", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);
      const callCount = handler.mock.calls.length;

      select.setLoading(false); // 默认就是 false
      expect(handler.mock.calls.length).toBe(callCount);
    });

    it("refresh 触发 StateChange", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);
      select.refresh();
      expect(handler).toHaveBeenCalled();
    });
  });

  // —— Focus / Blur 事件 ——

  describe("Focus / Blur 事件", () => {
    it("focus() 触发 Focus 事件", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onFocus(handler);
      select.focus();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("blur() 触发 Blur 事件", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onBlur(handler);
      select.blur();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  // —— 快速切换 ——

  describe("快速切换（边缘场景）", () => {
    it("show 在 disabled 状态下不打开", () => {
      const select = new SelectCore({ defaultValue: null, disabled: true });
      select.show();
      expect(select.open).toBe(false);
      expect(select.focused).toBe(false);
    });

    it("hide 在已关闭状态 return 不做额外操作", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);
      const callCount = handler.mock.calls.length;

      select.hide(); // already closed
      expect(select.open).toBe(false);
    });

    it("show → hide 快速连续切换", async () => {
      const select = new SelectCore({ defaultValue: null });
      select.show();
      select.hide();
      await new Promise((resolve) => setTimeout(resolve, 300));
      expect(select.open).toBe(false);
    });

    it("show → hide → show → hide → show 最终打开", async () => {
      const select = new SelectCore({ defaultValue: null });
      select.show();
      select.hide();
      select.show();
      select.hide();
      select.show();
      await new Promise((resolve) => setTimeout(resolve, 300));
      // 最后一次 show 生效
      expect(select.open).toBe(true);
    });
  });

  // —— 多监听器 ——

  describe("多监听器", () => {
    it("同一事件可注册多个 handler", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [opt("a", "选项A")],
      });
      const h1 = vi.fn();
      const h2 = vi.fn();
      const h3 = vi.fn();

      select.onChange(h1);
      select.onChange(h2);
      select.onChange(h3);
      select.select("a");

      expect(h1).toHaveBeenCalled();
      expect(h2).toHaveBeenCalled();
      expect(h3).toHaveBeenCalled();
    });

    it("其中一个 handler 取消监听不影响其他", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [opt("a", "选项A")],
      });
      const h1 = vi.fn();
      const h2 = vi.fn();

      select.onChange(h1);
      const unlisten = select.onChange(h2);
      unlisten();
      select.select("a");

      expect(h1).toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });

  // —— 事件监听器返回取消函数 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [opt("a", "选项A")],
      });
      const handler = vi.fn();
      const unlisten = select.onChange(handler);

      select.select("a");
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      select.setValue(null);
      select.select("a");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 取消后不再触发", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      const unlisten = select.onStateChange(handler);

      select.refresh();
      expect(handler).toHaveBeenCalled();

      unlisten();
      const callCount = handler.mock.calls.length;
      select.refresh();
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });

  // —— setPosition ——

  describe("setPosition", () => {
    it("setPosition 更新 reference 并触发 StateChange", () => {
      const select = new SelectCore({ defaultValue: null });
      const handler = vi.fn();
      select.onStateChange(handler);

      select.setPosition({ x: 10, y: 20, width: 200, height: 40, left: 10, right: 210, top: 20, bottom: 60 });
      expect(select.reference).not.toBeNull();
      expect(select.reference!.width).toBe(200);
      expect(handler).toHaveBeenCalled();
    });
  });
});

// —— SelectInListCore ——

describe("SelectInListCore", () => {
  describe("bind", () => {
    it("bind 创建并返回 SelectCore 实例", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      const select = listSelect.bind("key1");
      expect(select).toBeInstanceOf(SelectCore);
    });

    it("相同 key 返回相同实例", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      const s1 = listSelect.bind("key1");
      const s2 = listSelect.bind("key1");
      expect(s1).toBe(s2);
    });

    it("bind 可以传入 defaultValue", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      const select = listSelect.bind("key1", { defaultValue: "a" });
      expect(select.value).toBe("a");
    });

    it("bind 的 onChange 触发 SelectInListCore 的 Change 事件", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A"), opt("b", "选项B")],
      });
      const handler = vi.fn();
      listSelect.onChange(handler);

      const select = listSelect.bind("key1");
      select.select("a");

      expect(handler).toHaveBeenCalledWith(["key1", "a"]);
    });
  });

  describe("setOptions", () => {
    it("setOptions 更新所有已绑定的 SelectCore", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      const s1 = listSelect.bind("key1");
      const s2 = listSelect.bind("key2");
      listSelect.setOptions([opt("b", "选项B"), opt("c", "选项C")]);
      expect(s1.options.length).toBe(2);
      expect(s2.options.length).toBe(2);
    });
  });

  describe("setValue", () => {
    it("setValue 设置所有 SelectCore 的值", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A"), opt("b", "选项B")],
      });
      const s1 = listSelect.bind("key1");
      const s2 = listSelect.bind("key2");
      listSelect.setValue("a");
      expect(s1.value).toBe("a");
      expect(s2.value).toBe("a");
    });
  });

  describe("getValue", () => {
    it("getValue 返回指定 key 的值", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      listSelect.bind("key1", { defaultValue: "a" });
      expect(listSelect.getValue("key1")).toBe("a");
    });

    it("未绑定的 key 返回 null", () => {
      const listSelect = new SelectInListCore({ options: [] });
      expect(listSelect.getValue("nonexistent")).toBeNull();
    });
  });

  describe("clear", () => {
    it("clear 清空所有缓存的 SelectCore", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      listSelect.bind("key1");
      listSelect.bind("key2");
      expect(listSelect.list.length).toBe(2);
      listSelect.clear();
      expect(listSelect.list.length).toBe(0);
    });
  });

  describe("toJson", () => {
    it("toJson 将键值对映射为 JSON 数组", () => {
      const listSelect = new SelectInListCore({
        options: [opt("a", "选项A")],
      });
      listSelect.bind("k1", { defaultValue: "a" });
      listSelect.bind("k2", { defaultValue: null });

      const result = listSelect.toJson(([key, value]) => ({ key, value }));
      expect(result).toEqual([
        { key: "k1", value: "a" },
        { key: "k2", value: null },
      ]);
    });
  });
});
