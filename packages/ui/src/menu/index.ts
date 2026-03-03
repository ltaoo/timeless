/**
 * @file 菜单 组件
 */
import { BaseDomain, Handler } from "@timeless/base";
import { PopperCore, Side, Align } from "@/popper";
import { DismissableLayerCore } from "@/dismissable-layer";
import { PresenceCore } from "@/presence";
import { Direction } from "@/direction";

import { MenuItemCore } from "./item";

enum Events {
  Show,
  Hidden,
  EnterItem,
  LeaveItem,
  EnterMenu,
  LeaveMenu,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.Hidden]: void;
  [Events.EnterItem]: MenuItemCore;
  [Events.LeaveItem]: MenuItemCore;
  [Events.EnterMenu]: void;
  [Events.LeaveMenu]: void;
  [Events.StateChange]: MenuCoreState;
};
type MenuCoreState = {
  /** 是否是展开状态 */
  open: boolean;
  hover: boolean;
  /** 所有选项 */
  items: MenuItemCore[];
};
type MenuCoreProps = {
  side: Side;
  align: Align;
  strategy: "fixed" | "absolute";
  items: MenuItemCore[];
  offsetX?: number;
  offsetY?: number;
};

export class MenuCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuCore";
  debug = false;

  popper: PopperCore;
  presence: PresenceCore;
  layer: DismissableLayerCore;

  open_timer: NodeJS.Timeout | null = null;

  state: MenuCoreState = {
    open: false,
    hover: false,
    items: [],
  };

  constructor(options: Partial<{ _name: string } & MenuCoreProps> = {}) {
    super(options);
    const {
      _name,
      items = [],
      side,
      align,
      strategy = "fixed",
      offsetX = 0,
      offsetY = 0,
    } = options;
    if (_name) {
      this._name = _name;
    }
    this.state.items = items;
    this.items = items;

    console.log("[DOMAIN]ui/menu/index - constructor", {
      name: this._name,
      items: items.map((v) => v.label),
      side,
      align,
      strategy,
    });

    this.popper = new PopperCore({
      side,
      align,
      strategy,
      offsetX,
      offsetY,
      _name: _name ? `${_name}__popper` : "menu__popper",
    });
    this.presence = new PresenceCore();
    this.layer = new DismissableLayerCore();

    this.listen_items(items);

    this.popper.onEnter(() => {
      console.log("[DOMAIN]ui/menu/index - popper.onEnter", this._name);
      this.state.hover = true;
      this.emit(Events.EnterMenu);
    });
    this.popper.onLeave(() => {
      console.log("[DOMAIN]ui/menu/index - popper.onLeave", this._name);
      this.state.hover = false;
      this.emit(Events.LeaveMenu);
    });
    this.layer.onDismiss(() => {
      console.log("[DOMAIN]ui/menu/index - layer.onDismiss", this._name);
      this.hide();
    });
    this.presence.onHidden(() => {
      console.log(
        "[DOMAIN]ui/menu/index - presence.onHidden",
        this._name,
        this.cur_item?.label,
        this.cur_sub?._name,
        this.state.open,
      );
      if (this.state.open) {
        console.log(
          "[DOMAIN]ui/menu/index - presence.onHidden ignored because open",
          this._name,
        );
        return;
      }
      this.reset();
      this.in_sub_menu = false;
      this.maybe_hide_sub = false;
      this.hide_sub_timer = null;
      this.state.open = false;
      this.popper.reset();
      for (let i = 0; i < this.items.length; i += 1) {
        this.items[i].reset();
      }
      if (this.cur_item) {
        this.cur_item.blur();
      }
      if (this.cur_sub) {
        this.cur_sub.hide();
        this.cur_sub = null;
      }
    });
  }

  // subs: MenuCore[] = [];
  items: MenuItemCore[] = [];
  cur_sub: MenuCore | null = null;
  cur_item: MenuItemCore | null = null;
  /** 父菜单引用，用于子菜单清除父菜单的定时器 */
  parent_menu: MenuCore | null = null;
  inside = false;
  /** 鼠标是否处于子菜单中 */
  in_sub_menu = false;
  /** 鼠标离开 item 时，可能要隐藏子菜单，但是如果从有子菜单的 item 离开前往子菜单，就不用隐藏 */
  maybe_hide_sub = false;
  hide_sub_timer: NodeJS.Timeout | null = null;

  toggle() {
    const { open } = this.state;
    console.log("[DOMAIN]ui/menu/index - toggle", this._name, open);
    // this.log("toggle", open);
    if (open) {
      this.hide();
      return;
    }
    this.show();
  }
  show() {
    if (this.state.open) {
      return;
    }
    console.log("[DEBUG-MENU] show()", this._name);
    // console.trace("[DEBUG-MENU] show() call stack");
    this.state.open = true;
    this.presence.show();
    this.popper.place();
    this.emit(Events.Show);
    this.emit(Events.StateChange, { ...this.state });
  }
  hide() {
    if (this.state.open === false) {
      return;
    }
    console.log("[DOMAIN]ui/menu/index - hide", this._name);
    this.state.open = false;
    // this.log("hide");
    this.presence.hide();
    this.emit(Events.Hidden);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 处理选项 */
  listen_item(item: MenuItemCore) {
    //  const item = items[i];
    item.onEnter(() => {
      console.log(
        "[DOMAIN]ui/menu/index - item.onEnter",
        this._name,
        item.label,
        {
          hasMenu: !!item.menu,
          curItem: this.cur_item?.label,
        },
      );
      if (this.hide_sub_timer !== null) {
        clearTimeout(this.hide_sub_timer);
        this.hide_sub_timer = null;
      }
      if (item.menu && item.menu.hide_sub_timer !== null) {
        clearTimeout(item.menu.hide_sub_timer);
        item.menu.hide_sub_timer = null;
      }
      // 如果当前菜单有父菜单，清除父菜单的定时器
      if (this.parent_menu && this.parent_menu.hide_sub_timer !== null) {
        clearTimeout(this.parent_menu.hide_sub_timer);
        this.parent_menu.hide_sub_timer = null;
      }
      this.emit(Events.EnterItem, item);
      if (item.menu) {
        item.menu.show();
      }
      if (this.cur_item && this.cur_item !== item) {
        this.cur_item.blur();
        // 立即关闭之前菜单项的子菜单，保持快速响应
        if (this.cur_item.menu) {
          this.cur_item.menu.hide();
        }
      }
      this.cur_item = item;
    });
    item.onLeave(() => {
      console.log("[DOMAIN]ui/menu/index - item.onLeave", this._name, {
        label: item.label,
        open: item._open,
        focused: item._focused,
        hasMenu: !!item.menu,
        itemState: item.menu?.state,
      });
      this.emit(Events.LeaveItem, item);
      item.blur();
    });
    if (!item.menu) {
      return;
    }
    const sub_menu = item.menu;
    // 设置子菜单的父菜单引用
    sub_menu.parent_menu = this;
    // sub_menu.onShow(() => {
    //   this.log("sub.onShow");
    //   this.cur_sub = sub_menu;
    // });
    // sub_menu.onEnter(() => {
    //   this.log("sub.onEnter");
    //   this.in_sub_menu = true;
    // });
    // sub_menu.onLeave(() => {
    //   this.log("sub.onLeave");
    //   this.in_sub_menu = false;
    // });
    // sub_menu.onHide(() => {
    //   this.log("sub.onHide");
    //   this.cur_sub = null;
    // });
    // if (this.subs.includes(subMenu)) {
    //   return;
    // }
    // this.subs.push(subMenu);
  }
  listen_items(items: MenuItemCore[]) {
    console.log(
      "[DOMAIN]ui/menu/index - listen_items",
      this._name,
      items.map((v) => v.label),
    );
    for (let i = 0; i < items.length; i += 1) {
      this.listen_item(items[i]);
    }
  }
  setItems(items: MenuItemCore[]) {
    console.log("[DOMAIN]ui/menu - set items", items);
    this.state.items = items;
    this.items = items;
    this.listen_items(items);
    this.emit(Events.StateChange, {
      ...this.state,
    });
  }
  setOffset(offset: { x: number; y: number }) {
    // this.offsetX = offset.x;
    // this.offsetY = offset.y;
    this.popper.setOffset(offset);
  }
  checkNeedHideSubMenu(item: MenuItemCore) {
    // console.log("[DOMAIN]ui/menu/index - checkNeedHideSubMenu", item.label, this.maybeHideSub, this.curSub);
    // if (this.hideSubTimer) {
    //   clearTimeout(this.hideSubTimer);
    // }
    // this.hideSubTimer = null;
    // if (this.maybeHideSub === false) {
    //   return;
    // }
    // this.log("leaveMenu check need hide subMenu", this.curSub, this.inSubMenu);
    // this.emit(Events.LeaveMenu);
    // 直接从有 SubMenu 的 MenuItem 离开，不到其他 MenuItem 场景下，也要关闭 SubMenu
    // if (this.curSub && !this.inSubMenu) {
    //   this.curSub.hide();
    // }
  }
  reset() {
    // console.log("[]MenuCore - reset", this.items);
    this.in_sub_menu = false;
    // this.cur_item = null;
    this.cur_sub = null;
    this.maybe_hide_sub = false;
    this.hide_sub_timer = null;
    this.state.open = false;
    this.presence.reset();
    this.popper.reset();
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].reset();
    }
  }

  handleLeave() {
    console.log("[]handleLeave", this.cur_item?.label, this.cur_item?._open);
    // 使用 cur_item 而不是查找 focused 状态的 item
    // 因为 item 的 handlePointerLeave 会先触发，将 _focused 设置为 false
    if (!this.cur_item) {
      return;
    }
    // 如果当前菜单项有子菜单且子菜单是打开的，延迟关闭它
    // 使用较短的延迟时间(100ms)，让用户有时间移动到子菜单，同时保持快速响应
    if (this.cur_item.menu && this.cur_item._open) {
      this.hide_sub_timer = setTimeout(() => {
        this.hide_sub_timer = null;
        if (this.cur_item && this.cur_item.menu) {
          this.cur_item.menu.hide();
        }
      }, 100);
    }
  }

  unmount() {
    // this.log("destroy", this.name);
    super.destroy();
    this.layer.destroy();
    this.popper.destroy();
    this.presence.unmount();
    // for (let i = 0; i < this.subs.length; i += 1) {
    //   this.subs[i].unmount();
    // }
    for (let i = 0; i < this.items.length; i += 1) {
      this.items[i].unmount();
    }
    this.reset();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onEnterItem(handler: Handler<TheTypesOfEvents[Events.EnterItem]>) {
    return this.on(Events.EnterItem, handler);
  }
  onLeaveItem(handler: Handler<TheTypesOfEvents[Events.LeaveItem]>) {
    return this.on(Events.LeaveItem, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents[Events.EnterMenu]>) {
    return this.on(Events.EnterMenu, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents[Events.LeaveMenu]>) {
    return this.on(Events.LeaveMenu, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "Menu";
  }
}

const SELECTION_KEYS = ["Enter", " "];
const FIRST_KEYS = ["ArrowDown", "PageUp", "Home"];
const LAST_KEYS = ["ArrowUp", "PageDown", "End"];
const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS];
const SUB_OPEN_KEYS: Record<Direction, string[]> = {
  ltr: [...SELECTION_KEYS, "ArrowRight"],
  rtl: [...SELECTION_KEYS, "ArrowLeft"],
};
const SUB_CLOSE_KEYS: Record<Direction, string[]> = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"],
};
