/**
 * @file 菜单 组件
 */
import { BaseDomain, Handler } from "@timeless/base";

import { PopperCore, Side, Align } from "@/popper/index";
import { DismissableLayerCore } from "@/dismissable-layer/index";
import { PresenceCore } from "@/presence/index";
import { Direction } from "@/direction/index";
import { Logger } from "@/util";

import { MenuItemCore } from "./item";
import { MenuSeparatorCore } from "./separator";
import { MenuGroupCore } from "./group";

const logger = Logger({ prefix: "vm", scope: "menu" });

enum Events {
  Show,
  PrepareHide,
  StartHide,
  Hidden,
  EnterItem,
  LeaveItem,
  EnterMenu,
  LeaveMenu,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.Show]: void;
  [Events.PrepareHide]: void;
  [Events.StartHide]: void;
  [Events.Hidden]: void;
  [Events.EnterItem]: MenuItemCore;
  [Events.LeaveItem]: MenuItemCore;
  [Events.EnterMenu]: void;
  [Events.LeaveMenu]: void;
  [Events.StateChange]: MenuCoreState;
};
export type MenuEntry = MenuItemCore | MenuSeparatorCore | MenuGroupCore;
type MenuCoreState = {
  /** 是否是展开状态 */
  open: boolean;
  hover: boolean;
  /** 所有选项 */
  items: MenuEntry[];
  /** 自定义内容（替代 items 渲染） */
  content: unknown;
  enter?: boolean;
  exit?: boolean;
};
type MenuCoreProps = {
  side: Side;
  align: Align;
  strategy: "fixed" | "absolute";
  items: MenuEntry[];
  /** 自定义内容，设置后渲染层显示该内容而非迭代 items */
  content?: unknown;
  offsetX?: number;
  offsetY?: number;
  /** 默认是否展示菜单 */
  defaultVisible?: boolean;
};

export class MenuCore extends BaseDomain<TheTypesOfEvents> {
  _name = "MenuCore";
  debug = false;

  popper: PopperCore;
  presence: PresenceCore;
  layer: DismissableLayerCore;

  open_timer: NodeJS.Timeout | null = null;
  hide_timer: NodeJS.Timeout | null = null;
  /** 鼠标离开 item 时，可能要隐藏子菜单，但是如果从有子菜单的 item 离开前往子菜单，就不用隐藏 */
  maybe_hide_sub = false;
  hide_sub_timer: NodeJS.Timeout | null = null;

  content: unknown = null;

  items: MenuEntry[] = [];
  cur_sub: MenuCore | null = null;
  cur_item: MenuItemCore | null = null;
  /** 父菜单引用，用于子菜单清除父菜单的定时器 */
  parent_menu: MenuCore | null = null;
  /** 鼠标是否处于菜单中 */
  inside = false;
  /** 鼠标是否处于子菜单中 */
  in_sub_menu = false;

  state: MenuCoreState = {
    open: false,
    hover: false,
    items: [],
    content: null,
  };

  constructor(options: Partial<{ _name: string } & MenuCoreProps> = {}) {
    super(options);
    const {
      _name,
      items = [],
      content,
      side,
      align,
      strategy = "fixed",
      offsetX = 0,
      offsetY = 0,
      defaultVisible = false,
    } = options;
    if (_name) {
      this._name = _name;
    }
    this.state.items = items;
    this.items = items;
    this.content = content ?? null;
    this.state.content = this.content;

    // console.log("[DOMAIN]ui/menu/index - constructor", {
    //   name: this._name,
    //   items: items.map((v) => v.label),
    //   side,
    //   align,
    //   strategy,
    // });

    this.popper = new PopperCore({
      side,
      align,
      strategy,
      offsetX,
      offsetY,
      _name: _name ? `${_name}__popper` : "menu__popper",
      defaultPlaced: defaultVisible,
    });
    this.presence = new PresenceCore(
      defaultVisible ? { mounted: true, visible: true } : {},
    );
    if (defaultVisible) {
      this.state.open = true;
    }
    this.layer = new DismissableLayerCore();

    this.listen_items(items);

    // this.popper.onEnter(() => {
    //   console.log("[DOMAIN]ui/menu/index - popper.onEnter", this._name);
    //   this.state.hover = true;
    //   // 清除父菜单的定时器，防止从菜单项移动到子菜单时子菜单被关闭
    //   if (this.parent_menu && this.parent_menu.hide_sub_timer !== null) {
    //     clearTimeout(this.parent_menu.hide_sub_timer);
    //     this.parent_menu.hide_sub_timer = null;
    //   }
    //   this.emit(Events.EnterMenu);
    // });
    // this.popper.onLeave(() => {
    //   console.log("[DOMAIN]ui/menu/index - popper.onLeave", this._name);
    //   this.state.hover = false;
    //   this.emit(Events.LeaveMenu);
    // });
    this.layer.onDismiss(() => {
      console.log("[DOMAIN]ui/menu/index - layer.onDismiss", this._name);
      this.hide();
    });
    this.presence.onStateChange(() => {
      // During exit animation, mounted is still true but we should treat the menu as closed
      this.state.open =
        this.presence.state.mounted && !this.presence.state.exit;
      this.state.enter = this.presence.state.enter;
      this.state.exit = this.presence.state.exit;
      this.emit(Events.StateChange, { ...this.state });
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
      this.emit(Events.Hidden);
    });
  }

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
    // console.log("[DEBUG-MENU] show()", this._name);
    // 当子菜单显示时，清除父菜单的定时器
    // 这是必要的，因为 mouseenter 事件可能不会在 DOM 动态挂载时触发
    // if (this.parent_menu && this.parent_menu.hide_sub_timer !== null) {
    //   clearTimeout(this.parent_menu.hide_sub_timer);
    //   this.parent_menu.hide_sub_timer = null;
    // }
    // Close other open root menus when opening this one
    // if (this._is_root_menu) {
    //   for (const menu of MenuCore.openRootMenus) {
    //     if (menu !== this && menu.state.open) {
    //       menu.hide();
    //     }
    //   }
    //   MenuCore.openRootMenus.add(this);
    // }
    this.presence.show();
    this.popper.place();
    this.emit(Events.Show);
    this.emit(Events.StateChange, { ...this.state });
  }
  isPrepareHide() {
    return this.hide_timer !== null;
  }
  prepareHide() {
    logger.log("[]prepare hide the menu", this._name);
    if (this.state.open === false) {
      return;
    }
    this.hide_timer = setTimeout(() => {
      logger.log("[]invoke hide in prepareHide timer", this._name);
      this.hide();
    }, 80);
    this.emit(Events.PrepareHide);
  }
  cancelHide() {
    if (this.hide_timer !== null) {
      clearTimeout(this.hide_timer);
      this.hide_timer = null;
    }
  }
  hide() {
    if (this.state.open === false) {
      return;
    }
    console.log("[DOMAIN]ui/menu/index - hide", this._name, {
      open: this.state.open,
      exit: this.presence.exit,
      enter: this.presence.enter,
    });

    // Emit Hiding event immediately so menu items can update their state
    this.emit(Events.StartHide);

    // Remove from global registry
    // MenuCore.openRootMenus.delete(this);

    // Close all open submenus immediately
    // if (this.cur_item && this.cur_item.menu && this.cur_item.menu.state.open) {
    //   console.log(
    //     "[DOMAIN]ui/menu/index - closing submenu",
    //     this.cur_item.menu._name,
    //   );
    //   this.cur_item.menu.hide();
    // }

    // this.log("hide");
    this.presence.hide();
    console.log(
      "[DOMAIN]ui/menu/index - hide AFTER presence.hide()",
      this._name,
      {
        exit: this.presence.exit,
        enter: this.presence.enter,
      },
    );
    this.state.open = false;
    this.state.enter = this.presence.enter;
    this.state.exit = this.presence.exit;
    // Don't emit Events.Hidden here - it should be emitted by presence.onHidden callback
    this.emit(Events.StateChange, { ...this.state });
    console.log("[DOMAIN]ui/menu/index - hide END", this._name, {
      open: this.state.open,
      exit: this.state.exit,
    });
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
      // if (this.hide_sub_timer !== null) {
      //   clearTimeout(this.hide_sub_timer);
      //   this.hide_sub_timer = null;
      // }
      this.emit(Events.EnterItem, item);
      if (item.menu && item.menu.isPrepareHide()) {
        item.menu.cancelHide();
      }
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
      if (this.cur_item) {
        this.cur_item.blur();
        if (this.cur_item.menu) {
          logger.log(
            "[]leave item, so prepare hide the menu belong this menu item",
          );
          // 从菜单项移动到菜单外部，需要延迟关闭子菜单，因为可能是移动回 菜单项
          // 比如 1 -> 1-1 例子，从 1-1 移动回 1 时，要给时间让 1 移除延迟关闭定时器
          // 从 1-1 移动到外部，延迟定时器就能正确关闭 1-1
          this.cur_item.menu.prepareHide();
        }
      }
      // this.emit(Events.LeaveItem, item);
      // Don't blur if the item has an open submenu
      // if (!item._open) {
      //   item.blur();
      // }
    });
    if (!item.menu) {
      return;
    }
    // 设置子菜单的父菜单引用
    // item.menu.parent_menu = this;
    // sub_menu.onShow(() => {
    //   this.log("sub.onShow");
    //   this.cur_sub = sub_menu;
    // });
    item.menu.onEnter(() => {
      logger.log(
        "[]enter the menu belong items, so prevent hide timer",
        this._name,
      );
      this.in_sub_menu = true;
      this.cancelHide();
    });
    item.menu.onLeave(() => {
      this.in_sub_menu = false;
      //   logger.log("[]leave the menu belong items, so prepare hide", this._name);
      //   this.prepareHide();
    });
    item.menu.onStartHide(() => {
      logger.log(
        "[]the menu belong to items hide, so prepare hide",
        this._name,
      );
      if (this.inside) {
        return;
      }
      this.hide();
    });
    // if (this.subs.includes(subMenu)) {
    //   return;
    // }
    // this.subs.push(subMenu);
  }
  listen_items(items: MenuEntry[]) {
    for (let i = 0; i < items.length; i += 1) {
      if (items[i] instanceof MenuItemCore) {
        this.listen_item(items[i] as MenuItemCore);
      } else if (items[i] instanceof MenuGroupCore) {
        this.listen_items((items[i] as MenuGroupCore).items);
      }
    }
  }
  setItems(items: MenuEntry[]) {
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
    this.state.open = false;
    this.hide_timer = null;
    this.in_sub_menu = false;
    this.cur_item = null;
    this.cur_sub = null;
    this.maybe_hide_sub = false;
    if (this.hide_sub_timer !== null) {
      clearTimeout(this.hide_sub_timer);
      this.hide_sub_timer = null;
    }
    this.presence.reset();
    this.popper.reset();
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item instanceof MenuItemCore) {
        item.reset();
      } else if (item instanceof MenuGroupCore) {
        item.reset();
      }
    }
  }
  refresh() {
    this.emit(Events.StateChange, { ...this.state });
  }

  handleEnter() {
    this.inside = true;
    if (this.hide_timer) {
      clearTimeout(this.hide_timer);
      this.hide_timer = null;
    }
    // 清除父菜单的定时器，防止从菜单项移动到子菜单时子菜单被关闭
    // if (this.parent_menu && this.parent_menu.hide_sub_timer !== null) {
    //   clearTimeout(this.parent_menu.hide_sub_timer);
    //   this.parent_menu.hide_sub_timer = null;
    // }
    this.emit(Events.EnterMenu);
  }
  handleLeave() {
    this.inside = false;
    console.log("[MenuCore] handleLeave", this._name, {
      curItem: this.cur_item?.label,
      curItemOpen: this.cur_item?._open,
      hasMenu: !!this.cur_item?.menu,
    });
    this.prepareHide();
    this.emit(Events.LeaveMenu);
    // this.hide();
    // 使用 cur_item 而不是查找 focused 状态的 item
    // 因为 item 的 handlePointerLeave 会先触发，将 _focused 设置为 false
    // if (!this.cur_item) {
    //   return;
    // }
    // // 如果当前菜单项有子菜单且子菜单是打开的，延迟关闭它
    // // 使用 300ms 延迟，让用户有时间移动到子菜单，同时保持快速响应
    // if (this.cur_item.menu && this.cur_item._open) {
    //   console.log("[MenuCore] setting hide_sub_timer", this._name);
    //   this.hide_sub_timer = setTimeout(() => {
    //     console.log("[MenuCore] hide_sub_timer fired", this._name, {
    //       curItem: this.cur_item?.label,
    //       timerStillSet: this.hide_sub_timer !== null,
    //     });
    //     this.hide_sub_timer = null;
    //     // if (this.cur_item && this.cur_item.menu) {
    //     //   this.cur_item.menu.hide();
    //     // }
    //   }, 300);
    // }
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
      const item = this.items[i];
      if (item instanceof MenuItemCore) {
        item.unmount();
      } else if (item instanceof MenuGroupCore) {
        item.unmount();
      }
    }
    this.reset();
  }

  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onPrepareHide(handler: Handler<TheTypesOfEvents[Events.PrepareHide]>) {
    return this.on(Events.PrepareHide, handler);
  }
  onStartHide(handler: Handler<TheTypesOfEvents[Events.StartHide]>) {
    return this.on(Events.StartHide, handler);
  }
  /**
   * 监听菜单已关闭事件
   */
  onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
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
