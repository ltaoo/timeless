import { describe, expect, it } from "vitest";

import { getPlatform, vm } from "@timeless/timeless";

import { platform } from "@/index";

describe("DOM platform", () => {
  it("configures the primitive and PopperCore platforms", () => {
    expect(getPlatform()).toBe(platform);
    expect(vm.getPopperPlatform()).toBe(platform);
    expect(new vm.PopperCore().platform).toBe(platform);
  });
});
