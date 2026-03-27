import { describe, it, expect, vi, beforeEach } from "vitest";

import { SelectCore, SelectInListCore } from "@/select";

describe("SelectCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const select = new SelectCore({ defaultValue: null });
      expect(select.value).toBe(null);
      expect(select.open).toBe(false);
      expect(select.disabled).toBe(false);
      expect(select.placeholder).toBe("点击选择");
    });

    it("可以设置默认值", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      expect(select.value).toBe("a");
    });

    it("可以设置选项", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      expect(select.options.length).toBe(2);
    });

    it("可以设置 placeholder", () => {
      const select = new SelectCore({
        defaultValue: null,
        placeholder: "请选择",
      });
      expect(select.placeholder).toBe("请选择");
    });
  });

  describe("show / hide", () => {
    it("show 应打开下拉框", () => {
      const select = new SelectCore({ defaultValue: null });
      select.show();
      expect(select.open).toBe(true);
    });

    it("disabled 状态不能打开", () => {
      const select = new SelectCore({
        defaultValue: null,
        disabled: true as any,
      });
      select.show();
      expect(select.open).toBe(false);
    });

    it("hide 应关闭下拉框", () => {
      const select = new SelectCore({ defaultValue: null });
      select.show();
      select.hide();
      expect(select.open).toBe(false);
    });

    it("hide 应清空搜索关键字", () => {
      const select = new SelectCore({ defaultValue: null, search: true });
      select.show();
      select.setSearchKeyword("test");
      select.hide();
      expect(select.searchKeyword).toBe("");
    });
  });

  describe("select", () => {
    it("应设置选中值", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      select.select("a");
      expect(select.value).toBe("a");
    });

    it("应触发 Change 事件", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      select.onChange(handler);
      select.select("a");
      expect(handler).toHaveBeenCalledWith("a");
    });

    it("选中相同值应关闭下拉框", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      select.show();
      select.select("a");
      expect(select.open).toBe(false);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      select.setValue("a");
      expect(select.value).toBe("a");
    });

    it("设置 null 应清空值", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      select.setValue(null);
      expect(select.value).toBe(null);
    });

    it("应触发 Change 事件", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      select.onChange(handler);
      select.setValue("a");
      expect(handler).toHaveBeenCalledWith("a");
    });
  });

  describe("clear", () => {
    it("应清空值", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      select.clear();
      expect(select.value).toBe(null);
    });

    it("应触发 Change 事件", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      select.onChange(handler);
      select.clear();
      expect(handler).toHaveBeenCalledWith(null);
    });
  });

  describe("setOptions", () => {
    it("应更新选项列表", () => {
      const select = new SelectCore({ defaultValue: null });
      select.setOptions([
        { value: "a", label: "选项A" },
        { value: "b", label: "选项B" },
      ]);
      expect(select.options.length).toBe(2);
    });

    it("当前值不在新选项中时应清空值", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
      });
      select.setOptions([{ value: "b", label: "选项B" }]);
      expect(select.value).toBe(null);
    });
  });

  describe("搜索功能", () => {
    it("setSearchKeyword 应设置搜索关键字", () => {
      const select = new SelectCore({ defaultValue: null, search: true });
      select.setSearchKeyword("test");
      expect(select.searchKeyword).toBe("test");
    });

    it("clearSearch 应清空搜索关键字", () => {
      const select = new SelectCore({ defaultValue: null, search: true });
      select.setSearchKeyword("test");
      select.clearSearch();
      expect(select.searchKeyword).toBe("");
    });

    it("filteredOptions 应返回过滤后的选项", () => {
      const select = new SelectCore({
        defaultValue: null,
        search: true,
        options: [
          { value: "a", label: "Apple" },
          { value: "b", label: "Banana" },
          { value: "c", label: "Cherry" },
        ],
      });
      select.setSearchKeyword("an");
      expect(select.filteredOptions.length).toBe(1);
      expect(select.filteredOptions[0].label).toBe("Banana");
    });
  });

  describe("focusOption / blurOption", () => {
    it("focusOption 应设置选项为聚焦状态", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      select.focusOption("a");
      expect(select.options[0].focused).toBe(true);
    });

    it("blurOption 应取消选项聚焦状态", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      select.focusOption("a");
      select.blurOption("a");
      expect(select.options[0].focused).toBe(false);
    });
  });

  describe("键盘导航", () => {
    it("focusNextOption 应聚焦下一个选项", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      select.focusNextOption();
      expect(select.options[1].focused).toBe(true);
    });

    it("focusPrevOption 应聚焦上一个选项", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      select.focusOption("b");
      select.focusPrevOption();
      expect(select.options[0].focused).toBe(true);
    });

    it("selectFocusedOption 应选中当前聚焦的选项", () => {
      const select = new SelectCore({
        defaultValue: null,
        options: [{ value: "a", label: "选项A" }],
      });
      select.focusOption("a");
      select.selectFocusedOption();
      expect(select.value).toBe("a");
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const select = new SelectCore({
        defaultValue: "a",
        options: [{ value: "a", label: "选项A" }],
        placeholder: "请选择",
      });
      expect(select.state.value).toBe("a");
      expect(select.state.placeholder).toBe("请选择");
      expect(select.state.open).toBe(false);
    });
  });
});

describe("SelectInListCore", () => {
  describe("bind", () => {
    it("应创建并返回 SelectCore 实例", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const select = listSelect.bind("key1");
      expect(select).toBeInstanceOf(SelectCore);
    });

    it("相同 key 应返回相同的实例", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const select1 = listSelect.bind("key1");
      const select2 = listSelect.bind("key1");
      expect(select1).toBe(select2);
    });
  });

  describe("setOptions", () => {
    it("应更新所有 SelectCore 的选项", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const select1 = listSelect.bind("key1");
      const select2 = listSelect.bind("key2");
      listSelect.setOptions([{ value: "b", label: "选项B" }]);
      expect(select1.options.length).toBe(1);
      expect(select2.options.length).toBe(1);
    });
  });

  describe("setValue", () => {
    it("应设置所有 SelectCore 的值", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const select1 = listSelect.bind("key1");
      const select2 = listSelect.bind("key2");
      listSelect.setValue("a");
      expect(select1.value).toBe("a");
      expect(select2.value).toBe("a");
    });
  });

  describe("getValue", () => {
    it("应返回指定 key 的值", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      listSelect.bind("key1", { defaultValue: "a" });
      expect(listSelect.getValue("key1")).toBe("a");
    });
  });

  describe("clear", () => {
    it("应清空所有 SelectCore", () => {
      const listSelect = new SelectInListCore({
        options: [{ value: "a", label: "选项A" }],
      });
      listSelect.bind("key1");
      listSelect.bind("key2");
      listSelect.clear();
      expect(listSelect.list.length).toBe(0);
    });
  });
});
