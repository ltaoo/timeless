import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import {
  countRenderedNodes,
  HostElement,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";

const logger = Logger({
  prefix: "dom",
  scope: "list-view",
  prefixColor: "#ff6b6b",
});

export type DOMListView = VNodeView<HTMLDivElement> & {
  t: "list-view";
  insert(idx: number, element: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; elements: (TimelessElement | null)[] }[];
    removed: { idx: number; count: number }[];
    moved: { from: number; to: number }[];
  }): void;
  move(from: number, to: number): void;
  swap(from: number, to: number): void;
  render(): HTMLDivElement;
  reorderSlots(elements: Element[]): void;
};

export function DOMListView(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
  elm: TimelessElement;
}): DOMListView {
  // const $fragment = document.createDocumentFragment();
  const t = "list-view";
  //   const $anchor = document.createTextNode("");
  let $content: any | null = null;
  let $viewport: any | null = null;
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    insert(idx, children) {
      return box$.methods.insert(idx, children, { $parent: $viewport });
    },
    remove(idx, count) {
      box$.methods.remove(idx, count, { $parent: $viewport });
    },
    refresh(payload) {
      box$.methods.refresh(payload, { $parent: $viewport });
    },
    move: box$.methods.move,
    swap: box$.methods.move,
    reorderSlots(elements: Element[]) {
      if (!$viewport) return;
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (el && $viewport.children[i] !== el) {
          $viewport.insertBefore(el, $viewport.children[i] || null);
        }
      }
    },
    setStyleValue(k: string, value: string | number) {
      if (k === "viewportOffset") {
        if ($viewport) {
          $viewport.style.transform = `translateY(${value}px)`;
        }
        return;
      }
      if (k === "viewportOpacity") {
        if ($viewport) {
          $viewport.style.opacity = String(value);
        }
        return;
      }
      if ($content) {
        $content.style[k] = `${value}px`;
        if (k === "height") {
          const newHeight = Number(value);
          const maxScroll = Math.max(0, newHeight - $content.clientHeight);
          if ($content.scrollTop > maxScroll) {
            $content.scrollTop = maxScroll;
          }
        }
      }
    },
    render() {
      const $elm = document.createElement("div");
      $content = document.createElement("div");
      $viewport = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state);
      box$.methods.setupEventListener(props.elm.events);
      $elm.style.position = "relative";
      $elm.style.overflowY = "auto";
      if (props.elm.state.height) {
        $content.style.height = `${props.elm.state.height}px`;
      }
      $content.style.position = "relative";
      $viewport.style.position = "absolute";
      $viewport.style.top = "0";
      $viewport.style.left = "0";
      $viewport.style.right = "0";
      $elm.setAttribute("data-list-view-root", "");
      $content.setAttribute("data-list-view-content", "");
      $viewport.setAttribute("data-list-view-viewport", "");
      $elm.addEventListener("scroll", function (event) {
        const top = (event.target as any).scrollTop;
        (props.elm.events as any)?.onScroll?.({
          scrollTop: top,
        });
      });
      const $fragment = box$.methods.render(props.elm.children);
      $viewport.appendChild($fragment);
      $content.appendChild($viewport);
      $elm.appendChild($content);
      return $elm;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: { $parent: any; offset: number; idx: number },
    ) {
      // logger.log("hydrate", elm, $elm, opt.$parent, opt.offset, opt.idx);
      const $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);

      const $v = opt.$parent || $elm;
      const idx = opt.offset;

      const hydrated_elements: (TimelessElement | null)[] = [];
      const hydrated_child_nodes: VNodeView[] = [];

      if ($v && $v instanceof HTMLElement) {
        if (elm.children) {
          // common$.methods.setchildrenelement([...elm.children]);
          // const count = elm.children.length;
          // const $parent = $elm.parentElement;
          const total_nodes = countRenderedNodes(elm);
          // console.log("[]for check has $parent", $parent, count);
          const $children = Array.from($v.childNodes) as (HTMLElement | Text)[];
          // const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + total_nodes);
          box$.methods.set$childrne($children_belong_me);

          const $last = $children[idx + total_nodes];
          // logger.log("$children belong me", idx, $children_belong_me, $last);

          let offset = idx;
          let $child_offset = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            hydrated_elements.push(child);

            const prev_child = elm.children[i - 1];
            const $child = $children_belong_me[$child_offset] as
              | HTMLElement
              | Text;

            // logger.log("each child", i, child, $child, offset, prev_child);

            if (child) {
              const child$ = hydrate_node(child, $child, {
                $parent: $v as HTMLElement,
                offset,
                idx: i,
              });
              if (child$) {
                if (isEmptyNode(child)) {
                } else if (isFragment(child)) {
                  const count_$children = child$.get$children().length;
                  offset += count_$children;
                  offset += insertedAnchor(child) ? 1 : 0;
                  $child_offset += count_$children;
                } else {
                  offset += 1;
                  $child_offset += 1;
                }
                hydrated_child_nodes.push(child$);
              }
            }
          }
          box$.methods.setchildnode(hydrated_child_nodes);
          box$.methods.setchildrenelement(hydrated_elements);

          if ($last) {
            $v.insertBefore($anchor, $last);
          } else {
            $v.appendChild($anchor);
          }
        }
      }
    },
  };
}

export function isDOMListView(value: any): value is DOMListView {
  return value.t === "list-view";
}
