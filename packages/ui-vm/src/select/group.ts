import { BaseDomain, Handler } from "@timeless/base";

import { SelectItemCore } from "./item";

enum Events {
  Change,
}
type TheTypesOfEvents<T> = {
  [Events.Change]: SelectGroupCoreState<T>;
};

type SelectGroupCoreProps<T> = {
  label?: unknown;
  options: SelectItemCore<T>[];
};

type SelectGroupCoreState<T> = {
  label?: unknown;
  options: SelectItemCore<T>[];
};

export class SelectGroupCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  _name = "SelectGroupCore";
  debug = false;

  readonly type = "group" as const;

  label?: unknown;
  options: SelectItemCore<T>[];

  get state(): SelectGroupCoreState<T> {
    return {
      label: this.label,
      options: this.options,
    };
  }

  constructor(options: Partial<{ _name: string }> & SelectGroupCoreProps<T>) {
    super(options);

    const { _name, label, options: items = [] } = options;

    this.label = label;
    this.options = items;

    if (_name) {
      this._name = _name;
    }
  }

  setItems(items: SelectItemCore<T>[]) {
    this.options = items;
    this.emit(Events.Change, { ...this.state });
  }

  reset() {
    for (let i = 0; i < this.options.length; i += 1) {
      const item = this.options[i] as any;
      if (item && typeof item.reset === "function") {
        item.reset();
      }
    }
  }

  unmount() {
    super.destroy();
    for (let i = 0; i < this.options.length; i += 1) {
      const item = this.options[i] as any;
      if (item && typeof item.unmount === "function") {
        item.unmount();
      }
    }
  }

  onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  get [Symbol.toStringTag]() {
    return "SelectGroup";
  }
}
