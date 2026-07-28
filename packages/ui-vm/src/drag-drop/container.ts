import { base, Handler } from "@timeless/inner-base";

import type { DragItemModel } from "./item";
import type {
  DragDropAcceptContext,
  DragDropContainerState,
  DragDropPlacement,
  DragDropNodeSnapshot,
} from "./types";

export type DragContainerAcceptHandler = (
  context: DragDropAcceptContext<any, any>,
) => boolean;

export type DragContainerModelProps<
  TItemPayload = unknown,
  TContainerPayload = unknown,
> = {
  id: string;
  payload?: TContainerPayload;
  draggable?: boolean;
  disabled?: boolean;
  accepts?: DragContainerAcceptHandler;
};

export function DragContainerModel<
  TItemPayload = unknown,
  TContainerPayload = unknown,
>(props: DragContainerModelProps<TItemPayload, TContainerPayload>) {
  let _id = props.id;
  let _payload = props.payload;
  let _draggable = props.draggable ?? true;
  let _disabled = props.disabled ?? false;
  let _dragging = false;
  let _hovering = false;
  let _parent: DragContainerModel | null = null;
  let _index = -1;
  let _items: any[] = [];
  const _accepts = props.accepts;

  const _state = {
    get id() {
      return _id;
    },
    get kind() {
      return "container" as const;
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
    get draggable() {
      return _draggable;
    },
    get hovering() {
      return _hovering;
    },
    get itemIds() {
      return _items.map((item) => item.id);
    },
    get items() {
      return _items.map((item) => {
        return { ...item.state } as DragDropNodeSnapshot<
          TItemPayload,
          TContainerPayload
        >;
      });
    },
  };

  enum Events {
    StateChange,
    ItemsChange,
    Drop,
    DragStart,
    DragEnd,
    HoverChange,
    ParentChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: DragDropContainerState<
      TItemPayload,
      TContainerPayload
    >;
    [Events.ItemsChange]: any[];
    [Events.Drop]: {
      node: any;
      container: any;
      index: number;
    };
    [Events.DragStart]: any;
    [Events.DragEnd]: any;
    [Events.HoverChange]: boolean;
    [Events.ParentChange]: {
      containerId: string | null;
      index: number;
    };
  };

  const bus = base<TheTypesOfEvents>();
  let api: any;

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    setPayload(payload: TContainerPayload) {
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
    setDraggable(draggable: boolean) {
      if (_draggable === draggable) {
        return;
      }
      _draggable = draggable;
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
    setHovering(hovering: boolean) {
      if (_hovering === hovering) {
        return;
      }
      _hovering = hovering;
      bus.emit(Events.HoverChange, _hovering);
      methods.refresh();
    },
    startDrag() {
      if (_disabled || !_draggable || _dragging) {
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
    canAccept(node: any, placement: DragDropPlacement = {}) {
      if (_disabled || node.state.disabled) {
        return false;
      }
      if (node.kind === "container") {
        if (node.id === _id || node.methods.contains(_id)) {
          return false;
        }
      }
      const index = normalizeIndex(placement.index, _items.length);
      if (_accepts) {
        return _accepts({
          node,
          target: api,
          index,
          sourceContainerId: node.parent?.id ?? null,
          sourceIndex: node.state.index,
        });
      }
      return true;
    },
    insert(node: any, placement: DragDropPlacement = {}) {
      if (!methods.canAccept(node, placement)) {
        return false;
      }

      let index = normalizeIndex(placement.index, _items.length);
      const existingIndex = _items.findIndex((item) => item.id === node.id);

      if (existingIndex !== -1) {
        _items.splice(existingIndex, 1);
        if (existingIndex < index) {
          index -= 1;
        }
      } else if (node.parent) {
        node.parent.methods.remove(node);
      }

      index = normalizeIndex(index, _items.length);
      _items.splice(index, 0, node);
      reindexItems();
      emitItemsChange();
      methods.refresh();
      return true;
    },
    append(node: any) {
      return methods.insert(node, { index: _items.length });
    },
    remove(nodeOrId: any | string) {
      const id = typeof nodeOrId === "string" ? nodeOrId : nodeOrId.id;
      const index = _items.findIndex((item) => item.id === id);
      if (index === -1) {
        return false;
      }
      const [removed] = _items.splice(index, 1);
      removed.methods.setParent(null, -1);
      reindexItems();
      emitItemsChange();
      methods.refresh();
      return true;
    },
    drop(node: any, placement: DragDropPlacement = {}) {
      const accepted = methods.insert(node, placement);
      if (!accepted) {
        return false;
      }
      bus.emit(Events.Drop, {
        node,
        container: api,
        index: node.state.index,
      });
      return true;
    },
    contains(id: string) {
      return _items.some((item) => {
        if (item.id === id) {
          return true;
        }
        if (item.kind === "container") {
          return item.methods.contains(id);
        }
        return false;
      });
    },
    find(id: string): any | null {
      for (const item of _items) {
        if (item.id === id) {
          return item;
        }
        if (item.kind === "container") {
          const matched = item.methods.find(id);
          if (matched) {
            return matched;
          }
        }
      }
      return null;
    },
    getItem(id: string) {
      return _items.find((item) => item.id === id) ?? null;
    },
  };

  api = {
    kind: "container" as const,
    state: _state,
    methods,
    get id() {
      return _id;
    },
    get parent() {
      return _parent;
    },
    get items() {
      return _items;
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onItemsChange(handler: Handler<TheTypesOfEvents[Events.ItemsChange]>) {
      return bus.on(Events.ItemsChange, handler);
    },
    onDrop(handler: Handler<TheTypesOfEvents[Events.Drop]>) {
      return bus.on(Events.Drop, handler);
    },
    onDragStart(handler: Handler<TheTypesOfEvents[Events.DragStart]>) {
      return bus.on(Events.DragStart, handler);
    },
    onDragEnd(handler: Handler<TheTypesOfEvents[Events.DragEnd]>) {
      return bus.on(Events.DragEnd, handler);
    },
    onHoverChange(handler: Handler<TheTypesOfEvents[Events.HoverChange]>) {
      return bus.on(Events.HoverChange, handler);
    },
    onParentChange(handler: Handler<TheTypesOfEvents[Events.ParentChange]>) {
      return bus.on(Events.ParentChange, handler);
    },
  };

  return api;

  function reindexItems() {
    for (let i = 0; i < _items.length; i += 1) {
      _items[i].methods.setParent(api, i);
    }
  }

  function emitItemsChange() {
    bus.emit(Events.ItemsChange, [..._items]);
  }
}

function normalizeIndex(index: number | undefined, length: number) {
  if (index === undefined || !Number.isFinite(index)) {
    return length;
  }
  return Math.max(0, Math.min(length, Math.floor(index)));
}

export type DragContainerModel = ReturnType<typeof DragContainerModel>;

export type DragDropNodeModel = DragItemModel | DragContainerModel;
