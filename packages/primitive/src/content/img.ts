/**
 * Img - A component for rendering image elements.
 *
 * Native image component with support for:
 * - Reactive src/alt for dynamic image changes
 * - Loading states (lazy/eager)
 * - srcset for responsive images
 * - All standard img attributes
 *
 * @example
 * ```tsx
 * <Img
 *   src={imageUrl}
 *   alt="Description"
 *   loading="lazy"
 *   onLoad={() => console.log('loaded')}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { isClassNameRef, RawViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";
import { VNodeView } from "@/vnode/view";

import { Box, BoxProps } from "./box";

/** Props for Img component */
export type ImgProps = BoxProps & {
  /** Image source URL */
  src?: string | DerivedRef<string> | Ref<string>;
  /** Alternative text for accessibility */
  alt?: string | DerivedRef<string> | Ref<string>;
  /** Image width */
  width?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Image height */
  height?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Loading strategy: "lazy" or "eager" */
  loading?: "lazy" | "eager" | DerivedRef<string> | Ref<string>;
  /** Decoding strategy */
  decoding?: "async" | "sync" | "auto" | DerivedRef<string> | Ref<string>;
  /** Cross-origin attribute */
  crossOrigin?:
    | "anonymous"
    | "use-credentials"
    | ""
    | DerivedRef<string>
    | Ref<string>;
  /** Source set for responsive images */
  srcset?: string | Ref<string>;
  /** Sizes descriptor */
  sizes?: string | Ref<string>;
  /** Referrer policy */
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  /** Fetch priority */
  fetchPriority?: "high" | "low" | "auto" | DerivedRef<string> | Ref<string>;
  /** USEMap attribute */
  useMap?: string | DerivedRef<string> | Ref<string>;
  /** IsMap attribute */
  isMap?: boolean;
  /** Load event handler */
  onLoad?(e: Event): void;
  /** Error event handler */
  onError?(e: Event): void;
  onMounted?(
    event: MountedEvent<VNodeView<HTMLImageElement>>,
  ): void | (() => void);
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

/** Internal state for Img */
type ImgState = {
  rendered: boolean;
  src: string | null;
  style: RawViewStyleProperties;
  styleSet: string[];
};

/**
 * Creates an Img component.
 *
 * @param props - Image component props
 * @returns A TimelessElement representing an image
 */
export function Img(props: ImgProps) {
  // const host = getHost();
  const {
    src,
    alt,
    width,
    height,
    loading,
    decoding,
    crossOrigin,
    srcset,
    sizes,
    referrerPolicy,
    fetchPriority,
    useMap,
    isMap,
    onLoad,
    onError,
    ...rest
  } = props as ImgProps & Record<string, any>;

  let $elm: any = null;
  const box$ = Box<ImgState>(rest, {} as ImgState);

  const state = box$.state;
  const events = box$.events;

  const listener$ = ListenerManager();

  const methods = {
    apply_attr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm && typeof $elm.removeAttribute === "function") {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm && typeof $elm.setAttribute === "function") {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(k, String(v));
      }
    },

    // Helper: create event listener
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
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();

  return {
    t: "img",
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
      // Reset state for potential re-render
      // listener$.destroy();
      state.rendered = false;
    },
  };
}

export type Img = ReturnType<typeof Img>;

export function isImg(v: any) {
  return v.t === "img";
}
