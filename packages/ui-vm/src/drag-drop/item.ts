import { base, Handler } from "@timeless/base";

import type { DragContainerModel } from "./container";
import type { DragDropItemState } from "./types";

export type DragItemModelProps<TPayload = unknown> = {
  id: string;
  type?: string;
  payload?: TPayload;
  disabled?: boolean;
};

export function DragItemModel<TPayload = unknown>(
  props: DragItemModelProps<TPayload>,
) {
  let _id = props.id;
  let _type = props.type ?? "default";
  let _payload = props.payload;
  let _disabled = props.disabled ?? false;
  let _dragging = false;
  let _parent: DragContainerModel | null = null;
  let _index = -1;

  const _state = {
    get id() {
      return _id;
    },
    get kind() {
      return "item" as const;
    },
    get type() {
      return _type;
    },
    get payload() {
      return _payload;
    },
    get containerId() {
      return _parent?.id ?? null;
    },
    get index() {
      return _index;
    },
    get dragging() {
      return _dragging;
    },
    get disabled() {
      return _disabled;
    },
  };

  enum Events {
    StateChange,
    DragStart,
    DragEnd,
    ParentChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: DragDropItemState<TPayload>;
    [Events.DragStart]: any;
    [Events.DragEnd]: any;
    [Events.ParentChange]: {
      containerId: string | null;
      index: number;
    };
  };

  const bus = base<TheTypesOfEvents>();

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setPayload(payload: TPayload) {
      _payload = payload;
      methods.refresh();
    },
    setDisabled(disabled: boolean) {
      if (_disabled === disabled) {
        return;
      }
      _disabled = disabled;
      methods.refresh();
    },
    setParent(parent: DragContainerModel | null, index: number) {
      const nextIndex = parent ? index : -1;
      if (_parent === parent && _index === nextIndex) {
        return;
      }
      _parent = parent;
      _index = nextIndex;
      bus.emit(Events.ParentChange, {
        containerId: _parent?.id ?? null,
        index: _index,
      });
      methods.refresh();
    },
    startDrag() {
      if (_disabled || _dragging) {
        return false;
      }
      _dragging = true;
      bus.emit(Events.DragStart, api);
      methods.refresh();
      return true;
    },
    endDrag() {
      if (!_dragging) {
        return;
      }
      _dragging = false;
      bus.emit(Events.DragEnd, api);
      methods.refresh();
    },
  };

  const api = {
    kind: "item" as const,
    state: _state,
    methods,
    get id() {
      return _id;
    },
    get parent() {
      return _parent;
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onDragStart(handler: Handler<TheTypesOfEvents[Events.DragStart]>) {
      return bus.on(Events.DragStart, handler);
    },
    onDragEnd(handler: Handler<TheTypesOfEvents[Events.DragEnd]>) {
      return bus.on(Events.DragEnd, handler);
    },
    onParentChange(handler: Handler<TheTypesOfEvents[Events.ParentChange]>) {
      return bus.on(Events.ParentChange, handler);
    },
  };

  return api;
}

export type DragItemModel = ReturnType<typeof DragItemModel>;
