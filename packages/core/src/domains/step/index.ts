import { BaseDomain, Handler } from "@/domains/base";

enum Events {
  StateChange,
  Change,
}
type TheTypesOfEvents = {
  [Events.StateChange]: StepState;
  [Events.Change]: number;
};
type StepState = {
  value: number;
};

export class StepCore extends BaseDomain<TheTypesOfEvents> {
  value = 0;

  get state(): StepState {
    return {
      value: this.value,
    };
  }

  constructor(props: Partial<{ _name: string; value: number }> = {}) {
    super(props);
    if (props.value !== undefined) {
      this.value = props.value;
    }
  }

  change(v: number) {
    this.value = v;
    this.emit(Events.StateChange, { ...this.state });
    this.emit(Events.Change, v);
  }

  onChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
