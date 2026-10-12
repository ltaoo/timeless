import { afterEach, describe, expect, it, vi } from "vitest";
import { download } from "../download";
import { random_uuid } from "../uuid";
import { AudioCore } from "@timeless/inner-kit";
import { create_audio_provider, connect as provide_audio } from "../audio";

afterEach(() => vi.useRealTimers());

describe("Web download and UUID capabilities", () => {
  it("uses secure UUID generation, including v4 fallback without randomUUID", () => {
    expect(random_uuid({ crypto: { randomUUID: () => "native" } } as any)).toBe(
      "native",
    );
    const runtime = {
      crypto: { getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff) },
    } as any;
    expect(random_uuid(runtime)).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
    expect(() => random_uuid({} as any)).toThrow("Secure random");
  });
  it("downloads bytes, removes the anchor and revokes its URL after the browser consumes it", async () => {
    vi.useFakeTimers();
    const anchor = { setAttribute: vi.fn(), click: vi.fn(), remove: vi.fn() };
    const RuntimeURL = class extends URL {
      static createObjectURL = vi.fn(
        (_blob: Blob) => "blob:https://reader.test/id",
      );
      static revokeObjectURL = vi.fn();
    };
    const runtime = {
      URL: RuntimeURL,
      Blob,
      setTimeout,
      document: {
        baseURI: "https://reader.test/",
        createElement: () => anchor,
        body: { appendChild: vi.fn() },
      },
    } as any;
    await download(
      { filename: "test.txt", bytes: new Uint8Array([65]), type: "text/plain" },
      runtime,
    );
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.remove).toHaveBeenCalledOnce();
    expect(RuntimeURL.revokeObjectURL).not.toHaveBeenCalled();
    expect(await RuntimeURL.createObjectURL.mock.calls[0][0].text()).toBe("A");
    await vi.advanceTimersByTimeAsync(60000);
    expect(RuntimeURL.revokeObjectURL).toHaveBeenCalledWith(
      "blob:https://reader.test/id",
    );
  });
  it("rejects multiple sources and active URL schemes", async () => {
    await expect(
      download({ filename: "a", text: "", url: "/file" }),
    ).rejects.toThrow("exactly one");
    const anchor = { remove: vi.fn(), click: vi.fn() };
    await expect(
      download({ filename: "a", url: "javascript:alert(1)" }, {
        URL,
        document: {
          baseURI: "https://reader.test",
          createElement: () => anchor,
        },
      } as any),
    ).rejects.toThrow("Unsupported");
    expect(anchor.click).not.toHaveBeenCalled();
    expect(anchor.remove).toHaveBeenCalled();
  });
});

class TestAudio extends EventTarget {
  static instances: TestAudio[] = [];
  src = "";
  preload = "";
  currentTime = 0;
  duration = 120;
  playbackRate = 1;
  volume = 1;
  load = vi.fn();
  play = vi.fn(async () => {
    this.dispatchEvent(new Event("playing"));
  });
  pause = vi.fn(() => this.dispatchEvent(new Event("pause")));
  removeAttribute = vi.fn();
  constructor() {
    super();
    TestAudio.instances.push(this);
  }
}

describe("Web audio capability", () => {
  it("updates playback state, controls rate/position and ignores stopped sessions", async () => {
    TestAudio.instances = [];
    const player = new AudioCore();
    player.connect(
      create_audio_provider({ runtime: { Audio: TestAudio } as any }),
    );
    player.configure({ rate: 1.25, volume: 0.5 });
    player.load("/a.mp3");
    const first = TestAudio.instances[0];
    first.dispatchEvent(new Event("loadedmetadata"));
    expect(player.state.duration).toBe(120);
    expect(first.playbackRate).toBe(1.25);
    await player.play();
    expect(player.state.status).toBe("playing");
    player.seek(12);
    expect(first.currentTime).toBe(12);
    player.pause();
    expect(player.state.status).toBe("paused");
    player.load("/b.mp3");
    first.dispatchEvent(new Event("ended"));
    expect(player.state.status).toBe("loading");
    expect(first.removeAttribute).toHaveBeenCalledWith("src");
    player.destroy();
    expect(player.state.status).toBe("idle");
  });
  it("supports speech voices, pause/resume and cancels speech when a session is replaced", async () => {
    const synth = {
      getVoices: () => [{ voiceURI: "zh", name: "中文", lang: "zh-CN" }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speak: vi.fn((_utterance: any) => {}),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };
    const runtime = {
      Audio: TestAudio,
      speechSynthesis: synth,
      SpeechSynthesisUtterance: class {
        constructor(public text: string) {}
      },
    } as any;
    const player = new AudioCore();
    player.connect(create_audio_provider({ runtime }));
    expect(player.voices()).toEqual([
      { id: "zh", name: "中文", lang: "zh-CN" },
    ]);
    player.speak("你好", { voice: "zh", rate: 0.8 });
    const current = synth.speak.mock.calls[0][0];
    expect(current.lang).toBe("zh-CN");
    current.onstart();
    expect(player.state.status).toBe("playing");
    player.pause();
    await player.resume();
    expect(synth.pause).toHaveBeenCalled();
    player.load("/a.mp3");
    expect(synth.cancel).toHaveBeenCalledOnce();
    expect(current.onend).toBeNull();
    player.destroy();
    expect(synth.removeEventListener).toHaveBeenCalled();
  });
  it("keeps OS playback speed in sync and releases action handlers", () => {
    TestAudio.instances = [];
    const handlers = new Map<string, unknown>();
    const media = {
      setActionHandler: vi.fn((name: string, handler: unknown) =>
        handlers.set(name, handler),
      ),
      setPositionState: vi.fn(),
    };
    const player = new AudioCore();
    provide_audio(player, {
      runtime: { Audio: TestAudio, navigator: { mediaSession: media } } as any,
    });
    player.load("/a.mp3");
    TestAudio.instances[0].dispatchEvent(new Event("loadedmetadata"));
    player.configure({ rate: 2 });
    expect(media.setPositionState).toHaveBeenLastCalledWith({
      duration: 120,
      position: 0,
      playbackRate: 2,
    });
    player.destroy();
    expect([...handlers.values()].every((value) => value === null)).toBe(true);
  });
  it("reports unavailable speech and validates invalid playback options", () => {
    const player = new AudioCore();
    player.connect(create_audio_provider({ runtime: {} as any }));
    expect(() => player.speak("a")).toThrow("unavailable");
    expect(player.state.status).toBe("error");
    expect(() => player.configure({ volume: 2 })).toThrow(RangeError);
    expect(() => player.seek(-1)).toThrow(RangeError);
  });
});
