import { parseRichText, type TimelessElement } from "@timeless/timeless";
import { SSRBox } from "./box";

export function SSRRichText(props: { elm: TimelessElement }) {
  const box = SSRBox();
  return {
    ...box.methods,
    t: "rich-text",
    getType() {
      return "view" as const;
    },
    render() {
      const attrs = box.stringifyAttrs(box.buildAttributes(props.elm.state));
      const document =
        props.elm.state.document ??
        parseRichText(props.elm.state.content ?? "", props.elm.state.format);
      return `<div${attrs}>${document.html}</div>`;
    },
    hydrate() {},
  };
}
