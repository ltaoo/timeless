import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMMatch {
  t: "match";
  /** 宿主元素，在 build 过程会插入父节点 */
  $elm: DocumentFragment;
  getChildNodes(): ChildNode[];
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): Text;
  addContent(children: (TimelessElement | null)[]): void;
  removeContent(): void;
  hydrateContent(
    children: (TimelessElement | null)[],
    startDom: any,
    parentDom: any,
    onMounted?: (event: any) => void,
    callback?: (newNodes: any[], newInstances: any[]) => void,
  ): any;
}

export function DOMMatch(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMMatch {
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");

  let elements: TimelessElement[] = [];
  const children$: ChildNode[] = [];

  return {
    t: "match",
    get $elm() {
      return $fragment;
    },
    getChildNodes() {
      return children$;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const new_nodes: any[] = [];
      const new_instances: any[] = [];
      if (elm.children) {
        for (let child of elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
            new_instances.push(child);
            const $sub = props.build(child);
            if (!$sub) {
              continue;
            }
            if ($sub.isDocumentFragment()) {
              const child_nodes = $sub.getChildNodes();
              new_nodes.push(...child_nodes);
              children$.push(...child_nodes);
            } else {
              new_nodes.push($sub);
              if ($sub.$elm) {
                children$.push($sub.$elm as ChildNode);
              }
            }
            if ($sub.$elm) {
              $fragment.appendChild($sub.$elm);
            }
          }
        }
        $fragment.appendChild($anchor);
        elements = new_instances;
        for (let child of elements) {
          if (child.onMounted) {
            child.onMounted({
              target: child.$elm,
            });
          }
        }
      }

      return $anchor;
    },
    addContent(children: (TimelessElement | null)[]) {
      const new_instances: TimelessElement[] = [];
      const $parent = $anchor.parentElement;
      if (!$parent || !children) {
        return;
      }

      for (let child of children) {
        if (!child) {
          continue;
        }
        if (isElement(child)) {
          // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
          new_instances.push(child);
          const $sub = props.build(child);
          if (!$sub) {
            continue;
          }
          if ($sub.isDocumentFragment()) {
            const child_nodes = $sub.getChildNodes();
            children$.push(...child_nodes);
          }

          if ($sub.$elm) {
            children$.push($sub.$elm as ChildNode);
            $fragment.appendChild($sub.$elm);
          }
        }
      }
      $parent.appendChild($fragment);
      elements = new_instances;
      for (let child of elements) {
        if (child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    removeContent() {
      console.log("[]Match - removeContent", children$);
      for (const node of children$) {
        const $parent = node.parentElement;
        if ($parent) {
          $parent.removeChild(node);
        }
      }
      for (let child of elements) {
        if (child.onUnmounted) {
          child.onUnmounted();
        }
      }
      elements = [];
      children$.length = 0;
    },
    hydrateContent(
      children: (TimelessElement | null)[],
      startDom: any,
      parentDom: any,
      onMounted?: (event: any) => void,
      callback?: (newNodes: any[], newInstances: any[]) => void,
    ) {
      const new_nodes: any[] = [];
      const new_instances: any[] = [];

      if (!children || children.length === 0) {
        if (callback) {
          callback(new_nodes, new_instances);
        }
        return $anchor;
      }

      for (let child of children) {
        if (!child) {
          continue;
        }
        if (isElement(child)) {
          new_instances.push(child);
          const $sub = props.build(child);
          if (!$sub) {
            continue;
          }
          if ($sub.isDocumentFragment()) {
            const child_nodes = $sub.getChildNodes();
            new_nodes.push(...child_nodes);
            children$.push(...child_nodes);
          } else {
            new_nodes.push($sub);
            if ($sub.$elm) {
              children$.push($sub.$elm as ChildNode);
            }
          }
        }
      }

      elements = new_instances;

      if (onMounted) {
        for (let child of elements) {
          if (child.onMounted) {
            onMounted({
              target: child.$elm,
            });
          }
        }
      }

      if (callback) {
        callback(new_nodes, new_instances);
      }

      return $anchor;
    },
  };
}

export function isDOMMatch(value: any): value is DOMMatch {
  return value.t === "match";
}
