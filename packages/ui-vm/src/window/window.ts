import { base, Handler } from "@timeless/inner-base";

import {
  WindowBodyModel,
  WindowFooterModel,
  WindowHeaderModel,
  WindowPoint,
  WindowRect,
  WindowSize,
} from "./section";

export type WindowResizeEdge =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

export type WindowSectionRectState = {
  rect: WindowRect;
  localRect: WindowRect;
};

export type WindowHeaderLayoutState = WindowHeaderModel["state"] &
  WindowSectionRectState;
export type WindowBodyLayoutState = WindowBodyModel["state"] &
  WindowSectionRectState;
export type WindowFooterLayoutState = WindowFooterModel["state"] &
  WindowSectionRectState;

export type WindowResizeHandleState = {
  edge: WindowResizeEdge;
  rect: WindowRect;
  localRect: WindowRect;
};

export type WindowState = {
  id: string;
  position: WindowPoint;
  size: WindowSize;
  rect: WindowRect;
  minSize: WindowSize;
  maxSize: WindowSize;
  dragging: boolean;
  resizing: boolean;
  resizeEdge: WindowResizeEdge | null;
  header: WindowHeaderLayoutState;
  body: WindowBodyLayoutState;
  footer: WindowFooterLayoutState;
  resizeHandles: WindowResizeHandleState[];
};

export type WindowModelProps = {
  id?: string;
  title?: string;
  position?: Partial<WindowPoint>;
  size?: Partial<WindowSize>;
  minSize?: Partial<WindowSize>;
  maxSize?: Partial<WindowSize>;
  headerHeight?: number;
  footerHeight?: number;
  footer?: boolean;
  edgeSize?: number;
};

type ResizeSnapshot = WindowPoint & WindowSize;

export function WindowModel(props: WindowModelProps = {}) {
  const $header = WindowHeaderModel({
    title: props.title,
    height: props.headerHeight,
  });
  const $body = WindowBodyModel();
  const $footer = WindowFooterModel({
    height: props.footerHeight,
    visible: props.footer,
  });

  let _id = props.id ?? "";
  let _position = normalizePoint(props.position, { x: 0, y: 0 });
  let _size = normalizeSize(props.size, { width: 320, height: 240 });
  let _minSize = normalizeSize(props.minSize, { width: 160, height: 120 });
  let _maxSize = normalizeSize(props.maxSize, {
    width: Number.POSITIVE_INFINITY,
    height: Number.POSITIVE_INFINITY,
  });
  let _edgeSize = props.edgeSize ?? 8;
  let _dragging = false;
  let _dragStartPoint: WindowPoint | null = null;
  let _dragStartPosition: WindowPoint | null = null;
  let _resizing = false;
  let _resizeEdge: WindowResizeEdge | null = null;
  let _resizeStartPoint: WindowPoint | null = null;
  let _resizeStartRect: ResizeSnapshot | null = null;

  const _state = {
    get id() {
      return _id;
    },
    get position() {
      return { ..._position };
    },
    get size() {
      return { ..._size };
    },
    get rect() {
      return currentRect();
    },
    get minSize() {
      return { ..._minSize };
    },
    get maxSize() {
      return { ..._maxSize };
    },
    get dragging() {
      return _dragging;
    },
    get resizing() {
      return _resizing;
    },
    get resizeEdge() {
      return _resizeEdge;
    },
    get header() {
      return {
        ...$header.state,
        rect: headerRect(),
        localRect: headerLocalRect(),
      };
    },
    get body() {
      return {
        ...$body.state,
        rect: bodyRect(),
        localRect: bodyLocalRect(),
      };
    },
    get footer() {
      return {
        ...$footer.state,
        rect: footerRect(),
        localRect: footerLocalRect(),
      };
    },
    get resizeHandles() {
      return resizeHandles();
    },
  };

  enum Events {
    StateChange,
    PositionChange,
    SizeChange,
    DragStart,
    DragMove,
    DragEnd,
    ResizeStart,
    ResizeMove,
    ResizeEnd,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: WindowState;
    [Events.PositionChange]: WindowPoint;
    [Events.SizeChange]: WindowSize;
    [Events.DragStart]: WindowPoint;
    [Events.DragMove]: WindowPoint;
    [Events.DragEnd]: WindowPoint;
    [Events.ResizeStart]: { edge: WindowResizeEdge; rect: WindowRect };
    [Events.ResizeMove]: { edge: WindowResizeEdge; rect: WindowRect };
    [Events.ResizeEnd]: { edge: WindowResizeEdge; rect: WindowRect };
  };

  const bus = base<TheTypesOfEvents>();

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setId(id: string) {
      if (_id === id) {
        return;
      }
      _id = id;
      methods.refresh();
    },
    setTitle(title: string) {
      $header.methods.setTitle(title);
      methods.refresh();
    },
    setPosition(position: WindowPoint) {
      commitPosition(position);
    },
    moveBy(delta: Partial<{ dx: number; dy: number }>) {
      commitPosition({
        x: _position.x + (delta.dx ?? 0),
        y: _position.y + (delta.dy ?? 0),
      });
    },
    setSize(size: WindowSize) {
      commitSize(size);
    },
    resizeBy(
      edge: WindowResizeEdge,
      delta: Partial<{ dx: number; dy: number }>,
    ) {
      const next = calcResizeRect(
        edge,
        currentRect(),
        delta.dx ?? 0,
        delta.dy ?? 0,
      );
      commitRect(next, edge);
    },
    startHeaderDrag(point: WindowPoint) {
      _dragging = true;
      _dragStartPoint = { ...point };
      _dragStartPosition = { ..._position };
      bus.emit(Events.DragStart, { ..._position });
      methods.refresh();
    },
    dragHeader(point: WindowPoint) {
      if (!_dragging || !_dragStartPoint || !_dragStartPosition) {
        return;
      }
      const next = {
        x: _dragStartPosition.x + point.x - _dragStartPoint.x,
        y: _dragStartPosition.y + point.y - _dragStartPoint.y,
      };
      if (commitPosition(next)) {
        bus.emit(Events.DragMove, { ..._position });
      }
    },
    endHeaderDrag(point?: WindowPoint) {
      if (!_dragging) {
        return;
      }
      if (point) {
        methods.dragHeader(point);
      }
      _dragging = false;
      _dragStartPoint = null;
      _dragStartPosition = null;
      bus.emit(Events.DragEnd, { ..._position });
      methods.refresh();
    },
    pointerDownHeader(x: number, y: number) {
      $header.methods.pointerDown(x, y);
    },
    pointerMoveHeader(x: number, y: number) {
      $header.methods.pointerMove(x, y);
    },
    pointerUpHeader(x: number, y: number) {
      $header.methods.pointerUp(x, y);
    },
    pointerDownResize(edge: WindowResizeEdge, x: number, y: number) {
      _resizing = true;
      _resizeEdge = edge;
      _resizeStartPoint = { x, y };
      _resizeStartRect = currentRect();
      bus.emit(Events.ResizeStart, { edge, rect: currentRect() });
      methods.refresh();
    },
    pointerMoveResize(x: number, y: number) {
      if (
        !_resizing ||
        !_resizeEdge ||
        !_resizeStartPoint ||
        !_resizeStartRect
      ) {
        return;
      }
      const next = calcResizeRect(
        _resizeEdge,
        _resizeStartRect,
        x - _resizeStartPoint.x,
        y - _resizeStartPoint.y,
      );
      if (commitRect(next, _resizeEdge)) {
        bus.emit(Events.ResizeMove, {
          edge: _resizeEdge,
          rect: currentRect(),
        });
      }
    },
    pointerUpResize(x: number, y: number) {
      if (!_resizing || !_resizeEdge) {
        return;
      }
      const edge = _resizeEdge;
      methods.pointerMoveResize(x, y);
      _resizing = false;
      _resizeEdge = null;
      _resizeStartPoint = null;
      _resizeStartRect = null;
      bus.emit(Events.ResizeEnd, { edge, rect: currentRect() });
      methods.refresh();
    },
    /** 获取 body 内元素的绝对坐标（相对屏幕） */
    getAbsoluteRect(el: {
      x: number;
      y: number;
      width: number;
      height: number;
    }): WindowRect {
      const b = bodyLocalRect();
      return {
        x: _position.x + b.x + el.x,
        y: _position.y + b.y + el.y,
        width: el.width,
        height: el.height,
      };
    },
  };

  $header.onDragStart((payload) => {
    methods.startHeaderDrag({ x: payload.x, y: payload.y });
  });
  $header.onDragMove((payload) => {
    methods.dragHeader({ x: payload.x, y: payload.y });
  });
  $header.onDragEnd((payload) => {
    methods.endHeaderDrag({ x: payload.x, y: payload.y });
  });
  $header.onStateChange(() => {
    methods.refresh();
  });
  $footer.onStateChange(() => {
    methods.refresh();
  });

  ensureSizeBounds();

  return {
    state: _state,
    methods,
    $header,
    $body,
    $footer,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onPositionChange(
      handler: Handler<TheTypesOfEvents[Events.PositionChange]>,
    ) {
      return bus.on(Events.PositionChange, handler);
    },
    onSizeChange(handler: Handler<TheTypesOfEvents[Events.SizeChange]>) {
      return bus.on(Events.SizeChange, handler);
    },
    onDragStart(handler: Handler<TheTypesOfEvents[Events.DragStart]>) {
      return bus.on(Events.DragStart, handler);
    },
    onDragMove(handler: Handler<TheTypesOfEvents[Events.DragMove]>) {
      return bus.on(Events.DragMove, handler);
    },
    onDragEnd(handler: Handler<TheTypesOfEvents[Events.DragEnd]>) {
      return bus.on(Events.DragEnd, handler);
    },
    onResizeStart(handler: Handler<TheTypesOfEvents[Events.ResizeStart]>) {
      return bus.on(Events.ResizeStart, handler);
    },
    onResizeMove(handler: Handler<TheTypesOfEvents[Events.ResizeMove]>) {
      return bus.on(Events.ResizeMove, handler);
    },
    onResizeEnd(handler: Handler<TheTypesOfEvents[Events.ResizeEnd]>) {
      return bus.on(Events.ResizeEnd, handler);
    },
  };

  function ensureSizeBounds() {
    _size = clampSize(_size);
  }

  function commitPosition(position: WindowPoint) {
    const next = normalizePoint(position, _position);
    if (next.x === _position.x && next.y === _position.y) {
      return false;
    }
    _position = next;
    bus.emit(Events.PositionChange, { ..._position });
    methods.refresh();
    return true;
  }

  function commitSize(size: WindowSize) {
    const next = clampSize(normalizeSize(size, _size));
    if (next.width === _size.width && next.height === _size.height) {
      return false;
    }
    _size = next;
    bus.emit(Events.SizeChange, { ..._size });
    methods.refresh();
    return true;
  }

  function commitRect(rect: WindowRect, edge: WindowResizeEdge) {
    const nextRect = {
      x: rect.x,
      y: rect.y,
      ...clampSize({ width: rect.width, height: rect.height }),
    };
    if (edgeHas(edge, "left")) {
      nextRect.x = rect.x + rect.width - nextRect.width;
    }
    if (edgeHas(edge, "top")) {
      nextRect.y = rect.y + rect.height - nextRect.height;
    }
    const positionChanged =
      nextRect.x !== _position.x || nextRect.y !== _position.y;
    const sizeChanged =
      nextRect.width !== _size.width || nextRect.height !== _size.height;
    if (!positionChanged && !sizeChanged) {
      return false;
    }
    _position = {
      x: nextRect.x,
      y: nextRect.y,
    };
    _size = {
      width: nextRect.width,
      height: nextRect.height,
    };
    if (positionChanged) {
      bus.emit(Events.PositionChange, { ..._position });
    }
    if (sizeChanged) {
      bus.emit(Events.SizeChange, { ..._size });
    }
    methods.refresh();
    return true;
  }

  function calcResizeRect(
    edge: WindowResizeEdge,
    start: ResizeSnapshot,
    dx: number,
    dy: number,
  ): WindowRect {
    let x = start.x;
    let y = start.y;
    let width = start.width;
    let height = start.height;

    if (edgeHas(edge, "left")) {
      width = start.width - dx;
      x = start.x + dx;
    }
    if (edgeHas(edge, "right")) {
      width = start.width + dx;
    }
    if (edgeHas(edge, "top")) {
      height = start.height - dy;
      y = start.y + dy;
    }
    if (edgeHas(edge, "bottom")) {
      height = start.height + dy;
    }

    return { x, y, width, height };
  }

  function currentRect(): WindowRect {
    return {
      x: _position.x,
      y: _position.y,
      width: _size.width,
      height: _size.height,
    };
  }

  function headerLocalRect(): WindowRect {
    return {
      x: 0,
      y: 0,
      width: _size.width,
      height: headerHeight(),
    };
  }

  function headerRect(): WindowRect {
    return toAbsoluteRect(headerLocalRect());
  }

  function bodyLocalRect(): WindowRect {
    const y = headerHeight();
    return {
      x: 0,
      y,
      width: _size.width,
      height: Math.max(0, _size.height - y - footerHeight()),
    };
  }

  function bodyRect(): WindowRect {
    return toAbsoluteRect(bodyLocalRect());
  }

  function footerLocalRect(): WindowRect {
    const height = footerHeight();
    return {
      x: 0,
      y: _size.height - height,
      width: _size.width,
      height,
    };
  }

  function footerRect(): WindowRect {
    return toAbsoluteRect(footerLocalRect());
  }

  function resizeHandles(): WindowResizeHandleState[] {
    const width = _size.width;
    const height = _size.height;
    const edge = _edgeSize;
    const half = edge / 2;
    const localRects: Array<[WindowResizeEdge, WindowRect]> = [
      ["top", { x: 0, y: -half, width, height: edge }],
      ["right", { x: width - half, y: 0, width: edge, height }],
      ["bottom", { x: 0, y: height - half, width, height: edge }],
      ["left", { x: -half, y: 0, width: edge, height }],
      ["top-left", { x: -half, y: -half, width: edge, height: edge }],
      ["top-right", { x: width - half, y: -half, width: edge, height: edge }],
      [
        "bottom-right",
        { x: width - half, y: height - half, width: edge, height: edge },
      ],
      [
        "bottom-left",
        { x: -half, y: height - half, width: edge, height: edge },
      ],
    ];

    return localRects.map(([edge, localRect]) => ({
      edge,
      localRect,
      rect: toAbsoluteRect(localRect),
    }));
  }

  function headerHeight() {
    return $header.state.height;
  }

  function footerHeight() {
    return $footer.state.visible ? $footer.state.height : 0;
  }

  function toAbsoluteRect(rect: WindowRect): WindowRect {
    return {
      x: _position.x + rect.x,
      y: _position.y + rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  function clampSize(size: WindowSize): WindowSize {
    return {
      width: clamp(size.width, _minSize.width, _maxSize.width),
      height: clamp(size.height, _minSize.height, _maxSize.height),
    };
  }
}

function normalizePoint(
  point: Partial<WindowPoint> | undefined,
  fallback: WindowPoint,
): WindowPoint {
  return {
    x: finiteOr(point?.x, fallback.x),
    y: finiteOr(point?.y, fallback.y),
  };
}

function normalizeSize(
  size: Partial<WindowSize> | undefined,
  fallback: WindowSize,
): WindowSize {
  return {
    width: finiteOr(size?.width, fallback.width),
    height: finiteOr(size?.height, fallback.height),
  };
}

function finiteOr(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function edgeHas(
  edge: WindowResizeEdge,
  side: "top" | "right" | "bottom" | "left",
) {
  return edge === side || edge.includes(side);
}

export type WindowModel = ReturnType<typeof WindowModel>;
