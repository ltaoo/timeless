/**
 * Audio - A component for rendering audio elements.
 *
 * Native audio component with support for:
 * - Reactive src for dynamic audio changes
 * - Playback controls
 * - Common media attributes
 * - Standard audio events
 *
 * @example
 * ```tsx
 * <Audio
 *   src={audioUrl}
 *   controls
 *   onPlay={() => console.log("playing")}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { RawViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";
import { VNodeView } from "@/vnode/view";

import { Box, BoxProps } from "./box";

/** Props for Audio component */
export type AudioProps = BoxProps & {
  /** Audio source URL */
  src?: string | DerivedRef<string> | Ref<string>;
  /** Show native playback controls */
  controls?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Start playback automatically */
  autoplay?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Loop playback */
  loop?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Mute audio */
  muted?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Preload hint */
  preload?: "none" | "metadata" | "auto" | "" | DerivedRef<string> | Ref<string>;
  /** Cross-origin attribute */
  crossOrigin?:
    | "anonymous"
    | "use-credentials"
    | ""
    | DerivedRef<string>
    | Ref<string>;
  /** Load event handler */
  onLoad?(e: Event): void;
  /** Error event handler */
  onError?(e: Event): void;
  /** Play event handler */
  onPlay?(e: Event): void;
  /** Pause event handler */
  onPause?(e: Event): void;
  /** Ended event handler */
  onEnded?(e: Event): void;
  /** Time update event handler */
  onTimeUpdate?(e: Event): void;
  /** Loaded metadata event handler */
  onLoadedMetadata?(e: Event): void;
  onMounted?(
    event: MountedEvent<VNodeView<HTMLAudioElement>>,
  ): void | (() => void);
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

/** Internal state for Audio */
type AudioState = {
  rendered: boolean;
  src: string | null;
  style: RawViewStyleProperties;
  styleSet: string[];
};

/**
 * Creates an Audio component.
 *
 * @param props - Audio component props
 * @returns A TimelessElement representing an audio
 */
export function Audio(props: AudioProps) {
  const {
    src,
    controls,
    autoplay,
    loop,
    muted,
    preload,
    crossOrigin,
    onLoad,
    onError,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    ...rest
  } = props as AudioProps & Record<string, any>;

  let $elm: any = null;
  const box$ = Box<AudioState>(rest, {} as AudioState);

  const state = box$.state;
  const events = box$.events;

  const listener$ = ListenerManager();

  const methods = {
    subscribe_attr(attr: string, value: any) {
      if (value === undefined) {
        return;
      }
      const apply = (v: any) => {
        state.attributes[attr] = v === false ? undefined : v;
        if ($elm && typeof $elm.setAttribute === "function") {
          if (v === undefined || v === null || v === false) {
            $elm.removeAttribute(attr);
          } else if (v === true) {
            $elm.setAttribute(attr, "");
          } else {
            $elm.setAttribute(attr, String(v));
          }
        }
      };
      if (isRef(value)) {
        apply(value.value);
        const unsub = value.subscribe({
          onChange(v: any) {
            apply(v);
          },
        });
        listener$.push(unsub);
      } else {
        apply(value);
      }
    },

    subscribe_props() {
      box$.methods.subscribe_props();
      methods.subscribe_attr("controls", props.controls);
      methods.subscribe_attr("autoplay", props.autoplay);
      methods.subscribe_attr("loop", props.loop);
      methods.subscribe_attr("muted", props.muted);
      methods.subscribe_attr("preload", props.preload);
      methods.subscribe_attr("crossorigin", props.crossOrigin);
      if (props.src) {
        if (isRef(props.src)) {
          state.src = props.src.value;
          const unsub = props.src.subscribe({
            onChange(v: any) {
              state.src = v;
              if ($elm && $elm.setSrc) {
                $elm.setSrc(v);
              }
            },
          });
          listener$.push(unsub);
        } else {
          state.src = props.src;
        }
      }
      if (onLoad) {
        (events as any).onLoad = onLoad;
      }
      if (onError) {
        (events as any).onError = onError;
      }
      if (onPlay) {
        (events as any).onPlay = onPlay;
      }
      if (onPause) {
        (events as any).onPause = onPause;
      }
      if (onEnded) {
        (events as any).onEnded = onEnded;
      }
      if (onTimeUpdate) {
        (events as any).onTimeUpdate = onTimeUpdate;
      }
      if (onLoadedMetadata) {
        (events as any).onLoadedMetadata = onLoadedMetadata;
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "audio",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    state,
    events,
    onMounted(event: MountedEvent) {
      if (rest.onMounted) {
        rest.onMounted(event);
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      state.rendered = false;
    },
  };
}

export type Audio = ReturnType<typeof Audio>;

export function isAudio(v: any) {
  return v.t === "audio";
}
