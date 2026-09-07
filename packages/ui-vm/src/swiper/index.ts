import { BaseDomain, Handler } from "@timeless/inner-base";

export type SwiperOrientation = "horizontal" | "vertical";
export type SwiperPhase = "idle" | "dragging" | "settling" | "refreshing";

export type SwiperPoint = {
  x: number;
  y: number;
};

export type SwiperCoreOptions = Partial<{
  _name: string;
  index: number;
  count: number;
  size: number;
  orientation: SwiperOrientation;
  threshold: number;
  resistance: number;
  disabled: boolean;
  pullToRefresh: boolean;
  refreshThreshold: number;
  refreshHoldDistance: number;
  reachBottom: boolean;
  reachBottomThreshold: number;
}>;

export type SwiperState = {
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

export type SwiperChangeEvent = {
  index: number;
  previousIndex: number;
};

export type SwiperReachBottomEvent = {
  index: number;
  count: number;
};

enum Events {
  StateChange,
  Change,
  SwipeStart,
  SwipeMove,
  SwipeEnd,
  Refresh,
  ReachBottom,
}

type TheTypesOfEvents = {
  [Events.StateChange]: SwiperState;
  [Events.Change]: SwiperChangeEvent;
  [Events.SwipeStart]: SwiperState;
  [Events.SwipeMove]: SwiperState;
  [Events.SwipeEnd]: SwiperChangeEvent & { changed: boolean };
  [Events.Refresh]: { index: number };
  [Events.ReachBottom]: SwiperReachBottomEvent;
};

/**
 * Platform-neutral state machine for a touch-driven swiper.
 *
 * A threshold in the range 0..1 is interpreted as a proportion of the
 * viewport. A value greater than 1 is interpreted as pixels.
 */
export class SwiperCore extends BaseDomain<TheTypesOfEvents> {
  index = 0;
  count = 0;
  size = 1;
  offset = 0;
  orientation: SwiperOrientation = "horizontal";
  phase: SwiperPhase = "idle";
  threshold = 1 / 3;
  resistance = 0.24;
  disabled = false;
  pullToRefresh = false;
  refreshThreshold = 72;
  refreshHoldDistance = 48;
  reachBottom = false;
  reachBottomThreshold = 0;
  pullDistance = 0;

  private start_point: SwiperPoint = { x: 0, y: 0 };
  private last_point: SwiperPoint = { x: 0, y: 0 };
  private gesture_axis: SwiperOrientation | null = null;
  private pending_index: number | null = null;
  private suppress_click_until = 0;
  private reach_bottom_emitted_for_count = -1;

  get state(): SwiperState {
    return {
      index: this.index,
      count: this.count,
      size: this.size,
      offset: this.offset,
      orientation: this.orientation,
      phase: this.phase,
      disabled: this.disabled,
      pullDistance: this.pullDistance,
      refreshing: this.phase === "refreshing",
    };
  }

  constructor(options: SwiperCoreOptions = {}) {
    super(options);
    this.orientation = options.orientation ?? "horizontal";
    this.threshold = options.threshold ?? 1 / 3;
    this.resistance = options.resistance ?? 0.24;
    this.disabled = options.disabled ?? false;
    this.pullToRefresh = options.pullToRefresh ?? false;
    this.refreshThreshold = Math.max(1, options.refreshThreshold ?? 72);
    this.refreshHoldDistance = Math.max(0, options.refreshHoldDistance ?? 48);
    this.reachBottom = options.reachBottom ?? false;
    this.reachBottomThreshold = Math.max(
      0,
      Math.floor(options.reachBottomThreshold ?? 0),
    );
    this.count = Math.max(0, Math.floor(options.count ?? 0));
    this.size = Math.max(1, options.size ?? 1);
    this.index = this.clamp_index(options.index ?? 0);
  }

  setOptions(options: SwiperCoreOptions) {
    if (options.orientation !== undefined) {
      this.orientation = options.orientation;
    }
    if (options.threshold !== undefined) {
      this.threshold = Math.max(0, options.threshold);
    }
    if (options.resistance !== undefined) {
      this.resistance = Math.max(0, Math.min(1, options.resistance));
    }
    if (options.disabled !== undefined) {
      this.disabled = options.disabled;
    }
    if (options.pullToRefresh !== undefined) {
      this.pullToRefresh = options.pullToRefresh;
    }
    if (options.refreshThreshold !== undefined) {
      this.refreshThreshold = Math.max(1, options.refreshThreshold);
    }
    if (options.refreshHoldDistance !== undefined) {
      this.refreshHoldDistance = Math.max(0, options.refreshHoldDistance);
    }
    if (options.reachBottom !== undefined) {
      this.reachBottom = options.reachBottom;
    }
    if (options.reachBottomThreshold !== undefined) {
      this.reachBottomThreshold = Math.max(
        0,
        Math.floor(options.reachBottomThreshold),
      );
    }
    if (options.count !== undefined) {
      this.update_count(options.count);
    }
    if (options.size !== undefined) {
      this.size = Math.max(1, options.size);
    }
    if (options.index !== undefined && this.phase === "idle") {
      this.index = this.clamp_index(options.index);
    }
    this.emit_state();
  }

  setCount(count: number) {
    this.update_count(count);
    this.index = this.clamp_index(this.index);
    this.emit_state();
  }

  setSize(size: number) {
    const next_size = Math.max(1, size);
    if (next_size === this.size) return;
    this.size = next_size;
    this.emit_state();
  }

  setIndex(index: number) {
    if (this.phase !== "idle") return false;
    const next_index = this.clamp_index(index);
    if (next_index === this.index) return false;
    this.index = next_index;
    this.offset = 0;
    this.emit_state();
    return true;
  }

  slideTo(index: number, animated = true) {
    if (this.disabled || this.phase !== "idle") return false;
    const next_index = this.clamp_index(index);
    if (next_index === this.index) return false;
    if (!animated) {
      const previous_index = this.index;
      this.index = next_index;
      this.offset = 0;
      this.emit_state();
      this.emit(Events.Change, {
        index: this.index,
        previousIndex: previous_index,
      });
      return true;
    }
    this.start_settling(next_index);
    return true;
  }

  next(animated = true) {
    if (this.index >= this.count - 1) {
      this.maybe_emit_reach_bottom(true);
      return false;
    }
    return this.slideTo(this.index + 1, animated);
  }

  previous(animated = true) {
    return this.slideTo(this.index - 1, animated);
  }

  beginSwipe(point: SwiperPoint) {
    const supports_edge_action = this.pullToRefresh || this.reachBottom;
    if (
      this.disabled ||
      (this.count <= 1 && !supports_edge_action) ||
      this.phase !== "idle"
    ) {
      return false;
    }
    this.start_point = point;
    this.last_point = point;
    this.gesture_axis = null;
    this.pending_index = null;
    this.offset = 0;
    this.pullDistance = 0;
    this.phase = "dragging";
    this.emit_state();
    this.emit(Events.SwipeStart, this.state);
    return true;
  }

  moveSwipe(point: SwiperPoint) {
    if (this.phase !== "dragging") return false;
    this.last_point = point;
    const distance_x = point.x - this.start_point.x;
    const distance_y = point.y - this.start_point.y;

    if (this.gesture_axis === null && Math.hypot(distance_x, distance_y) >= 8) {
      this.gesture_axis =
        Math.abs(distance_y) > Math.abs(distance_x) * 1.1
          ? "vertical"
          : "horizontal";
    }
    if (this.gesture_axis !== null && this.gesture_axis !== this.orientation) {
      this.phase = "idle";
      this.offset = 0;
      this.pullDistance = 0;
      this.gesture_axis = null;
      this.emit_state();
      return false;
    }
    if (this.gesture_axis === null) return false;

    const distance = this.orientation === "vertical" ? distance_y : distance_x;
    this.pullDistance =
      this.pullToRefresh && this.index === 0 && distance > 0 ? distance : 0;
    const at_start = this.index === 0 && distance > 0;
    const at_end = this.index === this.count - 1 && distance < 0;
    const resisted_distance =
      at_start || at_end ? this.apply_edge_resistance(distance) : distance;
    const limit = this.size * 0.96;
    this.offset = Math.max(-limit, Math.min(limit, resisted_distance));
    this.emit_state();
    this.emit(Events.SwipeMove, this.state);
    return true;
  }

  endSwipe(point: SwiperPoint = this.last_point) {
    if (this.phase !== "dragging") return false;
    const distance_x = point.x - this.start_point.x;
    const distance_y = point.y - this.start_point.y;
    const consumed = this.gesture_axis === this.orientation;

    if (!consumed) {
      this.phase = "idle";
      this.offset = 0;
      this.gesture_axis = null;
      this.emit_state();
      return false;
    }

    const distance = this.orientation === "vertical" ? distance_y : distance_x;
    const threshold =
      this.threshold <= 1 ? this.size * this.threshold : this.threshold;
    const delta = distance < 0 ? 1 : -1;
    const target_index = this.index + delta;
    const should_refresh =
      this.pullToRefresh &&
      this.index === 0 &&
      distance > this.refreshThreshold;
    const can_change =
      Math.abs(distance) > threshold &&
      target_index >= 0 &&
      target_index < this.count;

    this.suppress_click_until = Date.now() + 480;
    this.gesture_axis = null;
    if (should_refresh) {
      this.phase = "refreshing";
      this.offset = this.refreshHoldDistance;
      this.emit_state();
      this.emit(Events.Refresh, { index: this.index });
      this.emit(Events.SwipeEnd, {
        index: this.index,
        previousIndex: this.index,
        changed: false,
      });
      return true;
    }
    this.pullDistance = 0;
    if (
      !can_change &&
      target_index >= this.count &&
      Math.abs(distance) > threshold
    ) {
      this.maybe_emit_reach_bottom(true);
    }
    this.start_settling(can_change ? target_index : null);
    return true;
  }

  cancelSwipe() {
    if (this.phase !== "dragging") return false;
    const consumed = this.gesture_axis === this.orientation;
    this.gesture_axis = null;
    this.pullDistance = 0;
    if (!consumed) {
      this.offset = 0;
      this.phase = "idle";
      this.emit_state();
      return false;
    }
    this.suppress_click_until = Date.now() + 320;
    this.start_settling(null);
    return true;
  }

  finishTransition() {
    if (this.phase !== "settling") return false;
    const previous_index = this.index;
    if (this.pending_index !== null) {
      this.index = this.pending_index;
    }
    this.pending_index = null;
    this.offset = 0;
    this.phase = "idle";
    this.emit_state();

    const changed = previous_index !== this.index;
    const change_event = {
      index: this.index,
      previousIndex: previous_index,
    };
    if (changed) this.emit(Events.Change, change_event);
    if (changed) this.maybe_emit_reach_bottom();
    this.emit(Events.SwipeEnd, { ...change_event, changed });
    return changed;
  }

  shouldSuppressClick() {
    return Date.now() < this.suppress_click_until;
  }

  finishRefresh() {
    if (this.phase !== "refreshing") return false;
    this.pullDistance = 0;
    this.start_settling(null);
    return true;
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  onSwipeStart(handler: Handler<TheTypesOfEvents[Events.SwipeStart]>) {
    return this.on(Events.SwipeStart, handler);
  }

  onSwipeMove(handler: Handler<TheTypesOfEvents[Events.SwipeMove]>) {
    return this.on(Events.SwipeMove, handler);
  }

  onSwipeEnd(handler: Handler<TheTypesOfEvents[Events.SwipeEnd]>) {
    return this.on(Events.SwipeEnd, handler);
  }

  onRefresh(handler: Handler<TheTypesOfEvents[Events.Refresh]>) {
    return this.on(Events.Refresh, handler);
  }

  onReachBottom(handler: Handler<TheTypesOfEvents[Events.ReachBottom]>) {
    return this.on(Events.ReachBottom, handler);
  }

  private start_settling(target_index: number | null) {
    this.pending_index = target_index;
    this.phase = "settling";
    this.offset =
      target_index === null ? 0 : -(target_index - this.index) * this.size;
    this.emit_state();
  }

  private apply_edge_resistance(distance: number) {
    const magnitude = Math.abs(distance);
    if (magnitude === 0 || this.resistance === 0) return 0;
    const resistance_extent = Math.max(1, this.size * 0.5);
    const resisted_magnitude =
      (magnitude * this.resistance * resistance_extent) /
      (resistance_extent + magnitude * this.resistance);
    return Math.sign(distance) * resisted_magnitude;
  }

  private clamp_index(index: number) {
    if (this.count <= 0) return 0;
    return Math.max(0, Math.min(this.count - 1, Math.floor(index)));
  }

  private update_count(count: number) {
    const next_count = Math.max(0, Math.floor(count));
    if (next_count !== this.count) this.reach_bottom_emitted_for_count = -1;
    this.count = next_count;
  }

  private maybe_emit_reach_bottom(force = false) {
    if (!this.reachBottom || this.count <= 0) return;
    const trigger_index = Math.max(
      0,
      this.count - 1 - this.reachBottomThreshold,
    );
    if (!force && this.index < trigger_index) return;
    if (this.reach_bottom_emitted_for_count === this.count) return;
    this.reach_bottom_emitted_for_count = this.count;
    this.emit(Events.ReachBottom, { index: this.index, count: this.count });
  }

  private emit_state() {
    this.emit(Events.StateChange, this.state);
  }
}
