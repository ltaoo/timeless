/**
 * Video - A component for rendering video elements.
 *
 * Native video component with support for:
 * - Reactive src for dynamic video changes
 * - Playback controls
 * - Poster images
 * - All standard video attributes
 *
 * @example
 * ```tsx
 * <Video
 *   src={videoUrl}
 *   controls
 *   poster={posterUrl}
 *   onPlay={() => console.log("playing")}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { RawViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";
import { VNodeView } from "@/vnode/view";

import { Box, BoxProps } from "./box";

/** Props for Video component */
export type VideoProps = BoxProps & {
  /** Video source URL */
  src?: string | DerivedRef<string> | Ref<string>;
  /** Poster image URL */
  poster?: string | DerivedRef<string> | Ref<string>;
  /** Video width */
  width?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Video height */
  height?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Show native playback controls */
  controls?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Start playback automatically */
  autoplay?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Loop playback */
  loop?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Mute audio */
  muted?: boolean | DerivedRef<boolean> | Ref<boolean>;
  /** Plays inline on mobile browsers */
  playsInline?: boolean | DerivedRef<boolean> | Ref<boolean>;
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
    event: MountedEvent<VNodeView<HTMLVideoElement>>,
  ): void | (() => void);
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

/** Internal state for Video */
type VideoState = {
  rendered: boolean;
  src: string | null;
  style: RawViewStyleProperties;
  styleSet: string[];
};

/**
 * Creates a Video component.
 *
 * @param props - Video component props
 * @returns A TimelessElement representing a video
 */
export function Video(props: VideoProps) {
  const {
    src,
    poster,
    width,
    height,
    controls,
    autoplay,
    loop,
    muted,
    playsInline,
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
  } = props as VideoProps & Record<string, any>;

  let $elm: any = null;
  const box$ = Box<VideoState>(rest, {} as VideoState);

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

    apply_attr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        if ($elm && typeof $elm.removeAttribute === "function") {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        if ($elm && typeof $elm.setAttribute === "function") {
          $elm.setAttribute(k, "");
        }
        return;
      }
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(k, String(v));
      }
    },

    listen(
      target: any,
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      target.addEventListener(type, handler, options);
      listener$.push(function () {
        target.removeEventListener(type, handler, options);
      });
    },

    subscribe_props() {
      box$.methods.subscribe_props();
      methods.subscribe_attr("poster", props.poster);
      methods.subscribe_attr("width", props.width);
      methods.subscribe_attr("height", props.height);
      methods.subscribe_attr("controls", props.controls);
      methods.subscribe_attr("autoplay", props.autoplay);
      methods.subscribe_attr("loop", props.loop);
      methods.subscribe_attr("muted", props.muted);
      methods.subscribe_attr("playsinline", props.playsInline);
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
    t: "video",
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

export type Video = ReturnType<typeof Video>;

export function isVideo(v: any) {
  return v.t === "video";
}
