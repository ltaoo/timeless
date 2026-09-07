import { TimelessElement, VNodeView, vm } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import { HostElement } from "./box";

type Orientation = "horizontal" | "vertical";
type Point = { x: number; y: number };
type ScrollGesture = {
  target: HTMLElement;
  start_point: Point;
  start_top: number;
  scrolling: boolean;
};
type InlineTouchAction = {
  value: string;
  priority: string;
};
type SwiperElement = TimelessElement & {
  state: TimelessElement["state"] & {
    index: number;
    count: number;
    orientation: Orientation;
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
  handleChange?(event: { index: number; previousIndex: number }): void;
  handleSwipeStart?(state: unknown): void;
  handleSwipeMove?(state: unknown): void;
  handleSwipeEnd?(event: {
    index: number;
    previousIndex: number;
    changed: boolean;
  }): void;
  handleRefresh?(event: { index: number }): void;
  handleReachBottom?(event: { index: number; count: number }): void;
};

export type DOMSwiper = VNodeView<HTMLDivElement> & {
  t: "swiper";
  mount(): void;
  unmount(): void;
  destroy(): void;
  setOptions(options: Record<string, unknown>): void;
  slideTo(index: number, animated?: boolean): boolean;
  next(animated?: boolean): boolean;
  previous(animated?: boolean): boolean;
  finishRefresh(): boolean;
};

export function DOMSwiper(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: SwiperElement;
}): DOMSwiper {
  const box$ = HostElement({ $elm: null, t: "swiper", build: props.build });
  const core = new vm.SwiperCore({
    index: props.elm.state.index,
    count: props.elm.state.count,
    orientation: props.elm.state.orientation,
    threshold: props.elm.state.threshold,
    resistance: props.elm.state.resistance,
    disabled: props.elm.state.disabled,
    pullToRefresh: props.elm.state.pullToRefresh,
    refreshThreshold: props.elm.state.refreshThreshold,
    refreshHoldDistance: props.elm.state.refreshHoldDistance,
    reachBottom: props.elm.state.reachBottom,
    reachBottomThreshold: props.elm.state.reachBottomThreshold,
  });
  let $root: HTMLDivElement | null = null;
  let $track: HTMLDivElement | null = null;
  let $refresh_indicator: HTMLDivElement | null = null;
  let mounted = false;
  let touch_identifier: number | null = null;
  let transition_timer: ReturnType<typeof setTimeout> | null = null;
  let resize_observer: ResizeObserver | null = null;
  let mutation_observer: MutationObserver | null = null;
  let last_wheel_at = 0;
  let suppress_scroll_click_until = 0;
  let scroll_gesture: ScrollGesture | null = null;
  const scroll_touch_actions = new Map<HTMLElement, InlineTouchAction>();
  let duration = props.elm.state.duration;
  let mousewheel = props.elm.state.mousewheel;
  const event_cleanups: (() => void)[] = [];
  const core_cleanups: (() => void)[] = [];

  function listen(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean,
  ) {
    target.addEventListener(type, handler, options);
    event_cleanups.push(() =>
      target.removeEventListener(type, handler, options),
    );
  }

  function read_point(event: { clientX: number; clientY: number }) {
    return { x: event.clientX, y: event.clientY };
  }

  function find_scrollable_target(target: EventTarget | null) {
    if (!$root || !(target instanceof HTMLElement)) return null;
    let candidate: HTMLElement | null = target;
    while (candidate && candidate !== $root) {
      const style = getComputedStyle(candidate);
      if (
        /(auto|scroll)/.test(style.overflowY) &&
        candidate.scrollHeight > candidate.clientHeight + 1
      ) {
        return candidate;
      }
      candidate = candidate.parentElement;
    }
    return null;
  }

  function begin_scroll_gesture(target: EventTarget | null, point: Point) {
    const scroll_target = find_scrollable_target(target);
    scroll_gesture = scroll_target
      ? {
          target: scroll_target,
          start_point: point,
          start_top: scroll_target.scrollTop,
          scrolling: false,
        }
      : null;
  }

  function move_scroll_gesture(point: Point) {
    if (!scroll_gesture || core.state.orientation !== "vertical") return false;
    const distance_x = point.x - scroll_gesture.start_point.x;
    const distance_y = point.y - scroll_gesture.start_point.y;
    if (!scroll_gesture.scrolling) {
      if (Math.hypot(distance_x, distance_y) < 8) return false;
      if (Math.abs(distance_y) <= Math.abs(distance_x) * 1.1) return false;
      const max_top =
        scroll_gesture.target.scrollHeight - scroll_gesture.target.clientHeight;
      const can_scroll =
        (distance_y < 0 && scroll_gesture.start_top < max_top) ||
        (distance_y > 0 && scroll_gesture.start_top > 0);
      if (!can_scroll) return false;
      scroll_gesture.scrolling = true;
      suppress_scroll_click_until = Date.now() + 480;
      core.cancelSwipe();
    }
    scroll_gesture.target.scrollTop = Math.max(
      0,
      Math.min(
        scroll_gesture.target.scrollHeight - scroll_gesture.target.clientHeight,
        scroll_gesture.start_top - distance_y,
      ),
    );
    return true;
  }

  function end_scroll_gesture() {
    const consumed = scroll_gesture?.scrolling ?? false;
    if (
      consumed &&
      scroll_gesture &&
      scroll_gesture.target.scrollTop >=
        scroll_gesture.target.scrollHeight -
          scroll_gesture.target.clientHeight -
          1
    ) {
      core.next(false);
    }
    scroll_gesture = null;
    return consumed;
  }

  function restore_scroll_touch_actions() {
    for (const [target, previous] of scroll_touch_actions) {
      if (target.style.getPropertyValue("touch-action") !== "none") continue;
      if (previous.value) {
        target.style.setProperty(
          "touch-action",
          previous.value,
          previous.priority,
        );
      } else {
        target.style.removeProperty("touch-action");
      }
    }
    scroll_touch_actions.clear();
  }

  function sync_scroll_touch_actions() {
    if (!$root || core.state.orientation !== "vertical") {
      restore_scroll_touch_actions();
      return;
    }
    const active_targets = new Set<HTMLElement>();
    for (const target of Array.from($root.querySelectorAll<HTMLElement>("*"))) {
      if (!/(auto|scroll)/.test(getComputedStyle(target).overflowY)) continue;
      active_targets.add(target);
      if (getComputedStyle(target).touchAction === "none") continue;
      if (!scroll_touch_actions.has(target)) {
        scroll_touch_actions.set(target, {
          value: target.style.getPropertyValue("touch-action"),
          priority: target.style.getPropertyPriority("touch-action"),
        });
      }
      target.style.setProperty("touch-action", "none");
    }
    for (const [target, previous] of scroll_touch_actions) {
      if (active_targets.has(target)) continue;
      if (target.style.getPropertyValue("touch-action") === "none") {
        if (previous.value) {
          target.style.setProperty(
            "touch-action",
            previous.value,
            previous.priority,
          );
        } else {
          target.style.removeProperty("touch-action");
        }
      }
      scroll_touch_actions.delete(target);
    }
  }

  function configure_layout() {
    if (!$root || !$track) return;
    const vertical = core.state.orientation === "vertical";
    // The consumer owns the root geometry. Inline position/size defaults would
    // override class-based layouts such as `position: absolute; inset: ...`.
    $root.style.overflow = "hidden";
    $root.style.touchAction = vertical ? "pan-x" : "pan-y";
    $root.style.userSelect = "none";
    $root.style.webkitUserSelect = "none";
    $track.style.display = "flex";
    $track.style.width = "100%";
    $track.style.height = "100%";
    $track.style.flexDirection = vertical ? "column" : "row";
    $track.style.willChange = "transform";
    for (const child of Array.from($track.children) as HTMLElement[]) {
      child.style.flex = "0 0 100%";
      child.style.width = "100%";
      child.style.height = "100%";
      child.style.minWidth = "0";
      child.style.minHeight = "0";
    }
    core.setCount($track.children.length);
    sync_scroll_touch_actions();
  }

  function configure_refresh_indicator() {
    if (!$root) return;
    if (!core.pullToRefresh) {
      $refresh_indicator?.remove();
      $refresh_indicator = null;
      return;
    }
    if ($refresh_indicator) return;
    $refresh_indicator = document.createElement("div");
    $refresh_indicator.setAttribute("data-swiper-refresh", "");
    $refresh_indicator.setAttribute("role", "status");
    Object.assign($refresh_indicator.style, {
      position: "absolute",
      zIndex: "2",
      top: "0",
      right: "0",
      left: "0",
      display: "flex",
      height: `${core.refreshHoldDistance}px`,
      alignItems: "center",
      justifyContent: "center",
      color: "inherit",
      fontSize: "13px",
      pointerEvents: "none",
      transform: "translate3d(0, -100%, 0)",
      willChange: "transform, opacity",
    });
    $refresh_indicator.textContent = "下拉刷新";
    $root.insertBefore($refresh_indicator, $track);
  }

  function clear_transition_timer() {
    if (transition_timer !== null) clearTimeout(transition_timer);
    transition_timer = null;
  }

  function finish_transition() {
    clear_transition_timer();
    core.finishTransition();
  }

  function apply_state(state: InstanceType<typeof vm.SwiperCore>["state"]) {
    if (!$root || !$track) return;
    const position = -state.index * state.size + state.offset;
    $track.style.transition =
      state.phase === "settling"
        ? `transform ${duration}ms cubic-bezier(0.22, 0.72, 0.2, 1)`
        : "none";
    $track.style.transform =
      state.orientation === "vertical"
        ? `translate3d(0, ${position}px, 0)`
        : `translate3d(${position}px, 0, 0)`;
    $root.dataset.swiperIndex = String(state.index);
    $root.dataset.swiperPhase = state.phase;
    $root.dataset.swiperOrientation = state.orientation;
    $root.setAttribute("aria-live", state.phase === "idle" ? "polite" : "off");
    if ($refresh_indicator) {
      const progress = Math.min(1, state.pullDistance / core.refreshThreshold);
      const refresh_state = state.refreshing
        ? "refreshing"
        : progress >= 1
          ? "ready"
          : progress > 0
            ? "pulling"
            : "idle";
      const shown_distance = state.refreshing
        ? core.refreshHoldDistance
        : progress * core.refreshHoldDistance;
      $refresh_indicator.dataset.swiperRefreshState = refresh_state;
      $refresh_indicator.style.setProperty(
        "--swiper-refresh-progress",
        String(progress),
      );
      $refresh_indicator.style.height = `${core.refreshHoldDistance}px`;
      $refresh_indicator.style.opacity = String(
        state.refreshing ? 1 : Math.max(0, progress),
      );
      $refresh_indicator.style.transform = `translate3d(0, ${shown_distance - core.refreshHoldDistance}px, 0)`;
      $refresh_indicator.textContent = state.refreshing
        ? "正在刷新…"
        : progress >= 1
          ? "释放刷新"
          : "下拉刷新";
    }

    clear_transition_timer();
    if (state.phase === "settling") {
      if (duration === 0) queueMicrotask(finish_transition);
      else transition_timer = setTimeout(finish_transition, duration + 80);
    }
  }

  function measure() {
    if (!$root) return;
    sync_scroll_touch_actions();
    const rect = $root.getBoundingClientRect();
    core.setSize(
      core.state.orientation === "vertical" ? rect.height : rect.width,
    );
  }

  function attach_input_events() {
    if (!$root || !$track) return;

    if (typeof globalThis.PointerEvent === "function") {
      listen($root, "pointerdown", ((event: PointerEvent) => {
        if (
          event.isPrimary === false ||
          (event.button !== undefined && event.button !== 0)
        ) {
          return;
        }
        const point = read_point(event);
        begin_scroll_gesture(event.target, point);
        core.beginSwipe(point);
      }) as EventListener);
      listen(
        $root,
        "pointermove",
        ((event: PointerEvent) => {
          if (move_scroll_gesture(read_point(event))) {
            $root?.setPointerCapture?.(event.pointerId);
            event.preventDefault();
            return;
          }
          if (core.moveSwipe(read_point(event))) {
            $root?.setPointerCapture?.(event.pointerId);
            event.preventDefault();
          }
        }) as EventListener,
        { passive: false },
      );
      listen($root, "pointerup", ((event: PointerEvent) => {
        const scrolled = end_scroll_gesture();
        const consumed = scrolled ? false : core.endSwipe(read_point(event));
        if ($root?.hasPointerCapture?.(event.pointerId)) {
          $root.releasePointerCapture(event.pointerId);
        }
        if (consumed) event.preventDefault();
      }) as EventListener);
      listen($root, "pointercancel", (() => {
        end_scroll_gesture();
        core.cancelSwipe();
      }) as EventListener);
    } else {
      listen(
        $root,
        "touchstart",
        ((event: TouchEvent) => {
          if (event.touches.length !== 1) return;
          const touch = event.touches[0];
          touch_identifier = touch.identifier;
          const point = read_point(touch);
          begin_scroll_gesture(event.target, point);
          core.beginSwipe(point);
        }) as EventListener,
        { passive: true },
      );
      listen(
        $root,
        "touchmove",
        ((event: TouchEvent) => {
          const touch = Array.from(event.touches).find(
            (candidate) => candidate.identifier === touch_identifier,
          );
          if (
            touch &&
            (move_scroll_gesture(read_point(touch)) ||
              core.moveSwipe(read_point(touch)))
          ) {
            event.preventDefault();
          }
        }) as EventListener,
        { passive: false },
      );
      listen($root, "touchend", ((event: TouchEvent) => {
        const touch = Array.from(event.changedTouches).find(
          (candidate) => candidate.identifier === touch_identifier,
        );
        const scrolled = end_scroll_gesture();
        if (touch && !scrolled && core.endSwipe(read_point(touch))) {
          event.preventDefault();
        }
        touch_identifier = null;
      }) as EventListener);
      listen($root, "touchcancel", (() => {
        touch_identifier = null;
        end_scroll_gesture();
        core.cancelSwipe();
      }) as EventListener);
    }

    listen(
      $root,
      "click",
      ((event: MouseEvent) => {
        if (
          !core.shouldSuppressClick() &&
          Date.now() >= suppress_scroll_click_until
        ) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
      }) as EventListener,
      true,
    );
    listen($track, "transitionend", ((event: TransitionEvent) => {
      if (event.target === $track && event.propertyName === "transform") {
        finish_transition();
      }
    }) as EventListener);
    listen(
      $root,
      "wheel",
      ((event: WheelEvent) => {
        if (!mousewheel || Math.abs(event.deltaY) < 12) return;
        const now = Date.now();
        if (now - last_wheel_at < duration + 120) return;
        last_wheel_at = now;
        const changed = event.deltaY > 0 ? core.next() : core.previous();
        if (changed) event.preventDefault();
      }) as EventListener,
      { passive: false },
    );
    listen($root, "keydown", ((event: KeyboardEvent) => {
      const previous_key =
        core.state.orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const next_key =
        core.state.orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      if (event.key !== previous_key && event.key !== next_key) return;
      const changed = event.key === next_key ? core.next() : core.previous();
      if (changed) event.preventDefault();
    }) as EventListener);
  }

  function hydrate_children($container: HTMLDivElement) {
    const child_nodes: VNodeView[] = [];
    const child_elements: (TimelessElement | null)[] = [];
    const host_children = Array.from($container.childNodes) as HTMLElement[];
    for (let index = 0; index < (props.elm.children?.length ?? 0); index += 1) {
      const child = props.elm.children?.[index] ?? null;
      child_elements.push(child);
      if (!child || !host_children[index]) continue;
      const child_node = hydrate_node(child, host_children[index], {
        $parent: $container,
        offset: index,
        idx: index,
      });
      if (child_node) child_nodes.push(child_node);
    }
    box$.methods.set$childrne(host_children);
    box$.methods.setchildrenelement(child_elements);
    box$.methods.setchildnode(child_nodes);
  }

  const host: DOMSwiper = {
    ...box$.methods,
    t: "swiper",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      $root = document.createElement("div");
      $root.setAttribute("data-swiper", "");
      $root.setAttribute("role", "group");
      $root.setAttribute("aria-roledescription", "carousel");
      if (!props.elm.state.attributes.tabindex) $root.tabIndex = 0;
      box$.methods.set$elm($root);
      box$.methods.applyState(props.elm.state, { initial: true });

      $track = document.createElement("div");
      $track.setAttribute("data-swiper-track", "");
      $track.appendChild(box$.methods.render(props.elm.children));
      $root.appendChild($track);
      configure_refresh_indicator();
      box$.methods.setupEventListener(props.elm.events);
      configure_layout();
      apply_state(core.state);
      return $root;
    },
    hydrate(elm: TimelessElement, $dom: HTMLDivElement) {
      $root = $dom;
      box$.methods.set$elm($root);
      box$.methods.setupEventListener(elm.events);
      $track = $root.querySelector(":scope > [data-swiper-track]");
      if (!$track) {
        $track = document.createElement("div");
        $track.setAttribute("data-swiper-track", "");
        while ($root.firstChild) $track.appendChild($root.firstChild);
        $root.appendChild($track);
      }
      hydrate_children($track);
      configure_refresh_indicator();
      configure_layout();
      apply_state(core.state);
    },
    mount() {
      if (mounted || !$root) return;
      mounted = true;
      core_cleanups.push(
        core.onStateChange(apply_state),
        core.onChange((event) => props.elm.handleChange?.(event)),
        core.onSwipeStart((state) => props.elm.handleSwipeStart?.(state)),
        core.onSwipeMove((state) => props.elm.handleSwipeMove?.(state)),
        core.onSwipeEnd((event) => props.elm.handleSwipeEnd?.(event)),
        core.onRefresh((event) => props.elm.handleRefresh?.(event)),
        core.onReachBottom((event) => props.elm.handleReachBottom?.(event)),
      );
      attach_input_events();
      if (typeof ResizeObserver === "function") {
        resize_observer = new ResizeObserver(measure);
        resize_observer.observe($root);
      } else {
        listen(window, "resize", measure as EventListener);
      }
      if (typeof MutationObserver === "function" && $track) {
        mutation_observer = new MutationObserver(() => configure_layout());
        mutation_observer.observe($track, { childList: true, subtree: true });
      }
      measure();
      apply_state(core.state);
    },
    unmount() {
      if (!mounted) return;
      mounted = false;
      clear_transition_timer();
      resize_observer?.disconnect();
      resize_observer = null;
      mutation_observer?.disconnect();
      mutation_observer = null;
      restore_scroll_touch_actions();
      for (const cleanup of event_cleanups.splice(0)) cleanup();
      for (const cleanup of core_cleanups.splice(0)) cleanup();
      if (core.state.phase === "dragging") core.cancelSwipe();
      if (core.state.phase === "settling") core.finishTransition();
    },
    destroy() {
      host.unmount();
      restore_scroll_touch_actions();
      core.destroy();
      box$.methods.destroy();
      $root = null;
      $track = null;
      $refresh_indicator = null;
    },
    setOptions(options: Record<string, unknown>) {
      if (typeof options.duration === "number") {
        duration = Math.max(0, options.duration);
      }
      if (typeof options.mousewheel === "boolean") {
        mousewheel = options.mousewheel;
      }
      core.setOptions({
        index: typeof options.index === "number" ? options.index : undefined,
        count: typeof options.count === "number" ? options.count : undefined,
        orientation:
          options.orientation === "vertical" ||
          options.orientation === "horizontal"
            ? options.orientation
            : undefined,
        threshold:
          typeof options.threshold === "number" ? options.threshold : undefined,
        resistance:
          typeof options.resistance === "number"
            ? options.resistance
            : undefined,
        disabled:
          typeof options.disabled === "boolean" ? options.disabled : undefined,
        pullToRefresh:
          typeof options.pullToRefresh === "boolean"
            ? options.pullToRefresh
            : undefined,
        refreshThreshold:
          typeof options.refreshThreshold === "number"
            ? options.refreshThreshold
            : undefined,
        refreshHoldDistance:
          typeof options.refreshHoldDistance === "number"
            ? options.refreshHoldDistance
            : undefined,
        reachBottom:
          typeof options.reachBottom === "boolean"
            ? options.reachBottom
            : undefined,
        reachBottomThreshold:
          typeof options.reachBottomThreshold === "number"
            ? options.reachBottomThreshold
            : undefined,
      });
      configure_refresh_indicator();
      configure_layout();
      measure();
      apply_state(core.state);
    },
    slideTo(index: number, animated = true) {
      return core.slideTo(index, animated && duration > 0);
    },
    next(animated = true) {
      return core.next(animated && duration > 0);
    },
    previous(animated = true) {
      return core.previous(animated && duration > 0);
    },
    finishRefresh() {
      return core.finishRefresh();
    },
  };

  return host;
}

export type DOMSwiperItem = VNodeView<HTMLDivElement> & {
  t: "swiper-item";
};

export function DOMSwiperItem(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
}): DOMSwiperItem {
  const box$ = HostElement({
    $elm: null,
    t: "swiper-item",
    build: props.build,
  });

  function apply_item_layout($elm: HTMLDivElement) {
    $elm.setAttribute("data-swiper-item", "");
    $elm.style.flex = "0 0 100%";
    $elm.style.width = "100%";
    $elm.style.height = "100%";
    $elm.style.minWidth = "0";
    $elm.style.minHeight = "0";
    $elm.style.overflow = "hidden";
  }

  return {
    ...box$.methods,
    t: "swiper-item",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      apply_item_layout($elm);
      $elm.appendChild(box$.methods.render(props.elm.children));
      box$.methods.setupEventListener(props.elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      apply_item_layout($elm);
      const child_nodes: VNodeView[] = [];
      const child_elements: (TimelessElement | null)[] = [];
      const host_children = Array.from($elm.childNodes) as HTMLElement[];
      for (let index = 0; index < (elm.children?.length ?? 0); index += 1) {
        const child = elm.children?.[index] ?? null;
        child_elements.push(child);
        if (!child || !host_children[index]) continue;
        const child_node = hydrate_node(child, host_children[index], {
          $parent: $elm,
          offset: index,
          idx: index,
        });
        if (child_node) child_nodes.push(child_node);
      }
      box$.methods.set$childrne(host_children);
      box$.methods.setchildrenelement(child_elements);
      box$.methods.setchildnode(child_nodes);
    },
  };
}
