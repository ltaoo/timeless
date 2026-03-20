/**
 * @file 提示框
 */
import { BaseDomain, Handler } from "@timeless/base";
import { PresenceCore } from "@/presence";
import { PopperCore, Align, Side } from "@/popper";

enum Events {
  Show,
  Hidden,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.StateChange]: TooltipState;
};
type TooltipState = {
  isPlaced: boolean;
  x: number;
  y: number;
  visible: boolean;
  enter: boolean;
  exit: boolean;
};
type TooltipProps = {
  side?: Side;
  align?: Align;
  strategy?: "fixed" | "absolute";
};

export class TooltipCore extends BaseDomain<TheTypesOfEvents> {
  popper: PopperCore;
  presence: PresenceCore;

  _side: Side;
  _align: Align;

  visible = false;
  get state(): TooltipState {
    return {
      isPlaced: this.popper.state.isPlaced,
      x: this.popper.state.x,
      y: this.popper.state.y,
      enter: this.presence.state.enter,
      visible: this.presence.state.visible,
      exit: this.presence.state.exit,
    };
  }

  constructor(props: { _name?: string } & TooltipProps = {}) {
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
    this.presence.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    this.popper.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
  }

  ready() {}
  destroy() {}

  show() {
    if (this.visible) return;
    this.visible = true;
    this.presence.show();
    this.popper.place();
    this.emit(Events.Show);
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.presence.hide();
    this.emit(Events.Hidden);
  }

  unmount() {
    super.destroy();
    this.popper.destroy();
    this.presence.unmount();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "TooltipCore";
  }
}
