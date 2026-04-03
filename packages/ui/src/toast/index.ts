/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@timeless/base";

import { PresenceCore } from "@/presence/index";
import { SonnerCore, ExternalToast } from "@/sonner/index";

enum Events {
  BeforeShow,
  Show,
  BeforeHidden,
  Hidden,
  OpenChange,
  AnimationStart,
  AnimationEnd,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHidden]: void;
  [Events.Hidden]: void;
  [Events.OpenChange]: boolean;
  [Events.AnimationStart]: void;
  [Events.AnimationEnd]: void;
  [Events.StateChange]: ToastState;
};
type ToastProps = {
  delay: number;
};

type ToastState = {
  mask: boolean;
  icon?: unknown;
  texts: string[];
  enter: boolean;
  visible: boolean;
  exit: boolean;
};

export class ToastCore extends BaseDomain<TheTypesOfEvents> {
  name = "ToastCore";

  presence = new PresenceCore();
  sonner = SonnerCore.getInstance();
  delay = 1200;
  timer: NodeJS.Timeout | null = null;
  open = false;
  _mask = false;
  _icon: unknown = null;
  _texts: string[] = [];

  get state(): ToastState {
    return {
      mask: this._mask,
      icon: this._icon,
      texts: this._texts,
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
    };
  }

  constructor(options: Partial<{ _name: string } & ToastProps> = {}) {
    super(options);

    const { delay } = options;
    if (delay) {
      this.delay = delay;
    }
    this.presence.onShow(() => {
      this.open = true;
      this.emit(Events.OpenChange, true);
    });
    this.presence.onHidden(() => {
      this.open = false;
      this.emit(Events.OpenChange, false);
    });
    this.presence.onStateChange(() =>
      this.emit(Events.StateChange, { ...this.state }),
    );
  }

  /** 显示弹窗 */
  async show(params: { mask?: boolean; icon?: unknown; texts: string[] }) {
    const { mask = false, icon, texts } = params;
    this._mask = mask;
    this._icon = icon;
    this._texts = texts;
    this.emit(Events.StateChange, { ...this.state });

    if (this.timer !== null) {
      this.clearTimer();
      if (this._icon === "loading") {
        return;
      }
      this.timer = setTimeout(() => {
        this.hide();
      }, this.delay);
      return;
    }
    this.presence.show();
    if (this._icon === "loading") {
      return;
    }
    this.timer = setTimeout(() => {
      this.hide();
    }, this.delay);
  }
  clearTimer() {
    if (this.timer === null) {
      return;
    }
    clearTimeout(this.timer);
    this.timer = null;
  }
  /** 隐藏弹窗 */
  hide() {
    this.presence.hide();
    this.clearTimer();
  }

  toast(message: unknown, data?: ExternalToast) {
    return this.sonner.toast(message, data);
  }

  success(message: unknown, data?: ExternalToast) {
    return this.sonner.success(message, data);
  }

  error(message: unknown, data?: ExternalToast) {
    return this.sonner.error(message, data);
  }

  info(message: unknown, data?: ExternalToast) {
    return this.sonner.info(message, data);
  }

  warning(message: unknown, data?: ExternalToast) {
    return this.sonner.warning(message, data);
  }

  loading(message: unknown, data?: ExternalToast) {
    return this.sonner.loading(message, data);
  }

  dismiss(id?: number | string) {
    return this.sonner.dismiss(id);
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onOpenChange(handler: Handler<TheTypesOfEvents[Events.OpenChange]>) {
    return this.on(Events.OpenChange, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "ToastCore";
  }
}

export type {
  ToastT,
  ExternalToast,
  ToastTypes,
  ToastToDismiss,
} from "@/sonner";
