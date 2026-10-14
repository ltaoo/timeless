import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";
export type SSRModal = VNodeView<string> & { t: "modal" };
export function SSRModal(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRModal {
  const box = SSRBox();
  return {
    ...box.methods,
    t: "modal",
    getType() {
      return "view" as const;
    },
    render() {
      const attrs = box.buildAttributes(props.elm.state);
      if (props.elm.state.open) attrs.push("open");
      return `<dialog${box.stringifyAttrs(attrs)}>${box.buildChildren(props.elm.children, props.build)}</dialog>`;
    },
    hydrate() {},
  };
}
