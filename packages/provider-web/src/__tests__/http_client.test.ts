import { describe, expect, it, vi } from "vitest";

import { HttpClientCore } from "@timeless/inner-kit";

import { connect } from "../http_client";

/** 造一个「记录 init + 回固定响应」的假 fetch 传输。 */
function recording_transport(response: Partial<Response> = {}) {
  const calls: { input: string; init: RequestInit }[] = [];
  const transport = vi.fn(async (input: string, init: RequestInit) => {
    calls.push({ input, init });
    return {
      ok: true,
      status: 200,
      json: async () => ({}),
      ...response,
    } as Response;
  });
  return { calls, transport };
}

function make_client(response: Partial<Response> = {}) {
  const { calls, transport } = recording_transport(response);
  const store = new HttpClientCore();
  connect(store, { transport });
  return { store, calls };
}

describe("provider-web HttpClientCore", () => {
  it("POST 会序列化 JSON 并补 Content-Type", async () => {
    const { store, calls } = make_client();
    await store.fetch({
      url: "/api/a",
      method: "POST",
      data: { n: 1 },
      headers: { "X-Test": "1" },
    });
    expect(calls[0].input).toBe("/api/a");
    expect(calls[0].init.method).toBe("POST");
    expect(calls[0].init.body).toBe('{"n":1}');
    expect(calls[0].init.headers).toEqual({
      "Content-Type": "application/json",
      "X-Test": "1",
    });
  });

  it("GET 不带 body，原样透传 headers / cache / keepalive", async () => {
    const { store, calls } = make_client();
    await store.fetch({
      url: "/api/a",
      method: "GET",
      cache: "no-store",
      keepalive: true,
      headers: { "X-Test": "1" },
    });
    expect(calls[0].init.body).toBeUndefined();
    expect(calls[0].init.cache).toBe("no-store");
    expect(calls[0].init.keepalive).toBe(true);
    expect(calls[0].init.headers).toEqual({ "X-Test": "1" });
  });

  it("返回信封：把响应体解析成 data，非 2xx 不抛", async () => {
    const { store } = make_client({
      ok: false,
      status: 409,
      json: async () => ({ error: "冲突", subscriptions: [] }),
    });
    const envelope = await store.fetch({ url: "/api/a", method: "GET" });
    expect(envelope.ok).toBe(false);
    expect(envelope.status).toBe(409);
    expect(envelope.data).toEqual({ error: "冲突", subscriptions: [] });
    await expect(envelope.json?.()).resolves.toEqual({
      error: "冲突",
      subscriptions: [],
    });
  });

  it("响应体不是 JSON 时 data 回落 null", async () => {
    const { store } = make_client({
      json: async () => {
        throw new Error("not json");
      },
    });
    const envelope = await store.fetch({ url: "/api/a", method: "GET" });
    expect(envelope.data).toBeNull();
  });

  it("外部 signal 的 abort 会取消内部控制器", async () => {
    const { store, calls } = make_client();
    const controller = new AbortController();
    controller.abort("stop");
    await store.fetch({ url: "/api/a", method: "GET", signal: controller.signal });
    expect((calls[0].init.signal as AbortSignal).aborted).toBe(true);
  });
});
