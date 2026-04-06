import { TimelessElement } from "@timeless/timeless";

export interface DOMText {
  $elm: null | Text;
  isDocumentFragment(): boolean;
  getChildNodes(): NodeListOf<ChildNode>;
  render(): Text | null;
}

export function DOMText(value?: string | null): DOMText {
  const $text = (() => {
    if (value !== null && value !== undefined) {
      return document.createTextNode(String(value));
    }
    return null;
  })();
  return {
    get $elm() {
      return $text;
    },
    getChildNodes() {
      return {} as NodeListOf<ChildNode>;
    },
    isDocumentFragment() {
      return true;
    },
    render() {
      return $text;
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
