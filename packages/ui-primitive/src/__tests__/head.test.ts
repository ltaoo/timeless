import { expect, it } from "vitest";
import { Head1, Head2, Head3 } from "../modules/head";
it("preserves heading semantics alongside caller attributes using View", () => {
  for (const [index, factory] of [Head1, Head2, Head3].entries()) {
    const node = factory({ attributes: { id: `heading-${index}` } }, ["Title"]);
    expect(node.t).toBe("view");
    expect(node.state.attributes.id).toBe(`heading-${index}`);
    expect(node.state.attributes.role).toBe("heading");
    expect(node.state.attributes["aria-level"]).toBe(index + 1);
  }
});
