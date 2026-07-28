/**
 * 场景：Select 驱动表单字段集切换
 *
 * 模拟 web-shadcn index.validate.js 中的存储提供商配置模式：
 * - 选择不同提供商（qiniu / s3 / webdav）→ 切换不同的字段集
 * - 使用 ObjectFieldCore.setField() 动态替换表单字段
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { SelectCore, InputCore } from "@timeless/inner-vm";
import { SingleFieldCore, ObjectFieldCore } from "@timeless/inner-vm/formv2";

import { selectItem } from "../helpers";

describe("Select 驱动表单字段集切换", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("步骤 0：初始状态——选择提供商 → 字段集随 provider 变化", () => {
    // 提供商选择
    const providerSelect = new SelectCore<string>({
      defaultValue: null,
      placeholder: "请选择存储提供商",
      options: [
        selectItem("qiniu", "七牛云"),
        selectItem("s3", "S3 兼容"),
        selectItem("webdav", "WebDAV"),
      ],
    });

    expect(providerSelect.value).toBeNull();
    expect(providerSelect.shape).toBe("select");

    // 初始无字段
    const qiniuFields = {
      access_key: new SingleFieldCore({
        label: "Access Key",
        input: new InputCore<string>({ defaultValue: "" }),
        rules: [{ required: true }],
      }),
      bucket: new SingleFieldCore({
        label: "Bucket",
        input: new InputCore<string>({ defaultValue: "" }),
        rules: [{ required: true }],
      }),
    };

    const s3Fields = {
      endpoint: new SingleFieldCore({
        label: "Endpoint",
        input: new InputCore<string>({ defaultValue: "" }),
        rules: [{ required: true }],
      }),
      region: new SingleFieldCore({
        label: "Region",
        input: new InputCore<string>({ defaultValue: "" }),
      }),
      bucket: new SingleFieldCore({
        label: "Bucket",
        input: new InputCore<string>({ defaultValue: "" }),
        rules: [{ required: true }],
      }),
    };

    // 表单（初始使用 qiniu 字段）
    const form = new ObjectFieldCore({ fields: qiniuFields });

    vi.advanceTimersByTime(850);

    // 初始有 2 个字段
    const state0 = form.state.fields;
    expect(state0).toHaveLength(2);
    expect(state0[0].label).toBe("Access Key");
    expect(state0[1].label).toBe("Bucket");

    // 填写 qiniu 字段
    form.setValue({ access_key: "ak-123", bucket: "my-bucket" });
    expect(form.value).toEqual({ access_key: "ak-123", bucket: "my-bucket" });

    // —— 切换为 S3 字段集 ——
    // 替换字段：删除旧 key，添加新 key
    delete form.fields.access_key;
    (form.fields as any).endpoint = s3Fields.endpoint;
    // bucket 字段保留（s3 也有 bucket）
    form.setField("bucket", s3Fields.bucket);
    // 添加 region 字段（qiniu 没有此字段）
    (form.fields as any).region = s3Fields.region;
    form.refresh();

    const state1 = form.state.fields;
    expect(state1).toHaveLength(3);

    // 旧值被清除（新字段 defaultValue 为空）
    expect(form.fields.endpoint.value).toBe("");
    expect(form.fields.bucket.value).toBe("");
  });

  it("步骤 1：选择 provider → 触发字段集切换（完整流程）", async () => {
    const changeLog: string[] = [];

    const providerSelect = new SelectCore<string>({
      defaultValue: null,
      options: [
        selectItem("qiniu", "七牛云"),
        selectItem("s3", "S3"),
      ],
    });

    // 初始 qiniu 字段
    const form = new ObjectFieldCore({
      fields: {
        provider_type: new SingleFieldCore({
          label: "提供商",
          input: providerSelect,
        }),
        access_key: new SingleFieldCore({
          label: "Access Key",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true }],
        }),
        bucket: new SingleFieldCore({
          label: "Bucket",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true }],
        }),
      },
    });

    vi.advanceTimersByTime(850);

    // 初始 3 个字段
    let state = form.state.fields;
    expect(state).toHaveLength(3);
    expect(state.map((f: any) => f.label)).toEqual([
      "提供商", "Access Key", "Bucket",
    ]);

    // 选择 provider → s3
    providerSelect.select("s3");
    changeLog.push(`provider:${providerSelect.value}`);

    // 替换字段集：替换 access_key → endpoint，保留 bucket（s3 也有 bucket）
    const endpointField = new SingleFieldCore({
      label: "Endpoint",
      input: new InputCore<string>({ defaultValue: "" }),
      rules: [{ required: true }],
    });
    const regionField = new SingleFieldCore({
      label: "Region",
      input: new InputCore<string>({ defaultValue: "" }),
    });

    // 删除旧 key，添加新 key
    delete form.fields.access_key;
    (form.fields as any).endpoint = endpointField;
    (form.fields as any).region = regionField;
    form.refresh();

    // 字段已变化
    state = form.state.fields;
    expect(state).toHaveLength(4); // provider_type, endpoint, bucket, region
    expect(state.map((f: any) => f.label)).toEqual([
      "提供商", "Bucket", "Endpoint", "Region",
    ]);

    // 填写 S3 字段
    form.setFieldValue("endpoint", "https://s3.example.com");
    form.setFieldValue("region", "us-east-1");
    form.setFieldValue("bucket", "s3-bucket");

    expect(form.value).toEqual({
      provider_type: "s3",
      endpoint: "https://s3.example.com",
      bucket: "s3-bucket",
      region: "us-east-1",
    });

    expect(changeLog).toEqual(["provider:s3"]);
  });

  it("步骤 2：不选 provider → 验证失败 → 选择后验证通过", async () => {
    const providerSelect = new SelectCore<string>({
      defaultValue: null,
      options: [
        selectItem("qiniu", "七牛云"),
        selectItem("s3", "S3"),
      ],
    });

    const form = new ObjectFieldCore({
      fields: {
        provider: new SingleFieldCore({
          label: "提供商",
          input: providerSelect,
          rules: [{ required: true }],
        }),
        access_key: new SingleFieldCore({
          label: "Access Key",
          input: new InputCore<string>({ defaultValue: "" }),
          rules: [{ required: true }],
        }),
      },
    });

    vi.advanceTimersByTime(850);

    // provider 未选 → 验证失败
    const r1 = await form.validate();
    expect(r1.error).toBeTruthy();

    // 选择 provider → 验证
    providerSelect.select("qiniu");
    form.setFieldValue("access_key", "my-key");

    const r2 = await form.validate();
    expect(r2.error).toBeFalsy();
    expect(r2.data).toEqual({ provider: "qiniu", access_key: "my-key" });
  });
});
