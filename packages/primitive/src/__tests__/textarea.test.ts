import { ref } from "@timeless/inner-reactive";
import { describe, expect, it } from "vitest";

import { Textarea } from "@/input/textarea";

describe("Textarea attributes", () => {
  it("keeps attributes in host state", () => {
    const label_ = ref("Comment");
    const textarea = Textarea({
      attributes: { n: "textarea-input", "aria-label": label_ },
    });

    expect(textarea.state.attributes).toMatchObject({
      n: "textarea-input",
      "aria-label": "Comment",
    });

    label_.as("Feedback");

    expect(textarea.state.attributes["aria-label"]).toBe("Feedback");
  });
});
