import { BaseDomain, Handler } from "@timeless/inner-base";
import { unsupported_host_capability } from "../app/platform";

export type AudioVoice = { id: string; name: string; lang: string };
export type AudioOptions = {
  rate?: number;
  volume?: number;
  voice?: string;
  language?: string;
};
export type AudioState = {
  status:
    | "idle"
    | "loading"
    | "ready"
    | "playing"
    | "paused"
    | "ended"
    | "error";
  kind: "audio" | "speech" | null;
  rate: number;
  volume: number;
  currentTime: number;
  duration: number;
  error: string;
};
export type AudioEvents = {
  ready(duration: number): void;
  time(currentTime: number, duration: number): void;
  playing(): void;
  pause(): void;
  end(): void;
  error(message: string): void;
};
export interface AudioProvider {
  load(url: string, options: AudioOptions, events: AudioEvents): void;
  speak(text: string, options: AudioOptions, events: AudioEvents): void;
  play(): Promise<void>;
  pause(): void;
  resume(): Promise<void>;
  stop(): void;
  seek(time: number): void;
  configure(options: AudioOptions): void;
  voices(): AudioVoice[];
  watchVoices(handler: () => void): () => void;
  destroy?(): void;
}

enum Events {
  StateChange,
  VoicesChange,
}
type AudioEventTypes = {
  [Events.StateChange]: AudioState;
  [Events.VoicesChange]: AudioVoice[];
};

/** Playback state and session identity are independent of the host media implementation. */
export class AudioCore extends BaseDomain<AudioEventTypes> {
  private provider: AudioProvider | null = null;
  private generation = 0;
  private detachVoices: (() => void) | null = null;
  private options: AudioOptions = { rate: 1, volume: 1 };
  state: AudioState = {
    status: "idle",
    kind: null,
    rate: 1,
    volume: 1,
    currentTime: 0,
    duration: 0,
    error: "",
  };

  connect(provider: AudioProvider) {
    this.stop();
    this.detachVoices?.();
    this.provider?.destroy?.();
    this.provider = provider;
    this.detachVoices = provider.watchVoices(() =>
      this.emit(Events.VoicesChange, this.voices()),
    );
  }
  private requireProvider() {
    return this.provider || unsupported_host_capability("audio");
  }
  private update(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    this.emit(Events.StateChange, { ...this.state });
  }
  private events(): AudioEvents {
    const generation = this.generation;
    const update = (patch: Partial<AudioState>) => {
      if (generation === this.generation) this.update(patch);
    };
    return {
      ready: (duration) =>
        update({
          status: "ready",
          duration: Number.isFinite(duration) ? duration : 0,
        }),
      time: (currentTime, duration) =>
        update({
          currentTime,
          duration: Number.isFinite(duration) ? duration : 0,
        }),
      playing: () => update({ status: "playing" }),
      pause: () => update({ status: "paused" }),
      end: () => update({ status: "ended" }),
      error: (error) => update({ status: "error", error }),
    };
  }
  load(url: string) {
    const provider = this.requireProvider();
    this.stop();
    this.update({ status: "loading", kind: "audio" });
    try {
      provider.load(url, this.options, this.events());
    } catch (error) {
      this.update({ status: "error", error: String((error as Error).message) });
      throw error;
    }
  }
  speak(text: string, options: AudioOptions = {}) {
    const provider = this.requireProvider();
    this.stop();
    this.configure(options);
    this.update({ status: "loading", kind: "speech" });
    try {
      provider.speak(text, this.options, this.events());
    } catch (error) {
      this.update({ status: "error", error: String((error as Error).message) });
      throw error;
    }
  }
  async play() {
    const generation = this.generation;
    try {
      await this.requireProvider().play();
      if (generation === this.generation)
        this.update({ status: "playing", error: "" });
    } catch (error) {
      if (generation === this.generation)
        this.update({
          status: "error",
          error: String((error as Error).message),
        });
      throw error;
    }
  }
  pause() {
    this.requireProvider().pause();
    if (this.state.kind) this.update({ status: "paused" });
  }
  async resume() {
    const generation = this.generation;
    try {
      await this.requireProvider().resume();
      if (generation === this.generation && this.state.kind)
        this.update({ status: "playing", error: "" });
    } catch (error) {
      if (generation === this.generation)
        this.update({
          status: "error",
          error: String((error as Error).message),
        });
      throw error;
    }
  }
  stop() {
    this.generation++;
    this.provider?.stop();
    this.update({
      status: "idle",
      kind: null,
      currentTime: 0,
      duration: 0,
      error: "",
    });
  }
  seek(time: number) {
    if (!Number.isFinite(time) || time < 0)
      throw new RangeError("Audio position must be non-negative");
    this.requireProvider().seek(time);
  }
  configure(options: AudioOptions) {
    if (
      options.rate !== undefined &&
      (!Number.isFinite(options.rate) || options.rate <= 0)
    )
      throw new RangeError("Audio rate must be positive");
    if (
      options.volume !== undefined &&
      (!Number.isFinite(options.volume) ||
        options.volume < 0 ||
        options.volume > 1)
    )
      throw new RangeError("Audio volume must be between 0 and 1");
    this.options = { ...this.options, ...options };
    this.provider?.configure(this.options);
    this.update({ rate: this.options.rate!, volume: this.options.volume! });
  }
  voices() {
    return this.requireProvider().voices();
  }
  onStateChange(handler: Handler<AudioState>) {
    return this.on(Events.StateChange, handler);
  }
  onVoicesChange(handler: Handler<AudioVoice[]>) {
    return this.on(Events.VoicesChange, handler);
  }
  destroy() {
    this.stop();
    this.detachVoices?.();
    this.provider?.destroy?.();
    this.provider = null;
    super.destroy();
  }
}
