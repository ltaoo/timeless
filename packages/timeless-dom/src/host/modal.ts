import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import {
  HostElement,
  countRenderedNodes,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";

const logger = Logger({ prefix: "dom", scope: "modal" });

export type DOMModal = VNodeView<HTMLElement> & {
  t: "modal";
  render(): HTMLElement;
  hydrate(elm: TimelessElement, $e: HTMLElement): void;
  setOpen(open: boolean, modal?: boolean): void;
  bindDismiss(onClose?: () => void): () => void;
};

export function DOMModal(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLElement>;
  elm: TimelessElement;
}): DOMModal {
  const t = "modal";
  const box$ = HostElement({ $elm: null, t, build: props.build });
  let closing = false;

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return true;
    },
    setOpen(open: boolean, modal = true) {
      const element = box$.methods.get$elm() as HTMLDialogElement | null;
      if (!element) return;
      if (open && !element.open) {
        if (modal) element.showModal();
        else element.show();
      } else if (!open && element.open) {
        closing = true;
        element.close();
      }
    },
    bindDismiss(onClose?: () => void) {
      const element = box$.methods.get$elm() as HTMLDialogElement;
      const cancel = (event: Event) => {
        if (onClose) {
          event.preventDefault();
          onClose();
        }
      };
      const close = () => {
        if (closing) {
          closing = false;
          return;
        }
        if (!element.open) onClose?.();
      };
      const backdrop = (event: MouseEvent) => {
        if (event.target !== element) return;
        const rect = element.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onClose?.();
      };
      element.addEventListener("cancel", cancel);
      element.addEventListener("close", close);
      element.addEventListener("click", backdrop);
      return () => {
        element.removeEventListener("cancel", cancel);
        element.removeEventListener("close", close);
        element.removeEventListener("click", backdrop);
      };
    },
    render() {
      const $elm = document.createElement("dialog");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[dom]host/view - hydrate", $elm, elm.state);
      box$.methods.set$elm($elm);
      // box$.methods.applyState(elm.state);
      box$.methods.setupEventListener(elm.events);

      const child_nodes: VNodeView[] = [];
      const child_elements: (TimelessElement | null)[] = [];

      if ($elm && elm.children) {
        // const total_nodes = countRenderedNodes(elm);
        const $children = Array.from($elm.childNodes) as (HTMLElement | Text)[];
        let offset = 0;
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          const $child = $children[offset] as HTMLElement | Text;
          child_elements.push(child);

          logger.log("each child", i, child, $child, offset);

          if (child) {
            const child$ = hydrate_node(child, $child, {
              $parent: $elm as HTMLElement,
              offset,
              idx: i,
            });
            // cursor += total_nodes;
            if (child$) {
              if (isEmptyNode(child)) {
              } else if (isFragment(child)) {
                const count_$children = child$.get$children().length;
                offset += count_$children;
                offset += insertedAnchor(child) ? 1 : 0;
                // $child_offset += count_$children;
              } else {
                offset += 1;
                // $child_offset += 1;
              }
              child_nodes.push(child$);
            }
          }
        }
        box$.methods.setchildrenelement(child_elements);
        box$.methods.setchildnode(child_nodes);
      }
    },
  };
}

export function isDOMModal(
  value: { t?: string } & VNodeView<any>,
): value is DOMModal {
  return value.t === "modal";
}
