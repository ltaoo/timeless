import { TimelessElement, VNodeView } from "@timeless/timeless";
import * as ASN from "@timeless/icons/asn";
import { SSRBox } from "./box";

type ASNNode = {
  tag: string;
  attrs?: Record<string, string>;
  children?: readonly ASNNode[];
};

export type SSRIcon = VNodeView<string> & {
  t: "icon";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRIcon(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRIcon {
  const t = "icon";
  const box$ = SSRBox();

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    render(elm: TimelessElement) {
      const name = elm.state.name as string;
      if (!name) {
        console.warn(`Icon must have a name`);
        return "";
      }
      const pascal_name = name
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      const asn_node = (ASN as any)[pascal_name] as ASNNode | undefined;
      if (!asn_node) {
        console.warn(`Icon "${name}" not found in @timeless/icons/asn`);
        return "";
      }
      return render_asn_to_string(asn_node, elm.state);
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}

function render_asn_to_string(
  asn: ASNNode,
  props: { styleSet?: string[]; color: string; size: number },
): string {
  const { tag, attrs = {}, children } = asn;

  if (tag === "svg") {
    const size = props.size ? String(props.size) : "24";
    const styleSet = props.styleSet
      ? ` class="${props.styleSet.join(" ")}"`
      : "";
    const inner = render_children_string(asn.children, props);
    return `<svg width="${size}" height="${size}"${styleSet}>${inner}</svg>`;
  }

  const attrStr = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  if (children && children.length > 0) {
    const inner = render_children_string(children, props);
    return attrStr ? `<${tag} ${attrStr}>${inner}</${tag}>` : `<${tag}>${inner}</${tag}>`;
  }

  return attrStr ? `<${tag} ${attrStr}/>` : `<${tag}/>`;
}

function render_children_string(
  children: readonly ASNNode[] | undefined,
  props: { styleSet?: string[]; color: string; size: number },
): string {
  if (!children || children.length === 0) return "";
  return children.map((child) => render_asn_to_string(child, props)).join("");
}
