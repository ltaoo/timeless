import { afterEach, describe, it, expect, vi } from "vitest";
import { Result } from "@timeless/inner-base";

import { SocketClientCore } from "../../http_client/socket";
import { ChannelCore } from "../index";

function createClient() {
  const client = new SocketClientCore();
  const send = vi.fn().mockReturnValue(Result.Ok(null));
  const close = vi.fn().mockReturnValue(Result.Ok(null));
  const open = vi.fn().mockReturnValue(Result.Ok({ send, close }));
  client.open = open;
  return { client, open, send, close };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("ChannelCore", () => {
  describe("constructor", () => {
    it("accepts an endpoint and client", () => {
      const { client } = createClient();
      const channel$ = new ChannelCore("/eventnamelisten", {
        client,
      });

      expect(channel$.client).toBe(client);
      expect(channel$.endpoint).toBe("/eventnamelisten");
      expect(channel$.initial).toBe(true);
      expect(channel$.connecting).toBe(false);
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("idle");
      expect(channel$.lastMessage).toBeNull();
      expect(channel$.lastSent).toBeNull();
      expect(channel$.error).toBeNull();
    });

    it("accepts and updates hostname", () => {
      const channel$ = new ChannelCore("/eventnamelisten", {
        hostname: "wss://example.com",
      });

      expect(channel$.hostname).toBe("wss://example.com");
      expect(channel$.getHostname()).toBe("wss://example.com");

      channel$.setHostname("wss://api.example.com");

      expect(channel$.hostname).toBe("wss://api.example.com");
      expect(channel$.getHostname()).toBe("wss://api.example.com");
    });
  });

  describe("connect", () => {
    it("uses the client and updates state", async () => {
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/eventnamelisten", {
        client,
        hostname: "wss://example.com",
        query: { token: "test" },
      });
      const connectedHandler = vi.fn();
      const statusHandler = vi.fn();
      channel$.onConnected(connectedHandler);
      channel$.onStatusChange(statusHandler);

      const result = await channel$.connect();

      expect(result.error).toBeNull();
      expect(open).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: "/eventnamelisten",
          hostname: "wss://example.com",
          query: { token: "test" },
        }),
      );
      expect(channel$.initial).toBe(false);
      expect(channel$.connecting).toBe(false);
      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(connectedHandler).toHaveBeenCalled();
      expect(statusHandler).toHaveBeenCalledWith("connecting");
      expect(statusHandler).toHaveBeenCalledWith("connected");
    });

    it("returns an error when client is missing", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");

      const result = await channel$.connect();

      expect(result.error?.message).toBe("缺少 socket client");
      expect(channel$.status).toBe("failed");
    });

    it("returns client open errors", async () => {
      const client = new SocketClientCore();
      client.open = vi.fn().mockReturnValue(Result.Err("failed"));
      const channel$ = new ChannelCore("/eventnamelisten", {
        client,
      });

      const result = await channel$.connect();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("failed");
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("failed");
    });

    it("sends initialMessage after connection opens", async () => {
      const { client, send } = createClient();
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
        {
          client,
          initialMessage: { type: "hello" },
        },
      );

      await channel$.connect();

      expect(send).toHaveBeenCalledWith({ type: "hello" });
      expect(channel$.lastSent).toEqual({ type: "hello" });
    });

    it("lets different clients coexist on the same page", async () => {
      const web = createClient();
      const velo = createClient();
      const webChannel$ = new ChannelCore("/web-events", {
        client: web.client,
      });
      const veloChannel$ = new ChannelCore("/velo-events", {
        client: velo.client,
      });

      await Promise.all([webChannel$.connect(), veloChannel$.connect()]);
      await webChannel$.send("web");
      await veloChannel$.send("velo");

      expect(web.open).toHaveBeenCalledTimes(1);
      expect(velo.open).toHaveBeenCalledTimes(1);
      expect(web.send).toHaveBeenCalledWith("web");
      expect(velo.send).toHaveBeenCalledWith("velo");
    });

    it("lets one client create multiple independent connections", async () => {
      const { client, open } = createClient();
      const firstChannel$ = new ChannelCore("/first", { client });
      const secondChannel$ = new ChannelCore("/second", { client });

      await Promise.all([firstChannel$.connect(), secondChannel$.connect()]);

      expect(open).toHaveBeenCalledTimes(2);
      expect(open.mock.calls[0][0].endpoint).toBe("/first");
      expect(open.mock.calls[1][0].endpoint).toBe("/second");
    });

    it("can close while the client is still opening", async () => {
      const client = new SocketClientCore();
      const send = vi.fn().mockReturnValue(Result.Ok(null));
      const close = vi.fn().mockReturnValue(Result.Ok(null));
      let finishOpen: (result: ReturnType<typeof Result.Ok>) => void;
      client.open = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          finishOpen = resolve;
        }),
      );
      const channel$ = new ChannelCore("/events", { client });

      const connecting = channel$.connect();
      await channel$.close(1000, "leave page");
      finishOpen!(Result.Ok({ send, close }));
      const result = await connecting;

      expect(result.error?.message).toBe("连接已取消");
      expect(close).toHaveBeenCalledWith(1000, "connect canceled");
      expect(channel$.status).toBe("closed");
      expect(channel$.connected).toBe(false);
    });
  });

  describe("message", () => {
    it("onMessage receives the business object", () => {
      const channel$ = new ChannelCore<{ type: string }, { type: string }>(
        "/eventnamelisten",
      );
      const messageHandler = vi.fn();
      const changeHandler = vi.fn();
      channel$.onMessage(messageHandler);
      channel$.onMessageChange(changeHandler);

      channel$.receiveMessage({ type: "download_progress" });

      expect(channel$.lastMessage).toEqual({ type: "download_progress" });
      expect(messageHandler).toHaveBeenCalledWith({
        type: "download_progress",
      });
      expect(changeHandler).toHaveBeenCalledWith({
        type: "download_progress",
      });
    });

    it("receives provider messages through the client callback", async () => {
      const { client, open } = createClient();
      const channel$ = new ChannelCore<{ type: string }>("/events", { client });

      await channel$.connect();
      open.mock.calls[0][0].onMessage({ type: "updated" });

      expect(channel$.lastMessage).toEqual({ type: "updated" });
    });

    it("can process raw messages before emitting", () => {
      const channel$ = new ChannelCore<{ type: string }, unknown>(
        "/eventnamelisten",
        {
          process: (v) => JSON.parse(String(v)),
        },
      );

      channel$.receiveMessage('{"type":"download_progress"}');

      expect(channel$.lastMessage).toEqual({ type: "download_progress" });
    });

    it("keeps the connection open when message processing fails", async () => {
      const { client } = createClient();
      const channel$ = new ChannelCore("/events", {
        client,
        process: () => {
          throw new Error("invalid message");
        },
      });

      await channel$.connect();
      channel$.receiveMessage("invalid");

      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(channel$.error?.message).toBe("invalid message");
    });
  });

  describe("sendMessage", () => {
    it("returns an error before connected", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");

      const result = await channel$.sendMessage({ type: "hello" });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("连接未建立");
    });

    it("submits objects through the connection", async () => {
      const { client, send } = createClient();
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
        { client },
      );
      const sentHandler = vi.fn();
      channel$.onSent(sentHandler);

      await channel$.connect();
      const result = await channel$.sendMessage({ type: "hello" });

      expect(result.error).toBeNull();
      expect(send).toHaveBeenCalledWith({ type: "hello" });
      expect(channel$.lastSent).toEqual({ type: "hello" });
      expect(sentHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { type: "hello" },
          raw: { type: "hello" },
        }),
      );
    });

    it("supports encoding before sending", async () => {
      const { client, send } = createClient();
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
        {
          client,
          encode: (v) => JSON.stringify(v),
        },
      );

      await channel$.connect();
      await channel$.sendMessage({ type: "hello" });

      expect(send).toHaveBeenCalledWith('{"type":"hello"}');
    });
  });

  describe("close", () => {
    it("closes cleanly before connected", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");

      const result = await channel$.close();

      expect(result.error).toBeNull();
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("closed");
      expect(channel$.closeReason).toEqual({
        code: undefined,
        reason: undefined,
        clean: true,
      });
    });

    it("closes the connection and updates state", async () => {
      const { client, close } = createClient();
      const channel$ = new ChannelCore("/eventnamelisten", {
        client,
      });
      const closeHandler = vi.fn();
      channel$.onClose(closeHandler);

      await channel$.connect();
      const result = await channel$.close(1000, "done");

      expect(result.error).toBeNull();
      expect(close).toHaveBeenCalledWith(1000, "done");
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("closed");
      expect(channel$.closeReason).toEqual({
        code: 1000,
        reason: "done",
        clean: true,
      });
      expect(closeHandler).toHaveBeenCalledWith({
        code: 1000,
        reason: "done",
        clean: true,
      });
    });

    it("handles provider-side close", async () => {
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/eventnamelisten", {
        client,
      });

      await channel$.connect();
      open.mock.calls[0][0].onClose({
        code: 1006,
        reason: "lost",
        clean: false,
      });

      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("closed");
      expect(channel$.closeReason).toEqual({
        code: 1006,
        reason: "lost",
        clean: false,
      });
    });
  });

  describe("reconnect", () => {
    it("reconnects immediately when requested", async () => {
      const { client, open, close } = createClient();
      const channel$ = new ChannelCore("/events", { client });
      const reconnectedHandler = vi.fn();
      channel$.onReconnected(reconnectedHandler);

      await channel$.connect();
      const result = await channel$.reconnect();

      expect(result.error).toBeNull();
      expect(close).toHaveBeenCalledWith(1000, "reconnect");
      expect(open).toHaveBeenCalledTimes(2);
      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(reconnectedHandler).toHaveBeenCalledTimes(1);
    });

    it("automatically reconnects after a remote close", async () => {
      vi.useFakeTimers();
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/events", {
        client,
        reconnect: {},
      });
      const reconnectingHandler = vi.fn();
      const reconnectedHandler = vi.fn();
      const closeStatusHandler = vi.fn(() => channel$.status);
      channel$.onReconnecting(reconnectingHandler);
      channel$.onReconnected(reconnectedHandler);
      channel$.onClose(closeStatusHandler);

      await channel$.connect();
      open.mock.calls[0][0].onClose({
        code: 1006,
        reason: "lost",
        clean: false,
      });

      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("reconnecting");
      expect(closeStatusHandler).toHaveReturnedWith("reconnecting");
      expect(channel$.reconnectAttempt).toBe(1);
      expect(channel$.nextReconnectAt).toBe(Date.now() + 5000);
      expect(reconnectingHandler).toHaveBeenCalledWith({
        attempt: 1,
        delay: 5000,
        scheduledAt: Date.now() + 5000,
      });

      await vi.advanceTimersByTimeAsync(5000);

      expect(open).toHaveBeenCalledTimes(2);
      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(channel$.reconnectAttempt).toBe(0);
      expect(channel$.nextReconnectAt).toBeNull();
      expect(reconnectedHandler).toHaveBeenCalledTimes(1);
    });

    it("retries an initial connection failure", async () => {
      vi.useFakeTimers();
      const { client, open, send, close } = createClient();
      open
        .mockReturnValueOnce(Result.Err("offline"))
        .mockReturnValueOnce(Result.Ok({ send, close }));
      const channel$ = new ChannelCore("/events", {
        client,
        reconnect: { interval: 1000 },
      });

      const result = await channel$.connect();

      expect(result.error?.message).toBe("offline");
      expect(channel$.status).toBe("reconnecting");
      expect(channel$.error?.message).toBe("offline");

      await vi.advanceTimersByTimeAsync(1000);

      expect(open).toHaveBeenCalledTimes(2);
      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(channel$.error).toBeNull();
    });

    it("does not schedule duplicate reconnect timers", async () => {
      vi.useFakeTimers();
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/events", {
        client,
        reconnect: { interval: 1000 },
      });

      await channel$.connect();
      const options = open.mock.calls[0][0];
      options.onError(new Error("network error"));
      options.onClose({ code: 1006, clean: false });

      expect(channel$.reconnectAttempt).toBe(1);
      await vi.advanceTimersByTimeAsync(1000);
      expect(open).toHaveBeenCalledTimes(2);
    });

    it("stops a scheduled reconnect after an active close", async () => {
      vi.useFakeTimers();
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/events", {
        client,
        reconnect: { interval: 1000 },
      });

      await channel$.connect();
      open.mock.calls[0][0].onClose({ code: 1006, clean: false });
      await channel$.close(1000, "leave page");
      await vi.advanceTimersByTimeAsync(1000);

      expect(open).toHaveBeenCalledTimes(1);
      expect(channel$.status).toBe("closed");
      expect(channel$.connected).toBe(false);
      expect(channel$.nextReconnectAt).toBeNull();
    });

    it("can disable automatic reconnect", async () => {
      vi.useFakeTimers();
      const { client, open } = createClient();
      const channel$ = new ChannelCore("/events", {
        client,
        reconnect: { enabled: false },
      });

      await channel$.connect();
      open.mock.calls[0][0].onClose({ code: 1006, clean: false });
      await vi.advanceTimersByTimeAsync(5000);

      expect(open).toHaveBeenCalledTimes(1);
      expect(channel$.status).toBe("closed");
    });
  });
});
