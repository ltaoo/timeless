import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HttpClientCore,
  RequestCore,
  request,
  request_factory,
} from "@timeless/inner-kit";
import { connect } from "../http_client";

afterEach(() => vi.useRealTimers());

function pending_transport() {
  return vi.fn(
    (_input: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal!.addEventListener(
          "abort",
          () => reject(init.signal!.reason),
          { once: true },
        );
      }),
  );
}

describe("HTTP deadlines", () => {
  it("propagates timeout through request descriptors, RequestCore and client helpers", async () => {
    const client = new HttpClientCore();
    const fetch = vi.fn(async (_options: any) => ({ data: {}, ok: true }));
    client.fetch = fetch as any;
    const runner = new RequestCore(
      () => request.post("/api", {}, { timeout: 25 }),
      { client },
    );
    await runner.run();
    expect(fetch.mock.calls[0][0].timeout).toBe(25);
    await client.get("/get", undefined, { timeout: 30 });
    expect(fetch.mock.calls[1][0].timeout).toBe(30);
    expect(request.del("/delete", { timeout: 40 }).timeout).toBe(40);
  });
  it("aborts a timed-out request and cleans up the timer and request entry", async () => {
    vi.useFakeTimers();
    const client = new HttpClientCore();
    connect(client, { transport: pending_transport(), timeout: 50 });
    const pending = client.fetch({ url: "/slow", method: "GET", id: "slow" });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "TimeoutError",
    });
    await vi.advanceTimersByTimeAsync(50);
    await rejected;
    expect(vi.getTimerCount()).toBe(0);
    expect(client.cancel("slow").error).not.toBeNull();
  });
  it("per-request zero disables the default timeout, while cancellation remains available", async () => {
    vi.useFakeTimers();
    const client = new HttpClientCore({ timeout: 10 });
    connect(client, { transport: pending_transport() });
    const pending = client.fetch({
      url: "/slow",
      method: "GET",
      id: "slow",
      timeout: 0,
    });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await vi.advanceTimersByTimeAsync(100);
    expect(vi.getTimerCount()).toBe(0);
    expect(client.cancel("slow").error).toBeNull();
    await rejected;
  });
  it("keeps the deadline active while reading the response body", async () => {
    vi.useFakeTimers();
    const client = new HttpClientCore();
    connect(client, {
      transport: async (_input, init) =>
        ({
          ok: true,
          json: () =>
            new Promise((_resolve, reject) =>
              init.signal!.addEventListener("abort", () =>
                reject(init.signal!.reason),
              ),
            ),
        }) as Response,
    });
    const pending = client.fetch({ url: "/body", method: "GET", timeout: 10 });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "TimeoutError",
    });
    await vi.advanceTimersByTimeAsync(10);
    await rejected;
  });
  it("detaches caller signals after success and rejects invalid deadlines", async () => {
    vi.useFakeTimers();
    const client = new HttpClientCore();
    const transport = vi.fn(
      async () =>
        ({ ok: true, status: 200, json: async () => ({}) }) as Response,
    );
    connect(client, { transport });
    const signal = new AbortController().signal,
      remove = vi.spyOn(signal, "removeEventListener");
    await client.fetch({ url: "/ok", method: "GET", signal, timeout: 10 });
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
    await expect(
      client.fetch({ url: "/bad", method: "GET", timeout: -1 }),
    ).rejects.toThrow(RangeError);
  });
  it("does not erase another in-flight request when two calls share a cancellation id", async () => {
    let finish: (response: Response) => void;
    const client = new HttpClientCore();
    const transport = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finish = resolve;
          }),
      )
      .mockImplementation(pending_transport());
    connect(client, { transport });
    const first = client.fetch({ url: "/first", method: "GET", id: "group" });
    const second = client.fetch({ url: "/second", method: "GET", id: "group" });
    const rejected = expect(second).rejects.toMatchObject({
      name: "AbortError",
    });
    finish!({ ok: true, json: async () => ({}) } as Response);
    await first;
    expect(client.cancel("group").error).toBeNull();
    await rejected;
  });
});
