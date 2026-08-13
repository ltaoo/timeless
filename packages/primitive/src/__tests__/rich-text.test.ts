import { describe, expect, it, vi } from "vitest";

import { ref } from "@timeless/inner-reactive";

import { RichText } from "@/content/rich-text";

describe("RichText", () => {
  it("stores content and forwards reactive updates to its host", () => {
    const content = ref("<p>First</p>");
    const element = RichText({ content });
    const host = { setContent: vi.fn() };

    expect(element.state.content).toBe("<p>First</p>");

    element.$elm = host;
    content.as("<strong>Updated</strong>");

    expect(element.state.content).toBe("<strong>Updated</strong>");
    expect(host.setContent).toHaveBeenCalledWith("<strong>Updated</strong>");

    element.onUnmounted();
    content.as("<em>Ignored</em>");

    expect(host.setContent).toHaveBeenCalledOnce();
  });
});
