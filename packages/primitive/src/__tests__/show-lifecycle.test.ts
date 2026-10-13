import { describe, expect, it, vi } from "vitest";

import { ref, computed } from "@timeless/inner-reactive";

import { View } from "@/content/view";
import { Show } from "@/reactive/show";

describe("Show lifecycle", () => {
  it("does not rebuild static children during the first mount", () => {
    const child_mounted = vi.fn();
    const show$ = Show({
      when: true,
      ok: () => [View({ onMounted: child_mounted })],
    });
    const host = {
      removeChildren: vi.fn(),
      insertChildren: vi.fn(),
    };

    show$.$elm = host;
    show$.onMounted({ target: host } as any);

    expect(host.removeChildren).not.toHaveBeenCalled();
    expect(host.insertChildren).not.toHaveBeenCalled();
    expect(child_mounted).toHaveBeenCalledOnce();
  });

  it("rebuilds children only after an actual unmount", () => {
    const child_mounted = vi.fn();
    const render_child = vi.fn(() => [View({ onMounted: child_mounted })]);
    const show$ = Show({
      when: true,
      ok: render_child,
    });
    const host = {
      removeChildren: vi.fn(),
      insertChildren: vi.fn(),
    };

    show$.$elm = host;
    show$.onMounted({ target: host } as any);
    show$.onUnmounted();
    show$.$elm = host;
    expect(show$.$elm).toBe(host);
    show$.onMounted({ target: host } as any);

    expect(render_child).toHaveBeenCalledTimes(2);
    expect(host.removeChildren).toHaveBeenCalledOnce();
    expect(host.insertChildren).toHaveBeenCalledOnce();
    expect(child_mounted).toHaveBeenCalledOnce();
  });
});

it("permanent destruction releases the condition, owner and nested child exactly once", () => {
  const source = ref(0);
  const condition = ref(true);
  const onUnmounted = vi.fn();
  const childUnmounted = vi.fn();
  const show = Show({
    when: condition,
    onUnmounted,
    ok: () =>
      View({ onUnmounted: childUnmounted }, [
        computed(source, (value) => value),
      ]),
  });
  show.destroy();
  show.destroy();
  expect(condition.getDeps()).toHaveLength(0);
  expect(source.getDeps()).toHaveLength(0);
  expect(onUnmounted).toHaveBeenCalledTimes(1);
  expect(childUnmounted).toHaveBeenCalledTimes(1);
});
