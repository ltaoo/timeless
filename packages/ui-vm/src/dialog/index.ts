/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@timeless/base";

import { PresenceCore } from "@/presence/index";
import { ButtonCore } from "@/button/index";

enum Events {
  BeforeShow,
  Show,
  BeforeHidden,
  Hidden,
  Unmounted,
  VisibleChange,
  Cancel,
  OK,
  AnimationStart,
  AnimationEnd,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHidden]: void;
  [Events.Hidden]: void;
  [Events.Unmounted]: void;
  [Events.VisibleChange]: boolean;
  [Events.OK]: void;
  [Events.Cancel]: void;
  [Events.AnimationStart]: void;
  [Events.AnimationEnd]: void;
  [Events.StateChange]: DialogState;
};
export type DialogProps = {
  title?: string;
  footer?: boolean;
  closeable?: boolean;
  mask?: boolean;
  open?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  onUnmounted?: () => void;
};

type DialogState = {
  open: boolean;
  title: string;
  footer: boolean;
  /** 能否手动关闭 */
  closeable: boolean;
  mask: boolean;
  viewported: boolean;
  viewportRect: null | {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  enter: boolean;
  visible: boolean;
  exit: boolean;
};

export type DialogViewportRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type DialogViewport = {
  getRect?: () => DialogViewportRect | null | undefined;
};

export class DialogCore extends BaseDomain<TheTypesOfEvents> {
  open = false;
  title = "";
  footer = true;
  closeable = true;
  mask = true;
  viewport: DialogViewport = {};
  viewportRect: DialogViewportRect | null = null;

  presence = new PresenceCore();
  okBtn = new ButtonCore();
  cancelBtn = new ButtonCore({
    variant: "secondary",
  });

  get state(): DialogState {
    return {
      open: this.open,
      title: this.title,
      footer: this.footer,
      closeable: this.closeable,
      mask: this.mask,
      viewported: !!this.viewport.getRect,
      viewportRect: this.viewportRect,
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
    };
  }

  constructor(props: Partial<{ _name: string }> & DialogProps = {}) {
    super(props);

    const {
      title,
      footer = true,
      open = false,
      mask = true,
      closeable = true,
      onOk,
      onCancel,
      onUnmounted,
    } = props;
    if (title) {
      this.title = title;
    }
    this.footer = footer;
    this.closeable = closeable;
    this.mask = mask;
    this.open = open;
    if (open) {
      this.presence.show();
    }
    if (onOk) {
      this.onOk(onOk);
    }
    if (onCancel) {
      this.onCancel(onCancel);
    }
    if (onUnmounted) {
      this.onUnmounted(onUnmounted);
    }
    this.presence.onShow(async () => {
      this.open = true;
      this.emit(Events.VisibleChange, true);
      this.emit(Events.Show);
      this.emit(Events.StateChange, { ...this.state });
    });
    this.presence.onHidden(async () => {
      this.open = false;
      this.emit(Events.Cancel);
      this.emit(Events.Hidden);
      this.emit(Events.VisibleChange, false);
      this.emit(Events.StateChange, { ...this.state });
    });
    this.presence.onUnmounted(() => {
      this.emit(Events.Unmounted);
    });
    this.presence.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    this.okBtn.onClick(() => {
      this.ok();
    });
    this.cancelBtn.onClick(() => {
      this.hide();
    });
  }
  toggle() {
    if (this.open) {
      this.presence.hide();
      return;
    }
    this.syncViewportRect();
    this.presence.show();
  }
  /** 显示弹窗 */
  show() {
    // console.log("[]ui/dialog - show");
    if (this.open) {
      return;
    }
    this.syncViewportRect();
    this.emit(Events.StateChange, { ...this.state });
    // this.emit(Events.BeforeShow);
    this.presence.show();
  }
  /** 隐藏弹窗 */
  hide(opt: Partial<{ destroy: boolean }> = {}) {
    // if (this.open === false) {
    //   return;
    // }
    // this.emit(Events.Cancel);
    this.presence.hide(opt);
  }
  ok() {
    this.emit(Events.OK);
  }
  cancel() {
    this.emit(Events.Cancel);
  }
  setTitle(title: string) {
    this.title = title;
    this.emit(Events.StateChange, { ...this.state });
  }

  setViewport(opt: DialogViewport = {}) {
    this.viewport.getRect = opt.getRect;
    this.syncViewportRect();
    this.emit(Events.StateChange, { ...this.state });
  }

  private syncViewportRect() {
    const getRect = this.viewport.getRect;
    if (!getRect) {
      this.viewportRect = null;
      return;
    }
    const rect = getRect();
    this.viewportRect = rect
      ? {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }
      : null;
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>) {
    return this.on(Events.Unmounted, handler);
  }
  onVisibleChange(handler: Handler<TheTypesOfEvents[Events.VisibleChange]>) {
    return this.on(Events.VisibleChange, handler);
  }
  onOk(handler: Handler<TheTypesOfEvents[Events.OK]>) {
    return this.on(Events.OK, handler);
  }
  onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>) {
    return this.on(Events.Cancel, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "Dialog";
  }
}
