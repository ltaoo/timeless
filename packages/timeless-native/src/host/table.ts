import { TimelessElement, VNodeView } from "@timeless/timeless";
import { setNativeDefaultStyle } from "../stylesheet";
import { NativeView } from "./view";

const table_roles: Record<string, string> = {
  table: "table",
  "table-header": "rowgroup",
  "table-body": "rowgroup",
  "table-footer": "rowgroup",
  "table-row": "row",
  "table-head": "columnheader",
  "table-cell": "cell",
  "table-caption": "caption",
};

export function isNativeTableType(type: string) {
  return Object.prototype.hasOwnProperty.call(table_roles, type);
}

export function NativeTable(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}) {
  const view = NativeView(props);
  view.get$elm().type = props.elm.t;
  return {
    ...view,
    t: props.elm.t,
    isDocumentFragment: () => false,
    render() {
      const node = view.render();
      const cell = ["table-head", "table-cell"].includes(node.type);
      const defaults: Record<string, string> = {
        display: "flex",
        "flex-direction": node.type === "table-row" ? "row" : "column",
      };
      // shortcut: Native tables use equal-width columns; add intrinsic sizing and spans when needed.
      if (cell)
        Object.assign(defaults, {
          "flex-grow": "1",
          "flex-basis": "0px",
          "min-width": "0px",
          "justify-content": "center",
        });
      setNativeDefaultStyle(node, defaults);
      if (!node.attrs.role) view.setAttribute("role", table_roles[node.type]);
      return node;
    },
  };
}
