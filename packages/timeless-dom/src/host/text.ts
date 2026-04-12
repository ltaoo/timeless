import { VNodeView, TimelessElement } from "@timeless/timeless";
import { HostElement } from "./box";

export type DOMText = VNodeView<Text> & {
  t: "text";
  render(elm: TimelessElement): Text | null;
  hydrate(elm: TimelessElement, $text: HTMLElement | Text): void;
  setContent(value: string | number | null): void;
};

export function DOMText(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMText {
  const t = "text";
  let $text: any = null;
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "text";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    setContent(v?: string | number | null) {
      if (v !== undefined && v !== null) {
        $text.textContent = String(v);
      } else {
        $text.textContent = "";
      }
    },
    render(elm: TimelessElement) {
      // if (elm.state.value === undefined || elm.state.value === null) {
      //   return $text;
      // }
      $text = document.createTextNode(
        (() => {
          if (elm.state.value !== null && elm.state.value !== undefined) {
            return String(elm.state.value);
          }
          return "";
        })(),
      );
      return $text;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      if ($elm instanceof Text) {
        $text = $elm;
        common$.methods.set$elm($text);
        common$.methods.setupEventListener(elm.events);
      }
    },
  };
}

export function isDOMText(value: any): value is DOMText {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
