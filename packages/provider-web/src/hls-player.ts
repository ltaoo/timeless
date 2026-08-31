import type {
  HLSPlayerCore,
  HLSPlayerMountOptions,
  HLSPlayerSession,
  HLSPlayerState,
} from "@timeless/inner-kit";

type HLSPlayerInstance = {
  attachMedia: (video: HTMLVideoElement) => void;
  destroy: () => void;
  loadSource: (url: string) => void;
  on: (
    event: string,
    handler: (
      event: unknown,
      data?: { fatal?: boolean; type?: string },
    ) => void,
  ) => void;
  recoverMediaError: () => void;
  startLoad: () => void;
};

type HLSConstructor = {
  new (options: Record<string, unknown>): HLSPlayerInstance;
  isSupported: () => boolean;
  Events: {
    ERROR: string;
    MANIFEST_PARSED: string;
  };
  ErrorTypes: {
    MEDIA_ERROR: string;
    NETWORK_ERROR: string;
  };
};

export type HLSPlayerProviderOptions = {
  Hls?: HLSConstructor;
  fetch?: (url: string, options: RequestInit) => Promise<{ ok: boolean }>;
};

function resolve_video(target: unknown): HTMLVideoElement | null {
  let current =
    target && typeof target === "object" && "target" in target
      ? (target as { target: unknown }).target
      : target;
  for (let depth = 0; depth < 4; depth += 1) {
    if (
      current &&
      typeof (current as HTMLVideoElement).addEventListener === "function" &&
      typeof (current as HTMLVideoElement).canPlayType === "function"
    ) {
      return current as HTMLVideoElement;
    }
    if (current && typeof (current as any).get$elm === "function") {
      current = (current as any).get$elm();
      continue;
    }
    if (current && (current as any).$elm) {
      current = (current as any).$elm;
      continue;
    }
    break;
  }
  return null;
}

function play(video: HTMLVideoElement) {
  const result = video.play();
  result?.catch?.(() => {});
}

export function connect(
  player: HLSPlayerCore,
  provider_options: HLSPlayerProviderOptions = {},
) {
  const Hls =
    provider_options.Hls ||
    (globalThis as typeof globalThis & { Hls?: HLSConstructor }).Hls;
  const fetch_source =
    provider_options.fetch || globalThis.fetch?.bind(globalThis);
  let next_session = 0;
  let current_session: HLSPlayerSession | null = null;
  let video: HTMLVideoElement | null = null;
  let hls: HLSPlayerInstance | null = null;
  let poll_timer: ReturnType<typeof setTimeout> | null = null;
  let poll_controller: AbortController | null = null;
  let remove_listeners: (() => void) | null = null;
  let source_loaded = false;

  function set_state(state: HLSPlayerState) {
    player.handleStateChange(state);
  }

  function clear_poll() {
    if (poll_timer !== null) {
      clearTimeout(poll_timer);
      poll_timer = null;
    }
    poll_controller?.abort();
    poll_controller = null;
  }

  function teardown(reset_state: boolean) {
    current_session = null;
    clear_poll();
    remove_listeners?.();
    remove_listeners = null;
    hls?.destroy();
    hls = null;
    if (video && source_loaded) {
      video.removeAttribute("src");
      video.load();
    }
    video = null;
    source_loaded = false;
    if (reset_state) {
      set_state({ status: "idle", reason: "idle" });
    }
  }

  function schedule_probe(
    session: HLSPlayerSession,
    options: HLSPlayerMountOptions,
  ) {
    if (session !== current_session) return;
    const interval = Math.max(100, Number(options.pollInterval) || 1000);
    poll_timer = setTimeout(() => {
      poll_timer = null;
      void probe(session, options);
    }, interval);
  }

  function start_player(
    session: HLSPlayerSession,
    options: HLSPlayerMountOptions,
  ) {
    if (session !== current_session || !video) return;
    const mounted_video = video;
    source_loaded = true;
    set_state({ status: "loading", reason: "source-loading" });

    const handle_playing = () => {
      if (session === current_session) {
        set_state({ status: "playing", reason: "playing" });
      }
    };
    const handle_waiting = () => {
      if (session === current_session) {
        set_state({ status: "loading", reason: "buffering" });
      }
    };
    mounted_video.addEventListener("playing", handle_playing);
    mounted_video.addEventListener("waiting", handle_waiting);
    remove_listeners = () => {
      mounted_video.removeEventListener("playing", handle_playing);
      mounted_video.removeEventListener("waiting", handle_waiting);
    };

    const hls_supported = Boolean(Hls && Hls.isSupported());
    if (
      !hls_supported &&
      mounted_video.canPlayType("application/vnd.apple.mpegurl")
    ) {
      const handle_loaded_metadata = () => {
        if (
          session !== current_session ||
          mounted_video.seekable.length === 0
        ) {
          return;
        }
        try {
          mounted_video.currentTime = mounted_video.seekable.start(0);
        } catch {
          // The seekable window can change between the length and start calls.
        }
      };
      const handle_error = () => {
        if (session === current_session) {
          set_state({ status: "error", reason: "playback-error" });
        }
      };
      const remove_common_listeners = remove_listeners;
      mounted_video.addEventListener("loadedmetadata", handle_loaded_metadata);
      mounted_video.addEventListener("error", handle_error);
      remove_listeners = () => {
        remove_common_listeners?.();
        mounted_video.removeEventListener(
          "loadedmetadata",
          handle_loaded_metadata,
        );
        mounted_video.removeEventListener("error", handle_error);
      };
      mounted_video.src = options.url;
      mounted_video.load();
      if (options.autoplay) play(mounted_video);
      return;
    }

    if (!hls_supported || !Hls) {
      set_state({ status: "error", reason: "unsupported" });
      return;
    }

    const instance = new Hls({
      startPosition: 0,
      liveDurationInfinity: true,
      maxBufferLength: 60,
      backBufferLength: 600,
    });
    hls = instance;
    instance.on(Hls.Events.MANIFEST_PARSED, () => {
      if (session !== current_session) return;
      set_state({ status: "ready", reason: "source-ready" });
      if (options.autoplay) play(mounted_video);
    });
    instance.on(Hls.Events.ERROR, (_event, data) => {
      if (session !== current_session || !data?.fatal) return;
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        set_state({ status: "loading", reason: "network-retry" });
        instance.startLoad();
        return;
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        set_state({ status: "loading", reason: "media-recovery" });
        instance.recoverMediaError();
        return;
      }
      set_state({ status: "error", reason: "playback-error" });
      instance.destroy();
      if (hls === instance) hls = null;
    });
    instance.loadSource(options.url);
    instance.attachMedia(mounted_video);
  }

  async function probe(
    session: HLSPlayerSession,
    options: HLSPlayerMountOptions,
  ) {
    if (session !== current_session) return;
    if (!fetch_source) {
      set_state({ status: "error", reason: "unsupported" });
      return;
    }
    const controller = new AbortController();
    poll_controller = controller;
    let response: { ok: boolean } | null = null;
    try {
      response = await fetch_source(options.url, {
        method: "HEAD",
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
    } finally {
      if (poll_controller === controller) poll_controller = null;
    }
    if (session !== current_session) return;
    if (response?.ok) {
      start_player(session, options);
      return;
    }
    if (options.terminal) {
      set_state({ status: "error", reason: "source-missing" });
      return;
    }
    set_state({ status: "waiting", reason: "waiting-source" });
    schedule_probe(session, options);
  }

  player.mount = (target, options) => {
    teardown(false);
    const mounted_video = resolve_video(target);
    if (!mounted_video) {
      set_state({ status: "error", reason: "invalid-target" });
      return null;
    }
    const url = String(options?.url || "").trim();
    if (!url) {
      set_state({ status: "error", reason: "invalid-source" });
      return null;
    }
    const session = ++next_session;
    current_session = session;
    video = mounted_video;
    const mount_options = { ...options, url };
    set_state({ status: "waiting", reason: "waiting-source" });
    void probe(session, mount_options);
    return session;
  };

  player.unmount = (session) => {
    if (typeof session === "number" && session !== current_session) {
      return false;
    }
    teardown(true);
    return true;
  };
}
