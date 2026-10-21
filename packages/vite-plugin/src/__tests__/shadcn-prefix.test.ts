import { describe, expect, it } from "vitest";
import { prefixTailwindClassesPlugin } from "../../../shadcn/build/vite-plugin-tailwind-prefix";

describe("shadcn Tailwind class prefixes", () => {
  it("keeps group and peer markers consistent with generated CSS selectors", () => {
    const [source, css] = prefixTailwindClassesPlugin("/components") as any[];
    const result = source.transform.call({}, 'View({ class: "group peer flex" })', "/components/switch.ts");
    expect(result.code).toContain("tt-group tt-peer tt-flex");
    const bundle = { styles: { type: "asset", fileName: "styles.css", source: "@layer utilities { .group[data-checked] .peer { color:red } }" } };
    css.generateBundle.call({}, {}, bundle);
    expect(bundle.styles.source).toContain(".tt-group[data-checked] .tt-peer");
  });
});
