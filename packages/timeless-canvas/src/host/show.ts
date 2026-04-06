import { isElement, TimelessElement, isRef } from "@timeless/timeless";

import { CanvasHostNode } from "./type";
import { CanvasDocument } from "./draw";

export interface CanvasShow {
  $elm: any;
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
    ): any;
  };
  getChildNodes(): any[];
  isDocumentFragment(): boolean;
  addContent(children: (TimelessElement | null)[]): void;
  removeContent(): void;
  render(elm: TimelessElement): any;
}

export function CanvasShow(props: {
  canvas: CanvasDocument;
  build: (elm: TimelessElement, canvas: CanvasDocument) => CanvasHostNode;
}): CanvasShow {
  const canvas = props.canvas;

  let $elm: any = null;
  let $anchor: any = null;
  let children$: any[] = [];

  const methods = {
    unmount(event: {
      data: TimelessElement[];
      reason?: string;
      destroy?: boolean;
    }) {
      const { destroy = false } = event;
      if (destroy) {
        for (const elm of event.data) {
        }
      }
      console.log("[Show] unmount completed");
    },

    mount(children: (TimelessElement | null)[], parent?: any, before?: any) {
      const $fragment = canvas.createDocumentFragment();
      const new_nodes: any[] = [];
      const new_instances: any[] = [];

      for (let elm of children) {
        if (!elm) {
          continue;
        }
        if (isElement(elm)) {
          new_instances.push(elm);
        } else if (typeof elm === "string" || typeof elm === "number") {
          const $text = canvas.createTextNode(String(elm));
          canvas.appendChild($fragment, $text);
          new_nodes.push($text);
        }
      }

      if (parent) {
        canvas.insertBefore(parent, $fragment, before || null);
      }

      for (const child of new_instances) {
        if (isElement(child) && child.onMounted) {
          child.onMounted(child.$elm);
        }
      }

      return $fragment;
    },
  };

  return {
    get $elm() {
      return $elm;
    },
    methods,
    getChildNodes() {
      return $elm ? [] : [];
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      $elm = canvas.createDocumentFragment();
      $anchor = canvas.createTextNode("");

      const props = (elm as any).props ?? (elm as any)._props ?? {};
      const when = props.when;
      const okFn = (elm as any)._ok ?? props.ok;
      const elseFn = (elm as any)._else ?? props.else;

      const condition = isRef(when) ? !!when.value : !!when;
      const chosen = condition ? (okFn ? okFn() : []) : elseFn ? elseFn() : [];
      const normalizedChildren = Array.isArray(chosen) ? chosen : [chosen];

      const new_nodes: any[] = [];
      const new_instances: any[] = [];

      for (let child of normalizedChildren) {
        if (!child) {
          continue;
        }
        if (typeof child === "function") {
          child = child();
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
              children$.push($sub.$elm);
            }
          }
          if ($sub.$elm) {
            canvas.appendChild($elm, $sub.$elm);
          }
        } else if (typeof child === "string" || typeof child === "number") {
          const $text = canvas.createTextNode(String(child));
          canvas.appendChild($elm, $text);
          new_nodes.push($text);
          children$.push($text);
        }
      }

      canvas.appendChild($elm, $anchor);
      return $anchor;
    },
    addContent(children: (TimelessElement | null)[]) {
      const new_nodes: any[] = [];
      const new_instances: any[] = [];
      const $parent = $anchor ? canvas.getParentNode($anchor) : null;
      if (!$parent) {
        return;
      }
      if (children) {
        for (let child of children) {
          if (!child) {
            continue;
          }
          if (isElement(child)) {
            new_instances.push(child);
            const $sub = props.build(child, canvas);
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
                children$.push($sub.$elm);
              }
            }
            if ($sub.$elm) {
              canvas.appendChild($elm, $sub.$elm);
            }
          }
        }
        canvas.appendChild($parent, $elm);
      }
    },
    removeContent() {
      for (const node of children$) {
        const $parent = canvas.getParentNode(node);
        if ($parent) {
          canvas.removeChild($parent, node);
        }
      }
      children$ = [];
    },
  };
}

export function isCanvasShow(value: any): value is CanvasShow {
  return (
    value &&
    typeof value === "object" &&
    typeof value.methods === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function" &&
    typeof value.addContent === "function" &&
    typeof value.removeContent === "function"
  );
}
