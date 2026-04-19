export interface Platform {
  /** 监听全局事件，返回取消监听的 cleanup 函数 */
  addEventListener(
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ): () => void;

  /** 批量设置 document.body 样式（传空字符串可清除） */
  patchBodyStyle(style: Record<string, string>): void;

  /** 获取视口大小 */
  getViewportSize(): { width: number; height: number };
}

const noop = () => {};

let _platform: Platform = {
  addEventListener: () => noop,
  patchBodyStyle: noop,
  getViewportSize: () => ({ width: 0, height: 0 }),
};

export function setPlatform(p: Platform) {
  _platform = p;
  return p;
}

export function getPlatform(): Platform {
  return _platform;
}
