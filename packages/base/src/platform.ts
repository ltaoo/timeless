export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ElementRects {
  reference: Rect;
  floating: Rect;
}

export type Strategy = "absolute" | "fixed";

export interface Platform {
  addEventListener(
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): () => void;

  patchBodyStyle(style: Record<string, string>): void;

  getViewportSize(): { width: number; height: number };

  isBrowser(): boolean;

  isElement(value: unknown): boolean;

  isHTMLElement(value: unknown): boolean;

  getBoundingClientRect(element: unknown): Rect;

  getDimensions(element: unknown): Dimensions;

  getElementRects(args: {
    reference: unknown;
    floating: unknown;
    strategy: Strategy;
  }): ElementRects;

  getClippingRect(args: {
    element: unknown;
    boundary: unknown;
    rootBoundary: unknown;
    strategy: Strategy;
  }): Rect;

  getOffsetParent(element: unknown): unknown;

  isRTL(element: unknown): boolean;

  getScale(element: unknown): { x: number; y: number };

  getDocumentElement(element?: unknown): unknown;
}
