/**
 * @file 菜单项
 */
import { BaseDomain, Handler } from "@timeless/inner-base";

import type { MenuCore } from "./index";

enum Events {
  Enter,
  Leave,
  Focus,
  Blur,
  Click,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Enter]: void;
  [Events.Leave]: void;
  [Events.Focus]: void;
  [Events.Blur]: void;
  [Events.Click]: void;
  [Events.StateChange]: MenuItemCoreState;
};

type MenuItemCoreProps = {
  /** 菜单文案 */
  label: string;
  /** hover 时的提示 */
  tooltip?: string;
  /** 菜单图标 */
  icon?: unknown;
  /** 菜单快捷键/或者说额外内容? */
  shortcut?: string;
  /** 菜单是否禁用 */
  disabled?: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
  /** 子菜单 */
  menu?: MenuCore;
  /** 点击后的回调 */
  onClick?: () => void;
};
type MenuItemCoreState = MenuItemCoreProps & {
  /** 有子菜单并且子菜单展示了 */
  open: boolean;
  /** 是否聚焦 */
  focused: boolean;
};

export class MenuItemCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuItemCore";
  debug = true;

  readonly type: "item" | "checkbox" | "radio" | "radio-group" = "item";

  label: string;
  tooltip?: string;
  icon?: unknown;
  shortcut?: string;
  /** 子菜单 */
  menu: MenuCore | null = null;

  /** 子菜单是否展示 */
  _open = false;
  _hidden = false;
  _enter = false;
  _focused = false;
  _disabled = false;

  get state(): MenuItemCoreState {
    return {
      label: this.label,
      icon: this.icon,
      shortcut: this.shortcut,
      open: this._open,
      disabled: this._disabled,
      focused: this._focused || this._open,
    };
  }
  get hidden() {
    return this._hidden;
  }

  move() {
    this._enter = true;
    this._focused = true;
    this.emit(Events.Enter);
    this.emit(Events.Focus);
    this.emit(Events.StateChange, { ...this.state });
  }
  leave() {
    this._enter = false;
    this._focused = false;
    this.emit(Events.Leave);
    this.emit(Events.Blur);
    this.emit(Events.StateChange, { ...this.state });
  }
  click() {
    if (this._disabled) {
      return;
    }
    this.emit(Events.Click);
  }
  focus() {
    if (this._focused) {
      return;
    }
    this._focused = true;
    this.emit(Events.Focus);
    this.emit(Events.StateChange, { ...this.state });
  }

  constructor(options: Partial<{ _name: string }> & MenuItemCoreProps) {
    super(options);

    const {
      _name,
      tooltip,
      label,
      icon,
      shortcut,
      disabled = false,
      hidden = false,
      menu,
      onClick,
    } = options;

    this.label = label;
    this.tooltip = tooltip;
    this.icon = icon;
    this.shortcut = shortcut;
    this._hidden = hidden;
    this._disabled = disabled;
    if (_name) {
      this._name = _name;
    }

    if (menu) {
      menu.popper.setConfig({
        placement: "right-start",
      });
      this.menu = menu;
      // console.log("[DOMAIN]ui/menu/item - bind menu", this.label, menu._name);
      menu.onShow(() => {
        // console.log(
        //   "[DOMAIN]ui/menu/item - menu.onShow",
        //   this.label,
        //   menu._name,
        // );
        this._open = true;
        this.emit(Events.StateChange, { ...this.state });
      });
      menu.onStartHide(() => {
        // console.log(
        //   "[DOMAIN]ui/menu/item - menu.onHiding",
        //   this.label,
        //   menu._name,
        // );
        this._open = false;
        this.emit(Events.StateChange, { ...this.state });
      });
      menu.onHidden(() => {
        console.log(
          "[DOMAIN]ui/menu/item - menu.onHide",
          this.label,
          menu._name,
        );
        this._open = false;
        this.emit(Events.StateChange, { ...this.state });
      });
      // menu.onEnter(() => {
      //   console.log("[DOMAIN]ui/menu/item - handle Menu enter");
      // });
      // this.onBlur(() => {
      //   menu.hide();
      // });
    }
    if (onClick) {
      this.onClick(onClick.bind(this));
    }
  }
  setIcon(icon: unknown) {
    this.icon = icon;
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 禁用指定菜单项 */
  disable() {
    this._disabled = true;
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 启用指定菜单项 */
  enable() {
    this._disabled = false;
    this.emit(Events.StateChange, { ...this.state });
  }
  blur() {
    this._focused = false;
    this.emit(Events.Blur);
    this.emit(Events.StateChange, { ...this.state });
  }
  reset() {
    // console.log("[DOMAIN]ui/menu/item - reset", this.label, this.state.focused);
    // this._disabled = false;
    this._focused = false;
    this._open = false;
    this._enter = false;
    if (this.menu) {
      this.menu.reset();
    }
  }
  hide() {
    this._hidden = true;
  }
  show() {
    this._hidden = false;
  }
  unmount() {
    super.destroy();
    if (this.menu) {
      this.menu.unmount();
    }
    this.reset();
  }

  /** 鼠标进入菜单项 */
  handlePointerEnter() {
    console.log(
      "[DOMAIN]ui/menu/item - handlePointerEnter",
      this.label,
      this._enter,
      this._open,
    );
    if (this._enter) {
      return;
    }
    // this.log("enter");
    this._enter = true;
    this._focused = true;
    this.emit(Events.Enter);
    this.emit(Events.StateChange, { ...this.state });
  }
  handlePointerMove() {
    // console.log("[DOMAIN]ui/menu/item - handle pointer move", this.label);
    // if (this.state.disabled) {
    //   this.handlePointerLeave();
    //   return;
    // }
    // this.handlePointerEnter();
  }
  /** 鼠标离开菜单项 */
  handlePointerLeave() {
    console.log(
      "[DOMAIN]ui/menu/item - handlePointerLeave",
      this.label,
      this._enter,
      this._open,
    );
    if (this._enter === false) {
      return;
    }
    this._enter = false;
    this._focused = false;
    this.emit(Events.Leave);
    this.emit(Events.StateChange, { ...this.state });
  }
  handleFocus() {
    console.log(
      "[DOMAIN]ui/menu/item - handleFocus",
      this.label,
      this._focused,
    );
    if (this._focused) {
      return;
    }
    // this.log("focus");
    this._focused = true;
    this.emit(Events.Focus);
    this.emit(Events.StateChange, { ...this.state });
  }
  handleBlur() {
    console.log("[DOMAIN]ui/menu/item - handleBlur", this.label, this._focused);
    if (this._focused === false) {
      return;
    }
    this._focused = false;
    this._enter = false;
    this.blur();
  }
  handleClick() {
    if (this._disabled) {
      return;
    }
    this.emit(Events.Click);
  }

  onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents[Events.Leave]>) {
    return this.on(Events.Leave, handler);
  }
  onFocus(handler: Handler<TheTypesOfEvents[Events.Focus]>) {
    return this.on(Events.Focus, handler);
  }
  onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>) {
    return this.on(Events.Blur, handler);
  }
  onClick(handler: Handler<TheTypesOfEvents[Events.Click]>) {
    return this.on(Events.Click, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "MenuItem";
  }
}

export type MenuItemCheckedState = boolean | "indeterminate";

type MenuCheckboxMenuProps = MenuItemCoreProps & {
  checked?: MenuItemCheckedState;
  defaultChecked?: MenuItemCheckedState;
  onCheckedChange?: (checked: MenuItemCheckedState) => void;
};

export class MenuCheckboxMenu extends MenuItemCore {
  readonly type = "checkbox" as const;

  _checked: MenuItemCheckedState = false;
  onCheckedChange?: (checked: MenuItemCheckedState) => void;

  get checked() {
    return this._checked;
  }

  override get state() {
    return {
      ...super.state,
      checked: this._checked,
    };
  }

  constructor(options: Partial<{ _name: string }> & MenuCheckboxMenuProps) {
    super(options);
    const { checked, defaultChecked = false, onCheckedChange } = options;
    this.onCheckedChange = onCheckedChange;
    this._checked = checked ?? defaultChecked;
  }

  setChecked(checked: MenuItemCheckedState) {
    if (this._checked === checked) {
      return;
    }
    this._checked = checked;
    if (this.onCheckedChange) {
      this.onCheckedChange(checked);
    }
    this.emit(Events.StateChange, { ...(this.state as any) });
  }

  toggle() {
    if (this._checked === "indeterminate") {
      this.setChecked(true);
      return;
    }
    this.setChecked(!this._checked);
  }

  override handleClick() {
    if (this._disabled) {
      return;
    }
    this.toggle();
    this.emit(Events.Click);
  }

  get [Symbol.toStringTag]() {
    return "MenuCheckboxMenu";
  }
}

type MenuRadioItemProps = MenuItemCoreProps & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export class MenuRadioItem extends MenuItemCore {
  readonly type = "radio" as const;

  _checked = false;
  onCheckedChange?: (checked: boolean) => void;

  get checked() {
    return this._checked;
  }

  override get state() {
    return {
      ...super.state,
      checked: this._checked,
    };
  }

  constructor(options: Partial<{ _name: string }> & MenuRadioItemProps) {
    super(options);
    const { checked, defaultChecked = false, onCheckedChange } = options;
    this.onCheckedChange = onCheckedChange;
    this._checked = checked ?? defaultChecked;
  }

  setChecked(checked: boolean) {
    if (this._checked === checked) {
      return;
    }
    this._checked = checked;
    if (this.onCheckedChange) {
      this.onCheckedChange(checked);
    }
    this.emit(Events.StateChange, { ...(this.state as any) });
  }

  override handleClick() {
    if (this._disabled) {
      return;
    }
    this.setChecked(true);
    this.emit(Events.Click);
  }

  get [Symbol.toStringTag]() {
    return "MenuRadioItem";
  }
}

type MenuRadioGroupItemProps = MenuItemCoreProps & {
  group: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export class MenuRadioGroupItem extends MenuItemCore {
  private static groups = new Map<string, Set<MenuRadioGroupItem>>();

  readonly type = "radio-group" as const;

  group: string;
  _checked = false;
  onCheckedChange?: (checked: boolean) => void;

  get checked() {
    return this._checked;
  }

  override get state() {
    return {
      ...super.state,
      checked: this._checked,
    };
  }

  constructor(options: Partial<{ _name: string }> & MenuRadioGroupItemProps) {
    super(options);
    const { group, checked, defaultChecked = false, onCheckedChange } = options;
    this.group = group;
    this.onCheckedChange = onCheckedChange;
    this._checked = checked ?? defaultChecked;
    this._register();
    if (this._checked) {
      this._enforceGroupSelection();
    }
  }

  private _register() {
    let set = MenuRadioGroupItem.groups.get(this.group);
    if (!set) {
      set = new Set<MenuRadioGroupItem>();
      MenuRadioGroupItem.groups.set(this.group, set);
    }
    set.add(this);
  }

  private _unregister() {
    const set = MenuRadioGroupItem.groups.get(this.group);
    if (!set) {
      return;
    }
    set.delete(this);
    if (set.size === 0) {
      MenuRadioGroupItem.groups.delete(this.group);
    }
  }

  private _setCheckedInternal(checked: boolean) {
    if (this._checked === checked) {
      return;
    }
    this._checked = checked;
    if (this.onCheckedChange) {
      this.onCheckedChange(checked);
    }
    this.emit(Events.StateChange, { ...(this.state as any) });
  }

  private _enforceGroupSelection() {
    const set = MenuRadioGroupItem.groups.get(this.group);
    if (!set) {
      return;
    }
    for (const item of set) {
      if (item !== this && item._checked) {
        item._setCheckedInternal(false);
      }
    }
  }

  setChecked(checked: boolean) {
    if (checked) {
      this._setCheckedInternal(true);
      this._enforceGroupSelection();
      return;
    }
    this._setCheckedInternal(false);
  }

  override handleClick() {
    if (this._disabled) {
      return;
    }
    this.setChecked(true);
    this.emit(Events.Click);
  }

  override unmount() {
    this._unregister();
    super.unmount();
  }

  get [Symbol.toStringTag]() {
    return "MenuRadioGroupItem";
  }
}
