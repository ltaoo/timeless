import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMSVG = VNodeView<SVGSVGElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGSVGElement;
  hydrate(elm: TimelessElement, $elm: SVGSVGElement): void;
};

export function DOMSVG(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMSVG {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      ) as SVGSVGElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGSVGElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMG = VNodeView<SVGGElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGGElement;
  hydrate(elm: TimelessElement, $elm: SVGGElement): void;
};

export function DOMG(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMG {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      ) as SVGGElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGGElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMCircle = VNodeView<SVGCircleElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGCircleElement;
  hydrate(elm: TimelessElement, $elm: SVGCircleElement): void;
};

export function DOMCircle(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMCircle {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      ) as SVGCircleElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGCircleElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMRect = VNodeView<SVGRectElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGRectElement;
  hydrate(elm: TimelessElement, $elm: SVGRectElement): void;
};

export function DOMRect(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMRect {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      ) as SVGRectElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGRectElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMPath = VNodeView<SVGPathElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGPathElement;
  hydrate(elm: TimelessElement, $elm: SVGPathElement): void;
};

export function DOMPath(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMPath {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      ) as SVGPathElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      if (elm.state.d) {
        $elm.setAttribute("d", elm.state.d);
      }
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGPathElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMLine = VNodeView<SVGLineElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGLineElement;
  hydrate(elm: TimelessElement, $elm: SVGLineElement): void;
};

export function DOMLine(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMLine {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      ) as SVGLineElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGLineElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMPolyline = VNodeView<SVGPolylineElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGPolylineElement;
  hydrate(elm: TimelessElement, $elm: SVGPolylineElement): void;
};

export function DOMPolyline(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMPolyline {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline",
      ) as SVGPolylineElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGPolylineElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMPolygon = VNodeView<SVGPolygonElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGPolygonElement;
  hydrate(elm: TimelessElement, $elm: SVGPolygonElement): void;
};

export function DOMPolygon(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMPolygon {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      ) as SVGPolygonElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGPolygonElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMEllipse = VNodeView<SVGEllipseElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGEllipseElement;
  hydrate(elm: TimelessElement, $elm: SVGEllipseElement): void;
};

export function DOMEllipse(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMEllipse {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "ellipse",
      ) as SVGEllipseElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGEllipseElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMSVGText = VNodeView<SVGTextElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGTextElement;
  hydrate(elm: TimelessElement, $elm: SVGTextElement): void;
};

export function DOMSVGText(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMSVGText {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      ) as SVGTextElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGTextElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMDefs = VNodeView<SVGDefsElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGDefsElement;
  hydrate(elm: TimelessElement, $elm: SVGDefsElement): void;
};

export function DOMDefs(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMDefs {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs",
      ) as SVGDefsElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGDefsElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMSymbol = VNodeView<SVGSymbolElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGSymbolElement;
  hydrate(elm: TimelessElement, $elm: SVGSymbolElement): void;
};

export function DOMSymbol(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMSymbol {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "symbol",
      ) as SVGSymbolElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGSymbolElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMUse = VNodeView<SVGUseElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGUseElement;
  hydrate(elm: TimelessElement, $elm: SVGUseElement): void;
};

export function DOMUse(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMUse {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use",
      ) as SVGUseElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGUseElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMLinearGradient = VNodeView<SVGLinearGradientElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGLinearGradientElement;
  hydrate(elm: TimelessElement, $elm: SVGLinearGradientElement): void;
};

export function DOMLinearGradient(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMLinearGradient {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient",
      ) as SVGLinearGradientElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGLinearGradientElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMRadialGradient = VNodeView<SVGRadialGradientElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGRadialGradientElement;
  hydrate(elm: TimelessElement, $elm: SVGRadialGradientElement): void;
};

export function DOMRadialGradient(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMRadialGradient {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "radialGradient",
      ) as SVGRadialGradientElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGRadialGradientElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMStop = VNodeView<SVGStopElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGStopElement;
  hydrate(elm: TimelessElement, $elm: SVGStopElement): void;
};

export function DOMStop(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMStop {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop",
      ) as SVGStopElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGStopElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMMask = VNodeView<SVGMaskElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGMaskElement;
  hydrate(elm: TimelessElement, $elm: SVGMaskElement): void;
};

export function DOMMask(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMMask {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "mask",
      ) as SVGMaskElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGMaskElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMClipPath = VNodeView<SVGClipPathElement> & {
  t: "svg";
  render(elm: TimelessElement): SVGClipPathElement;
  hydrate(elm: TimelessElement, $elm: SVGClipPathElement): void;
};

export function DOMClipPath(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
}): DOMClipPath {
  const t = "svg";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return t as any;
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "clipPath",
      ) as SVGClipPathElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGClipPathElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}
