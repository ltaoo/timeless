export type DragDropNodeKind = "item" | "container";

export type DragDropNodeState<TPayload = unknown> = {
  id: string;
  kind: DragDropNodeKind;
  payload: TPayload | undefined;
  containerId: string | null;
  index: number;
  dragging: boolean;
  disabled: boolean;
};

export type DragDropItemState<TPayload = unknown> =
  DragDropNodeState<TPayload> & {
    kind: "item";
    type: string;
  };

export type DragDropContainerState<
  TItemPayload = unknown,
  TContainerPayload = unknown,
> = DragDropNodeState<TContainerPayload> & {
  kind: "container";
  draggable: boolean;
  hovering: boolean;
  itemIds: string[];
  items: DragDropNodeSnapshot<TItemPayload, TContainerPayload>[];
};

export type DragDropNodeSnapshot<
  TItemPayload = unknown,
  TContainerPayload = unknown,
> =
  | DragDropItemState<TItemPayload>
  | DragDropContainerState<TItemPayload, TContainerPayload>;

export type DragDropPlacement = {
  index?: number;
};

export type DragDropAcceptContext<TNode = unknown, TContainer = unknown> = {
  node: TNode;
  target: TContainer;
  index: number;
  sourceContainerId: string | null;
  sourceIndex: number;
};
