import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import {
  HostElement,
  countRenderedNodes,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";

const table_tags = {
  table: "table",
  "table-caption": "caption",
  "table-header": "thead",
  "table-body": "tbody",
  "table-footer": "tfoot",
  "table-row": "tr",
  "table-head": "th",
  "table-cell": "td",
} as const;

export type DOMTableElementType = keyof typeof table_tags;

export function isDOMTableElementType(
  value: string,
): value is DOMTableElementType {
  return Object.prototype.hasOwnProperty.call(table_tags, value);
}

export type DOMTableElement = VNodeView<HTMLElement> & {
  t: DOMTableElementType;
  render(): HTMLElement;
  hydrate(
    elm: TimelessElement,
    element: HTMLElement,
    options: { $parent: HTMLElement; offset: number; idx: number },
  ): void;
};

export function DOMTable(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLElement>;
  elm: TimelessElement;
}): DOMTableElement {
  const t = props.elm.t as DOMTableElementType;
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const element = document.createElement(table_tags[t]);
      box$.methods.set$elm(element);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
      element.appendChild(box$.methods.render(props.elm.children));
      return element;
    },
    hydrate(
      elm: TimelessElement,
      element: HTMLElement,
      options: { $parent: HTMLElement; offset: number; idx: number },
    ) {
      box$.methods.set$elm(element);
      box$.methods.setupEventListener(elm.events);

      const child_nodes: (VNodeView<any> | null)[] = [];
      const child_elements: (TimelessElement | null)[] = [];
      const dom_children = Array.from(element.childNodes) as (
        | HTMLElement
        | Text
      )[];
      let offset = 0;

      for (let index = 0; index < (elm.children?.length || 0); index += 1) {
        const child = elm.children?.[index] || null;
        child_elements.push(child);
        if (!child) continue;

        const child_node = hydrate_node(child, dom_children[offset], {
          $parent: element,
          offset,
          idx: index,
        });
        child_nodes.push(child_node);
        if (!child_node || isEmptyNode(child)) continue;
        if (isFragment(child)) {
          offset += countRenderedNodes(child);
          if (insertedAnchor(child)) offset += 1;
        } else {
          offset += 1;
        }
      }

      box$.methods.setchildnode(child_nodes);
      box$.methods.setchildrenelement(child_elements);
    },
  };
}
