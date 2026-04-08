import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMLazyView {
  t: "lazy-view";
  $elm: DocumentFragment;
  methods: {
    unmount(event: {
      data: TimelessElement[];
      reason?: string;
      destroy?: boolean;
    }): void;
    mount(
      children: (TimelessElement | null)[],
      parent?: any,
      before?: any,
    ): DocumentFragment;
  };
  getChildNodes(): NodeListOf<ChildNode>;
  isDocumentFragment(): boolean;
  render(elm: TimelessElement): Text;
  refresh(children: (TimelessElement | null)[]): void;
  addContent(children: (TimelessElement | null)[]): void;
  removeContent(): void;
}

export function DOMLazyView(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMLazyView {
  const methods = {
    unmount(event: {
      data: TimelessElement[];
      reason?: string;
      destroy?: boolean;
    }) {
      const { destroy = false } = event;
      // DOM removal
      if (destroy) {
        // console.log("[Show] removing DOM nodes, count:", _current_nodes.length);
        for (const elm of event.data) {
          // 直接检查节点是否还有父节点，不依赖 anchor.parentNode
          // console.log(
          //   "[Show] checking node:",
          //   node.nodeName,
          //   "parentNode:",
          //   !!node.parentNode,
          // );
          //   const parent = host.getParentNode(elm);
          //   if (parent) {
          //     host.removeChild(parent, elm);
          //   }
        }
      }
      console.log("[Show] unmount completed");
    },

    mount(children: (TimelessElement | null)[], parent?: any, before?: any) {
      const $fragment = document.createDocumentFragment();
      const new_nodes: any[] = [];
      const new_instances: any[] = [];

      for (let elm of children) {
        if (!elm) {
          continue;
        }
        // 处理 h() 返回的延迟执行函数
        // if (typeof node === "function") {
        //   node = node();
        // }
        if (isElement(elm)) {
          //   const result = elm.render();
          // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
          new_instances.push(elm);
          //   if (result) {
          //     if (host.isDocumentFragment(result)) {
          //       new_nodes.push(...host.getChildNodes(result));
          //     } else {
          //       new_nodes.push(result);
          //     }
          //     host.appendChild($fragment, result);
          //   }
        } else if (typeof elm === "string" || typeof elm === "number") {
          const $text = document.createTextNode(String(elm));
          $fragment.appendChild($text);
          new_nodes.push($text);
        }
      }

      //       _current_nodes = new_nodes;
      //       _current_children = new_instances;

      if (parent) {
        // host.insertBefore(parent, $fragment, before || null);
        parent.insertBefore($fragment, before || null);
      }

      // Lifecycle
      for (const child of new_instances) {
        if (isElement(child) && child.onMounted) {
          child.onMounted(child.$elm);
        }
      }

      return $fragment;
    },
  };

  let elements: TimelessElement[] = [];
  const children$: ChildNode[] = [];
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");

  return {
    t: "lazy-view",
    get $elm() {
      return $fragment;
    },
    methods,
    getChildNodes() {
      return $fragment.childNodes;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const new_elements: TimelessElement[] = [];
      if (elm.children) {
        // console.log("[]show - in render", elm.children);
        for (let child of elm.children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
            new_elements.push(child);
            const $sub = props.build(child);
            if (!$sub) {
              continue;
            }
            if ($sub.isDocumentFragment()) {
              const child_nodes = Array.from($sub.getChildNodes());
              // new_nodes.push(...child_nodes);
              children$.push(...child_nodes);
            } else {
              // new_nodes.push($sub);
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
        for (const child of new_elements) {
          if (isElement(child) && child.onMounted) {
            child.onMounted({
              target: child.$elm,
            });
          }
        }
        elements = new_elements;
      }

      return $anchor;
    },
    refresh(children: (TimelessElement | null)[]) {
      this.removeContent();
      this.addContent(children);
    },
    addContent(children: (TimelessElement | null)[]) {
      // const new_nodes: any[] = [];
      const new_elements: any[] = [];
      const $parent = $anchor.parentElement;
      if (!$parent || !children) {
        return;
      }
      // console.log("[]show - in render", elm.children);
      for (let child of children) {
        // console.log("[]show addContent", child);
        if (!child) {
          continue;
        }
        if (isElement(child)) {
          // 即使 render 返回 null（如 Portal），也要保存实例以便调用生命周期
          new_elements.push(child);
          const $sub = props.build(child);
          if (!$sub) {
            continue;
          }
          if ($sub.isDocumentFragment()) {
            const child_nodes = Array.from($sub.getChildNodes());
            // new_nodes.push(...child_nodes);
            children$.push(...child_nodes);
          } else {
            // new_nodes.push($sub);
            if ($sub.$elm) {
              children$.push($sub.$elm as ChildNode);
            }
          }
          // console.log("[]show addContent before $sub.$elm", $sub.$elm);
          if ($sub.$elm) {
            $fragment.appendChild($sub.$elm);
          }
        }
      }
      $parent.appendChild($fragment);
      for (const child of new_elements) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
      elements = new_elements;
      // console.log("[]show - the end of addContent", children$);
    },
    removeContent() {
      // console.log("[]LazyView - removeContent", children$);
      for (const node of children$) {
        const $parent = node.parentElement;
        // console.log("[]show remove content", node, $parent);
        if ($parent) {
          $parent.removeChild(node);
        }
      }
      children$.length = 0;
      // @fragment 会在 appendChild 自己清空，无需手动清空
      for (const element of elements) {
        if (element.onUnmounted) {
          element.onUnmounted();
        }
      }
    },
  };
}

export function isDOMLazyView(value: any): value is DOMLazyView {
  return value.t === "lazy-view";
}
