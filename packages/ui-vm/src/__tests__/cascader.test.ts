import { describe, it, expect, vi, beforeEach } from "vitest";

import { CascaderCore } from "@/cascader";

describe("CascaderCore", () => {
  const mockOptions = [
    {
      value: "zhejiang",
      label: "浙江",
      children: [
        {
          value: "hangzhou",
          label: "杭州",
          children: [
            { value: "xihu", label: "西湖区" },
            { value: "binjiang", label: "滨江区" },
          ],
        },
        { value: "ningbo", label: "宁波" },
      ],
    },
    {
      value: "jiangsu",
      label: "江苏",
      children: [
        { value: "nanjing", label: "南京" },
        { value: "suzhou", label: "苏州" },
      ],
    },
  ];

  describe("构造函数", () => {
    it("默认状态", () => {
      const cascader = new CascaderCore({ defaultValue: null });
      expect(cascader.value).toBe(null);
      expect(cascader.open).toBe(false);
      expect(cascader.placeholder).toBe("请选择");
    });

    it("可以设置默认值", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou"],
        options: mockOptions,
      });
      expect(cascader.value).toEqual(["zhejiang", "hangzhou"]);
    });

    it("可以设置选项", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      expect(cascader.options.length).toBe(2);
    });

    it("可以设置 expandTrigger", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        expandTrigger: "hover",
      });
      expect(cascader.expandTrigger).toBe("hover");
    });

    it("可以设置 showFullPath", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        showFullPath: false,
      });
      expect(cascader.showFullPath).toBe(false);
    });
  });

  describe("show / hide", () => {
    it("show 应打开级联选择器", () => {
      const cascader = new CascaderCore({ defaultValue: null });
      cascader.show();
      expect(cascader.open).toBe(true);
    });

    it("hide 应关闭级联选择器", () => {
      const cascader = new CascaderCore({ defaultValue: null });
      cascader.show();
      cascader.hide();
      expect(cascader.open).toBe(false);
    });

    it("hide 应清空搜索关键字", () => {
      const cascader = new CascaderCore({ defaultValue: null, search: true });
      cascader.show();
      cascader.setSearchKeyword("test");
      cascader.hide();
      expect(cascader.searchKeyword).toBe("");
    });
  });

  describe("select", () => {
    it("应设置选中值", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.select(["zhejiang", "hangzhou", "xihu"]);
      expect(cascader.value).toEqual(["zhejiang", "hangzhou", "xihu"]);
    });

    it("应触发 Change 事件", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      const handler = vi.fn();
      cascader.onChange(handler);
      cascader.select(["zhejiang", "hangzhou", "xihu"]);
      expect(handler).toHaveBeenCalled();
    });

    it("应关闭下拉框", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.select(["zhejiang", "hangzhou", "xihu"]);
      expect(cascader.open).toBe(false);
    });
  });

  describe("clickOption", () => {
    it("点击有子选项的选项应展开", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.clickOption(0, mockOptions[0]);
      expect(cascader.panels.length).toBeGreaterThan(1);
    });

    it("点击叶子节点应完成选择", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.clickOption(0, mockOptions[0]);
      cascader.clickOption(1, mockOptions[0].children![0]);
      cascader.clickOption(2, mockOptions[0].children![0].children![0]);
      expect(cascader.value).toEqual(["zhejiang", "hangzhou", "xihu"]);
    });

    it("disabled 选项不应响应点击", () => {
      const disabledOptions = [
        { value: "a", label: "A", disabled: true },
        { value: "b", label: "B" },
      ];
      const cascader = new CascaderCore({
        defaultValue: null,
        options: disabledOptions,
      });
      cascader.show();
      cascader.clickOption(0, disabledOptions[0]);
      expect(cascader.value).toBe(null);
    });
  });

  describe("expand", () => {
    it("应展开指定面板", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.expand(0, "zhejiang");
      expect(cascader.panels.length).toBe(2);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.setValue(["zhejiang", "hangzhou"]);
      expect(cascader.value).toEqual(["zhejiang", "hangzhou"]);
    });

    it("设置 null 应清空值", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou"],
        options: mockOptions,
      });
      cascader.setValue(null);
      expect(cascader.value).toBe(null);
    });
  });

  describe("clear", () => {
    it("应清空值", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou"],
        options: mockOptions,
      });
      cascader.clear();
      expect(cascader.value).toBe(null);
    });
  });

  describe("setOptions", () => {
    it("应更新选项列表", () => {
      const cascader = new CascaderCore({ defaultValue: null });
      cascader.setOptions(mockOptions);
      expect(cascader.options.length).toBe(2);
    });
  });

  describe("displayText", () => {
    it("未选择时应返回空字符串", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      expect(cascader.displayText).toBe("");
    });

    it("应返回完整路径", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou", "xihu"],
        options: mockOptions,
        showFullPath: true,
      });
      expect(cascader.displayText).toBe("浙江 / 杭州 / 西湖区");
    });

    it("showFullPath=false 时只显示最后一级", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou", "xihu"],
        options: mockOptions,
        showFullPath: false,
      });
      expect(cascader.displayText).toBe("西湖区");
    });
  });

  describe("getSelectedOptions", () => {
    it("应返回选中选项的完整路径", () => {
      const cascader = new CascaderCore({
        defaultValue: ["zhejiang", "hangzhou", "xihu"],
        options: mockOptions,
      });
      const selected = cascader.getSelectedOptions();
      expect(selected.length).toBe(3);
      expect(selected[0].label).toBe("浙江");
      expect(selected[1].label).toBe("杭州");
      expect(selected[2].label).toBe("西湖区");
    });

    it("未选择时应返回空数组", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      const selected = cascader.getSelectedOptions();
      expect(selected).toEqual([]);
    });
  });

  describe("搜索功能", () => {
    it("setSearchKeyword 应设置搜索关键字", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
        search: true,
      });
      cascader.setSearchKeyword("杭");
      expect(cascader.searchKeyword).toBe("杭");
    });

    it("searchResults 应返回搜索结果", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
        search: true,
      });
      cascader.setSearchKeyword("西湖");
      expect(cascader.searchResults.length).toBe(1);
    });

    it("selectSearchResult 应选择搜索结果", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
        search: true,
      });
      cascader.setSearchKeyword("西湖");
      const result = cascader.searchResults[0];
      cascader.selectSearchResult(result);
      expect(cascader.value).toEqual(["zhejiang", "hangzhou", "xihu"]);
    });
  });

  describe("键盘导航", () => {
    it("focusNextOption 应聚焦下一个选项", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.focusNextOption();
      // 验证焦点位置变化
    });

    it("focusPrevOption 应聚焦上一个选项", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.focusPrevOption();
      // 验证焦点位置变化
    });

    it("focusNextPanel 应进入子级面板", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.focusNextPanel();
      // 如果当前选项有子选项，应展开
    });

    it("focusPrevPanel 应返回父级面板", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      cascader.show();
      cascader.expand(0, "zhejiang");
      cascader.focusPrevPanel();
      expect(cascader.panels.length).toBe(1);
    });

    it("selectFocusedOption 应选中当前聚焦的选项", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: [{ value: "a", label: "A" }],
      });
      cascader.show();
      cascader.selectFocusedOption();
      expect(cascader.value).toEqual(["a"]);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
        placeholder: "请选择地区",
      });
      expect(cascader.state.placeholder).toBe("请选择地区");
      expect(cascader.state.open).toBe(false);
      expect(cascader.state.disabled).toBe(false);
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      const handler = vi.fn();
      const unlisten = cascader.onChange(handler);
      cascader.select(["zhejiang", "hangzhou"]);
      expect(handler).toHaveBeenCalled();
      unlisten();
      cascader.select(["jiangsu", "nanjing"]);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const cascader = new CascaderCore({
        defaultValue: null,
        options: mockOptions,
      });
      const handler = vi.fn();
      const unlisten = cascader.onStateChange(handler);
      cascader.show();
      expect(handler).toHaveBeenCalled();
      unlisten();
      cascader.hide();
      const callCount = handler.mock.calls.length;
      cascader.show();
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
