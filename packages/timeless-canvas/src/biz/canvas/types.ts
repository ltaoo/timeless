// import { MutableRecord, MutableRecord2 } from "@/types/index";

import {
  CanvasThingTypes,
  LineDirectionTypes,
  RectLineTypes,
  Side,
} from "./constants";
// import TransformRect from "../domains/rect";
// import ImageDomain from "../domains/image";
// import TextDomain from "../domains/text";

/**
 * 点位置
 */
export interface Position {
  /** 距离左边间距 */
  x: number;
  /** 距离上边间距 */
  y: number;
}

/**
 * 矩形大小
 */
export interface Size {
  /** 宽 */
  width: number;
  /** 高 */
  height: number;
}

/**
 *
 */
export interface SideSize {
  width: number;
  height: number;
}

interface CanvasContentWithoutType {
  /** 唯一值 */
  id: number;
  /** 包裹内容的容器实例 */
  //   rect: TransformRect;
}

/** 矩形盒子尺寸、位置信息 */
export interface RectShape {
  x: number;
  x1: number;
  y: number;
  y1: number;
  center: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  angle: number;
  index: number;
}

interface LineShapeWithoutType {
  /** 起始点 */
  origin: number;
  /** 长度 */
  length: number;
  /** 该线条如果是矩形中的，具体是矩形哪条线 */
  typeAtRect?: RectLineTypes;
}

/** 线条位置、长度信息 */
// export type LineShape = MutableRecord2<{
//   [LineDirectionTypes.Horizontal]: {
//     y: number;
//   } & LineShapeWithoutType;
//   [LineDirectionTypes.Vertical]: {
//     x: number;
//   } & LineShapeWithoutType;
// }>;

// export type LineShape = {
//   [Type in LineDirectionTypes]: {
//     type: Type;
//     data: {
//       [LineDirectionTypes.X]: { y: number };
//       [LineDirectionTypes.Y]: { x: number };
//     }[Type];
//   };
// }[LineDirectionTypes];

export interface SideThumbnailInterface extends SideSize {
  position: Side;
  url: string;
  // backgroundColor?: string;
}

/** 容器? */
export interface ContainerParams {
  size: Size;
  position: Position;
  rotate: number;
}

type SizeUnit = "mm";
export interface BoxSize {
  length: number;
  width: number;
  height: number;
  unit: SizeUnit;
}
