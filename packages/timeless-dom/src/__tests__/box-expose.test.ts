import { afterEach, describe, expect, it, vi } from "vitest";

import { HostElement } from "@/host/box";

type FakeEntry = {
  target: object;
  isIntersecting: boolean;
};

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly targets = new Set<object>();
  readonly observe = vi.fn((target: object) => {
    this.targets.add(target);
  });
  readonly unobserve = vi.fn((target: object) => {
    this.targets.delete(target);
  });
  readonly disconnect = vi.fn(() => {
    this.targets.clear();
  });

  constructor(readonly callback: (entries: FakeEntry[]) => void) {
    FakeIntersectionObserver.instances.push(this);
  }

  trigger(...entries: FakeEntry[]) {
    this.callback(entries);
  }
}

function create_host() {
  const element = {
    nodeType: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const host = HostElement({
    t: "view",
    $elm: element,
    build: vi.fn(),
  });
  return { element, host };
}

describe("shared Box exposure observer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeIntersectionObserver.instances.length = 0;
  });

  it("uses one observer, fires once, and cleans up on teardown", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const first = create_host();
    const second = create_host();
    const first_expose = vi.fn();
    const second_expose = vi.fn();

    first.host.methods.setupEventListener({ onExpose: first_expose });
    second.host.methods.setupEventListener({ onExpose: second_expose });

    expect(FakeIntersectionObserver.instances).toHaveLength(1);
    const observer = FakeIntersectionObserver.instances[0];
    observer.trigger({ target: first.element, isIntersecting: true });
    observer.trigger({ target: first.element, isIntersecting: true });

    expect(first_expose).toHaveBeenCalledOnce();
    expect(second_expose).not.toHaveBeenCalled();
    expect(observer.unobserve).toHaveBeenCalledWith(first.element);

    second.host.methods.teardownEventListener({ onExpose: second_expose });

    expect(observer.unobserve).toHaveBeenCalledWith(second.element);
    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
