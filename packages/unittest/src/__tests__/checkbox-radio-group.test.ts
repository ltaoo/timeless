/**
 * 场景：CheckboxGroup + RadioGroup 多选/单选组件协调
 *
 * 模拟 web-shadcn index.form.js + index.overlay.js 中的模式：
 * - RadioGroup 互斥单选
 * - CheckboxGroup 多选
 * - 单选驱动多选选项变化
 * - 全选/取消全选
 */
import { describe, it, expect } from "vitest";

import { CheckboxCore, RadioCore, RadioGroupCore } from "@timeless/inner-vm";
import { CheckboxGroupCore } from "@timeless/inner-vm";

describe("CheckboxGroup + RadioGroup 协调", () => {
  describe("RadioGroup——互斥选择", () => {
    it("初始状态：3 个选项，value=null", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
          { value: "c", label: "选项C" },
        ],
      });

      expect(group.value).toBe(null);
      expect(group.disabled).toBe(false);
      expect(group.state.value).toBe(null);

      // 所有选项未选中
      group.options.forEach((opt) => {
        expect(opt.core.checked).toBe(false);
      });
    });

    it("select A → value=A, RadioA checked=true", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
          { value: "c", label: "选项C" },
        ],
      });
      const values: any[] = [];
      group.onChange((v) => values.push(v));

      group.select("a");
      expect(group.value).toBe("a");
      expect(group.options[0].core.checked).toBe(true);
      expect(group.options[1].core.checked).toBe(false);
      // select 触发两次 Change（RadioCore.onChange → group.select() 递归）
      expect(values).toEqual(["a", "a"]);
    });

    it("select A → select B → A 自动取消", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
          { value: "c", label: "选项C" },
        ],
      });

      group.select("a");
      expect(group.options[0].core.checked).toBe(true);

      group.select("b");
      expect(group.value).toBe("b");
      expect(group.options[0].core.checked).toBe(false);
      expect(group.options[1].core.checked).toBe(true);
    });

    it("RadioCore.check() 自动联动 group.select()", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });

      // 通过 RadioCore 触发
      group.options[1].core.check();
      expect(group.value).toBe("b");
      expect(group.options[0].core.checked).toBe(false);
      expect(group.options[1].core.checked).toBe(true);
    });

    it("reset → 清空所有选择", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
        value: "a",
      });

      group.reset();
      expect(group.value).toBe(null);
    });
  });

  describe("CheckboxGroup——多选", () => {
    it("初始状态：空 values", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "red", label: "红色" },
          { value: "green", label: "绿色" },
          { value: "blue", label: "蓝色" },
        ],
      });

      expect(group.values).toEqual([]);
      expect(group.indeterminate).toBe(false);
    });

    it("多选：checkOption red, blue → values=[red, blue]", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "red", label: "红色" },
          { value: "green", label: "绿色" },
          { value: "blue", label: "蓝色" },
        ],
      });
      const valuesLog: string[][] = [];
      group.onChange((v) => valuesLog.push([...v]));

      group.checkOption("red");
      group.checkOption("blue");

      expect(group.values).toEqual(["red", "blue"]);
      expect(valuesLog).toEqual([["red"], ["red", "blue"]]);
    });

    it("取消选择：uncheckOption red → values=[blue]", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "red", label: "红色" },
          { value: "green", label: "绿色" },
          { value: "blue", label: "蓝色" },
        ],
      });

      group.checkOption("red");
      group.checkOption("blue");
      group.uncheckOption("red");

      expect(group.values).toEqual(["blue"]);
    });

    it("CheckboxCore.toggle() 联动 CheckboxGroupCore", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "red", label: "红色" },
          { value: "green", label: "绿色" },
        ],
      });

      const redCheckbox = group.options[0].core;
      redCheckbox.toggle(); // check red
      expect(group.values).toEqual(["red"]);

      redCheckbox.toggle(); // uncheck red
      expect(group.values).toEqual([]);
    });

    it("全选 → indeterminate=true", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      });

      group.checkOption("a");
      group.checkOption("b");
      expect(group.indeterminate).toBe(true);
    });

    it("部分选中 → indeterminate=false", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      });

      group.checkOption("a");
      expect(group.indeterminate).toBe(false);
    });

    it("reset → 清空所有", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ],
      });

      group.checkOption("a");
      group.checkOption("b");
      group.reset();
      expect(group.values).toEqual([]);
    });
  });

  describe("RadioGroup 驱动 CheckboxGroup 选项变化", () => {
    it("选择 role → checkbox 可选项变化", () => {
      // 角色选择（Radio）
      const roleGroup = new RadioGroupCore({
        options: [
          { value: "admin", label: "管理员" },
          { value: "editor", label: "编辑者" },
          { value: "viewer", label: "观察者" },
        ],
      });

      // 权限选择（Checkbox）——根据 role 动态变化
      const allPermissions = {
        admin: [
          { value: "create", label: "创建" },
          { value: "read", label: "读取" },
          { value: "update", label: "更新" },
          { value: "delete", label: "删除" },
        ],
        editor: [
          { value: "create", label: "创建" },
          { value: "read", label: "读取" },
          { value: "update", label: "更新" },
        ],
        viewer: [{ value: "read", label: "读取" }],
      };

      const permGroup = new CheckboxGroupCore({
        options: allPermissions.admin,
      });

      const permChangeLog: string[][] = [];
      permGroup.onChange((v) => permChangeLog.push([...v]));

      // 初始 admin 权限
      expect(permGroup.options).toHaveLength(4);

      // 切换 role → editor
      roleGroup.select("editor");
      permGroup.setOptions(allPermissions.editor);
      expect(permGroup.options).toHaveLength(3);

      // 切换 role → viewer
      roleGroup.select("viewer");
      permGroup.setOptions(allPermissions.viewer);
      expect(permGroup.options).toHaveLength(1);
    });

    it("切换 role → setOptions 不清除 values（需手动 reset）", () => {
      const permGroup = new CheckboxGroupCore({
        options: [
          { value: "create", label: "创建" },
          { value: "delete", label: "删除" },
        ],
      });

      permGroup.checkOption("delete");

      // setOptions 只替换选项，不清除 values
      permGroup.setOptions([{ value: "read", label: "读取" }]);
      expect(permGroup.values).toEqual(["delete"]);

      // 手动清除后重新选择
      permGroup.reset();
      permGroup.checkOption("read");
      expect(permGroup.values).toEqual(["read"]);
    });
  });

  describe("CheckboxCore 单独使用", () => {
    it("toggle false→true→false", () => {
      const cb = new CheckboxCore();
      expect(cb.checked).toBe(false);

      cb.toggle();
      expect(cb.checked).toBe(true);

      cb.toggle();
      expect(cb.checked).toBe(false);
    });

    it("disabled 时 toggle 仍然切换（toggle 不 guard disabled）", () => {
      const cb = new CheckboxCore({ disabled: true });
      cb.toggle();
      // CheckboxCore.toggle() 没有 disabled guard，仍会切换
      expect(cb.checked).toBe(true);
    });

    it("setValue(true) 触发 onChange", () => {
      const cb = new CheckboxCore();
      const calls: boolean[] = [];
      cb.onChange((v) => calls.push(v));

      cb.setValue(true);
      expect(calls).toEqual([true]);
      expect(cb.checked).toBe(true);
    });

    it("setValue(false, { silence: true }) 静默设置", () => {
      const cb = new CheckboxCore({ checked: true });
      const calls: boolean[] = [];
      cb.onChange((v) => calls.push(v));

      cb.setValue(false, { silence: true });
      expect(cb.checked).toBe(false);
      expect(calls).toEqual([]);
    });
  });
});
