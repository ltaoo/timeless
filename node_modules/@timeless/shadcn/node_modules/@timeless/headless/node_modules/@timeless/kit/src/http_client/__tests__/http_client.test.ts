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

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const client = new HttpClientCore();
      const handler = vi.fn();
      const unlisten = client.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
