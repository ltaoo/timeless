import { BaseDomain, Handler } from "@/base";

enum Events {
  Scroll,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Scroll]: { x: number };
  [Events.StateChange]: HorizontalScrollViewState;
};
type HorizontalScrollViewState = {
  // add properties if needed
};

export class HorizontalScrollViewCore extends BaseDomain<TheTypesOfEvents> {
  get state(): HorizontalScrollViewState {
    return {};
  }

  onScroll(handler: Handler<TheTypesOfEvents[Events.Scroll]>) {
    return this.on(Events.Scroll, handler);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  scrollTo(pos: { x: number }) {
    this.emit(Events.Scroll, pos);
  }
}
