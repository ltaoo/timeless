import { describe, expect, it, vi } from "vitest";
import { AudioCore, AudioEvents, AudioOptions, AudioProvider } from "..";

function provider() {
  return {
    load: vi.fn(
      (_url: string, _options: AudioOptions, _events: AudioEvents) => {},
    ),
    speak: vi.fn(),
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    resume: vi.fn(async () => {}),
    stop: vi.fn(),
    seek: vi.fn(),
    configure: vi.fn(),
    voices: () => [],
    watchVoices: () => vi.fn(),
  } satisfies AudioProvider;
}

describe("platform independent AudioCore", () => {
  it("fails explicitly when a provider is missing", () => {
    expect(() => new AudioCore().load("/a")).toThrow("Host provider");
  });
  it("ignores callbacks and play completions from an earlier session", async () => {
    const adapter = provider(),
      audio = new AudioCore();
    audio.connect(adapter);
    audio.load("/a");
    const callbacks = adapter.load.mock.calls[0][2] as AudioEvents;
    let complete: () => void;
    adapter.play.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    const playing = audio.play();
    audio.load("/b");
    callbacks.end();
    callbacks.error("old error");
    complete!();
    await playing;
    expect(audio.state).toMatchObject({ status: "loading", error: "" });
  });
  it("reports a resume failure and cleans up its provider on destruction", async () => {
    const adapter = provider(),
      audio = new AudioCore();
    audio.connect(adapter);
    audio.load("/a");
    adapter.resume.mockRejectedValue(new Error("denied"));
    await expect(audio.resume()).rejects.toThrow("denied");
    expect(audio.state).toMatchObject({ status: "error", error: "denied" });
    audio.destroy();
    expect(adapter.stop).toHaveBeenCalled();
  });
});
