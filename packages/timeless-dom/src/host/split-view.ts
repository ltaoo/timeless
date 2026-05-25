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

  const isVertical = $splitView.getAttribute("data-split-direction") === "vertical";
  const templateProp = isVertical ? "grid-template-rows" : "grid-template-columns";
  const cursorStyle = isVertical ? "row-resize" : "col-resize";

  event.preventDefault();
  $handler.setPointerCapture(event.pointerId);

  let startPos = isVertical ? event.clientY : event.clientX;
  let startTemplate = $splitView.style[templateProp as any];

  document.body.style.cursor = cursorStyle;
  document.body.style.userSelect = "none";
  $handler.style.touchAction = "none";

  const onMove = (moveEvent: PointerEvent) => {
    const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX;
    const delta = currentPos - startPos;
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

    const rect = (idx: number) => $splitView.children[idx].getBoundingClientRect();
    const leftPx = isLeftAuto
      ? (isVertical ? rect(leftColIdx).height : rect(leftColIdx).width)
      : parseFloat(leftCol);
    const rightPx = isRightAuto
      ? (isVertical ? rect(rightColIdx).height : rect(rightColIdx).width)
      : parseFloat(rightCol);

    let newLeft = leftPx + delta;
    let newRight = rightPx - delta;

    const leftPanel = $splitView.children[leftColIdx];
    const rightPanel = $splitView.children[rightColIdx];
    const leftMinWidth = leftPanel ? parseInt(leftPanel.getAttribute("data-min-size") || "20") : 20;
    const rightMinWidth = rightPanel ? parseInt(rightPanel.getAttribute("data-min-size") || "20") : 20;

    if (newLeft < leftMinWidth) {
      newRight -= leftMinWidth - newLeft;
      newLeft = leftMinWidth;
    }
    if (newRight < rightMinWidth) {
      newLeft -= rightMinWidth - newRight;
      newRight = rightMinWidth;
    }

    columns[leftColIdx] = `${Math.round(newLeft)}px`;
    columns[rightColIdx] = `${Math.round(newRight)}px`;

    startTemplate = columns.join(" ");
    $splitView.style[templateProp as any] = startTemplate;
    startPos = currentPos;
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
      const isVertical = elm.state.direction === "vertical";

      $elm.setAttribute("data-split-view", "");
      $elm.setAttribute("data-split-direction", isVertical ? "vertical" : "horizontal");

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
      const templateProp = isVertical ? "grid-template-rows" : "grid-template-columns";
      $elm.style[templateProp as any] = columns;

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
      if (elm.state.minSize) {
        $elm.setAttribute("data-min-size", String(elm.state.minSize));
      }
      Object.assign(elm.state.style, {
        overflow: "clip",
        width: "100%",
        height: "100%",
      });
      if (elm.state.minSize) {
        const isVertical = elm.state.direction === "vertical";
        elm.state.style[isVertical ? "min-height" : "min-width"] = `${elm.state.minSize}px`;
      }

      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      $elm.style.position = "relative";
      $elm.style.zIndex = "0";

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      $elm.style.position = "relative";
      $elm.style.zIndex = "0";
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
      const $line = document.createElement("div");
      const $hover_zone = document.createElement("div");
      let hover_timer: ReturnType<typeof setTimeout> | null = null;
      let is_hover_highlighted = false;

      $elm.setAttribute("data-split-view-handler", "");

      // Use direction from element state
      const applyDirection = () => {
        const isVertical = elm.state.direction === "vertical";
        if (isVertical) {
          Object.assign(elm.state.style, {
            display: "flex",
            width: "100%",
            height: "1px",
            "z-index": 2,
            position: "relative",
            overflow: "visible",
          });
          Object.assign($line.style, {
            width: "100%",
            height: "1px",
            "pointer-events": "none",
            "background-color": "color-mix(in srgb, CanvasText 20%, black)",
          });
          Object.assign($hover_zone.style, {
            position: "absolute",
            left: "0",
            right: "0",
            top: "-2px",
            bottom: "-2px",
            "pointer-events": "auto",
            cursor: "row-resize",
            transition: "background-color 0.2s ease",
          });
        } else {
          Object.assign(elm.state.style, {
            display: "flex",
            width: "1px",
            height: "100%",
            "z-index": 2,
            position: "relative",
            overflow: "visible",
          });
          Object.assign($line.style, {
            width: "1px",
            height: "100%",
            "pointer-events": "none",
            "background-color": "color-mix(in srgb, CanvasText 20%, black)",
          });
          Object.assign($hover_zone.style, {
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "-2px",
            right: "-2px",
            "pointer-events": "auto",
            cursor: "col-resize",
            transition: "background-color 0.2s ease",
          });
        }
      };

      box$.methods.set$elm($elm);
      applyDirection();
      box$.methods.applyState(elm.state, { initial: true });
      $elm.style.zIndex = "2";

      const setHoverHighlight = (highlighted: boolean) => {
        is_hover_highlighted = highlighted;
        $hover_zone.style.backgroundColor = highlighted
          ? "#3376cd"
          : "transparent";
      };

      $hover_zone.addEventListener("pointerenter", () => {
        if (hover_timer) {
          clearTimeout(hover_timer);
        }
        hover_timer = setTimeout(() => {
          setHoverHighlight(true);
          hover_timer = null;
        }, 600);
      });

      $hover_zone.addEventListener("pointerleave", () => {
        if (hover_timer) {
          clearTimeout(hover_timer);
          hover_timer = null;
        }
        if (is_hover_highlighted) {
          setHoverHighlight(false);
        }
      });

      $hover_zone.addEventListener("pointerdown", function (event: PointerEvent) {
        const $splitView = $hover_zone.closest("[data-split-view]") as HTMLElement;
        if ($splitView) {
          setupDragResize($hover_zone, $splitView, elm, event);
        }
      });

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($line);
      $elm.appendChild($hover_zone);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      $elm.style.zIndex = "2";
    },
  };
}

export function isDOMSplitView(value: any): value is DOMSplitView {
  return value?.t === "split-view";
}

export function isDOMSplitPane(value: any): value is DOMSplitPane {
  return value?.t === "split-pane";
}
