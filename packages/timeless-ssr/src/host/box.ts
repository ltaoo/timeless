import {
  RawViewStyleProperties,
  TimelessElement,
  VNodeView,
} from "@timeless/timeless";

function buildAttributes(state: TimelessElement["state"]): string[] {
  const attributes: {
    key: string;
    value: string;
  }[] = [];
  if (!state) {
    return [];
  }
  if (state.id !== undefined) {
    attributes.push({
      key: "id",
      value: state.id,
    });
  }
  if (state.styleSet && state.styleSet.length > 0) {
    const r = state.styleSet.join(" ");
    if (r) {
      attributes.push({
        key: "class",
        value: r,
      });
    }
  }
  if (state.style) {
    const v = styleToString(state.style);
    if (v) {
      attributes.push({
        key: "style",
        value: v + ";",
      });
    }
  }
  if (state.attributes) {
    for (const [key, value] of Object.entries(state.attributes)) {
      if (value !== undefined && value !== null) {
        attributes.push({
          key,
          value: attrEscape(String(value)),
        });
      }
    }
  }
  if (state.dataset) {
    for (const [key, value] of Object.entries(state.dataset)) {
      if (value !== undefined && value !== null) {
        attributes.push({
          key: `data-${camelToKebab(key)}`,
          value: attrEscape(String(value)),
        });
      }
    }
  }
  if (attributes.length === 0) {
    return [];
  }
  return attributes.map((attr) => `${attr.key}="${attr.value}"`);
}

function buildChildren(
  children: (TimelessElement | null)[] | undefined,
  build: (elm: TimelessElement) => VNodeView<string>,
): string {
  if (!children) return "";
  let result = "";
  for (const child of children) {
    if (child) {
      const child$ = build(child);
      result += child$.render();
    }
  }
  return result;
}

function styleToString(style: RawViewStyleProperties): string {
  const parts: string[] = [];
  const keys = Object.keys(style);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const value = style[k];
    if (value !== undefined && value !== null) {
      parts.push(`${camelToKebab(k)}:${value}`);
    }
  }
  return parts.join(";");
}

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function attrEscape(str: string): string {
  return str.replace(/"/g, "&quot;");
}

export function SSRBox() {
  const methods = {
    isDocumentFragment() {
      return false;
    },
    get$elm() {
      return "";
    },
    setStyle() {},
    setStyleValue() {},
    setStyleSet() {},
    setAttribute() {},
    removeAttribute() {},
    getBoundingClientRect() {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
    },
    addEventListener() {
      return function () {};
    },
    removeEventListener() {},
    getChildren() {
      return [];
    },
    buildChildren() {
      return {
        $fragment: null,
        child_nodes: [],
        child_elements: [],
        child_host_nodes: [],
      };
    },
    insertChildren() {},
    removeChildren() {},
    getParent() {
      return null;
    },
  };
  return {
    buildAttributes,
    buildChildren,
    stringifyAttrs(attrs: string[]) {
      if (attrs.length === 0) {
        return "";
      }
      return " " + attrs.join(" ");
    },
    methods,
  };
}
