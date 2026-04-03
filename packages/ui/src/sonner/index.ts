/**
 * @file SonnerCore - Toast 通知系统核心类
 * 基于 sonner 的设计，抽象 toast 管理逻辑
 */
import { BaseDomain, Handler } from "@timeless/base";

export type ToastTypes =
  | "normal"
  | "action"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading"
  | "default";

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export interface ToastT {
  id: number | string;
  toasterId?: string;
  title?: (() => unknown) | unknown;
  type?: ToastTypes;
  icon?: unknown;
  jsx?: unknown;
  richColors?: boolean;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: (() => unknown) | unknown;
  duration?: number;
  delete?: boolean;
  action?: Action;
  cancel?: Action;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  promise?: PromiseT;
  cancelButtonStyle?: Record<string, unknown>;
  actionButtonStyle?: Record<string, unknown>;
  style?: Record<string, unknown>;
  unstyled?: boolean;
  className?: string;
  descriptionClassName?: string;
  position?: Position;
  testId?: string;
}

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
  ToastT,
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

enum Events {
  ToastAdd,
  ToastDismiss,
  Subscribe,
}

type TheTypesOfEvents = {
  [Events.ToastAdd]: ToastT;
  [Events.ToastDismiss]: ToastToDismiss;
  [Events.Subscribe]: ToastT | ToastToDismiss;
};

class ToastObserver {
  subscribers: Array<(toast: ToastT | ToastToDismiss) => void> = [];
  toasts: Array<ToastT | ToastToDismiss> = [];
  dismissedToasts: Set<string | number>;

  constructor() {
    this.dismissedToasts = new Set();
  }

  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber);
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  };

  publish = (data: ToastT) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  };

  create = (
    data: ExternalToast & {
      message?: unknown;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: unknown;
    },
  ) => {
    const { message, ...rest } = data;
    const id =
      typeof data?.id === "number" || data.id?.length > 0
        ? data.id
        : this.getNextId();
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id;
    });
    const dismissible =
      data.dismissible === undefined ? true : data.dismissible;

    if (this.dismissedToasts.has(id as number | string)) {
      this.dismissedToasts.delete(id as number | string);
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message } as ToastT);
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
      this.addToast({ title: message, ...rest, dismissible, id } as ToastT);
    }

    return id;
  };

  private _counter = 1;
  getNextId(): number {
    return this._counter++;
  }

  dismiss = (id?: number | string) => {
    if (id) {
      this.dismissedToasts.add(id);
      requestAnimationFrame(() => {
        this.subscribers.forEach((subscriber) =>
          subscriber({ id, dismiss: true } as ToastToDismiss),
        );
      });
    } else {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach((subscriber) =>
          subscriber({ id: toast.id, dismiss: true } as ToastToDismiss),
        );
      });
    }
    return id;
  };

  message = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, message });
  };

  error = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, message, type: "error" });
  };

  success = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, type: "success", message });
  };

  info = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, type: "info", message });
  };

  warning = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, type: "warning", message });
  };

  loading = (message: unknown, data?: ExternalToast) => {
    return this.create({ ...data, type: "loading", message });
  };

  promise = <ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>,
  ) => {
    if (!data) {
      return;
    }

    let id: string | number | undefined = undefined;
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: "loading",
        message: data.loading,
      });
    }

    const p = Promise.resolve(
      promise instanceof Function ? promise() : promise,
    );

    let shouldDismiss = id !== undefined;
    let result: ["resolve", ToastData] | ["reject", unknown];

    p.then(async (response) => {
      result = ["resolve", response];
      if (data.success !== undefined) {
        shouldDismiss = false;
        this.create({ id, type: "success", message: data.success });
      }
    })
      .catch(async (error) => {
        result = ["reject", error];
        if (data.error !== undefined) {
          shouldDismiss = false;
          this.create({ id, type: "error", message: data.error });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = undefined;
        }
        data.finally?.();
      });

    return id;
  };

  custom = (jsx: (id: number | string) => unknown, data?: ExternalToast) => {
    const id = data?.id || this.getNextId();
    this.create({ jsx: jsx(id), ...data, id });
    return id;
  };

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
  };

  getHistory = () => {
    return this.toasts;
  };
}

export const ToastState = new ToastObserver();

export class SonnerCore extends BaseDomain<TheTypesOfEvents> {
  name = "SonnerCore";

  private static _instance: SonnerCore | null = null;
  static getInstance(): SonnerCore {
    if (!SonnerCore._instance) {
      SonnerCore._instance = new SonnerCore();
    }
    return SonnerCore._instance;
  }

  toast = (message: unknown, data?: ExternalToast) => {
    const id = data?.id || ToastState.getNextId();
    ToastState.addToast({
      title: message,
      ...data,
      id,
    } as ToastT);
    return id;
  };

  constructor() {
    super();
    ToastState.subscribe((toast) => {
      this.emit(Events.Subscribe, toast);
    });
  }

  success = (message: unknown, data?: ExternalToast) => {
    return ToastState.success(message, data);
  };

  error = (message: unknown, data?: ExternalToast) => {
    return ToastState.error(message, data);
  };

  info = (message: unknown, data?: ExternalToast) => {
    return ToastState.info(message, data);
  };

  warning = (message: unknown, data?: ExternalToast) => {
    return ToastState.warning(message, data);
  };

  loading = (message: unknown, data?: ExternalToast) => {
    return ToastState.loading(message, data);
  };

  message = (message: unknown, data?: ExternalToast) => {
    return ToastState.message(message, data);
  };

  dismiss = (id?: number | string) => {
    return ToastState.dismiss(id);
  };

  promise = <ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>,
  ) => {
    return ToastState.promise(promise, data);
  };

  custom = (jsx: (id: number | string) => unknown, data?: ExternalToast) => {
    return ToastState.custom(jsx, data);
  };

  getActiveToasts = () => {
    return ToastState.getActiveToasts();
  };

  getHistory = () => {
    return ToastState.getHistory();
  };

  onToastAdd(handler: Handler<ToastT>) {
    return this.on(Events.ToastAdd as any, handler);
  }

  onToastDismiss(handler: Handler<ToastToDismiss>) {
    return this.on(Events.ToastDismiss as any, handler);
  }

  onSubscribe(handler: Handler<ToastT | ToastToDismiss>) {
    return this.on(Events.Subscribe, handler);
  }

  get [Symbol.toStringTag]() {
    return "SonnerCore";
  }
}
