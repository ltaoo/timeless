import { isElement, TimelessElement } from "@timeless/timeless";

import { DOMHostNode } from "./type";

export interface DOMFor {
  $elm: DocumentFragment;
  getChildNodes(): ChildNode[];
  isDocumentFragment(): boolean;
  insert(idx: number, element: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  removeContent(): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; element: TimelessElement | null }[];
    removed: { idx: number }[];
    moved: { from: number; to: number }[];
  }): void;
  render(elm: TimelessElement): DocumentFragment;
}

export function DOMFor(props: {
  build: (elm: TimelessElement) => DOMHostNode;
}): DOMFor {
  const $fragment = document.createDocumentFragment();
  const $anchor = document.createTextNode("");
  const children$: ChildNode[] = [];

  const methods = {
    insert(idx: number, elements: (TimelessElement | null)[]) {
      console.log("[dom]For - insert", idx, elements);
      const $parent = $anchor.parentElement;
      if (!$parent) {
        return;
      }
      for (const element of elements) {
        if (element) {
          const child$ = props.build(element);
          const $reference = children$[idx];
          console.log(
            "[dom]For - insert - $sub",
            child$,
            idx,
            children$,
            $reference,
          );
          if (child$ && child$.$elm) {
            if ($reference) {
              children$.splice(idx, 0, child$.$elm);
              $parent.insertBefore(child$.$elm, $reference);
            } else {
              children$.push(child$.$elm);
              $parent.appendChild(child$.$elm);
            }
          }
        }
      }
    },
    remove(idx: number, count: number) {
      console.log("[dom]For - remove", idx, count, children$);
      const $parent = $anchor.parentElement;
      if (!$parent) {
        return;
      }
      for (let i = 0; i < count; i++) {
        const $child = children$[idx + i];
        if ($child) {
          children$.splice(idx + i, 1);
          $parent.removeChild($child);
        }
      }
    },
    refresh(data: {
      children: (TimelessElement | null)[];
      added: { idx: number; element: TimelessElement | null }[];
      removed: { idx: number }[];
      moved: { from: number; to: number }[];
    }) {
      const { added, removed, moved } = data;
      const $parent = $anchor.parentElement;
      if (!$parent) {
        return;
      }

      // 1. Remove (descending order to keep indices stable)
      const sorted_removed = [...removed].sort((a, b) => b.idx - a.idx);
      for (const { idx } of sorted_removed) {
        const $child = children$[idx];
        if ($child) {
          $parent.removeChild($child);
        }
        children$.splice(idx, 1);
      }

      // 2. Move (detach moved nodes, rebuild order, reinsert)
      if (moved.length > 0) {
        const move_entries = moved.map(({ from, to }) => ({
          $node: children$[from],
          to,
        }));

        const moved_from_set = new Set(moved.map((m) => m.from));
        const remaining = children$.filter((_, i) => !moved_from_set.has(i));

        // Insert moved nodes at their target positions (ascending order)
        const sorted_moves = [...move_entries].sort((a, b) => a.to - b.to);
        const result: ChildNode[] = [...remaining];
        for (const { $node, to } of sorted_moves) {
          if ($node) {
            result.splice(to, 0, $node);
          }
        }

        // Reinsert all children in correct order before anchor
        for (const $node of result) {
          if ($node) {
            $parent.insertBefore($node, $anchor);
          }
        }

        children$.length = 0;
        children$.push(...result);
      }

      // 3. Insert added nodes
      for (const { idx, element } of added) {
        if (element) {
          const child$ = props.build(element);
          if (child$ && child$.$elm) {
            const $reference = children$[idx];
            if ($reference) {
              children$.splice(idx, 0, child$.$elm);
              $parent.insertBefore(child$.$elm, $reference);
            } else {
              children$.push(child$.$elm);
              $parent.insertBefore(child$.$elm, $anchor);
            }
          }
        }
      }
    },
  };

  return {
    get $elm() {
      return $fragment;
    },
    getChildNodes() {
      return children$;
    },
    isDocumentFragment() {
      return true;
    },
    insert: methods.insert,
    remove: methods.remove,
    removeContent() {
      for (const $child of children$) {
        $fragment.removeChild($child);
      }
    },
    refresh: methods.refresh,
    render(elm: TimelessElement) {
      const new_instances: TimelessElement[] = [];
      if (elm.children) {
        for (const child of elm.children) {
          if (isElement(child)) {
            new_instances.push(child);
            const $sub = props.build(child);
            if ($sub && $sub.$elm) {
              children$.push($sub.$elm);
              $fragment.appendChild($sub.$elm);
            }
          }
        }
      }
      $fragment.appendChild($anchor);
      for (const child of new_instances) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
      return $fragment;
    },
  };
}

export function isDOMFor(value: any): value is DOMFor {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isDocumentFragment === "function" &&
    typeof value.render === "function"
  );
}
