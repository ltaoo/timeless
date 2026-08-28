import { describe, expect, it, vi } from "vitest";

import { View } from "@/core";
import { KeepAliveSubViews } from "@/modules/keep-alive-sub-views";

describe("KeepAliveSubViews", () => {
  it("keeps the same page instance after a route becomes hidden", () => {
    let update_presence: (state: Record<string, boolean>) => void = () => {};
    const presence_unsubscribe = vi.fn();
    const page_unmounted = vi.fn();
    const page = View({
      attributes: { n: "keep-alive-sub-views-test-page" },
      onUnmounted: page_unmounted,
    });
    const PageView = vi.fn(() => page);
    const subview = {
      id: 1,
      name: "page",
      pathname: "/page",
      animation: { in: "route-in", out: "route-out" },
      $presence: {
        state: {
          mounted: true,
          visible: true,
          enter: true,
          exit: false,
        },
        onStateChange(listener: typeof update_presence) {
          update_presence = listener;
          return presence_unsubscribe;
        },
      },
    };
    const subviews = KeepAliveSubViews({
      view: {
        subViews: [subview],
        onSubViewsChange: () => () => {},
      } as any,
      views: { page: PageView },
      app: {} as any,
      history: {} as any,
      storage: {} as any,
      client: {} as any,
    });
    const route_view = subviews.children[0]!;
    const lazy_view = route_view.children[0]!;
    const set_children_active = vi.fn();
    route_view.$elm = { setChildrenActive: set_children_active } as any;
    route_view.onMounted({ target: route_view.$elm });

    expect(PageView).toHaveBeenCalledOnce();
    expect(lazy_view.children[0]).toBe(page);
    expect(set_children_active).toHaveBeenLastCalledWith(true);
    expect(route_view.state.styleSet).toContain("route-in");
    expect(route_view.state.style.overflow).toBe("auto");
    expect(route_view.state.style["overflow-anchor"]).toBe("none");

    update_presence({
      mounted: true,
      visible: false,
      enter: false,
      exit: true,
    });
    expect(route_view.state.style.display).toBeUndefined();
    expect(route_view.state.styleSet).toContain("route-out");

    update_presence({
      mounted: true,
      visible: false,
      enter: false,
      exit: false,
    });
    expect(set_children_active).toHaveBeenLastCalledWith(false);
    expect(page_unmounted).not.toHaveBeenCalled();

    update_presence({
      mounted: true,
      visible: true,
      enter: true,
      exit: false,
    });
    expect(set_children_active).toHaveBeenLastCalledWith(true);
    expect(lazy_view.children[0]).toBe(page);
    expect(PageView).toHaveBeenCalledOnce();

    route_view.destroy?.();
    expect(presence_unsubscribe).toHaveBeenCalledOnce();
  });
});
