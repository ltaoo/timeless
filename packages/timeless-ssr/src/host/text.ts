import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRText = VNodeView<string> & {
  t: "text";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRText(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRText {
  const t = "text";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "text";
    },
    render() {
      // console.log("render text element", props.elm);
      const value = props.elm.state.value;
      if (value !== null && value !== undefined) {
        return textEscape(String(value));
      }
      return "";
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}

function textEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
