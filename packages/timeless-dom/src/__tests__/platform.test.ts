import { describe, expect, it } from "vitest";

import { getPlatform } from "@timeless/timeless";
import { getPopperPlatform, PopperCore } from "@timeless/inner-vm";

import { platform } from "@/index";

describe("DOM platform", () => {
  it("configures PopperCore with the DOM platform", () => {
    expect(getPlatform()).toBe(platform);
    expect(getPopperPlatform()).toBe(platform);
    expect(new PopperCore().platform).toBe(platform);
  });
});
