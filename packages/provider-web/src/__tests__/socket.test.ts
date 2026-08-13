import { describe, expect, it, vi } from "vitest";

import { SocketClientCore } from "@timeless/inner-kit";

import { connect } from "../socket";

class TestWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: TestWebSocket[] = [];

  CONNECTING = TestWebSocket.CONNECTING;
  OPEN = TestWebSocket.OPEN;
  CLOSING = TestWebSocket.CLOSING;
  CLOSED = TestWebSocket.CLOSED;
  readyState = TestWebSocket.CONNECTING;
  url: string;
  protocols?: string | string[];
  sent: unknown[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  onclose:
    | ((event: { code: number; reason: string; wasClean: boolean }) => void)
    | null = null;

  constructor(url: string | URL, protocols?: string | string[]) {
    this.url = String(url);
    this.protocols = protocols;
    TestWebSocket.instances.push(this);
  }

  open() {
    this.readyState = TestWebSocket.OPEN;
    this.onopen?.();
  }

  send(data: unknown) {
    this.sent.push(data);
  }

  message(data: unknown) {
    this.onmessage?.({ data });
  }

  error(error: unknown) {
    this.onerror?.(error);
  }

  close(code = 1000, reason = "") {
    this.readyState = TestWebSocket.CLOSED;
    this.onclose?.({ code, reason, wasClean: code === 1000 });
  }
}

function createOpenOptions() {
  const controller = new AbortController();
  return {
    controller,
    options: {
      endpoint: "/events",
      hostname: "wss://example.com",
      headers: {},
      query: { token: "test" },
      signal: controller.signal,
      onMessage: vi.fn(),
      onClose: vi.fn(),
      onError: vi.fn(),
    },
  };
}

describe("web socket provider", () => {
  it("opens, sends, receives, and closes a WebSocket", async () => {
    TestWebSocket.instances = [];
    const client = new SocketClientCore();
    connect(client, {
      WebSocket: TestWebSocket as unknown as typeof WebSocket,
    });
    const { options } = createOpenOptions();

    const opening = client.open(options);
    const socket = TestWebSocket.instances[0];
    expect(socket.url).toBe("wss://example.com/events?token=test");
    socket.open();
    const result = await opening;

    expect(result.error).toBeNull();
    await result.data.send({ type: "hello" });
    expect(socket.sent).toEqual(['{"type":"hello"}']);

    socket.message('{"type":"updated"}');
    expect(options.onMessage).toHaveBeenCalledWith(
      { type: "updated" },
      expect.objectContaining({ event: expect.any(Object) }),
    );

    socket.close(1006, "lost");
    expect(options.onClose).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 1006,
        reason: "lost",
        clean: false,
      }),
    );
  });

  it("returns a failed result when the socket errors before opening", async () => {
    TestWebSocket.instances = [];
    const client = new SocketClientCore();
    connect(client, {
      WebSocket: TestWebSocket as unknown as typeof WebSocket,
    });
    const { options } = createOpenOptions();

    const opening = client.open(options);
    TestWebSocket.instances[0].error(new Error("offline"));
    const result = await opening;

    expect(result.error?.message).toBe("WebSocket error");
    expect(options.onError).not.toHaveBeenCalled();
  });
});
