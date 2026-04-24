import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/reactive";

import { Scope } from "@/context/context";
import { ErrorBoundary } from "@/content/error-boundary";
import { View } from "@/content/view";
import { Show } from "@/reactive/show";

describe("owner cleanup", () => {
  it("destroys refs created inside Scope when the scope unmounts", () => {
    let local!: ReturnType<typeof ref<boolean>>;

    const child = Scope(
      () => {},
      () => {
        local = ref(false);
        local.subscribe({ onChange: vi.fn() });
        return View({}, ["scope"]);
      },
    );

    expect(local.getDeps()).toHaveLength(1);

    child.onUnmounted();

    expect(local.getDeps()).toHaveLength(0);
  });

  it("destroys refs created inside ErrorBoundary owner when it unmounts", () => {
    let local!: ReturnType<typeof ref<boolean>>;

    const boundary = ErrorBoundary({}, () => {
      local = ref(false);
      local.subscribe({ onChange: vi.fn() });
      return View({}, ["ok"]);
    });

    expect(local.getDeps()).toHaveLength(1);

    boundary.onUnmounted();

    expect(local.getDeps()).toHaveLength(0);
  });

  it("destroys refs adopted by a component root element on element unmount", () => {
    let visible!: ReturnType<typeof ref<boolean>>;

    function Content() {
      visible = ref(false);
      visible.subscribe({ onChange: vi.fn() });
      return Show({
        when: true,
        ok() {
          return View({}, ["ok"]);
        },
      });
    }

    const child = Scope(() => {}, () => Content());

    expect(visible.getDeps()).toHaveLength(1);

    child.children?.[0]?.onUnmounted();

    expect(visible.getDeps()).toHaveLength(0);
  });
});
