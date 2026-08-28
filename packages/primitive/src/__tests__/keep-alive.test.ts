import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { View } from "@/content/view";
import { KeepAlive } from "@/reactive/keep-alive";

describe("KeepAlive", () => {
  it("preserves its child while toggling visibility", () => {
    const active_ = ref(false);
    const mounted = vi.fn();
    const unmounted = vi.fn();
    const child = View({
      attributes: { n: "keep-alive-test-child" },
      onMounted: mounted,
      onUnmounted: unmounted,
    });
    const keep_alive = KeepAlive({ when: active_ }, [child]);
    const set_children_active = vi.fn();
    keep_alive.$elm = { setChildrenActive: set_children_active } as any;

    keep_alive.onMounted({ target: null } as any);
    expect(keep_alive.children?.[0]).toBe(child);
    expect(set_children_active).toHaveBeenLastCalledWith(false);
    expect(keep_alive.state.style.display).toBeUndefined();
    expect(mounted).toHaveBeenCalledOnce();

    active_.as(true);
    expect(set_children_active).toHaveBeenLastCalledWith(true);

    active_.as(false);
    expect(set_children_active).toHaveBeenLastCalledWith(false);
    expect(unmounted).not.toHaveBeenCalled();

    active_.as(true);
    expect(keep_alive.children?.[0]).toBe(child);
    expect(mounted).toHaveBeenCalledOnce();

    keep_alive.destroy?.();
    expect(unmounted).toHaveBeenCalledOnce();
  });
});
