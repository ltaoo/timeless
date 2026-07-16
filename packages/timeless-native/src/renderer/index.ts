import { type TimelessElement, isElement, patch } from "@timeless/timeless";

declare const __nativeBridge_render: (tree: any) => void;
declare const __nativeBridge_relayout: (() => void) | undefined;

import { NativeView, isNativeView } from "@/host/view";
import { NativeText } from "@/host/text";
import { NativeImg } from "@/host/img";
import { NativeButton } from "@/host/button";
import { NativeInput } from "@/host/input";
import { NativeRow } from "@/host/row";
import { NativeColumn } from "@/host/column";
import { NativeCheckbox } from "@/host/checkbox";
import { NativeRadio } from "@/host/radio";
import { NativeTextarea } from "@/host/textarea";
import { NativeFor } from "@/host/for";
import { NativeShow } from "@/host/show";
import { NativeMatch } from "@/host/match";
import { NativeFragment } from "@/host/fragment";
import { NativePortal } from "@/host/portal";
import { NativeLazyView } from "@/host/lazy-view";
import { NativeGrid } from "@/host/grid";
import { NativeLabel } from "@/host/label";
import { NativeIcon } from "@/host/icon";
import { NativeFilePicker } from "@/host/file-picker";
import { NativeNumberInput } from "@/host/number-input";
import { NativeSelect } from "@/host/select";
import { NativeAspectRatio } from "@/host/aspect-ratio";
import { NativeSplitView, NativeSplitPane } from "@/host/split-view";
import { NativeScrollView } from "@/host/scroll-view";
import { NativeTabView, NativeTabPane } from "@/host/tab-view";

function build(elm: TimelessElement): any {
  console.log(
    "[Native Render] build called with element type:",
    elm?.t,
    "children:",
    elm?.children?.length,
  );

  if (elm.t === "view") {
    const view$ = NativeView({ build, elm });
    elm.$elm = view$;
    return view$;
  }
  if (elm.t === "text") {
    const text$ = NativeText({ elm });
    // @ts-ignore
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "img") {
    const img$ = NativeImg({ build, elm });
    elm.$elm = img$;
    return img$;
  }
  if (elm.t === "button") {
    const button$ = NativeButton({ build, elm });
    elm.$elm = button$;
    return button$;
  }
  if (elm.t === "input") {
    const input$ = NativeInput({ build, elm });
    elm.$elm = input$;
    return input$;
  }
  if (elm.t === "row") {
    const row$ = NativeRow({ build, elm });
    elm.$elm = row$;
    return row$;
  }
  if (elm.t === "column") {
    const column$ = NativeColumn({ build, elm });
    elm.$elm = column$;
    return column$;
  }
  if (elm.t === "aspect-ratio") {
    const ratio$ = NativeAspectRatio({ build, elm });
    elm.$elm = ratio$;
    return ratio$;
  }
  if (elm.t === "checkbox") {
    const checkbox$ = NativeCheckbox({ build, elm });
    elm.$elm = checkbox$;
    return checkbox$;
  }
  if (elm.t === "radio") {
    const radio$ = NativeRadio({ build, elm });
    elm.$elm = radio$;
    return radio$;
  }
  if (elm.t === "textarea") {
    const textarea$ = NativeTextarea({ build, elm });
    elm.$elm = textarea$;
    return textarea$;
  }
  if (elm.t === "for") {
    const for$ = NativeFor({ build, elm });
    elm.$elm = for$;
    return for$;
  }
  if (elm.t === "show") {
    const show$ = NativeShow({ build, elm });
    elm.$elm = show$;
    return show$;
  }
  if (elm.t === "match") {
    const match$ = NativeMatch({ build, elm });
    elm.$elm = match$;
    return match$;
  }
  if (elm.t === "fragment") {
    const fragment$ = NativeFragment({ build, elm });
    elm.$elm = fragment$;
    return fragment$;
  }
  if (elm.t === "portal") {
    const portal$ = NativePortal({ build, elm });
    elm.$elm = portal$;
    return portal$;
  }
  if (elm.t === "lazy-view") {
    const lazyView$ = NativeLazyView({ build, elm });
    elm.$elm = lazyView$;
    return lazyView$;
  }
  if (elm.t === "grid") {
    const grid$ = NativeGrid({ build, elm });
    elm.$elm = grid$;
    return grid$;
  }
  if (elm.t === "label") {
    const label$ = NativeLabel({ build, elm });
    elm.$elm = label$;
    return label$;
  }
  if (elm.t === "icon") {
    const icon$ = NativeIcon({ build, elm });
    elm.$elm = icon$;
    return icon$;
  }
  if (elm.t === "file-picker") {
    const filePicker$ = NativeFilePicker({ build, elm });
    elm.$elm = filePicker$;
    return filePicker$;
  }
  if (elm.t === "number-input") {
    const numberInput$ = NativeNumberInput({ build, elm });
    elm.$elm = numberInput$;
    return numberInput$;
  }
  if (elm.t === "select") {
    const select$ = NativeSelect({ build, elm });
    elm.$elm = select$;
    return select$;
  }
  if (elm.t === "split-view") {
    const splitView$ = NativeSplitView({ build, elm });
    elm.$elm = splitView$;
    return splitView$;
  }
  if (elm.t === "split-pane") {
    const splitPane$ = NativeSplitPane({ build, elm });
    elm.$elm = splitPane$;
    return splitPane$;
  }
  if (elm.t === "scroll-view") {
    const scrollView$ = NativeScrollView({ build, elm });
    elm.$elm = scrollView$;
    return scrollView$;
  }
  if (elm.t === "tab-view") {
    const tabView$ = NativeTabView({ build, elm });
    elm.$elm = tabView$;
    return tabView$;
  }
  if (elm.t === "tab-pane") {
    const tabPane$ = NativeTabPane({ build, elm });
    elm.$elm = tabPane$;
    return tabPane$;
  }
  return NativeView({ build, elm });
}

// ─── buildAndRender ───────────────────────────────────────────────────────────

export function buildAndRender(elm: TimelessElement) {
  const vnode = build(elm);
  const dom = vnode.render();
  return { vnode, dom };
}

// ─── nativePlatform ───────────────────────────────────────────────────────────

export function nativePlatform() {
  return {
    hasParent(dom: any) {
      return !!dom.parentNode;
    },
    replaceChild(oldDom: any, newDom: any) {
      const parent = oldDom.parentNode;
      if (!parent) return;
      const idx = parent.children.indexOf(oldDom);
      if (idx !== -1) {
        parent.children[idx] = newDom;
        newDom.parentNode = parent;
        oldDom.parentNode = null;
        if (typeof parent._onChildReplaced === "function") {
          parent._onChildReplaced(idx, newDom);
        }
      }
    },
    removeChild(dom: any) {
      const parent = dom.parentNode;
      if (!parent) return;
      const idx = parent.children.indexOf(dom);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
        dom.parentNode = null;
        if (typeof parent._onChildRemoved === "function") {
          parent._onChildRemoved(idx);
        }
      }
    },
    insertChild(parentDom: any, childDom: any, index: number) {
      parentDom.children.splice(index, 0, childDom);
      childDom.parentNode = parentDom;
      if (typeof parentDom._onChildInserted === "function") {
        parentDom._onChildInserted(index, childDom);
      }
    },
    insertBeforeAnchor(anchorDom: any, childDom: any) {
      // Native: children go INSIDE the anchor-based element, not as siblings
      anchorDom.children.push(childDom);
      childDom.parentNode = anchorDom;
      if (typeof anchorDom._onChildInserted === "function") {
        anchorDom._onChildInserted(anchorDom.children.length - 1, childDom);
      }
    },
  };
}

// ─── render ───────────────────────────────────────────────────────────────────

export function render(elm: TimelessElement) {
  console.log(
    "[Native Render] render called, elm:",
    elm?.t,
    "children:",
    elm?.children?.length,
  );

  if (!elm) {
    console.error("[Render] Element is null");
    return;
  }

  if (isElement(elm)) {
    // HMR path: diff + patch instead of full rebuild
    const hmr = (globalThis as any).__native_hmr;
    if (hmr?.data?.__root) {
      console.log("[Native HMR] Patching existing tree...");
      patch(hmr.data.__root, elm, {
        buildAndRender,
        platform: nativePlatform(),
      });
      hmr.data.__root = elm;
      if (typeof __nativeBridge_relayout !== "undefined") {
        __nativeBridge_relayout();
      }
      // Re-trigger onMounted so timers/effects are re-established after HMR
      setTimeout(() => {
        if (typeof elm.onMounted === "function") {
          elm.onMounted({ target: elm.$elm?.get$elm?.() || elm.$elm });
        }
      }, 0);
      console.log("[Native HMR] Patch + relayout complete.");
      return;
    }

    // Initial render (existing code)
    console.log("[Native Render] isElement true, building...");
    const host$ = build(elm);
    console.log(
      "[Native Render] build returned:",
      host$?.$elm,
      "type:",
      host$?.t,
    );

    if (!host$) {
      console.error("[Render] Element render return null", elm.t);
      return;
    }
    const isViewLike = isNativeView(host$) || host$.getType() === "view";
    console.log("[Native Render] isViewLike:", isViewLike);
    const $root = host$.render();
    __nativeBridge_render($root);
    console.log("[Native Render] pushing view to root children, $elm:");

    // Store root for HMR patching
    if (hmr) {
      hmr.data.__root = elm;
    }

    setTimeout(() => {
      if (typeof elm.onMounted === "function") {
        elm.onMounted({ target: $root });
      }
    }, 0);
    return;
  }
  console.error("[Render] Root Element can't be lazy element");
  return;
}
