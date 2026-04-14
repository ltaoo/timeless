/**
 * @file 菜单组
 */
import { BaseDomain, Handler } from "@timeless/base";

import type { MenuEntry } from "./index";

enum Events {
  Change,
}
type TheTypesOfEvents = {
  [Events.Change]: MenuGroupCoreState;
};

type MenuGroupCoreProps = {
  /** 分组标签 */
  label?: string;
  /** 分组内的菜单项 */
  items: MenuEntry[];
};
type MenuGroupCoreState = {
  label?: string;
  items: MenuEntry[];
};

export class MenuGroupCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuGroupCore";
  debug = false;

  readonly type = "group" as const;

  label?: string;
  items: MenuEntry[];

  get state(): MenuGroupCoreState {
    return {
      label: this.label,
      items: this.items,
    };
  }

  constructor(options: Partial<{ _name: string }> & MenuGroupCoreProps) {
    super(options);

    const { _name, label, items = [] } = options;

    this.label = label;
    this.items = items;

    if (_name) {
      this._name = _name;
    }
  }

  setItems(items: MenuEntry[]) {
    this.items = items;
    this.emit(Events.Change, { ...this.state });
  }

  reset() {
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if ("reset" in item && typeof item.reset === "function") {
        item.reset();
      }
    }
  }

  unmount() {
    super.destroy();
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if ("unmount" in item && typeof item.unmount === "function") {
        item.unmount();
      }
    }
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.Change]>) {
    return this.on(Events.Change, handler);
  }

  get [Symbol.toStringTag]() {
    return "MenuGroup";
  }
}
