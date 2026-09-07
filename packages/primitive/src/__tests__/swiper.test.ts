import { describe, expect, it, vi } from "vitest";

import { ref } from "@timeless/inner-reactive";

import { Swiper, SwiperItem } from "@/layout/swiper";

describe("Swiper", () => {
  it("creates semantic swiper and swiper-item nodes", () => {
    const item = SwiperItem({}, ["slide"]);
    const swiper = Swiper({ orientation: "vertical" }, [item]);

    expect(swiper.t).toBe("swiper");
    expect(item.t).toBe("swiper-item");
    expect(swiper.state).toMatchObject({
      count: 1,
      index: 0,
      orientation: "vertical",
      threshold: 1 / 3,
      duration: 300,
      pullToRefresh: false,
      reachBottom: false,
    });
    swiper.destroy();
  });

  it("synchronizes writable indices with the host", () => {
    const index = ref(0);
    const on_change = vi.fn();
    const swiper = Swiper({ index, onChange: on_change }, [
      SwiperItem({}, ["one"]),
      SwiperItem({}, ["two"]),
      SwiperItem({}, ["three"]),
    ]);
    const host = {
      mount: vi.fn(),
      unmount: vi.fn(),
      destroy: vi.fn(),
      setOptions: vi.fn(),
      slideTo: vi.fn(() => true),
      next: vi.fn(() => true),
      previous: vi.fn(() => true),
      finishRefresh: vi.fn(() => true),
    };
    swiper.$elm = host;

    index.as(1);
    expect(host.slideTo).toHaveBeenCalledWith(1, true);

    swiper.handleChange({ index: 2, previousIndex: 1 });
    expect(index.value).toBe(2);
    expect(on_change).toHaveBeenCalledWith({ index: 2, previousIndex: 1 });

    expect(swiper.methods.previous()).toBe(true);
    expect(host.previous).toHaveBeenCalledWith(true);
    swiper.destroy();
  });

  it("completes refresh promises and forwards reach-bottom events", async () => {
    let resolve_refresh = () => {};
    const refresh_promise = new Promise<void>((resolve) => {
      resolve_refresh = resolve;
    });
    const on_refresh = vi.fn(() => refresh_promise);
    const on_reach_bottom = vi.fn();
    const swiper = Swiper(
      {
        pullToRefresh: true,
        onRefresh: on_refresh,
        onReachBottom: on_reach_bottom,
      },
      [SwiperItem({}, ["one"])],
    );
    const host = {
      mount: vi.fn(),
      unmount: vi.fn(),
      destroy: vi.fn(),
      setOptions: vi.fn(),
      slideTo: vi.fn(() => true),
      next: vi.fn(() => true),
      previous: vi.fn(() => true),
      finishRefresh: vi.fn(() => true),
    };
    swiper.$elm = host;

    swiper.handleRefresh({ index: 0 });
    expect(on_refresh).toHaveBeenCalledOnce();
    expect(host.finishRefresh).not.toHaveBeenCalled();
    resolve_refresh();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.finishRefresh).toHaveBeenCalledOnce();

    swiper.handleReachBottom({ index: 0, count: 1 });
    expect(on_reach_bottom).toHaveBeenCalledWith({ index: 0, count: 1 });
    swiper.destroy();
  });
});
