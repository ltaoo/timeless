import { base, Handler } from "@timeless/inner-base";

import { CanvasPointer } from "../pointer";

export type WindowPoint = {
  x: number;
  y: number;
};

export type WindowSize = {
  width: number;
  height: number;
};

export type WindowRect = WindowPoint & WindowSize;

export type WindowHeaderDragPayload = WindowPoint & {
  dx: number;
  dy: number;
};

export type WindowHeaderState = {
  role: "header";
  title: string;
  height: number;
  dragging: boolean;
};

export function WindowHeaderModel(
  props: {
    title?: string;
    height?: number;
  } = {},
) {
  let _title = props.title ?? "";
  let _height = props.height ?? 40;
  let _dragging = false;

  const _state = {
    get role() {
      return "header" as const;
    },
    get title() {
      return _title;
    },
    get height() {
      return _height;
    },
    get dragging() {
      return _dragging;
    },
  };

  enum Events {
    StateChange,
    DragStart,
    DragMove,
    DragEnd,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: WindowHeaderState;
    [Events.DragStart]: WindowHeaderDragPayload;
    [Events.DragMove]: WindowHeaderDragPayload;
    [Events.DragEnd]: WindowHeaderDragPayload;
  };

  const bus = base<TheTypesOfEvents>();
  const pointer = CanvasPointer({});

  pointer.onMove((payload) => {
    if (!_dragging) {
      return;
    }
    bus.emit(Events.DragMove, {
      x: payload.x,
      y: payload.y,
      dx: payload.dx,
      dy: payload.dy,
    });
  });

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setTitle(title: string) {
      if (_title === title) {
        return;
      }
      _title = title;
      methods.refresh();
    },
    setHeight(height: number) {
      if (_height === height) {
        return;
      }
      _height = height;
      methods.refresh();
    },
    pointerDown(x: number, y: number) {
      _dragging = true;
      pointer.handleMouseDown({ x, y });
      bus.emit(Events.DragStart, { x, y, dx: 0, dy: 0 });
      methods.refresh();
    },
    pointerMove(x: number, y: number) {
      pointer.handleMouseMove({ x, y });
    },
    pointerUp(x: number, y: number) {
      if (!_dragging) {
        return;
      }
      pointer.handleMouseUp({ x, y });
      _dragging = false;
      bus.emit(Events.DragEnd, { x, y, dx: 0, dy: 0 });
      methods.refresh();
    },
  };

  return {
    state: _state,
    methods,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
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
  };
}

export type WindowHeaderModel = ReturnType<typeof WindowHeaderModel>;

export type WindowBodyState = {
  role: "body";
};

export function WindowBodyModel() {
  const _state = {
    get role() {
      return "body" as const;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: WindowBodyState;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    state: _state,
    methods: {
      refresh() {
        bus.emit(Events.StateChange, { ..._state });
      },
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WindowBodyModel = ReturnType<typeof WindowBodyModel>;

export type WindowFooterState = {
  role: "footer";
  height: number;
  visible: boolean;
};

export function WindowFooterModel(
  props: {
    height?: number;
    visible?: boolean;
  } = {},
) {
  let _height = props.height ?? 48;
  let _visible = props.visible ?? true;

  const _state = {
    get role() {
      return "footer" as const;
    },
    get height() {
      return _height;
    },
    get visible() {
      return _visible;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: WindowFooterState;
  };

  const bus = base<TheTypesOfEvents>();

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setHeight(height: number) {
      if (_height === height) {
        return;
      }
      _height = height;
      methods.refresh();
    },
    setVisible(visible: boolean) {
      if (_visible === visible) {
        return;
      }
      _visible = visible;
      methods.refresh();
    },
  };

  return {
    state: _state,
    methods,
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type WindowFooterModel = ReturnType<typeof WindowFooterModel>;
