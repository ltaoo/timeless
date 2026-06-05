import { describe, it, expect, vi } from "vitest";
import { Result } from "@timeless/base";

import { ChannelCore } from "../index";

describe("ChannelCore", () => {
  describe("constructor", () => {
    it("accepts an endpoint directly", () => {
      const channel$ = new ChannelCore("/eventnamelisten");

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
    it("uses provider openConnection and updates state", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));
      const connectedHandler = vi.fn();
      const statusHandler = vi.fn();
      channel$.onConnected(connectedHandler);
      channel$.onStatusChange(statusHandler);

      const result = await channel$.connect();

      expect(result.error).toBeNull();
      expect(channel$.openConnection).toHaveBeenCalled();
      expect(channel$.initial).toBe(false);
      expect(channel$.connecting).toBe(false);
      expect(channel$.connected).toBe(true);
      expect(channel$.status).toBe("connected");
      expect(connectedHandler).toHaveBeenCalled();
      expect(statusHandler).toHaveBeenCalledWith("connecting");
      expect(statusHandler).toHaveBeenCalledWith("connected");
    });

    it("returns provider open errors", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");
      channel$.openConnection = vi.fn().mockReturnValue(Result.Err("failed"));

      const result = await channel$.connect();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("failed");
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("failed");
    });

    it("sends initialMessage after connection opens", async () => {
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
        {
          initialMessage: { type: "hello" },
        },
      );
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));
      channel$.postMessage = vi.fn().mockReturnValue(Result.Ok(null));

      await channel$.connect();

      expect(channel$.postMessage).toHaveBeenCalledWith({ type: "hello" });
      expect(channel$.lastSent).toEqual({ type: "hello" });
    });
  });

  describe("message", () => {
    it("onMessage receives the business object", async () => {
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
  });

  describe("sendMessage", () => {
    it("returns an error before connected", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");

      const result = await channel$.sendMessage({ type: "hello" });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("连接未建立");
    });

    it("submits object through provider postMessage", async () => {
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
      );
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));
      channel$.postMessage = vi.fn().mockReturnValue(Result.Ok(null));
      const sentHandler = vi.fn();
      channel$.onSent(sentHandler);

      await channel$.connect();
      const result = await channel$.sendMessage({ type: "hello" });

      expect(result.error).toBeNull();
      expect(channel$.postMessage).toHaveBeenCalledWith({ type: "hello" });
      expect(channel$.lastSent).toEqual({ type: "hello" });
      expect(sentHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { type: "hello" },
          raw: { type: "hello" },
        }),
      );
    });

    it("supports encoding before postMessage", async () => {
      const channel$ = new ChannelCore<string, { type: string }>(
        "/eventnamelisten",
        {
          encode: (v) => JSON.stringify(v),
        },
      );
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));
      channel$.postMessage = vi.fn().mockReturnValue(Result.Ok(null));

      await channel$.connect();
      await channel$.sendMessage({ type: "hello" });

      expect(channel$.postMessage).toHaveBeenCalledWith('{"type":"hello"}');
    });
  });

  describe("close", () => {
    it("closes cleanly before connected", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");
      channel$.closeConnection = vi.fn().mockReturnValue(Result.Ok(null));

      const result = await channel$.close();

      expect(result.error).toBeNull();
      expect(channel$.closeConnection).not.toHaveBeenCalled();
      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("closed");
      expect(channel$.closeReason).toEqual({
        code: undefined,
        reason: undefined,
        clean: true,
      });
    });

    it("uses provider closeConnection and updates state", async () => {
      const channel$ = new ChannelCore("/eventnamelisten");
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));
      channel$.closeConnection = vi.fn().mockReturnValue(Result.Ok(null));
      const closeHandler = vi.fn();
      channel$.onClose(closeHandler);

      await channel$.connect();
      const result = await channel$.close(1000, "done");

      expect(result.error).toBeNull();
      expect(channel$.closeConnection).toHaveBeenCalledWith(1000, "done");
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
      const channel$ = new ChannelCore("/eventnamelisten");
      channel$.openConnection = vi.fn().mockReturnValue(Result.Ok(null));

      await channel$.connect();
      channel$.handleClose({ code: 1006, reason: "lost", clean: false });

      expect(channel$.connected).toBe(false);
      expect(channel$.status).toBe("closed");
      expect(channel$.closeReason).toEqual({
        code: 1006,
        reason: "lost",
        clean: false,
      });
    });
  });
});
