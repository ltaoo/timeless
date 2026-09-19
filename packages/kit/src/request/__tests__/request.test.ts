import { describe, it, expect, vi, beforeEach } from "vitest";

import { RequestCore } from "../index";
import { HttpClientCore } from "@/http_client/index";
import { request, request_factory } from "../utils";
import { Result } from "@timeless/inner-base";

describe("RequestCore", () => {
  let mockClient: HttpClientCore;

  beforeEach(() => {
    mockClient = new HttpClientCore();
    mockClient.get = vi
      .fn()
      .mockResolvedValue(Result.Ok({ data: { id: 1, name: "test" } }));
    mockClient.post = vi
      .fn()
      .mockResolvedValue(Result.Ok({ data: { id: 1, name: "test" } }));
  });

  describe("构造函数", () => {
    it("初始状态", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      expect(req.loading).toBe(false);
      expect(req.initial).toBe(true);
      expect(req.response).toBeNull();
      expect(req.error).toBeNull();
      expect(req.pending).toBeNull();
    });

    it("传入选项", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, {
        client: mockClient,
        delay: 100,
        defaultResponse: { items: [] },
      });
      expect(req.client).toBe(mockClient);
      expect(req.delay).toBe(100);
      expect(req.response).toEqual({ items: [] });
    });
  });

  describe("state getter", () => {
    it("应返回当前状态", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      expect(req.state).toEqual({
        initial: true,
        loading: false,
        error: null,
        response: null,
      });
    });
  });

  describe("run 方法", () => {
    it("没有 service 应返回错误", async () => {
      const req = new RequestCore(null as any);
      const result = await req.run();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("缺少 service");
    });

    it("service 不是函数应返回错误", async () => {
      const req = new RequestCore("not a function" as any);
      const result = await req.run();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("service 不是函数");
    });

    it("没有 client 应返回错误", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const result = await req.run();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("缺少 client");
    });

    it("成功请求应更新状态", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      await req.run();
      expect(req.loading).toBe(false);
      expect(req.initial).toBe(false);
      expect(req.response).toBeDefined();
    });

    it("应触发 LoadingChange 事件", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      const handler = vi.fn();
      req.onLoadingChange(handler);
      await req.run();
      expect(handler).toHaveBeenCalledWith(true);
      expect(handler).toHaveBeenCalledWith(false);
    });

    it("应触发 Success 事件", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      const handler = vi.fn();
      req.onSuccess(handler);
      await req.run();
      expect(handler).toHaveBeenCalled();
    });

    it("应触发 StateChange 事件", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      const handler = vi.fn();
      req.onStateChange(handler);
      await req.run();
      expect(handler).toHaveBeenCalled();
    });

    it("并发调用应复用处理后的请求结果", async () => {
      let resolveRequest!: (value: ReturnType<typeof Result.Ok>) => void;
      mockClient.get = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );
      const process = vi.fn((response: any) => Result.Ok(response.data.data));
      const api = request_factory({ process });
      const req = new RequestCore(() => api.get("/api/test"), {
        client: mockClient,
      });

      const first = req.run();
      const second = req.run();
      resolveRequest(Result.Ok({ code: 0, data: { list: [] } }));

      const [firstResult, secondResult] = await Promise.all([first, second]);
      expect(firstResult.data).toEqual({ list: [] });
      expect(secondResult.data).toEqual({ list: [] });
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(process).toHaveBeenCalledTimes(1);
    });
  });

  describe("reload 方法", () => {
    it("应使用当前参数重新请求", async () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      req.args = [{ id: 1 }] as any;
      req.reload();
      expect(mockClient.get).toHaveBeenCalled();
    });
  });

  describe("cancel 方法", () => {
    it("没有 client 应返回错误", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const result = req.cancel();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("缺少 client");
    });

    it("应调用 client.cancel", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { client: mockClient });
      mockClient.cancel = vi.fn().mockReturnValue(Result.Ok(null));
      req.cancel();
      expect(mockClient.cancel).toHaveBeenCalledWith(req.id);
    });
  });

  describe("clear 方法", () => {
    it("应清空 response", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, { defaultResponse: { items: [1] } });
      req.clear();
      expect(req.response).toBeNull();
    });

    it("应触发 ResponseChange 事件", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const handler = vi.fn();
      req.onResponseChange(handler);
      req.clear();
      expect(handler).toHaveBeenCalledWith(null);
    });
  });

  describe("setError 方法", () => {
    it("应设置 error", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const error = { message: "test error", code: "TEST" } as any;
      req.setError(error);
      expect(req.error).toBe(error);
    });
  });

  describe("modifyResponse 方法", () => {
    it("response 为 null 时不应修改", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      req.modifyResponse((resp) => ({ ...resp, custom: "value" }));
      expect(req.response).toBeNull();
    });

    it("应修改 response", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service, {
        defaultResponse: { items: [] } as any,
      });
      req.modifyResponse((resp: any) => ({ ...resp, custom: "value" }));
      expect((req.response as any).custom).toBe("value");
    });
  });

  describe("事件监听", () => {
    it("onBeforeRequest 应注册监听器", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const handler = vi.fn();
      const unlisten = req.beforeRequest(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onCompleted 应注册监听器", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const handler = vi.fn();
      const unlisten = req.onCompleted(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onCanceled 应注册监听器", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const handler = vi.fn();
      const unlisten = req.onCanceled(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onFailed 应注册监听器", () => {
      const service = () => request.get("/api/test");
      const req = new RequestCore(service);
      const handler = vi.fn();
      const unlisten = req.onFailed(handler);
      expect(typeof unlisten).toBe("function");
    });
  });

  describe("request.put / request.del", () => {
    it("put 生成 PUT payload 并透传 extra", () => {
      const signal = new AbortController().signal;
      const payload = request.put(
        "/api/a",
        { a: 1 },
        { headers: { "X-Test": "1" }, cache: "no-store", signal, keepalive: true },
      );
      expect(payload.method).toBe("PUT");
      expect(payload.url).toBe("/api/a");
      expect(payload.body).toEqual({ a: 1 });
      expect(payload.headers).toEqual({ "X-Test": "1" });
      expect(payload.cache).toBe("no-store");
      expect(payload.signal).toBe(signal);
      expect(payload.keepalive).toBe(true);
    });

    it("del 不带 body", () => {
      const payload = request.del("/api/a", { cache: "no-store" });
      expect(payload.method).toBe("DELETE");
      expect(payload.url).toBe("/api/a");
      expect(payload.body).toBeUndefined();
      expect(payload.cache).toBe("no-store");
    });

    it("get 也透传 cache/signal/keepalive", () => {
      const signal = new AbortController().signal;
      const payload = request.get("/api/a", undefined, {
        cache: "no-store",
        signal,
        keepalive: true,
      });
      expect(payload.cache).toBe("no-store");
      expect(payload.signal).toBe(signal);
      expect(payload.keepalive).toBe(true);
    });
  });

  describe("execute 分派", () => {
    it("PUT 分派到 client.put 并透传 extra", async () => {
      const signal = new AbortController().signal;
      mockClient.put = vi.fn().mockResolvedValue(Result.Ok({ ok: 1 }));
      const req = new RequestCore(
        (body: any) =>
          request.put("/api/a", body, { cache: "no-store", signal, keepalive: true }),
        { client: mockClient },
      );
      await req.run({ a: 1 });
      expect(mockClient.put).toHaveBeenCalledWith(
        "/api/a",
        { a: 1 },
        expect.objectContaining({ cache: "no-store", signal, keepalive: true }),
      );
    });

    it("DELETE 分派到 client.del（不带 body）", async () => {
      mockClient.del = vi.fn().mockResolvedValue(Result.Ok({ ok: 2 }));
      const req = new RequestCore(
        (id: string) => request.del(`/api/b?id=${id}`, { cache: "no-store" }),
        { client: mockClient },
      );
      await req.run("1");
      expect(mockClient.del).toHaveBeenCalledWith(
        "/api/b?id=1",
        expect.objectContaining({ cache: "no-store" }),
      );
    });
  });

  describe("dedupe 开关", () => {
    it("dedupe: false 时并发 run 各打一次上游", async () => {
      let resolveRequest!: (value: ReturnType<typeof Result.Ok>) => void;
      const pending = new Promise<ReturnType<typeof Result.Ok>>((resolve) => {
        resolveRequest = resolve;
      });
      mockClient.post = vi.fn().mockReturnValue(pending);
      const req = new RequestCore((body: any) => request.post("/api/a", body), {
        client: mockClient,
        dedupe: false,
      });
      const first = req.run({ a: 1 });
      const second = req.run({ a: 2 });
      resolveRequest(Result.Ok({ ok: 1 }));
      await Promise.all([first, second]);
      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });
  });
});
