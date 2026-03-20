const mediaSizes = {
  sm: 0,
  /** 中等设备宽度阈值 */
  md: 768,
  /** 大设备宽度阈值 */
  lg: 992,
  /** 特大设备宽度阈值 */
  xl: 1200,
  /** 特大设备宽度阈值 */
  "2xl": 1536,
};
export function getCurrentDeviceSize(width: number) {
  if (width >= mediaSizes["2xl"]) {
    return "2xl";
  }
  if (width >= mediaSizes.xl) {
    return "xl";
  }
  if (width >= mediaSizes.lg) {
    return "lg";
  }
  if (width >= mediaSizes.md) {
    return "md";
  }
  return "sm";
}
export type DeviceSizeTypes = keyof typeof mediaSizes;

export function listenMultiEvent(events: (() => void)[]) {
  return () => {
    for (let i = 0; i < events.length; i += 1) {
      const cancel = events[i];
      cancel();
    }
  };
}
