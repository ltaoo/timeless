/**
 * 场景：对话框中嵌入表单 → 填写字段 → 验证 → 提交 → 关闭
 *
 * 模拟 web-shadcn index.form.js 中的 Dialog Form 模式：
 * - 4 个字段：name (Input)、email (Input)、role (Select)、bio (Textarea)
 * - 点击 OK 触发验证 → 验证失败则留空 Dialog
 * - 验证成功 → 模拟 loading → 关闭 Dialog
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  ButtonCore,
  DialogCore,
  SelectCore,
  InputCore,
  SelectItemCore,
} from "@timeless/inner-vm";
import { SingleFieldCore, ObjectFieldCore } from "@timeless/inner-vm/formv2";

import { snapDialog, selectItem } from "../helpers";

describe("Dialog 表单验证 → 提交", () => {
  // 使用 fake timers 来控制 SingleFieldCore/ObjectFieldCore 的 800ms onChange 延迟
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("步骤 0：创建 Dialog + 4 字段表单，初始状态全部空", () => {
    const dialog = new DialogCore({ title: "编辑用户" });

    // 名称字段
    const nameInput = new InputCore<string>({ defaultValue: "" });
    const nameField = new SingleFieldCore({
      label: "名称",
      name: "name",
      input: nameInput,
      rules: [{ required: true }],
    });

    // Email 字段
    const emailInput = new InputCore<string>({ defaultValue: "" });
    const emailField = new SingleFieldCore({
      label: "邮箱",
      name: "email",
      input: emailInput,
      rules: [{ required: true, mode: "email" }],
    });

    // 角色 Select
    const roleSelect = new SelectCore<string>({
      defaultValue: null,
      placeholder: "请选择角色",
      options: [
        selectItem("admin", "管理员"),
        selectItem("editor", "编辑者"),
        selectItem("viewer", "观察者"),
      ],
    });
    const roleField = new SingleFieldCore({
      label: "角色",
      name: "role",
      input: roleSelect,
      rules: [{ required: true }],
    });

    // Bio Textarea
    const bioInput = new InputCore<string>({ defaultValue: "" });
    const bioField = new SingleFieldCore({
      label: "简介",
      name: "bio",
      input: bioInput,
    });

    // 表单对象
    const form = new ObjectFieldCore({
      fields: {
        name: nameField,
        email: emailField,
        role: roleField,
        bio: bioField,
      },
    });

    // —— 初始状态：所有字段空 ——
    expect(dialog.open).toBe(false);

    expect(nameField.value).toBe("");
    expect(emailField.value).toBe("");
    expect(roleField.value).toBeNull();
    expect(bioField.value).toBe("");

    // 表单 state 包含所有字段
    const formState = form.state;
    expect(formState.fields).toBeDefined();

    // 表单 values
    expect(form.value).toEqual({
      name: "",
      email: "",
      role: null,
      bio: "",
    });
  });

  it("步骤 1：打开 Dialog → 初始状态", () => {
    const dialog = new DialogCore({ title: "编辑用户" });

    dialog.show();

    // 同步态：进入动画中
    expect(dialog.presence.state.enter).toBe(true);
    expect(dialog.presence.state.visible).toBe(true);
    expect(dialog.open).toBe(false);

    // 推进 200ms → dialog.open = true
    vi.advanceTimersByTime(200);
    expect(dialog.open).toBe(true);
    expect(dialog.presence.state.text).toBe("visible");
  });

  it("步骤 2：填写表单字段 + 验证", async () => {
    const dialog = new DialogCore({ title: "编辑用户" });
    dialog.show();
    vi.advanceTimersByTime(200);

    const nameInput = new InputCore<string>({ defaultValue: "" });
    const nameField = new SingleFieldCore({
      label: "名称",
      name: "name",
      input: nameInput,
      rules: [{ required: true }],
    });

    const emailInput = new InputCore<string>({ defaultValue: "" });
    const emailField = new SingleFieldCore({
      label: "邮箱",
      name: "email",
      input: emailInput,
      rules: [{ required: true, mode: "email" }],
    });

    const roleSelect = new SelectCore<string>({
      defaultValue: null,
      placeholder: "请选择角色",
      options: [
        selectItem("admin", "管理员"),
        selectItem("editor", "编辑者"),
      ],
    });
    const roleField = new SingleFieldCore({
      label: "角色",
      name: "role",
      input: roleSelect,
      rules: [{ required: true }],
    });

    const form = new ObjectFieldCore({
      fields: { name: nameField, email: emailField, role: roleField },
    });

    // 推进 850ms 让 SingleFieldCore 和 ObjectFieldCore 的 onChange 注册完成
    vi.advanceTimersByTime(850);

    // —— 空表单验证失败 ——
    const result1 = await form.validate();
    expect(result1.error).toBeTruthy();
    // validate() 设置 field._error 和调用 input.setStatus("error")，
    // 但不设置 field._status（state.status 仍需手动 setStatus）
    expect(nameField.state.error).not.toBeNull();
    expect(nameInput.status).toBe("error");
    // 邮箱 required
    expect(emailField.state.error).not.toBeNull();
    // 角色 required
    expect(roleField.state.error).not.toBeNull();

    // —— 填写名称 ——
    nameField.setValue("张三");
    expect(nameField.value).toBe("张三");
    // onChange 监听器（800ms 后注册）自动清除 error
    expect(nameField.state.error).toBeNull();

    // —— 填写无效邮箱 ——
    emailField.setValue("invalid-email");
    const result2 = await form.validate();
    expect(result2.error).toBeTruthy();
    expect(emailInput.status).toBe("error");

    // —— 填写正确邮箱 + 选择角色 ——
    emailField.setValue("zhangsan@example.com");
    roleField.setValue("admin");
    expect(roleField.value).toBe("admin");

    // —— 全部验证通过 ——
    const result3 = await form.validate();
    expect(result3.error).toBeFalsy();
    expect(result3.data).toEqual({
      name: "张三",
      email: "zhangsan@example.com",
      role: "admin",
    });

    // 错误已清除
    expect(nameField.state.error).toBeNull();
    expect(emailField.state.error).toBeNull();
    expect(roleField.state.error).toBeNull();
  });

  it("步骤 3：验证通过后 → 模拟提交 loading → 关闭 Dialog", () => {
    const dialog = new DialogCore({ title: "编辑用户" });
    dialog.show();
    vi.advanceTimersByTime(200);
    expect(dialog.open).toBe(true);

    const nameInput = new InputCore<string>({ defaultValue: "李四" });
    const nameField = new SingleFieldCore({
      label: "名称",
      name: "name",
      input: nameInput,
    });

    const form = new ObjectFieldCore({
      fields: { name: nameField },
    });

    vi.advanceTimersByTime(850);

    // —— 模拟：点击 OK → 设置 loading → 验证 → 提交 → 关闭 ——
    let submitLoading = false;
    let submitted = false;

    dialog.onOk(async () => {
      submitLoading = true;
      // 模拟异步提交
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          submitted = true;
          submitLoading = false;
          resolve();
        }, 1000);
      });
    });

    dialog.ok();
    expect(submitLoading).toBe(true);

    // loading 期间 Dialog 仍打开
    expect(dialog.open).toBe(true);

    // 推进 1s → 提交完成
    vi.advanceTimersByTime(1100);
    expect(submitted).toBe(true);
  });

  it("步骤 4：完整流程——打开→填写→验证失败→修正→验证通过→提交→关闭", async () => {
    const events: string[] = [];
    const dialog = new DialogCore({ title: "注册" });
    dialog.onShow(() => events.push("show"));
    dialog.onHidden(() => events.push("hidden"));

    // 打开弹窗
    dialog.show();
    vi.advanceTimersByTime(200);
    expect(dialog.open).toBe(true);
    expect(events).toContain("show");

    // 创建表单
    const nameInput = new InputCore<string>({ defaultValue: "" });
    const nameField = new SingleFieldCore({
      label: "用户名",
      name: "username",
      input: nameInput,
      rules: [{ required: true, minLength: 3 }],
    });

    const emailInput = new InputCore<string>({ defaultValue: "" });
    const emailField = new SingleFieldCore({
      label: "邮箱",
      name: "email",
      input: emailInput,
      rules: [{ required: true, mode: "email" }],
    });

    const form = new ObjectFieldCore({
      fields: { username: nameField, email: emailField },
    });

    vi.advanceTimersByTime(850);

    // 第一次验证 → 失败（空）
    const r1 = await form.validate();
    expect(r1.error).toBeTruthy();

    // 填写短用户名 → 失败
    nameField.setValue("ab");
    const r2 = await form.validate();
    expect(r2.error).toBeTruthy();

    // 修正 → 成功
    nameField.setValue("validUser");
    emailField.setValue("user@test.com");
    const r3 = await form.validate();
    expect(r3.error).toBeFalsy();
    expect(r3.data).toEqual({ username: "validUser", email: "user@test.com" });

    // Dialog state 仍可见
    expect(dialog.open).toBe(true);

    // 关闭弹窗
    dialog.hide();
    expect(dialog.presence.state.exit).toBe(true);

    vi.advanceTimersByTime(200);

    expect(dialog.open).toBe(false);
    expect(dialog.presence.state.mounted).toBe(false);
    expect(events).toContain("hidden");
  });

  it("步骤 5：reset 表单 → 所有字段回到默认值", async () => {
    const nameInput = new InputCore<string>({ defaultValue: "" });
    const nameField = new SingleFieldCore({
      label: "名称",
      input: nameInput,
      rules: [{ required: true }],
    });

    const roleSelect = new SelectCore<string>({
      defaultValue: null,
      options: [selectItem("a", "A"), selectItem("b", "B")],
    });
    const roleField = new SingleFieldCore({
      label: "角色",
      input: roleSelect,
    });

    const form = new ObjectFieldCore({
      fields: { name: nameField, role: roleField },
    });

    vi.advanceTimersByTime(850);

    // 填写
    nameField.setValue("test");
    roleField.setValue("a");
    expect(form.value).toEqual({ name: "test", role: "a" });

    // reset
    form.reset();
    expect(form.value).toEqual({ name: "", role: null });
    expect(nameField.state.error).toBeNull();
    expect(nameField.state.status).toBe("normal");
  });
});
