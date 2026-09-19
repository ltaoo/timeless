import { describe, it, expect, vi, beforeEach } from "vitest";

import { HttpClientCore } from "../index";

describe("HttpClientCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const client = new HttpClientCore();
      expect(client.hostname).toBe("");
      expect(client.headers).toEqual({});
      expect(client.debug).toBe(false);
    });

    it("传入配置", () => {
      const client = new HttpClientCore({
        hostname: "https://api.example.com",
        headers: { Authorization: "Bearer token" },
        debug: true,
      });
      expect(client.hostname).toBe("https://api.example.com");
      expect(client.headers).toEqual({ Authorization: "Bearer token" });
      expect(client.debug).toBe(true);
    });
  });

  describe("setHeaders", () => {
    it("应设置 headers", () => {
      const client = new HttpClientCore();
      client.setHeaders({ "Content-Type": "application/json" });
      expect(client.headers).toEqual({ "Content-Type": "application/json" });
    });

    it("应覆盖原有 headers", () => {
      const client = new HttpClientCore({
        headers: { Authorization: "Bearer token" },
      });
      client.setHeaders({ "Content-Type": "application/json" });
      expect(client.headers).toEqual({ "Content-Type": "application/json" });
    });
  });

  describe("appendHeaders", () => {
    it("应追加 headers", () => {
      const client = new HttpClientCore({
        headers: { Authorization: "Bearer token" },
      });
      client.appendHeaders({ "Content-Type": "application/json" });
      expect(client.headers).toEqual({
        Authorization: "Bearer token",
        "Content-Type": "application/json",
      });
    });

    it("应覆盖同名 header", () => {
      const client = new HttpClientCore({
        headers: { Authorization: "Bearer old" },
      });
      client.appendHeaders({ Authorization: "Bearer new" });
      expect(client.headers).toEqual({ Authorization: "Bearer new" });
    });
  });

  describe("setDebug", () => {
    it("应设置 debug 状态", () => {
      const client = new HttpClientCore();
      expect(client.debug).toBe(false);
      client.setDebug(true);
      expect(client.debug).toBe(true);
      client.setDebug(false);
      expect(client.debug).toBe(false);
    });
  });

  describe("get 方法", () => {
    it("应返回 Result.Err 当 fetch 未实现时", async () => {
      const client = new HttpClientCore({
        hostname: "https://api.example.com",
      });
      const result = await client.get("/users");
      expect(result.error).toBeDefined();
    });
  });

  describe("post 方法", () => {
    it("应返回 Result.Err 当 fetch 未实现时", async () => {
      const client = new HttpClientCore({
        hostname: "https://api.example.com",
      });
      const result = await client.post("/users", { name: "test" });
      expect(result.error).toBeDefined();
    });
  });

  describe("cancel 方法", () => {
    it("应返回 Result.Err", () => {
      const client = new HttpClientCore();
      const result = client.cancel("test-id");
      expect(result.error).toBeDefined();
    });
  });

  describe("get/post/put/del 与响应信封", () => {
    /** 注入一个记录入参、回固定信封的 fetch。 */
    function with_fetch(response: Record<string, unknown>) {
      const client = new HttpClientCore({
        hostname: "https://api.example.com",
        headers: { "Content-Type": "application/json" },
      });
      const calls: any[] = [];
      client.fetch = (async (payload: any) => {
        calls.push(payload);
        return { ok: true, status: 200, data: { n: 1 }, ...response };
      }) as any;
      return { client, calls };
    }

    it("2xx 取 data 包成 Result.Ok", async () => {
      const { client, calls } = with_fetch({});
      const result = await client.get("/a", { q: "1" });
      expect(result.error).toBeNull();
      expect(result.data).toEqual({ n: 1 });
      expect(calls[0].url).toBe("https://api.example.com/a?q=1");
      expect(calls[0].method).toBe("GET");
    });

    it("非 2xx 用服务端 error 文案，并把状态与体带进 Result", async () => {
      const { client } = with_fetch({
        ok: false,
        status: 409,
        data: { error: "冲突了" },
      });
      const result: any = await client.put("/a", { b: 2 });
      expect(result.error.message).toBe("冲突了");
      expect(result.error.code).toBe(409);
      expect(result.data).toEqual({ error: "冲突了" });
    });

    it("非 2xx 且无服务端 error 时用 HTTP 状态码兜底", async () => {
      const { client } = with_fetch({ ok: false, status: 503, data: {} });
      const result: any = await client.del("/a");
      expect(result.error.message).toBe("HTTP 503");
    });

    it("del 不带 body；put 带 body", async () => {
      const { client, calls } = with_fetch({});
      await client.del("/a");
      await client.put("/b", { x: 1 });
      expect(calls[0].data).toBeUndefined();
      expect(calls[0].method).toBe("DELETE");
      expect(calls[1].data).toEqual({ x: 1 });
      expect(calls[1].method).toBe("PUT");
    });

    it("fetch 抛错时结果仍是 Result.Err", async () => {
      const client = new HttpClientCore();
      client.fetch = (async () => {
        throw new Error("网络断了");
      }) as any;
      const result: any = await client.get("/a");
      expect(result.error.message).toBe("网络断了");
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const client = new HttpClientCore();
      const handler = vi.fn();
      const unlisten = client.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
