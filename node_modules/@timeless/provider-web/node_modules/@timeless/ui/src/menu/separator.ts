/**
 * @file 菜单分割线
 */
import { BaseDomain } from "@timeless/base";

type TheTypesOfEvents = {};

export class MenuSeparatorCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuSeparatorCore";
  debug = false;

  readonly type = "separator" as const;

  constructor(options: Partial<{ _name: string }> = {}) {
    super(options);
    if (options._name) {
      this._name = options._name;
    }
  }

  get [Symbol.toStringTag]() {
    return "MenuSeparator";
  }
}
