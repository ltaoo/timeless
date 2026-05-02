import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

let _splitSeq = 0;

function parseGridTemplate(template: string): string[] {
  const columns: string[] = [];
  let current = "";
  let depth = 0;
  for (const char of template) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (char === " " && depth === 0) {
      if (current) {
        columns.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current) columns.push(current);
  return columns;
}

function setupDragResize(
  $handler: HTMLElement,
  $splitView: HTMLElement,
  handlerElm: TimelessElement,
  event: PointerEvent,
) {
  if (handlerElm.events?.onPointerDown) {
    handlerElm.events.onPointerDown(event);
  }

  event.preventDefault();
  $handler.setPointerCapture(event.pointerId);

  let startX = event.clientX;
  let startTemplate = $splitView.style["grid-template-columns"];

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  $handler.style.touchAction = "none";

  const onMove = (moveEvent: PointerEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const columns = parseGridTemplate(startTemplate);

    let handlerIndex = 0;
    let sibling = $handler.parentElement?.previousElementSibling;
    while (sibling) {
      if (sibling.hasAttribute("data-split-view-handler")) {
        handlerIndex++;
      }
      sibling = sibling.previousElementSibling;
    }

    const leftColIdx = handlerIndex * 2;
    const rightColIdx = handlerIndex * 2 + 2;

    if (leftColIdx >= columns.length || rightColIdx >= columns.length) return;

    const leftCol = columns[leftColIdx];
    const rightCol = columns[rightColIdx];
    const isLeftAuto = leftCol === "auto" || leftCol === "1fr";
    const isRightAuto = rightCol === "auto" || rightCol === "1fr";

    const leftPx = isLeftAuto
      ? $splitView.children[leftColIdx].getBoundingClientRect().width
      : parseFloat(leftCol);
    const rightPx = isRightAuto
      ? $splitView.children[rightColIdx].getBoundingClientRect().width
      : parseFloat(rightCol);

    let newLeft = leftPx + deltaX;
    let newRight = rightPx - deltaX;

    const MIN_WIDTH = 20;
    if (newLeft < MIN_WIDTH) {
      newRight -= MIN_WIDTH - newLeft;
      newLeft = MIN_WIDTH;
    }
    if (newRight < MIN_WIDTH) {
      newLeft -= MIN_WIDTH - newRight;
      newRight = MIN_WIDTH;
    }

    columns[leftColIdx] = `${Math.round(newLeft)}px`;
    columns[rightColIdx] = `${Math.round(newRight)}px`;

    startTemplate = columns.join(" ");
    $splitView.style["grid-template-columns"] = startTemplate;
    startX = moveEvent.clientX;
  };

  const onUp = () => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    $handler.style.touchAction = "";
    $handler.removeEventListener("pointermove", onMove);
    $handler.removeEventListener("pointerup", onUp);
  };

  $handler.addEventListener("pointermove", onMove);
  $handler.addEventListener("pointerup", onUp);
}

export type DOMSplitView = VNodeView<HTMLDivElement> & {
  t: "split-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMSplitView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSplitView {
  const box$ = HostElement({ $elm: null, t: "split-view", build: props.build });

  return {
    ...box$.methods,
    t: "split-view",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");

      $elm.setAttribute("data-split-view", "");

      $elm.style.display = "grid";
      $elm.style.height = "100%";
      const columns = elm.state.panels
        .map((panel) => {
          if (panel.t === "split-handler") {
            return "1px";
          }
          if (typeof panel.state.size === "number") {
            return `${panel.state.size}px`;
          }
          if (panel.state.size === "auto") {
            return "1fr";
          }
          return String(panel.state.size);
        })
        .join(" ");
      $elm.style["grid-template-columns"] = columns;
      $elm.style.flexDirection =
        elm.state.direction === "horizontal" ? "row" : "column";

      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMSplitPane = VNodeView<HTMLDivElement> & {
  t: "split-pane";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMSplitPane(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSplitPane {
  const box$ = HostElement({ $elm: null, t: "split-pane", build: props.build });

  return {
    ...box$.methods,
    t: "split-pane",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");

      $elm.setAttribute("data-split-view-panel", "");
      Object.assign(elm.state.style, {
        overflow: "hidden",
        width: "100%",
        height: "100%",
      });

      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMSplitHandler = VNodeView<HTMLDivElement> & {
  t: "split-handler";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMSplitHandler(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSplitHandler {
  const box$ = HostElement({ $elm: null, t: "split-pane", build: props.build });

  return {
    ...box$.methods,
    t: "split-handler",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      const $hover_zone = document.createElement("div");
      let hover_timer: ReturnType<typeof setTimeout> | null = null;
      let is_hover_highlighted = false;

      $elm.setAttribute("data-split-view-handler", "");
      Object.assign(elm.state.style, {
        display: "flex",
        width: "1px",
        height: "100%",
        "z-index": 1,
        position: "relative",
        overflow: "visible",
        "background-color": "CanvasText",
      });
      // const $handler = document.createElement("div");
      // $handler.style.cssText =
      //   "z-index: 2; position: relative; width: 4px; transform: translateX(-2px);";
      // $elm.appendChild($handler);

      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      Object.assign($hover_zone.style, {
        position: "absolute",
        top: "0",
        bottom: "0",
        left: "-2px",
        right: "-2px",
        "pointer-events": "auto",
        transition: "background-color 0.2s ease",
      });

      const setHoverHighlight = (highlighted: boolean) => {
        is_hover_highlighted = highlighted;
        $hover_zone.style.backgroundColor = highlighted
          ? "blue"
          : "transparent";
      };

      $hover_zone.addEventListener("pointerenter", () => {
        window.document.body.style.cursor = "col-resize";
        if (hover_timer) {
          clearTimeout(hover_timer);
        }
        hover_timer = setTimeout(() => {
          setHoverHighlight(true);
          hover_timer = null;
        }, 600);
      });

      $hover_zone.addEventListener("pointerleave", () => {
        window.document.body.style.cursor = "unset";
        if (hover_timer) {
          clearTimeout(hover_timer);
          hover_timer = null;
        }
        if (is_hover_highlighted) {
          setHoverHighlight(false);
        }
      });

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $hover_zone.addEventListener("pointerdown", function (event: PointerEvent) {
        const $splitView = $hover_zone.closest("[data-split-view]") as HTMLElement;
        if ($splitView) {
          setupDragResize($hover_zone, $splitView, elm, event);
        }
      });
      $elm.appendChild($hover_zone);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMSplitView(value: any): value is DOMSplitView {
  return value?.t === "split-view";
}

export function isDOMSplitPane(value: any): value is DOMSplitPane {
  return value?.t === "split-pane";
}
