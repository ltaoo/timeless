import {
  DerivedRef,
  Ref,
  isRef,
  isWriteableRef,
} from "@timeless/inner-reactive";

import { Box, BoxProps } from "@/content/box";
import {
  TimelessElement,
  ViewChildren,
  destroyElement,
  isElement,
} from "@/content/type";
import { MountedEvent } from "@/event";

export type SwiperOrientation = "horizontal" | "vertical";
export type SwiperPhase = "idle" | "dragging" | "settling";
type MaybeRef<T> = T | Ref<T> | DerivedRef<T>;

export type SwiperChangeEvent = {
  index: number;
  previousIndex: number;
};

export type SwiperState = {
  index: number;
  count: number;
  orientation: SwiperOrientation;
  threshold: number;
  resistance: number;
  duration: number;
  disabled: boolean;
  mousewheel: boolean;
  pullToRefresh: boolean;
  refreshThreshold: number;
  refreshHoldDistance: number;
  reachBottom: boolean;
  reachBottomThreshold: number;
};

export type SwiperRefreshEvent = {
  index: number;
  complete: () => void;
};

export type SwiperReachBottomEvent = {
  index: number;
  count: number;
};

export type SwiperProps = BoxProps & {
  /** Current zero-based slide index. Writable refs are updated after a swipe. */
  index?: MaybeRef<number>;
  /** Swipe axis. */
  orientation?: MaybeRef<SwiperOrientation>;
  /** 0..1 means a viewport ratio; values greater than 1 mean pixels. */
  threshold?: MaybeRef<number>;
  /** Initial edge response; resistance grows progressively with drag distance. */
  resistance?: MaybeRef<number>;
  /** Transition duration in milliseconds. */
  duration?: MaybeRef<number>;
  disabled?: MaybeRef<boolean>;
  /** Enables wheel navigation on DOM hosts. */
  mousewheel?: MaybeRef<boolean>;
  /** Enables pull-to-refresh at the leading edge. */
  pullToRefresh?: MaybeRef<boolean>;
  /** Pull distance in pixels required to start refreshing. */
  refreshThreshold?: MaybeRef<number>;
  /** Track offset kept visible while the refresh promise is pending. */
  refreshHoldDistance?: MaybeRef<number>;
  /** Number of remaining slides at which onReachBottom should fire. */
  reachBottomThreshold?: MaybeRef<number>;
  onChange?: (event: SwiperChangeEvent) => void;
  onSwipeStart?: (state: SwiperHostState) => void;
  onSwipeMove?: (state: SwiperHostState) => void;
  onSwipeEnd?: (event: SwiperChangeEvent & { changed: boolean }) => void;
  onRefresh?: (event: SwiperRefreshEvent) => void | Promise<unknown>;
  onReachBottom?: (event: SwiperReachBottomEvent) => void | Promise<unknown>;
};

export type SwiperHostState = {
  index: number;
  count: number;
  size: number;
  offset: number;
  orientation: SwiperOrientation;
  phase: SwiperPhase;
  disabled: boolean;
  pullDistance: number;
  refreshing: boolean;
};

type SwiperHost = {
  mount(): void;
  unmount(): void;
  destroy(): void;
  setOptions(options: Partial<SwiperState>): void;
  slideTo(index: number, animated?: boolean): boolean;
  next(animated?: boolean): boolean;
  previous(animated?: boolean): boolean;
  finishRefresh(): boolean;
};

function number_or(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Creates a platform-neutral swiper container.
 *
 * Each direct child should be wrapped with {@link SwiperItem}.
 */
export function Swiper(props: SwiperProps = {}, children?: ViewChildren) {
  const {
    index = 0,
    orientation = "horizontal",
    threshold = 1 / 3,
    resistance = 0.24,
    duration = 300,
    disabled = false,
    mousewheel = false,
    pullToRefresh = false,
    refreshThreshold = 72,
    refreshHoldDistance = 48,
    reachBottomThreshold = 0,
    onChange,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    onRefresh,
    onReachBottom,
    ...rest
  } = props;
  let $elm: SwiperHost | null = null;
  let syncing_index = false;
  const mount_cleanups: (() => void)[] = [];
  const state: SwiperState = {
    index: 0,
    count: 0,
    orientation: "horizontal",
    threshold: 1 / 3,
    resistance: 0.24,
    duration: 300,
    disabled: false,
    mousewheel: false,
    pullToRefresh: false,
    refreshThreshold: 72,
    refreshHoldDistance: 48,
    reachBottom: Boolean(onReachBottom),
    reachBottomThreshold: 0,
  };
  const box$ = Box<SwiperState>(rest, state);

  function subscribe_option<T>(
    key: keyof SwiperState,
    value: MaybeRef<T>,
    normalize: (value: T) => SwiperState[typeof key],
  ) {
    const apply = (next_value: T) => {
      (box$.state as any)[key] = normalize(next_value);
      $elm?.setOptions({ [key]: (box$.state as any)[key] });
    };
    if (isRef(value)) {
      apply(value.value);
      box$.methods.unsubscribe(value.subscribe({ onChange: apply }));
    } else {
      apply(value as T);
    }
  }

  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);
  box$.state.count = box$.state.children.filter(Boolean).length;
  subscribe_option("orientation", orientation, (value) =>
    value === "vertical" ? "vertical" : "horizontal",
  );
  subscribe_option("threshold", threshold, (value) =>
    Math.max(0, number_or(value, 1 / 3)),
  );
  subscribe_option("resistance", resistance, (value) =>
    Math.max(0, Math.min(1, number_or(value, 0.24))),
  );
  subscribe_option("duration", duration, (value) =>
    Math.max(0, number_or(value, 300)),
  );
  subscribe_option("disabled", disabled, Boolean);
  subscribe_option("mousewheel", mousewheel, Boolean);
  subscribe_option("pullToRefresh", pullToRefresh, Boolean);
  subscribe_option("refreshThreshold", refreshThreshold, (value) =>
    Math.max(1, number_or(value, 72)),
  );
  subscribe_option("refreshHoldDistance", refreshHoldDistance, (value) =>
    Math.max(0, number_or(value, 48)),
  );
  subscribe_option("reachBottomThreshold", reachBottomThreshold, (value) =>
    Math.max(0, Math.floor(number_or(value, 0))),
  );

  const apply_index = (value: number) => {
    const next_index = Math.max(
      0,
      Math.min(
        Math.max(0, box$.state.count - 1),
        Math.floor(number_or(value, 0)),
      ),
    );
    box$.state.index = next_index;
    if (!syncing_index) $elm?.slideTo(next_index, true);
  };
  if (isRef(index)) {
    apply_index(index.value);
    box$.methods.unsubscribe(index.subscribe({ onChange: apply_index }));
  } else {
    apply_index(index);
  }

  const methods = {
    slideTo(next_index: number, animated = true) {
      return $elm?.slideTo(next_index, animated) ?? false;
    },
    next(animated = true) {
      return $elm?.next(animated) ?? false;
    },
    previous(animated = true) {
      return $elm?.previous(animated) ?? false;
    },
    finishRefresh() {
      return $elm?.finishRefresh() ?? false;
    },
  };

  const element = {
    t: "swiper",
    get $elm() {
      return $elm;
    },
    set $elm(value: SwiperHost | null) {
      box$.methods.set$elm(value);
      $elm = value;
    },
    state: box$.state,
    children: box$.state.children,
    events: box$.events,
    methods,
    handleChange(event: SwiperChangeEvent) {
      box$.state.index = event.index;
      if (isWriteableRef(index) && index.value !== event.index) {
        syncing_index = true;
        index.as(event.index);
        syncing_index = false;
      }
      onChange?.(event);
    },
    handleSwipeStart(state: SwiperHostState) {
      onSwipeStart?.(state);
    },
    handleSwipeMove(state: SwiperHostState) {
      onSwipeMove?.(state);
    },
    handleSwipeEnd(event: SwiperChangeEvent & { changed: boolean }) {
      onSwipeEnd?.(event);
    },
    handleRefresh(event: { index: number }) {
      let completed = false;
      const complete = () => {
        if (completed) return;
        completed = true;
        $elm?.finishRefresh();
      };
      if (!onRefresh) {
        complete();
        return;
      }
      try {
        Promise.resolve(onRefresh({ ...event, complete })).then(
          complete,
          complete,
        );
      } catch {
        complete();
      }
    },
    handleReachBottom(event: SwiperReachBottomEvent) {
      try {
        Promise.resolve(onReachBottom?.(event)).catch(() => {});
      } catch {}
    },
    onMounted(event: MountedEvent) {
      box$.state.rendered = true;
      $elm?.mount();
      const cleanup = rest.onMounted?.(event);
      if (typeof cleanup === "function") mount_cleanups.push(cleanup);
      for (const child of box$.state.children) {
        if (isElement(child)) child.onMounted?.({ target: child.$elm });
      }
    },
    beforeUnmounted() {
      rest.beforeUnmounted?.();
      for (const child of box$.state.children) child?.beforeUnmounted?.();
    },
    onUnmounted() {
      for (const cleanup of mount_cleanups) cleanup();
      mount_cleanups.length = 0;
      $elm?.unmount();
      rest.onUnmounted?.();
      box$.state.rendered = false;
      box$.methods.set$elm(null);
      $elm = null;
    },
    destroy() {
      const host = $elm;
      element.onUnmounted();
      host?.destroy();
      box$.methods.destroy();
      for (const child of box$.state.children) destroyElement(child);
    },
  };

  return element;
}

export type SwiperItemProps = BoxProps;

/** Creates one full-size slide inside a {@link Swiper}. */
export function SwiperItem(
  props: SwiperItemProps = {},
  children?: ViewChildren,
) {
  const box$ = Box(props, {});
  let $elm: any = null;
  const mount_cleanups: (() => void)[] = [];
  box$.methods.subscribe_props();
  box$.methods.add_event();
  box$.methods.build_children(children);

  const element: TimelessElement = {
    t: "swiper-item",
    get $elm() {
      return $elm;
    },
    set $elm(value) {
      box$.methods.set$elm(value);
      $elm = value;
    },
    state: box$.state,
    children: box$.state.children,
    events: box$.events,
    onMounted(event: MountedEvent) {
      box$.state.rendered = true;
      const cleanup = props.onMounted?.(event);
      if (typeof cleanup === "function") mount_cleanups.push(cleanup);
      for (const child of box$.state.children) {
        if (isElement(child)) child.onMounted?.({ target: child.$elm });
      }
    },
    beforeUnmounted() {
      props.beforeUnmounted?.();
      for (const child of box$.state.children) child?.beforeUnmounted?.();
    },
    onUnmounted() {
      for (const cleanup of mount_cleanups) cleanup();
      mount_cleanups.length = 0;
      props.onUnmounted?.();
      box$.state.rendered = false;
      box$.methods.set$elm(null);
      $elm = null;
    },
    destroy() {
      element.onUnmounted();
      box$.methods.destroy();
      for (const child of box$.state.children) destroyElement(child);
    },
  };

  return element;
}
