import { BaseDomain, Handler } from "@timeless/base";

enum Events {
  Mounted,
  Unmounted,
}
type TheTypesOfEvents = {
  [Events.Mounted]: void;
  [Events.Unmounted]: void;
};

export class ElementCore extends BaseDomain<TheTypesOfEvents> {
  mount() {
    this.emit(Events.Mounted);
  }

  unmount() {
    this.emit(Events.Unmounted);
  }

  onMount(handler: Handler<TheTypesOfEvents[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }

  onUnmount(handler: Handler<TheTypesOfEvents[Events.Unmounted]>) {
    return this.on(Events.Unmounted, handler);
  }
}
