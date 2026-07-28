/**
 * @file SonnerCore - Toast 通知系统核心类
 * 基于 sonner 的设计，抽象 toast 管理逻辑
 */
// import { BaseDomain, Handler } from "@timeless/inner-base";

import { base, Handler } from "@timeless/inner-base";

export type ToastTypes =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"
  | "default";

// export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

// export type ToastShape = {
//   id: number | string;
//   style?: Record<string, unknown>;
//   unstyled?: boolean;
//   className?: string;
//   toasterId?: string;
//   type?: ToastTypes;
//   // title?: (() => unknown) | unknown;
//   title: unknown;
//   icon?: unknown;
//   // jsx?: unknown;
//   richColors?: boolean;
//   invert?: boolean;
//   closeButton?: boolean;
//   dismissible?: boolean;
//   // description?: (() => unknown) | unknown;
//   duration?: number;
//   delete?: boolean;
//   action?: Action;
//   cancel?: Action;
//   // promise?: PromiseT;
//   // cancelButtonStyle?: Record<string, unknown>;
//   // actionButtonStyle?: Record<string, unknown>;
//   descriptionClassName?: string;
//   position?: Position;
//   testId?: string;
//   // onDismiss?: (toast: ToastShape) => void;
//   // onAutoClose?: (toast: ToastShape) => void;
// };
type ToastShape = {
  id?: number;
  type?: ToastTypes;
  title: unknown;
  position?: Position;
  dismissible?: boolean;
};

export type SwipeDirection = "top" | "right" | "bottom" | "left";

export interface Action {
  label: unknown;
  onClick: (event: unknown) => void;
  actionButtonStyle?: Record<string, unknown>;
}

export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
}

export type ExternalToast = Omit<
  ToastShape,
  "id" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number;
  toasterId?: string;
};

export interface PromiseData<ToastData = any> {
  loading?: unknown;
  success?: unknown;
  error?: unknown;
  description?: unknown;
  finally?: () => void | Promise<void>;
}
export interface HeightShape {
  height: number;
  toastId: number;
  position: Position;
}

enum Events {
  ToastAdd,
  ToastDismiss,
  Subscribe,
}

type TheTypesOfEvents = {
  [Events.ToastAdd]: ToastShape;
  [Events.ToastDismiss]: ToastToDismiss;
  [Events.Subscribe]: ToastShape | ToastToDismiss;
};

export function SonnerCore() {
  let _subscribers: ((toast: ToastShape | ToastToDismiss) => void)[] = [];
  let _toasts: (ToastShape | ToastToDismiss)[] = [];
  let _dismissed_toasts: Set<string | number> = new Set();

  let _counter = 1;
  function _uid(): number {
    return _counter++;
  }

  const methods = {
    subscribe(subscriber: (toast: ToastShape | ToastToDismiss) => void) {
      _subscribers.push(subscriber);
      return () => {
        const index = _subscribers.indexOf(subscriber);
        if (index > -1) {
          _subscribers.splice(index, 1);
        }
      };
    },
    publish(data: ToastShape) {
      _subscribers.forEach((subscriber) => subscriber(data));
    },
    addToast(data: ToastShape) {
      methods.publish(data);
      _toasts = [..._toasts, data];
    },
    deleteToast(data: ToastShape) {
      methods.publish(data);
      _toasts = [..._toasts, data];
    },
    create(
      data: ExternalToast & {
        message?: unknown;
        type?: ToastTypes;
      },
    ) {
      const { message, ...rest } = data;
      const id = _uid();
      const existing = _toasts.find((toast) => {
        return toast.id === id;
      });
      const dismissible =
        data.dismissible === undefined ? true : Boolean(data.dismissible);

      if (_dismissed_toasts.has(id)) {
        _dismissed_toasts.delete(id);
      }

      if (existing) {
        _toasts = _toasts.map((toast) => {
          if (toast.id === id) {
            methods.publish({
              ...toast,
              ...data,
              id,
              title: message,
            } as ToastShape);
            return toast;
            // return {
            //   ...toast,
            //   ...data,
            //   id,
            //   dismissible,
            //   title: message,
            // };
          }
          return toast;
        });
      } else {
        methods.addToast({
          title: message,
          ...rest,
          dismissible,
          id,
        } as ToastShape);
      }
      return id;
    },
    dismiss(id?: number) {
      if (id !== undefined) {
        _dismissed_toasts.add(id);
        requestAnimationFrame(() => {
          _subscribers.forEach((subscriber) => {
            subscriber({ id, dismiss: true } as ToastToDismiss);
          });
        });
      } else {
        _toasts.forEach((toast) => {
          _subscribers.forEach((subscriber) =>
            subscriber({ id: toast.id, dismiss: true } as ToastToDismiss),
          );
        });
      }
      return id;
    },
    message(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, message });
    },
    error(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, message, type: "error" });
    },
    success(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, type: "success", message });
    },
    info(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, type: "info", message });
    },
    warning(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, type: "warning", message });
    },
    loading(message: unknown, data?: ExternalToast) {
      return methods.create({ ...data, type: "loading", message });
    },
    // custom(jsx: (id: number | string) => unknown, data?: ExternalToast) {
    //   const id = data?.id || _uid();
    //   methods.create({ jsx: jsx(id), ...data, id });
    //   return id;
    // },
    getActiveToasts() {
      return _toasts.filter((toast) => !_dismissed_toasts.has(toast.id));
    },
  };

  const state = {
    get toasts() {
      return _toasts;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof state;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    get [Symbol.toStringTag]() {
      return "SonnerCore";
    },
    state,
    methods,
    message(content: unknown, extra?: ExternalToast) {
      methods.create({ ...extra, message: content });
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      bus.on(Events.StateChange, handler);
    },
  };
}

export type SonnerCore = ReturnType<typeof SonnerCore>;

interface ToastTimer {
  id: number;
  startTime: number;
  remaining: number;
  timeoutId: ReturnType<typeof setTimeout>;
}

interface ToastHeightRecord {
  toastId: number;
  height: number;
  position: Position;
}
type ToastListener = (toast: ToastShape | ToastToDismiss) => void;

const DEFAULT_LIFETIME = 4000;
const DEFAULT_TOAST_WIDTH = 356;
const DEFAULT_GAP = 14;
const SWIPE_THRESHOLD = 45;
const TIME_BEFORE_UNMOUNT = 200;
const VISIBLE_TOASTS_AMOUNT = 3;

type ToasterModelProps = {
  id?: string;
  position?: Position;
  theme?: "light" | "dark" | "system";
  duration?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  gap?: number;
  richColors?: boolean;
  expand?: boolean;
  invert?: boolean;
  offset?:
    | number
    | string
    | {
        top?: number | string;
        right?: number | string;
        bottom?: number | string;
        left?: number | string;
      };
  mobileOffset?:
    | number
    | string
    | {
        top?: number | string;
        right?: number | string;
        bottom?: number | string;
        left?: number | string;
      };
  // icons?: ToastIcons;
  // classNames?: ToastClassnames;
  // swipeDirections?: SwipeDirection[];
  // cancelButtonStyle?: string;
  // actionButtonStyle?: string;
};

export function ToasterModel(props: ToasterModelProps) {
  let toast$s: ToastModel[] = [];
  let heights: ToastHeightRecord[] = [];
  let timers: Map<number | string, ToastTimer> = new Map();
  let listeners: Set<ToastListener> = new Set();
  let _uid = 1;
  let expanded = false;
  let interacting = false;
  let documentHidden = false;

  const config = {
    position: "bottom-right",
    theme: "light",
    duration: DEFAULT_LIFETIME,
    visibleToasts: VISIBLE_TOASTS_AMOUNT,
    closeButton: true,
    gap: DEFAULT_GAP,
    expand: false,
    invert: false,
    ...props,
  };

  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ...state });
    },
    // subscribe(listener: ToastListener): () => void {
    //   listeners.add(listener);
    //   return () => listeners.delete(listener);
    // },

    notify(toast?: ToastModel) {
      // listeners.forEach((fn) => fn(toast));
      methods.refresh();
    },

    uid(id?: number): number {
      return id ?? _uid++;
    },

    create_toast$(message: any, type?: ToastTypes, data?: ExternalToast) {
      const id = methods.uid(data?.id);
      const index = toast$s.length;
      // @ts-ignore
      return ToastModel({
        id,
        content: message,
        type,
        dismissible: true,
        duration: config.duration,
        position: config.position as Position,
        index,
        ...data,
        onToasterChange(handler) {
          bus.on(Events.StateChange, handler);
        },
      });
    },

    add(message: any, data?: ExternalToast): number {
      const toast$ = methods.create_toast$(message, data?.type, data);
      if (!toast$s.find((t) => t.id === toast$.id)) {
        // 创建新数组引用，确保响应式系统能检测到变化
        toast$s = [...toast$s, toast$];
      }
      methods.startTimer(toast$.id, toast$.duration ?? config.duration!);

      // 超出 visibleToasts 上限时，移除最早的 toast
      const max = config.visibleToasts!;
      const excess = toast$s.length - max;
      for (let i = 0; i < excess; i++) {
        methods.remove(toast$s[i].id);
      }

      methods.notify(toast$);
      return toast$.id;
    },

    success(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "success" });
    },

    error(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "error" });
    },

    info(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "info" });
    },

    warning(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "warning" });
    },

    loading(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "loading" });
    },

    message(message: any, data?: ExternalToast): number {
      return methods.add(message, { ...data, type: "normal" });
    },

    dismiss(id?: number | string) {
      if (id) {
        toast$s = toast$s.filter((t) => t.id !== id);
        methods.stopTimer(id);
        // methods.notify({ id, dismiss: true });
        methods.notify();
      } else {
        toast$s.forEach((_, key) => {
          methods.dismiss(key);
        });
      }
      return id;
    },

    update(id: number | string, data: Partial<ToastShape>) {
      const existing = toast$s.find((t) => t.id === id);
      if (existing) {
        const updated = { ...existing, ...data };
        methods.notify(updated);
      }
    },

    getToasts(): ToastModel[] {
      return Array.from(toast$s);
    },

    getToastsByPosition(position: Position): ToastModel[] {
      return methods
        .getToasts()
        .filter(
          (t) =>
            t.position === position ||
            (!t.position && config.position === position),
        );
    },

    getToastsByToasterId(toasterId: number): ToastModel[] {
      return methods.getToasts().filter((t) => t.id === toasterId);
    },

    getPositions(): Position[] {
      const positions = new Set<Position>();
      // @ts-ignore
      positions.add(config.position);
      methods.getToasts().forEach((t) => {
        if (t.position) positions.add(t.position);
      });
      return Array.from(positions);
    },

    setHeight(toastId: number | string, height: number, position: Position) {
      // heights.set(toastId, { toastId, height, position });
    },

    removeHeight(toastId: number | string) {
      // heights.delete(toastId);
      heights = heights.filter((h) => h.toastId !== toastId);
    },

    getHeights(): HeightShape[] {
      return Array.from(heights.values());
    },

    getHeightsByPosition(position: Position): HeightShape[] {
      return methods.getHeights().filter((h) => h.position === position);
    },

    calculateOffset(toastId: number | string, position: Position): number {
      const heights = methods
        .getHeightsByPosition(position)
        .sort((a, b) => a.height - b.height);

      let offset = 0;
      for (const h of heights) {
        if (h.toastId === toastId) break;
        offset += h.height + config.gap!;
      }
      return offset;
    },

    startTimer(id: number, duration: number) {
      methods.stopTimer(id);
      if (duration === Infinity) return;

      const timer: ToastTimer = {
        id,
        startTime: Date.now(),
        remaining: duration,
        timeoutId: setTimeout(() => {
          const toast = toast$s.find((t) => t.id == id);
          if (toast) {
            // toast.onAutoClose?.(toast);
            methods.remove(id);
          }
        }, duration),
      };
      timers.set(id, timer);
    },

    pauseTimer(id: number) {
      const timer = timers.get(id);
      if (timer) {
        const elapsed = Date.now() - timer.startTime;
        timer.remaining -= elapsed;
        clearTimeout(timer.timeoutId);
      }
    },

    resumeTimer(id: number) {
      const timer = timers.get(id);
      if (timer && timer.remaining > 0) {
        methods.startTimer(id, timer.remaining);
      }
    },

    pauseAllTimers() {
      const ids = Array.from(timers.keys());
      for (const id of ids) {
        methods.pauseTimer(id as number);
      }
    },

    resumeAllTimers() {
      const ids = Array.from(timers.keys());
      for (const id of ids) {
        methods.resumeTimer(id as number);
      }
    },

    stopTimer(id: number | string) {
      const timer = timers.get(id);
      if (timer) {
        clearTimeout(timer.timeoutId);
        timers.delete(id);
      }
    },

    remove(id: number | string) {
      const toast = toast$s.find((t) => t.id == id);
      if (toast) {
        // 先标记 toast 为 removed，触发退出动画
        toast.remove();
        methods.notify(toast);
      }

      // 等退出动画播放完毕后，真正从列表中移除
      setTimeout(() => {
        toast$s = toast$s.filter((t) => t.id !== id);
        heights = heights.filter((h) => h.toastId !== id);
        timers.delete(id);
        // methods.notify({ id, dismiss: true });
        methods.notify();
      }, TIME_BEFORE_UNMOUNT);
    },

    setExpanded(value: boolean) {
      expanded = value;
    },

    getExpanded(): boolean {
      return expanded;
    },

    setInteracting(value: boolean) {
      interacting = value;
    },

    getInteracting(): boolean {
      return interacting;
    },

    setDocumentHidden(hidden: boolean) {
      documentHidden = hidden;
    },

    getDocumentHidden(): boolean {
      return documentHidden;
    },

    // updateConfig(config: Partial<ToasterConfig>) {
    //   this.config = { ...this.config, ...config };
    // },

    // getConfig(): ToasterConfig {
    //   return { ...this.config };
    // },

    getTheme(): "light" | "dark" {
      if (config.theme === "system") {
        if (typeof window !== "undefined") {
          return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return "light";
      }
      // @ts-ignore
      return config.theme;
    },

    shouldPauseTimer(): boolean {
      return expanded || interacting || documentHidden;
    },

    isVisible(index: number): boolean {
      return index + 1 <= (config.visibleToasts ?? VISIBLE_TOASTS_AMOUNT);
    },

    isFront(index: number): boolean {
      return index === 0;
    },

    calculateSwipeThreshold(swipeAmount: number, timeTaken: number): boolean {
      const velocity = Math.abs(swipeAmount) / timeTaken;
      return Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11;
    },

    getSwipeDirections(position: Position): SwipeDirection[] {
      const [y, x] = position.split("-") as [string, string];
      const directions: SwipeDirection[] = [];
      if (y) directions.push(y as SwipeDirection);
      if (x) directions.push(x as SwipeDirection);
      return directions;
    },

    getDefaultSwipeDirections(): SwipeDirection[] {
      // @ts-ignore
      return methods.getSwipeDirections(config.position);
    },

    getLoadingIcon() {
      // @ts-ignore
      return config.icons?.loading;
    },

    getIcon(type?: ToastTypes) {
      if (type === "loading") {
        // @ts-ignore
        return config.icons?.loading;
      }
      // @ts-ignore
      return config.icons?.[type ?? "default"];
    },

    getCloseIcon() {
      // @ts-ignore
      return config.icons?.close;
    },

    clear() {
      toast$s = [];
      heights = [];
      timers.forEach((t) => clearTimeout(t.timeoutId));
      timers.clear();
    },
  };

  const state = {
    get toasts() {
      return toast$s;
    },
    get heights() {
      return heights;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof state;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    get [Symbol.toStringTag]() {
      return "ToasterModel";
    },
    state,
    heights,
    message(content: unknown) {
      methods.message(content);
    },
    pauseAllTimers() {
      methods.pauseAllTimers();
    },
    resumeAllTimers() {
      methods.resumeAllTimers();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}

export type ToasterModel = ReturnType<typeof ToasterModel>;

type ToastModelProps = {
  // heights: HeightShape[];
  id: number;
  /** toast 出现的位置 */
  position: Position;
  /** toast 的层级，从 0 开始 */
  index: number;
  /** 持续时间 */
  duration: number;
  /** 总共可见的 toast 数量 */
  visibleToasts?: number;
  type: string;
  /** 是否可消失 */
  dismissible?: boolean;
  content: unknown;
  onToasterChange: (
    handler: (v: ReturnType<typeof ToasterModel>["state"]) => void,
  ) => void;
};

export function ToastModel(props: ToastModelProps) {
  let _position = props.position;
  let _remaining_time = props.duration;
  let _is_front = props.index === 0;
  let _is_visible =
    props.index + 1 <= (props.visibleToasts ?? VISIBLE_TOASTS_AMOUNT);
  let _toast_type = props.type;
  let _dismissible = props.dismissible !== false;
  let _disabled = props.type === "loading";
  // let _heights = props.toaster.heights;
  let _heights = [];

  let _height_idx = 0;
  let _toasts_height_before = 0;

  let _mounted = false;
  let _removed = false;
  let _swiping = false;
  let _swipe_out = false;
  let _is_swiped = false;
  let _offset_before_remove = 0;
  let _initial_height = 0;
  let _drag_start_time: Date | null = null;
  let _close_timer_start_time_ref = 0;
  let _last_close_timer_start_time_ref = 0;
  let _pointer_start_ref: { x: number; y: number } | null = null;
  const [y, x] = _position.split("-");
  let _offset = 0;

  const methods = {
    refresh() {
      _height_idx =
        _heights.findIndex((height) => height.toastId === props.id) || 0;
      _toasts_height_before = _heights.reduce((prev, curr, reducerIndex) => {
        // Calculate offset up until current toast
        if (reducerIndex >= _height_idx) {
          return prev;
        }
        return prev + curr.height;
      }, 0);
    },
    /** 标记为已移除，触发退出动画 */
    markRemoved() {
      _removed = true;
      bus.emit(Events.StateChange, { ...state });
    },
  };

  const state = {
    get index() {
      return props.index;
    },
    get offset() {
      return _offset;
    },
    get removed() {
      return _removed;
    },
    get offsetBeforeRemove() {
      return _offset_before_remove;
    },
    get content() {
      return props.content;
    },
  };
  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof state;
  };
  const bus = base<TheTypesOfEvents>();

  methods.refresh();
  props.onToasterChange((v) => {
    console.log("[]ToastModel onToasterChange", v.heights);
    _heights = v.heights;
    methods.refresh();
    bus.emit(Events.StateChange, { ...state });
  });

  return {
    get [Symbol.toStringTag]() {
      return "ToastModel";
    },
    id: props.id,
    position: props.position,
    duration: props.duration,
    content: props.content,
    state,
    /** 标记为已移除，触发退出动画 */
    remove() {
      methods.markRemoved();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type ToastModel = ReturnType<typeof ToastModel>;
