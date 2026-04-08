export interface DOMText {
  $elm: null | Text;
  isDocumentFragment(): boolean;
  getChildNodes(): ChildNode[];
  setContent(value: string | number | null): void;
  render(): Text | null;
}

export function DOMText(value?: string | null): DOMText {
  const $text = document.createTextNode(
    (() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }
      return "";
    })(),
  );
  return {
    get $elm() {
      return $text;
    },
    getChildNodes() {
      return [];
    },
    isDocumentFragment() {
      return true;
    },
    setContent(v: string | number | null) {
      if (v !== undefined && v !== null) {
        $text.textContent = String(v);
      } else {
        $text.textContent = "";
      }
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
