// Core
export { computePosition } from "./compute-position";
export { detectOverflow } from "./detect-overflow";
export type { DetectOverflowOptions } from "./detect-overflow";

// Platform
export { getDOMPlatform } from "./platform";
export type { Platform } from "./types";

// Middleware
export { offset, flip, shift, limitShift, arrow } from "./middleware";
export type {
  OffsetOptions,
  FlipOptions,
  ShiftOptions,
  LimitShiftOptions,
  ArrowOptions,
} from "./middleware";

// Types
export type {
  Middleware,
  MiddlewareData,
  MiddlewareReturn,
  MiddlewareState,
  ComputePositionConfig,
  ComputePositionReturn,
  Elements,
  Boundary,
  RootBoundary,
  ElementContext,
  Derivable,
} from "./types";

// Utils
export type {
  Alignment,
  Side,
  AlignedPlacement,
  Placement,
  Strategy,
  Axis,
  Coords,
  Length,
  Dimensions,
  SideObject,
  Rect,
  Padding,
  ClientRectObject,
  ElementRects,
  VirtualElement,
} from "./utils";

export {
  sides,
  alignments,
  placements,
  getSide,
  getAlignment,
  getSideAxis,
  getAlignmentAxis,
  getAxisLength,
  getOppositeAxis,
  getOppositePlacement,
  getExpandedPlacements,
  getOppositeAxisPlacements,
  getAlignmentSides,
  clamp,
  evaluate,
  getPaddingObject,
  rectToClientRect,
} from "./utils";
