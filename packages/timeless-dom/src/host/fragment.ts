import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMFragment = VNodeView<Text> & {
  t: "fragment";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

/**
 * Count how many real DOM nodes an element produces when rendered.
 * Transparent components (show, fragment, for, match) don't produce wrapper nodes;
 * their children render directly into the parent.
 * Portal renders to document.body, not inline.
 * All other types produce exactly 1 DOM node.
 */
export function countRenderedNodes(elm: TimelessElement | null): number {
  if (!elm) return 0;
  const t = elm.t;
  if (t === "show" || t === "fragment" || t === "for" || t === "match") {
    if (!elm.children) return 0;
    let count = 0;
    for (const child of elm.children) {
      count += countRenderedNodes(child);
    }
    return count;
  }
  if (t === "portal") return 0;
  return 1;
}

export function DOMFragment(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFragment {
  const t = "fragment";
  let $anchor: Text;
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: Partial<{ $parent: HTMLElement }> = {},
    ) {
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);

      if (!elm.children || elm.children.length === 0) {
        return;
      }

      const totalNodes = countRenderedNodes(elm);

      // Use parent-sibling approach (like Show/For).
      // Fragment has no wrapper DOM node — $elm is the first rendered
      // child in the parent's childNode list, NOT a container.
      const $parent = $elm ? $elm.parentElement : opt.$parent || null;
      if (!$parent) return;

      if (totalNodes === 0) {
        // All children produce 0 DOM nodes (portals only). Place anchor in parent.
        $parent.appendChild($anchor);
        const child_nodes: VNodeView[] = [];
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          if (!child) continue;
          const child$ = props.build(child);
          child.$elm = child$;
          if (child.t === "portal") {
            child$.hydrate(child, null);
          }
          child_nodes.push(child$);
        }
        common$.methods.setchildnode(child_nodes);
        return;
      }

      // From here, totalNodes > 0 and $elm is guaranteed non-null.
      const $allSiblings = Array.from($parent.childNodes);
      const startIdx = $allSiblings.indexOf($elm);

      // Claim the DOM nodes that belong to this Fragment
      const $ourNodes = $allSiblings.slice(startIdx, startIdx + totalNodes);
      common$.methods.set$childrne($ourNodes);

      // Insert anchor after our nodes
      const $nextSibling = $allSiblings[startIdx + totalNodes];
      if ($nextSibling) {
        $parent.insertBefore($anchor, $nextSibling);
      } else {
        $parent.appendChild($anchor);
      }

      // Hydrate children with cursor-based mapping.
      // Each child may produce 0, 1, or N DOM nodes.
      let cursor = 0;
      const child_nodes: VNodeView[] = [];
      for (let i = 0; i < elm.children.length; i += 1) {
        const child = elm.children[i];
        if (!child) continue;

        const childNodeCount = countRenderedNodes(child);

        if (childNodeCount > 0) {
          // Child has rendered DOM nodes — hydrate normally
          const child$ = hydrate_node(
            child,
            $ourNodes[cursor] as HTMLElement | Text,
          );
          cursor += childNodeCount;
          if (child$) {
            child_nodes.push(child$);
          }
        } else {
          // Child produced no DOM nodes (e.g., Show with when=false, or Portal).
          // Use hydrate_node which properly handles all types:
          // - Portal: finds its own SSR container in <body>
          // - Show/Fragment/For/Match with 0 nodes: recursively hydrates children
          const child$ = hydrate_node(child, null as any, {
            $parent,
          });
          if (child$) {
            // For non-portal transparent components, place the anchor in DOM
            // so future insertChildren can find a parent.
            if (child.t !== "portal") {
              const childAnchor = child$.get$elm();
              if (childAnchor && !childAnchor.parentElement) {
                const $insertBefore =
                  cursor < $ourNodes.length ? $ourNodes[cursor] : $anchor;
                $parent.insertBefore(childAnchor, $insertBefore);
              }
            }
            child_nodes.push(child$);
          }
        }
      }
      common$.methods.setchildnode(child_nodes);
    },
  };
}

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
