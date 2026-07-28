/**
 * @file 确认气泡
 */
import { BaseDomain, Handler } from "@timeless/inner-base";

import { PresenceCore } from "@/presence/index";
import { PopperCore, Align, Side } from "@/popper/index";
import { DismissableLayerCore } from "@/dismissable-layer/index";

enum Events {
  Show,
  Hidden,
  Confirm,
  Cancel,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.Confirm]: void;
  [Events.Cancel]: void;
  [Events.StateChange]: PopconfirmState;
};
type PopconfirmState = {
  isPlaced: boolean;
  x: number;
  y: number;
  visible: boolean;
  enter: boolean;
  exit: boolean;
  loading: boolean;
};
type PopconfirmProps = {
  side?: Side;
  align?: Align;
  strategy?: "fixed" | "absolute";
};

export class PopconfirmCore extends BaseDomain<TheTypesOfEvents> {
  popper: PopperCore;
  presence: PresenceCore;
  layer: DismissableLayerCore;

  _side: Side;
  _align: Align;

  toBody = true;
  visible = false;
  loading = false;

  get state(): PopconfirmState {
    return {
      isPlaced: this.popper.state.isPlaced,
      x: this.popper.state.x,
      y: this.popper.state.y,
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
      loading: this.loading,
    };
  }

  constructor(props: { _name?: string } & PopconfirmProps = {}) {
    super();

    const { side = "top", align = "center", strategy = "fixed" } = props;
    this._side = side;
    this._align = align;

    this.popper = new PopperCore({
      side,
      align,
      strategy,
    });
    this.presence = new PresenceCore();
    this.layer = new DismissableLayerCore();
    this.layer.onDismiss(() => {
      this.hide();
    });
    this.presence.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    this.popper.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
  }

  ready() {}
  destroy() {}

  toggle() {
    const { visible } = this;
    if (visible) {
      this.hide();
      return;
    }
    this.show();
  }

  show() {
    this.visible = true;
    this.loading = false;
    this.presence.show();
    this.popper.place();
    this.emit(Events.Show);
  }

  hide() {
    if (this.visible === false) {
      return;
    }
    this.visible = false;
    this.loading = false;
    this.presence.hide();
    this.emit(Events.Hidden);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
    this.emit(Events.StateChange, { ...this.state });
  }

  confirm() {
    this.emit(Events.Confirm);
  }

  cancel() {
    this.emit(Events.Cancel);
    this.hide();
  }

  unmount() {
    super.destroy();
    this.layer.destroy();
    this.popper.destroy();
    this.presence.unmount();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onConfirm(handler: Handler<TheTypesOfEvents[Events.Confirm]>) {
    return this.on(Events.Confirm, handler);
  }
  onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>) {
    return this.on(Events.Cancel, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "PopconfirmCore";
  }
}
