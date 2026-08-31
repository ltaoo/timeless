import { describe, expect, it, vi } from "vitest";

import { HLSPlayerCore } from "../../../kit/src/hls-player";
import { connect } from "../hls-player";

class TestVideo {
  src = "";
  currentTime = 0;
  seekable = { length: 0, start: () => 0 };
  listeners = new Map<string, Set<() => void>>();
  canPlayType = vi.fn(() => "");
  load = vi.fn();
  play = vi.fn(() => Promise.resolve());
  removeAttribute = vi.fn();

  addEventListener(name: string, handler: () => void) {
    const handlers = this.listeners.get(name) || new Set();
    handlers.add(handler);
    this.listeners.set(name, handlers);
  }

  removeEventListener(name: string, handler: () => void) {
    this.listeners.get(name)?.delete(handler);
  }

  emit(name: string) {
    for (const handler of this.listeners.get(name) || []) handler();
  }
}

class TestHls {
  static Events = { ERROR: "error", MANIFEST_PARSED: "manifest" };
  static ErrorTypes = { MEDIA_ERROR: "media", NETWORK_ERROR: "network" };
  static instances: TestHls[] = [];
  static isSupported = () => true;

  handlers = new Map<string, (event: unknown, data?: unknown) => void>();
  attachMedia = vi.fn();
  destroy = vi.fn();
  loadSource = vi.fn();
  recoverMediaError = vi.fn();
  startLoad = vi.fn();

  constructor() {
    TestHls.instances.push(this);
  }

  on(event: string, handler: (event: unknown, data?: unknown) => void) {
    this.handlers.set(event, handler);
  }

  emit(event: string, data?: unknown) {
    this.handlers.get(event)?.(event, data);
  }
}

describe("web HLS player provider", () => {
  it("loads HLS, reports recovery states, and cleans up its session", async () => {
    TestHls.instances = [];
    const player = new HLSPlayerCore();
    const video = new TestVideo();
    connect(player, {
      Hls: TestHls as any,
      fetch: vi.fn().mockResolvedValue({ ok: true }),
    });

    const session = player.mount(
      { target: { get$elm: () => video } },
      { url: "/live/index.m3u8", autoplay: true },
    );
    await vi.waitFor(() => expect(TestHls.instances).toHaveLength(1));
    const hls = TestHls.instances[0];

    expect(player.state).toEqual({
      status: "loading",
      reason: "source-loading",
    });
    expect(hls.loadSource).toHaveBeenCalledWith("/live/index.m3u8");
    expect(hls.attachMedia).toHaveBeenCalledWith(video);

    hls.emit(TestHls.Events.MANIFEST_PARSED);
    expect(player.state.status).toBe("ready");
    expect(video.play).toHaveBeenCalled();

    hls.emit(TestHls.Events.ERROR, {
      fatal: true,
      type: TestHls.ErrorTypes.NETWORK_ERROR,
    });
    expect(player.state.reason).toBe("network-retry");
    expect(hls.startLoad).toHaveBeenCalled();

    expect(player.unmount(session)).toBe(true);
    expect(hls.destroy).toHaveBeenCalled();
    expect(player.state.status).toBe("idle");
  });
});
