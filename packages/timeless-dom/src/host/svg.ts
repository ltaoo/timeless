import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMSVG = VNodeView<SVGSVGElement> & {
  t: "svg";
  render(): SVGSVGElement;
  hydrate(elm: TimelessElement, $elm: SVGSVGElement): void;
};

export function DOMSVG(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      ) as SVGSVGElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGGElement;
  hydrate(elm: TimelessElement, $elm: SVGGElement): void;
};

export function DOMG(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g",
      ) as SVGGElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGCircleElement;
  hydrate(elm: TimelessElement, $elm: SVGCircleElement): void;
};

export function DOMCircle(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      ) as SVGCircleElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGRectElement;
  hydrate(elm: TimelessElement, $elm: SVGRectElement): void;
};

export function DOMRect(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      ) as SVGRectElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGPathElement;
  hydrate(elm: TimelessElement, $elm: SVGPathElement): void;
};

export function DOMPath(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      ) as SVGPathElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
      if (props.elm.state.d) {
        $elm.setAttribute("d", props.elm.state.d);
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
  render(): SVGLineElement;
  hydrate(elm: TimelessElement, $elm: SVGLineElement): void;
};

export function DOMLine(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      ) as SVGLineElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGPolylineElement;
  hydrate(elm: TimelessElement, $elm: SVGPolylineElement): void;
};

export function DOMPolyline(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline",
      ) as SVGPolylineElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGPolygonElement;
  hydrate(elm: TimelessElement, $elm: SVGPolygonElement): void;
};

export function DOMPolygon(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polygon",
      ) as SVGPolygonElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGEllipseElement;
  hydrate(elm: TimelessElement, $elm: SVGEllipseElement): void;
};

export function DOMEllipse(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "ellipse",
      ) as SVGEllipseElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGTextElement;
  hydrate(elm: TimelessElement, $elm: SVGTextElement): void;
};

export function DOMSVGText(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      ) as SVGTextElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGDefsElement;
  hydrate(elm: TimelessElement, $elm: SVGDefsElement): void;
};

export function DOMDefs(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs",
      ) as SVGDefsElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGSymbolElement;
  hydrate(elm: TimelessElement, $elm: SVGSymbolElement): void;
};

export function DOMSymbol(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "symbol",
      ) as SVGSymbolElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGUseElement;
  hydrate(elm: TimelessElement, $elm: SVGUseElement): void;
};

export function DOMUse(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use",
      ) as SVGUseElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGLinearGradientElement;
  hydrate(elm: TimelessElement, $elm: SVGLinearGradientElement): void;
};

export function DOMLinearGradient(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient",
      ) as SVGLinearGradientElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGRadialGradientElement;
  hydrate(elm: TimelessElement, $elm: SVGRadialGradientElement): void;
};

export function DOMRadialGradient(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "radialGradient",
      ) as SVGRadialGradientElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGStopElement;
  hydrate(elm: TimelessElement, $elm: SVGStopElement): void;
};

export function DOMStop(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop",
      ) as SVGStopElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGMaskElement;
  hydrate(elm: TimelessElement, $elm: SVGMaskElement): void;
};

export function DOMMask(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "mask",
      ) as SVGMaskElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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
  render(): SVGClipPathElement;
  hydrate(elm: TimelessElement, $elm: SVGClipPathElement): void;
};

export function DOMClipPath(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "clipPath",
      ) as SVGClipPathElement;
      box$.methods.set$elm($elm as any);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: SVGClipPathElement) {
      box$.methods.set$elm($elm as any);
      box$.methods.setupEventListener(elm.events);
    },
  };
}
