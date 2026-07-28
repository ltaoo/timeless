import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { ErrorBoundary } from "@/reactive/error-boundary";
import { Show } from "@/reactive/show";
import { LazyView } from "@/content/lazy-view";
import { View } from "@/content/view";

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders fallback content when child evaluation throws", () => {
    const boundary = ErrorBoundary(
      {
        fallback(error) {
          return View({}, [`fallback: ${error instanceof Error ? error.message : String(error)}`]);
        },
      },
      () => {
        throw new Error("boom");
      },
    );

    expect(boundary.children).toHaveLength(1);
    expect(boundary.children?.[0]?.t).toBe("view");
    expect(boundary.state.error).toBeInstanceOf(Error);
    expect((boundary.state.error as Error).message).toBe("boom");
  });

  it("reset retries child evaluation and clears the error", () => {
    let shouldThrow = true;
    let reset!: () => void;

    const boundary = ErrorBoundary(
      {
        fallback(_error, nextReset) {
          reset = nextReset;
          return View({}, ["fallback"]);
        },
      },
      () => {
        if (shouldThrow) {
          throw new Error("boom");
        }
        return View({}, ["ok"]);
      },
    );

    expect(boundary.state.error).toBeInstanceOf(Error);
    shouldThrow = false;
    reset();

    expect(boundary.state.error).toBeNull();
    expect(boundary.children).toHaveLength(1);
    expect(boundary.children?.[0]?.t).toBe("view");
  });

  it("renders fallback when Show.ok throws after boundary creation", () => {
    const boundary = ErrorBoundary(
      {
        fallback(error) {
          return View({}, [`fallback: ${error instanceof Error ? error.message : String(error)}`]);
        },
      },
      () => [
        Show({
          when: true,
          ok() {
            throw new Error("nested boom");
          },
        }),
      ],
    );

    expect(boundary.children).toHaveLength(1);
    expect(boundary.children?.[0]?.t).toBe("show");
    const show = boundary.children?.[0];
    expect(show?.children).toHaveLength(1);
    expect(show?.children?.[0]?.t).toBe("view");
  });

  it("renders fallback when Show.ok throws after a ref turns true", () => {
    const visible_ = ref(false);
    const boundary = ErrorBoundary(
      {
        fallback(error) {
          return View({}, [`fallback: ${error instanceof Error ? error.message : String(error)}`]);
        },
      },
      () => [
        Show({
          when: visible_,
          ok() {
            throw new Error("late boom");
          },
        }),
      ],
    );

    const show = boundary.children?.[0];
    expect(show?.children).toHaveLength(0);

    show!.$elm = {
      insertChildren(children: unknown[]) {
        show!.children = children as any;
      },
      removeChildren() {
        show!.children = [];
      },
    };

    visible_.as(true);

    expect(show?.children).toHaveLength(1);
    expect(show?.children?.[0]?.t).toBe("view");
  });

  it("reports handled errors to the global scope when enabled", () => {
    const reportError = vi.fn();
    vi.stubGlobal("reportError", reportError);

    ErrorBoundary(
      {
        throwToGlobal: true,
        fallback() {
          return View({}, ["fallback"]);
        },
      },
      () => {
        throw new Error("boom");
      },
    );

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((reportError.mock.calls[0]?.[0] as Error).message).toBe("boom");
  });

  it("does not report handled errors to the global scope by default", () => {
    const reportError = vi.fn();
    vi.stubGlobal("reportError", reportError);

    ErrorBoundary(
      {
        fallback() {
          return View({}, ["fallback"]);
        },
      },
      () => {
        throw new Error("boom");
      },
    );

    expect(reportError).not.toHaveBeenCalled();
  });

  it("renders fallback when LazyView async factory throws", async () => {
    const boundary = ErrorBoundary(
      {
        fallback(error) {
          return View({}, [`fallback: ${error instanceof Error ? error.message : String(error)}`]);
        },
      },
      () => [
        LazyView({}, () =>
          Promise.resolve(() => {
            throw new Error("lazy boom");
          }),
        ),
      ],
    );

    const lazyView = boundary.children?.[0];
    expect(lazyView?.children).toHaveLength(0);

    lazyView!.$elm = {
      replaceChildren(children: unknown[]) {
        lazyView!.children = children as any;
      },
      refresh(children: unknown[]) {
        lazyView!.children = children as any;
      },
    };

    await Promise.resolve();
    await Promise.resolve();

    expect(lazyView?.children).toHaveLength(1);
    expect(lazyView?.children?.[0]?.t).toBe("view");
  });
});
