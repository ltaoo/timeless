import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMPortal = VNodeView<Text> & {
  t: "portal";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: any): void;
};

let _hydratePortalCounter = 0;

export function resetPortalCounter() {
  _hydratePortalCounter = 0;
}

export function DOMPortal(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMPortal {
  const t = "portal";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

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
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      console.log(
        "[DOMPortal.render] appending to body, children count=",
        $fragment.childNodes.length,
      );
      document.body.appendChild($fragment);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      const portalId = _hydratePortalCounter++;
      const $container = document.querySelector(
        `[data-timeless-portal="${portalId}"]`,
      );
      console.log("[]Portal hydrate", elm, $container);
      if (!$container) {
        console.warn(
          `[DOMPortal.hydrate] No SSR portal container found for portal ${portalId}`,
        );
        return;
      }

      common$.methods.set$elm($anchor);

      // Hydrate children against the portal container's child nodes
      const child_nodes: VNodeView<any>[] = [];
      const child_host_nodes: Node[] = [];
      const child_elements: (TimelessElement | null)[] = [];
      if (elm.children) {
        const $childNodes = Array.from($container.childNodes);
        let cursor = 0;
        for (let i = 0; i < elm.children.length; i++) {
          const child = elm.children[i];
          if (!child) continue;
          const $domNode = $childNodes[cursor];
          if ($domNode) {
            child_elements.push(child);
            child_host_nodes.push($domNode);
            const child$ = hydrate_node(child, $domNode as HTMLElement | Text, {
              $parent: $container as HTMLElement,
              offset: 0,
              idx: i,
            });
            cursor++;
            if (child$) {
              child_nodes.push(child$);
            }
          }
        }
      }
      common$.methods.setchildnode(child_nodes);
      common$.methods.set$childrne(child_host_nodes);
      common$.methods.setchildrenelement(child_elements);

      // Append the anchor text node to the container
      $container.appendChild($anchor);
    },
  };
}

export function isDOMPortal(value: any): value is DOMPortal {
  return value.t === "portal";
}
