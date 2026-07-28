/**
 * 场景：多步骤表单，StepCore 驱动步骤进度
 *
 * 模拟 web-shadcn index.data.js 中的 Steps 组件模式：
 * - 3 步：Account → Profile → Complete
 * - 每步有对应表单字段
 * - 验证当前步骤后才能进入下一步
 * - Step 进度与表单状态同步
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { StepCore } from "@timeless/inner-vm";
import { InputCore, SelectCore } from "@timeless/inner-vm";
import { SingleFieldCore, ObjectFieldCore } from "@timeless/inner-vm/formv2";

import { selectItem } from "../helpers";

describe("多步骤表单 + StepCore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("步骤 0：StepCore 初始值为 0", () => {
    const step = new StepCore({ value: 0 });

    expect(step.value).toBe(0);
    expect(step.state.value).toBe(0);
  });

  it("步骤 1：Step 0→1→2 前进", () => {
    const step = new StepCore();
    const steps: number[] = [];
    step.onChange((v) => steps.push(v));

    step.change(1);
    expect(step.value).toBe(1);
    expect(steps).toEqual([1]);

    step.change(2);
    expect(step.value).toBe(2);
    expect(steps).toEqual([1, 2]);
  });

  it("步骤 2：Step1 (Account) 填写 + 验证 → Step2 (Profile)", async () => {
    const step = new StepCore();

    // Step 1: Account 表单
    const step1Form = new ObjectFieldCore({
      fields: {
        username: new SingleFieldCore({
          label: "用户名",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true, minLength: 3 }],
        }),
        email: new SingleFieldCore({
          label: "邮箱",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true, mode: "email" }],
        }),
      },
    });

    vi.advanceTimersByTime(850);

    // Step 1 空 → 验证失败
    const r1 = await step1Form.validate();
    expect(step.value).toBe(0); // 仍在 step 0
    expect(r1.error).toBeTruthy();

    // 填写
    step1Form.setValue({ username: "john", email: "john@test.com" });
    const r2 = await step1Form.validate();
    expect(r2.error).toBeFalsy();

    // 进入 step 2
    step.change(1);
    expect(step.value).toBe(1);

    // Step 2: Profile 表单
    const step2Form = new ObjectFieldCore({
      fields: {
        role: new SingleFieldCore({
          label: "角色",
          input: new SelectCore<string>({
            defaultValue: null,
            options: [selectItem("dev", "开发者"), selectItem("pm", "产品经理")],
          }),
          rules: [{ required: true }],
        }),
        bio: new SingleFieldCore({
          label: "简介",
          input: new InputCore<string>({ defaultValue: "" }),
        }),
      },
    });

    vi.advanceTimersByTime(850);

    // Step 2 空 → 验证失败
    const r3 = await step2Form.validate();
    expect(r3.error).toBeTruthy();

    // 填写
    step2Form.setValue({ role: "dev", bio: "full-stack developer" });
    const r4 = await step2Form.validate();
    expect(r4.error).toBeFalsy();

    // 进入 step 3 (complete)
    step.change(2);
    expect(step.value).toBe(2);
  });

  it("步骤 3：Step 前进→后退→再前进（字段保留）", async () => {
    const step = new StepCore();

    const accountForm = new ObjectFieldCore({
      fields: {
        username: new SingleFieldCore({
          label: "用户名",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true }],
        }),
      },
    });

    vi.advanceTimersByTime(850);

    // 填写 → 验证 → 前进 step 1
    accountForm.setValue({ username: "alice" });
    const r = await accountForm.validate();
    expect(r.error).toBeFalsy();

    step.change(1);
    expect(step.value).toBe(1);

    // 后退 step 0 → 字段值保留
    step.change(0);
    expect(step.value).toBe(0);
    expect(accountForm.value).toEqual({ username: "alice" });

    // 再前进 step 1
    step.change(1);
    expect(step.value).toBe(1);
  });

  it("步骤 4：完整事件序列——Step stateChange 日志", () => {
    const step = new StepCore();
    const stateChanges: number[] = [];
    step.onStateChange((s) => stateChanges.push(s.value));

    step.change(1);
    step.change(2);
    step.change(0);

    expect(stateChanges).toEqual([1, 2, 0]);
    expect(step.value).toBe(0);
  });
});
