export interface NativeText {
  $elm: { type: "text"; value: string };
  isDocumentFragment(): boolean;
  getChildNodes(): any[];
  setContent(value: string | number | null): void;
  render(): any;
}

export function NativeText(value?: string | null): NativeText {
  const $text: { type: "text"; value: string } = {
    type: "text" as const,
    value: (() => {
      if (value !== null && value !== undefined) {
        return String(value);
      }
      return "";
    })(),
  };

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
      if (v !== null && v !== undefined) {
        $text.value = String(v);
      }
    },
    render() {
      return $text;
    },
  };
}

export function isNativeText(value: any): value is NativeText {
  return (
    value &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
