import { BaseDomain, Handler } from "@timeless/base";

import type { SelectEntry } from "./index";

enum Events {
  Change,
}
type TheTypesOfEvents<T> = {
  [Events.Change]: SelectGroupCoreState<T>;
};

type SelectGroupCoreProps<T> = {
  label?: unknown;
  items: SelectEntry<T>[];
};

type SelectGroupCoreState<T> = {
  label?: unknown;
  items: SelectEntry<T>[];
};

export class SelectGroupCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
  _name = "SelectGroupCore";
  debug = false;

  readonly type = "group" as const;

  label?: unknown;
  items: SelectEntry<T>[];

  get state(): SelectGroupCoreState<T> {
    return {
      label: this.label,
      items: this.items,
    };
  }

  constructor(options: Partial<{ _name: string }> & SelectGroupCoreProps<T>) {
    super(options);

    const { _name, label, items = [] } = options;

    this.label = label;
    this.items = items;

    if (_name) {
      this._name = _name;
    }
  }

  setItems(items: SelectEntry<T>[]) {
    this.items = items;
    this.emit(Events.Change, { ...this.state });
  }

  reset() {
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i] as any;
      if (item && typeof item.reset === "function") {
        item.reset();
      }
    }
  }

  unmount() {
    super.destroy();
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i] as any;
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
