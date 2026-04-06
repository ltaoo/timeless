import { isElement, TimelessElement, isRef } from "@timeless/timeless";

import { TuiHostNode } from "./type";
import { createTuiFragment, createTuiText } from "./nodes";

export interface TuiShow {
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

export function TuiShow(props: {
  build: (elm: TimelessElement) => TuiHostNode;
}): TuiShow {
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
      const $fragment = createTuiFragment();
      const new_nodes: any[] = [];
      const new_instances: any[] = [];

      for (let elm of children) {
        if (!elm) {
          continue;
        }
        if (isElement(elm)) {
          new_instances.push(elm);
        } else if (typeof elm === "string" || typeof elm === "number") {
          const $text = createTuiText(String(elm));
          $fragment.appendChild($text);
          new_nodes.push($text);
        }
      }

      if (parent) {
        parent.insertBefore($fragment, before || null);
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
      $elm = createTuiFragment();
      $anchor = createTuiText("");

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
            $elm.appendChild($sub.$elm);
          }
        } else if (typeof child === "string" || typeof child === "number") {
          const $text = createTuiText(String(child));
          $elm.appendChild($text);
          new_nodes.push($text);
          children$.push($text);
        }
      }

      $elm.appendChild($anchor);
      return $anchor;
    },
    addContent(children: (TimelessElement | null)[]) {
      const new_nodes: any[] = [];
      const new_instances: any[] = [];
      const $parent = $anchor ? $anchor.parentNode : null;
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
              $elm.appendChild($sub.$elm);
            }
          }
        }
        $parent.appendChild($elm);
      }
    },
    removeContent() {
      for (const node of children$) {
        const $parent = node.parentNode;
        if ($parent) {
          $parent.removeChild(node);
        }
      }
      children$ = [];
    },
  };
}

export function isTuiShow(value: any): value is TuiShow {
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
