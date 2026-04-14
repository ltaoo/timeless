/**
 * @file SonnerCore - Toast 通知系统核心类
 * 基于 sonner 的设计，抽象 toast 管理逻辑
 */
// import { BaseDomain, Handler } from "@timeless/base";

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
type ToastShape = any;

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
  "id" | "type" | "title" | "jsx" | "delete" | "promise"
> & {
  id?: number | string;
  toasterId?: string;
};

export interface PromiseData<ToastData = any> {
  loading?: unknown;
  success?: unknown;
  error?: unknown;
  description?: unknown;
  finally?: () => void | Promise<void>;
}
export interface HeightT {
  height: number;
  toastId: number | string;
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

function SonnerCore() {
  let subscribers: Array<(toast: ToastShape | ToastToDismiss) => void> = [];
  let toasts: Array<ToastShape | ToastToDismiss> = [];
  let dismissed_toasts: Set<string | number> = new Set();

  let _counter = 1;
  function _uid(): number {
    return _counter++;
  }

  const methods = {
    subscribe(subscriber: (toast: ToastShape | ToastToDismiss) => void) {
      this.subscribers.push(subscriber);
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      };
    },
    publish(data: ToastShape) {
      this.subscribers.forEach((subscriber) => subscriber(data));
    },
    addToast(data: ToastShape) {
      this.publish(data);
      this.toasts = [...this.toasts, data];
    },
    create(
      data: ExternalToast & {
        message?: unknown;
        type?: ToastTypes;
        // promise?: PromiseT;
      },
    ) {
      const { message, ...rest } = data;
      const id = _uid();
      const existing = toasts.find((toast) => {
        return toast.id === id;
      });
      const dismissible =
        data.dismissible === undefined ? true : Boolean(data.dismissible);

      if (dismissed_toasts.has(id)) {
        dismissed_toasts.delete(id);
      }

      if (existing) {
        toasts = toasts.map((toast) => {
          if (toast.id === id) {
            methods.publish({
              ...toast,
              ...data,
              id,
              title: message,
            } as ToastShape);
            return {
              ...toast,
              ...data,
              id,
              dismissible,
              title: message,
            };
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
        dismissed_toasts.add(id);
        requestAnimationFrame(() => {
          subscribers.forEach((subscriber) => {
            subscriber({ id, dismiss: true } as ToastToDismiss);
          });
        });
      } else {
        toasts.forEach((toast) => {
          subscribers.forEach((subscriber) =>
            subscriber({ id: toast.id, dismiss: true } as ToastToDismiss),
          );
        });
      }
      return id;
    },
    message(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, message });
    },
    error(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, message, type: "error" });
    },
    success(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, type: "success", message });
    },
    info(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, type: "info", message });
    },
    warning(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, type: "warning", message });
    },
    loading(message: unknown, data?: ExternalToast) {
      return this.create({ ...data, type: "loading", message });
    },
    custom(jsx: (id: number | string) => unknown, data?: ExternalToast) {
      const id = data?.id || _uid();
      this.create({ jsx: jsx(id), ...data, id });
      return id;
    },
    getActiveToasts() {
      return toasts.filter((toast) => !dismissed_toasts.has(toast.id));
    },
  };

  return {
    get [Symbol.toStringTag]() {
      return "SonnerCore";
    },
  };
}

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

type ToasterCoreProps = {
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

function ToasterCore(props: ToasterCoreProps) {
  let toasts: Map<number | string, ToastShape> = new Map();
  let heights: Map<number | string, ToastHeightRecord> = new Map();
  let timers: Map<number | string, ToastTimer> = new Map();
  let listeners: Set<ToastListener> = new Set();
  let idCounter = 1;
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
    subscribe(listener: ToastListener): () => void {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    },

    notify(toast: ToastShape | ToastToDismiss) {
      this.listeners.forEach((fn) => fn(toast));
    },

    getId(id?: number | string): number | string {
      return id ?? this.idCounter++;
    },

    createToast(
      message: any,
      type?: ToastTypes,
      data?: ExternalToast,
    ): ToastShape {
      const id = this.getId(data?.id);
      return {
        id,
        title: message,
        type,
        dismissible: true,
        duration: this.config.duration,
        ...data,
      };
    },

    add(message: any, data?: ExternalToast): number {
      // const toast = this.createToast(message, data?.type, data);
      // this.toasts.set(toast.id, toast);
      // this.startTimer(toast.id, toast.duration ?? this.config.duration!);
      // this.notify(toast);
      // return toast.id;
      return 0;
    },

    success(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "success" });
    },

    error(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "error" });
    },

    info(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "info" });
    },

    warning(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "warning" });
    },

    loading(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "loading" });
    },

    message(message: any, data?: ExternalToast): number | string {
      return this.add(message, { ...data, type: "normal" });
    },

    dismiss(id?: number | string) {
      if (id) {
        this.toasts.delete(id);
        this.stopTimer(id);
        this.notify({ id, dismiss: true });
      } else {
        this.toasts.forEach((_, key) => {
          this.dismiss(key);
        });
      }
      return id;
    },

    update(id: number | string, data: Partial<ToastShape>) {
      const existing = this.toasts.get(id);
      if (existing) {
        const updated = { ...existing, ...data };
        this.toasts.set(id, updated);
        this.notify(updated);
      }
    },

    getToasts(): ToastShape[] {
      return Array.from(this.toasts.values());
    },

    getToastsByPosition(position: Position): ToastShape[] {
      return this.getToasts().filter(
        (t) =>
          t.position === position ||
          (!t.position && this.config.position === position),
      );
    },

    getToastsByToasterId(toasterId: string): ToastShape[] {
      return this.getToasts().filter((t) => t.toasterId === toasterId);
    },

    getPositions(): Position[] {
      const positions = new Set<Position>();
      positions.add(this.config.position!);
      this.getToasts().forEach((t) => {
        if (t.position) positions.add(t.position);
      });
      return Array.from(positions);
    },

    setHeight(toastId: number | string, height: number, position: Position) {
      this.heights.set(toastId, { toastId, height, position });
    },

    removeHeight(toastId: number | string) {
      this.heights.delete(toastId);
    },

    getHeights(): HeightT[] {
      return Array.from(this.heights.values());
    },

    getHeightsByPosition(position: Position): HeightT[] {
      return this.getHeights().filter((h) => h.position === position);
    },

    calculateOffset(toastId: number | string, position: Position): number {
      const heights = this.getHeightsByPosition(position).sort(
        (a, b) => a.height - b.height,
      );

      let offset = 0;
      for (const h of heights) {
        if (h.toastId === toastId) break;
        offset += h.height + this.config.gap!;
      }
      return offset;
    },

    startTimer(id: number, duration: number) {
      this.stopTimer(id);
      if (duration === Infinity) return;

      const timer: ToastTimer = {
        id,
        startTime: Date.now(),
        remaining: duration,
        timeoutId: setTimeout(() => {
          const toast = this.toasts.get(id);
          if (toast) {
            toast.onAutoClose?.(toast);
            this.remove(id);
          }
        }, duration),
      };
      this.timers.set(id, timer);
    },

    pauseTimer(id: number | string) {
      const timer = this.timers.get(id);
      if (timer) {
        const elapsed = Date.now() - timer.startTime;
        timer.remaining -= elapsed;
        clearTimeout(timer.timeoutId);
      }
    },

    resumeTimer(id: number | string) {
      const timer = this.timers.get(id);
      if (timer && timer.remaining > 0) {
        this.startTimer(id, timer.remaining);
      }
    },

    stopTimer(id: number | string) {
      const timer = this.timers.get(id);
      if (timer) {
        clearTimeout(timer.timeoutId);
        this.timers.delete(id);
      }
    },

    remove(id: number | string) {
      const toast = this.toasts.get(id);
      if (toast) {
        toast.onDismiss?.(toast);
        toast.delete = true;
        this.notify(toast);
      }

      setTimeout(() => {
        this.toasts.delete(id);
        this.heights.delete(id);
        this.timers.delete(id);
        this.notify({ id, dismiss: true });
      }, TIME_BEFORE_UNMOUNT);
    },

    setExpanded(value: boolean) {
      this.expanded = value;
    },

    getExpanded(): boolean {
      return this.expanded;
    },

    setInteracting(value: boolean) {
      this.interacting = value;
    },

    getInteracting(): boolean {
      return this.interacting;
    },

    setDocumentHidden(hidden: boolean) {
      this.documentHidden = hidden;
    },

    getDocumentHidden(): boolean {
      return this.documentHidden;
    },

    // updateConfig(config: Partial<ToasterConfig>) {
    //   this.config = { ...this.config, ...config };
    // },

    // getConfig(): ToasterConfig {
    //   return { ...this.config };
    // },

    getTheme(): "light" | "dark" {
      if (this.config.theme === "system") {
        if (typeof window !== "undefined") {
          return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return "light";
      }
      return this.config.theme!;
    },

    shouldPauseTimer(): boolean {
      return this.expanded || this.interacting || this.documentHidden;
    },

    isVisible(index: number): boolean {
      return index + 1 <= (this.config.visibleToasts ?? VISIBLE_TOASTS_AMOUNT);
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
      return this.getSwipeDirections(this.config.position!);
    },

    getLoadingIcon() {
      return this.config.icons?.loading;
    },

    getIcon(type?: ToastTypes) {
      if (type === "loading") {
        return this.config.icons?.loading;
      }
      return this.config.icons?.[type ?? "default"];
    },

    getCloseIcon() {
      return this.config.icons?.close;
    },

    clear() {
      this.toasts.clear();
      this.heights.clear();
      this.timers.forEach((t) => clearTimeout(t.timeoutId));
      this.timers.clear();
    },
  };
}
