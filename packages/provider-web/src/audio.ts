import type {
  AudioCore,
  AudioEvents,
  AudioOptions,
  AudioProvider,
} from "@timeless/inner-kit";

export type WebAudioProviderOptions = { runtime?: typeof globalThis };

/** The provider owns media elements and speech utterances; callbacks never escape a stopped session. */
export function create_audio_provider(
  options: WebAudioProviderOptions = {},
): AudioProvider {
  const runtime = options.runtime || globalThis;
  let audio: HTMLAudioElement | null = null;
  let utterance: SpeechSynthesisUtterance | null = null;
  let settings: AudioOptions = { rate: 1, volume: 1 };
  const listeners: (() => void)[] = [];
  const synth = () => runtime.speechSynthesis;
  function silence_others() {
    for (const media of runtime.document?.querySelectorAll<HTMLMediaElement>(
      "audio,video",
    ) || []) {
      if (media !== audio) media.pause();
    }
  }
  function configure(next: AudioOptions) {
    settings = { ...settings, ...next };
    if (audio) {
      audio.playbackRate = settings.rate ?? 1;
      audio.volume = settings.volume ?? 1;
    }
  }
  function stop() {
    for (const detach of listeners.splice(0)) detach();
    if (utterance) {
      utterance.onend = null;
      utterance.onerror = null;
      utterance.onstart = null;
      utterance = null;
      synth()?.cancel();
    }
    if (audio) {
      const previous = audio;
      audio = null;
      previous.pause();
      previous.removeAttribute("src");
      previous.load();
    }
  }
  return {
    load(url, next, events) {
      stop();
      configure(next);
      const current = new runtime.Audio();
      audio = current;
      current.preload = "metadata";
      configure(settings);
      const listen = (name: string, handler: () => void) => {
        const active = () => {
          if (audio === current) handler();
        };
        current.addEventListener(name, active);
        listeners.push(() => current.removeEventListener(name, active));
      };
      listen("loadedmetadata", () => events.ready(current.duration));
      listen("durationchange", () =>
        events.time(current.currentTime, current.duration),
      );
      listen("timeupdate", () =>
        events.time(current.currentTime, current.duration),
      );
      listen("playing", events.playing);
      listen("pause", events.pause);
      listen("ended", events.end);
      listen("error", () =>
        events.error(current.error?.message || "Audio playback failed"),
      );
      current.src = url;
      current.load();
    },
    speak(text, next, events) {
      stop();
      configure(next);
      if (!synth() || !runtime.SpeechSynthesisUtterance)
        throw new Error("Speech synthesis is unavailable");
      silence_others();
      const current = new runtime.SpeechSynthesisUtterance(text);
      utterance = current;
      current.voice =
        synth()
          .getVoices()
          .find((voice) => voice.voiceURI === settings.voice) || null;
      current.lang = current.voice?.lang || settings.language || "";
      current.rate = settings.rate ?? 1;
      current.volume = settings.volume ?? 1;
      current.onstart = () => {
        if (utterance === current) events.playing();
      };
      current.onend = () => {
        if (utterance === current) events.end();
      };
      current.onerror = (event) => {
        if (
          utterance === current &&
          !["canceled", "interrupted"].includes(event.error)
        )
          events.error(event.error);
      };
      synth().resume();
      synth().speak(current);
    },
    play() {
      if (!audio) return Promise.reject(new Error("Audio has not been loaded"));
      silence_others();
      return audio.play();
    },
    pause() {
      if (audio) audio.pause();
      else if (utterance) synth()?.pause();
    },
    resume() {
      silence_others();
      if (audio) return audio.play();
      if (!utterance)
        return Promise.reject(new Error("Audio has not been loaded"));
      synth()?.resume();
      return Promise.resolve();
    },
    stop,
    seek(time) {
      if (!audio) throw new Error("Audio has not been loaded");
      audio.currentTime = time;
    },
    configure,
    voices: () =>
      (synth()?.getVoices() || []).map((voice) => ({
        id: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
      })),
    watchVoices(handler) {
      synth()?.addEventListener("voiceschanged", handler);
      return () => synth()?.removeEventListener("voiceschanged", handler);
    },
    destroy: stop,
  };
}

export function connect(
  player: AudioCore,
  options: WebAudioProviderOptions = {},
) {
  const runtime = options.runtime || globalThis;
  const provider = create_audio_provider(options);
  player.connect(provider);
  const media = runtime.navigator?.mediaSession;
  if (!media) return;
  const detach = player.onStateChange((state) => {
    try {
      media.playbackState =
        state.status === "playing" ? "playing" : state.kind ? "paused" : "none";
      if (state.kind === "audio" && state.duration > 0)
        media.setPositionState?.({
          duration: state.duration,
          position: Math.min(state.currentTime, state.duration),
          playbackRate: state.rate,
        });
      else media.setPositionState?.();
    } catch {
      /* Unsupported Media Session operations must not interrupt playback. */
    }
  });
  for (const [action, handler] of Object.entries({
    play: () => {
      void player.resume().catch(() => {});
    },
    pause: () => player.pause(),
    stop: () => player.stop(),
    seekto: (event: MediaSessionActionDetails) => {
      if (event.seekTime !== undefined) player.seek(event.seekTime);
    },
    seekbackward: (event: MediaSessionActionDetails) =>
      player.seek(
        Math.max(0, player.state.currentTime - (event.seekOffset || 10)),
      ),
    seekforward: (event: MediaSessionActionDetails) =>
      player.seek(
        Math.min(
          player.state.duration,
          player.state.currentTime + (event.seekOffset || 10),
        ),
      ),
  })) {
    try {
      media.setActionHandler(action as MediaSessionAction, handler);
    } catch {
      /* Optional OS action. */
    }
  }
  const destroy = provider.destroy;
  provider.destroy = () => {
    detach();
    destroy?.();
    for (const action of [
      "play",
      "pause",
      "stop",
      "seekto",
      "seekbackward",
      "seekforward",
    ] as MediaSessionAction[]) {
      try {
        media.setActionHandler(action, null);
      } catch {
        /* Optional OS action. */
      }
    }
  };
}
