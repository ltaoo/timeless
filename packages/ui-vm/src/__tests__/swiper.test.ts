import { describe, expect, it, vi } from "vitest";

import { SwiperCore } from "@/swiper";

describe("SwiperCore", () => {
  it("uses one third of the viewport as the default switch threshold", () => {
    const swiper = new SwiperCore({
      count: 3,
      size: 900,
      orientation: "vertical",
    });
    const on_change = vi.fn();
    swiper.onChange(on_change);

    swiper.beginSwipe({ x: 100, y: 600 });
    expect(swiper.moveSwipe({ x: 100, y: 400 })).toBe(true);
    expect(swiper.state.offset).toBe(-200);
    swiper.endSwipe({ x: 100, y: 400 });
    expect(swiper.state.phase).toBe("settling");
    expect(swiper.state.offset).toBe(0);
    expect(swiper.finishTransition()).toBe(false);
    expect(swiper.state.index).toBe(0);
    expect(on_change).not.toHaveBeenCalled();

    swiper.beginSwipe({ x: 100, y: 600 });
    swiper.moveSwipe({ x: 100, y: 299 });
    swiper.endSwipe({ x: 100, y: 299 });
    expect(swiper.state.offset).toBe(-900);
    expect(swiper.finishTransition()).toBe(true);
    expect(swiper.state.index).toBe(1);
    expect(on_change).toHaveBeenCalledWith({ index: 1, previousIndex: 0 });
  });

  it("locks to the configured gesture orientation", () => {
    const swiper = new SwiperCore({
      count: 3,
      size: 300,
      orientation: "horizontal",
    });

    swiper.beginSwipe({ x: 200, y: 200 });
    expect(swiper.moveSwipe({ x: 190, y: 80 })).toBe(false);
    expect(swiper.endSwipe({ x: 190, y: 80 })).toBe(false);
    expect(swiper.state).toMatchObject({
      index: 0,
      offset: 0,
      phase: "idle",
    });

    swiper.beginSwipe({ x: 250, y: 100 });
    expect(swiper.moveSwipe({ x: 120, y: 100 })).toBe(true);
    swiper.endSwipe({ x: 120, y: 100 });
    swiper.finishTransition();
    expect(swiper.state.index).toBe(1);
  });

  it("progressively increases resistance toward either boundary", () => {
    const swiper = new SwiperCore({
      count: 2,
      size: 600,
      orientation: "vertical",
      resistance: 0.2,
    });

    swiper.beginSwipe({ x: 100, y: 200 });
    swiper.moveSwipe({ x: 100, y: 300 });
    const first_offset = swiper.state.offset;
    swiper.moveSwipe({ x: 100, y: 400 });
    const second_offset = swiper.state.offset;
    swiper.moveSwipe({ x: 100, y: 500 });
    const third_offset = swiper.state.offset;
    expect(first_offset).toBeCloseTo(18.75);
    expect(second_offset - first_offset).toBeLessThan(first_offset);
    expect(third_offset - second_offset).toBeLessThan(
      second_offset - first_offset,
    );
    swiper.endSwipe({ x: 100, y: 700 });
    expect(swiper.state.offset).toBe(0);
    swiper.finishTransition();
    expect(swiper.state.index).toBe(0);

    swiper.setIndex(1);
    swiper.beginSwipe({ x: 100, y: 500 });
    swiper.moveSwipe({ x: 100, y: 400 });
    expect(swiper.state.offset).toBeCloseTo(-18.75);
    swiper.endSwipe({ x: 100, y: 0 });
    swiper.finishTransition();
    expect(swiper.state.index).toBe(1);
  });

  it("supports pixel thresholds and programmatic navigation", () => {
    const swiper = new SwiperCore({ count: 4, size: 400, threshold: 80 });
    const on_change = vi.fn();
    swiper.onChange(on_change);

    swiper.beginSwipe({ x: 200, y: 100 });
    swiper.moveSwipe({ x: 130, y: 100 });
    swiper.endSwipe({ x: 130, y: 100 });
    swiper.finishTransition();
    expect(swiper.state.index).toBe(0);

    expect(swiper.slideTo(2, false)).toBe(true);
    expect(swiper.state.index).toBe(2);
    expect(on_change).toHaveBeenCalledWith({ index: 2, previousIndex: 0 });

    expect(swiper.previous()).toBe(true);
    expect(swiper.state).toMatchObject({ phase: "settling", offset: 400 });
    swiper.finishTransition();
    expect(swiper.state.index).toBe(1);
  });

  it("starts pull-to-refresh only after crossing its threshold", () => {
    const swiper = new SwiperCore({
      count: 3,
      size: 600,
      orientation: "vertical",
      pullToRefresh: true,
      refreshThreshold: 80,
      refreshHoldDistance: 44,
    });
    const on_refresh = vi.fn();
    swiper.onRefresh(on_refresh);

    swiper.beginSwipe({ x: 100, y: 100 });
    swiper.moveSwipe({ x: 100, y: 180 });
    swiper.endSwipe({ x: 100, y: 180 });
    expect(swiper.state.phase).toBe("settling");
    expect(on_refresh).not.toHaveBeenCalled();
    swiper.finishTransition();

    swiper.beginSwipe({ x: 100, y: 100 });
    swiper.moveSwipe({ x: 100, y: 181 });
    swiper.endSwipe({ x: 100, y: 181 });
    expect(swiper.state).toMatchObject({
      phase: "refreshing",
      refreshing: true,
      offset: 44,
    });
    expect(on_refresh).toHaveBeenCalledWith({ index: 0 });
    expect(swiper.finishRefresh()).toBe(true);
    expect(swiper.state.phase).toBe("settling");
    swiper.finishTransition();
    expect(swiper.state).toMatchObject({
      phase: "idle",
      refreshing: false,
      offset: 0,
    });
  });

  it("emits reach-bottom once until the slide count grows", () => {
    const swiper = new SwiperCore({
      count: 2,
      size: 500,
      orientation: "vertical",
      reachBottom: true,
    });
    const on_reach_bottom = vi.fn();
    swiper.onReachBottom(on_reach_bottom);

    swiper.slideTo(1);
    swiper.finishTransition();
    expect(on_reach_bottom).toHaveBeenCalledTimes(1);
    expect(on_reach_bottom).toHaveBeenCalledWith({ index: 1, count: 2 });
    swiper.next();
    expect(on_reach_bottom).toHaveBeenCalledTimes(1);

    swiper.setCount(3);
    swiper.slideTo(2);
    swiper.finishTransition();
    expect(on_reach_bottom).toHaveBeenCalledTimes(2);
    expect(on_reach_bottom).toHaveBeenLastCalledWith({ index: 2, count: 3 });
  });
});
