import { base, Handler } from "@timeless/inner-base";

import type { DragContainerModel, DragDropNodeModel } from "./container";
import type { DragDropContainerState, DragDropPlacement } from "./types";

export type DragDropActiveState = {
  id: string;
  kind: "item" | "container";
  sourceContainerId: string | null;
  sourceIndex: number;
};

export type DragDropState = {
  active: DragDropActiveState | null;
  overContainerId: string | null;
  containers: DragDropContainerState[];
};

export function DragDropModel<
  TItemPayload = unknown,
  TContainerPayload = unknown,
>() {
  let _containers: DragContainerModel[] = [];
  let _activeNode: DragDropNodeModel | null = null;
  let _sourceContainer: DragContainerModel | null = null;
  let _sourceIndex = -1;
  let _overContainer: DragContainerModel | null = null;

  const _state = {
    get active() {
      if (!_activeNode) {
        return null;
      }
      return {
        id: _activeNode.id,
        kind: _activeNode.kind,
        sourceContainerId: _sourceContainer?.id ?? null,
        sourceIndex: _sourceIndex,
      };
    },
    get overContainerId() {
      return _overContainer?.id ?? null;
    },
    get containers() {
      return _containers.map((container) => container.state);
    },
  };

  enum Events {
    StateChange,
    DragStart,
    DragOver,
    Drop,
    DragEnd,
    DragCancel,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.DragStart]: DragDropActiveState;
    [Events.DragOver]: {
      node: DragDropNodeModel;
      container: DragContainerModel;
      accepted: boolean;
      index: number;
    };
    [Events.Drop]: {
      node: DragDropNodeModel;
      container: DragContainerModel;
      index: number;
    };
    [Events.DragEnd]: DragDropActiveState;
    [Events.DragCancel]: DragDropActiveState;
  };

  const bus = base<TheTypesOfEvents>();

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    registerContainer(container: DragContainerModel) {
      if (_containers.includes(container)) {
        return;
      }
      _containers.push(container);
      methods.refresh();
    },
    unregisterContainer(container: DragContainerModel) {
      const index = _containers.indexOf(container);
      if (index === -1) {
        return;
      }
      _containers.splice(index, 1);
      if (_overContainer === container) {
        _overContainer = null;
      }
      methods.refresh();
    },
    startDrag(node: DragDropNodeModel) {
      if (_activeNode) {
        methods.cancelDrag();
      }
      const started = node.methods.startDrag();
      if (!started) {
        return false;
      }
      _activeNode = node;
      _sourceContainer = node.parent;
      _sourceIndex = node.state.index;
      bus.emit(Events.DragStart, _state.active!);
      methods.refresh();
      return true;
    },
    enterContainer(
      container: DragContainerModel,
      placement: DragDropPlacement = {},
    ) {
      if (!_activeNode) {
        return false;
      }
      clearOverContainer();
      const index = normalizeIndex(placement.index, container.items.length);
      const accepted = container.methods.canAccept(_activeNode, { index });
      container.methods.setHovering(accepted);
      _overContainer = container;
      bus.emit(Events.DragOver, {
        node: _activeNode,
        container,
        accepted,
        index,
      });
      methods.refresh();
      return accepted;
    },
    dropOn(container: DragContainerModel, placement: DragDropPlacement = {}) {
      if (!_activeNode) {
        return false;
      }
      const node = _activeNode;
      const accepted = container.methods.drop(node, placement);
      if (!accepted) {
        return false;
      }
      const active = _state.active!;
      bus.emit(Events.Drop, {
        node,
        container,
        index: node.state.index,
      });
      finishDrag();
      bus.emit(Events.DragEnd, active);
      methods.refresh();
      return true;
    },
    cancelDrag() {
      if (!_activeNode) {
        return;
      }
      const active = _state.active!;
      _activeNode.methods.endDrag();
      clearSession();
      bus.emit(Events.DragCancel, active);
      bus.emit(Events.DragEnd, active);
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
    onDragOver(handler: Handler<TheTypesOfEvents[Events.DragOver]>) {
      return bus.on(Events.DragOver, handler);
    },
    onDrop(handler: Handler<TheTypesOfEvents[Events.Drop]>) {
      return bus.on(Events.Drop, handler);
    },
    onDragEnd(handler: Handler<TheTypesOfEvents[Events.DragEnd]>) {
      return bus.on(Events.DragEnd, handler);
    },
    onDragCancel(handler: Handler<TheTypesOfEvents[Events.DragCancel]>) {
      return bus.on(Events.DragCancel, handler);
    },
  };

  function finishDrag() {
    if (_activeNode) {
      _activeNode.methods.endDrag();
    }
    clearSession();
  }

  function clearSession() {
    clearOverContainer();
    _activeNode = null;
    _sourceContainer = null;
    _sourceIndex = -1;
  }

  function clearOverContainer() {
    if (!_overContainer) {
      return;
    }
    _overContainer.methods.setHovering(false);
    _overContainer = null;
  }
}

function normalizeIndex(index: number | undefined, length: number) {
  if (index === undefined || !Number.isFinite(index)) {
    return length;
  }
  return Math.max(0, Math.min(length, Math.floor(index)));
}

export type DragDropModel = ReturnType<typeof DragDropModel>;
