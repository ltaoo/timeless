import { VNodeView, TimelessElement } from "@timeless/timeless";
import { HostElement } from "./box";

export type DOMText = VNodeView<Text> & {
  t: "text";
  render(elm: TimelessElement): Text | null;
  hydrate(elm: TimelessElement, $text: HTMLElement | Text): void;
  setText(value: string | number | null): void;
};

export function DOMText(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMText {
  const t = "text";
  let $text: any = null;
  let box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "text";
    },
    isDocumentFragment() {
      return false;
    },
    setText(v?: string | number | null) {
      if (!$text) {
        return;
      }
      if (v !== undefined && v !== null) {
        $text.textContent = String(v);
      } else {
        $text.textContent = "";
      }
    },
    removeChildren() {
      $text = null;
      box$.methods.destroy();
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
      box$.methods.set$elm($text);
      return $text;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      if ($elm instanceof Text) {
        $text = $elm;
        box$.methods.set$elm($text);
        box$.methods.setupEventListener(elm.events);
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
