export type MouseEvent<T = any> = {
  target: T;
};

export interface MountedEvent<T = any> {
  reason?: string;
  target: T;
  error?: Error;
}

export type ScrollEvent<T = any> = {
  scrollTop: number;
};

/** 指针位移方向（四向）；无位移为 "none" */
export type PointerDirection = "none" | "left" | "right" | "up" | "down";

/**
 * PointerInfo - 指针事件的位移信息（参考 kit 里的 CanvasPointer）。
 *
 * 按下时记录起点，移动 / 抬起时给出相对起点的位移（dx / dy）、
 * 距离（distance）与方向（direction）。
 */
export type PointerInfo = {
  /** 当前指针位置（clientX / clientY） */
  x: number;
  y: number;
  /** 按下时的指针位置 */
  startX: number;
  startY: number;
  /** 相对按下位置的位移 */
  dx: number;
  dy: number;
  /** 位移距离（dx / dy 的欧氏距离，保留两位小数） */
  distance: number;
  /** 位移方向 */
  direction: PointerDirection;
  /** 指针是否处于按下状态 */
  pressing: boolean;
  /** 按下后是否发生了位移 */
  dragging: boolean;
  /** 触发本次事件的 pointerId */
  pointerId: number;
};
