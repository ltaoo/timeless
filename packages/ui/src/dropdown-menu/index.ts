import { BaseDomain, Handler } from "@timeless/base";

import { MenuCore, MenuEntry } from "@/menu";
import { MenuItemCore } from "@/menu/item";
import { MenuGroupCore } from "@/menu/group";
import { Side } from "@/popper/types";
import { Align } from "@/popper";

enum Events {
  StateChange,
}
type TheTypesOfEvents = {
  [Events.StateChange]: DropdownMenuState;
};
type DropdownMenuProps = {
  side?: Side;
  align?: Align;
  items?: MenuItemCore[];
  onHidden?: () => void;
  offsetX?: number;
  offsetY?: number;
  submenuOffsetX?: number;
  submenuOffsetY?: number;
  trigger?: "click" | "hover" | "manual";
};
type DropdownMenuState = {
  items: MenuItemCore[];
  open: boolean;
  disabled: boolean;
  enter: boolean;
  visible: boolean;
  exit: boolean;
};
export class DropdownMenuCore extends BaseDomain<TheTypesOfEvents> {
  open = false;
  disabled = false;

  offsetX = 0;
  offsetY = 0;
  submenuOffsetX = 0;
  submenuOffsetY = 0;

  get state(): DropdownMenuState {
    return {
      items: this.items,
      open: this.open,
      disabled: this.disabled,
      enter: this.menu.presence?.state.enter,
      visible: this.menu.presence?.state.visible,
      exit: this.menu.presence?.state.exit,
    };
  }

  menu: MenuCore;
  subs: MenuCore[] = [];
  items: MenuItemCore[] = [];
  trigger: "click" | "hover" | "manual" = "click";

  constructor(props: { _name?: string } & DropdownMenuProps = {}) {
    super(props);

    // console.log("[DropdownMenuCore] constructor", props);

    const {
      _name,
      side,
      align,
      items = [],
      offsetX = 0,
      offsetY = 0,
      submenuOffsetX = -2,
      submenuOffsetY = -4,
      trigger = "click",
      onHidden,
    } = props;
    this.trigger = trigger;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.submenuOffsetX = submenuOffsetX;
    this.submenuOffsetY = submenuOffsetY;
    this.items = items;
    this.menu = new MenuCore({
      side,
      align,
      items,
      _name: _name ? `${_name}__menu` : "menu-in-dropdown",
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    });
    // Store reference to parent dropdown in menu for hover handling
    (this.menu as any).parentDropdown = this;
    this._configure_sub_menus(items);
    this.menu.onHide(() => {
      this.menu.reset();
      if (onHidden) {
        onHidden();
      }
    });
    this.menu.presence.onStateChange(() => {
      this.emit(Events.StateChange, { ...this.state });
    });
    // this.menu.popper.onStateChange(() => {
    //   this.emit(Events.StateChange, { ...this.state });
    // });
  }

  /** Recursively configure submenus inside items (including those nested in MenuGroupCore) */
  private _configure_sub_menus(items: MenuEntry[]) {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item instanceof MenuItemCore && item.menu) {
        item.menu.setOffset({
          x: this.submenuOffsetX,
          y: this.submenuOffsetY,
        });
        (item.menu as any).parentDropdown = this;
        (item.menu as any)._is_root_menu = false;
        // Recurse into the submenu's items as well
        this._configure_sub_menus(item.menu.items);
      } else if (item instanceof MenuGroupCore) {
        this._configure_sub_menus(item.items);
      }
    }
  }

  setItems(items: MenuItemCore[]) {
    this.items = items;
    this.menu.state.items = items;
    this.menu.refresh();
    this.emit(Events.StateChange, {
      ...this.state,
    });
  }
  showMenuItem(label: string) {
    const matched = this.items.find((v) => v.label === label);
    if (!matched) {
      return;
    }
    matched.show();
  }
  toggle(
    position?: Partial<{ x: number; y: number; width: number; height: number }>,
  ) {
    // console.log("[DEBUG-DROPDOWN] toggle", {
    //   position,
    //   offsetX: this.offsetX,
    //   offsetY: this.offsetY,
    //   popperRef: !!this.menu.popper.reference,
    //   popperHas$el: !!(this.menu.popper.reference as any)?.$el,
    //   popperFloating: !!this.menu.popper.floating,
    // });
    if (position) {
      const { x = 0, y = 0, width = 0, height = 0 } = position;
      this.menu.popper.updateReference({
        // @ts-ignore
        getRect() {
          return {
            width,
            height,
            x,
            y,
          };
        },
      });
    }
    this.menu.toggle();
  }
  show(
    position?: Partial<{ x: number; y: number; width: number; height: number }>,
  ) {
    // Don't reopen during exit animation
    if (this.menu.presence.exit) {
      return;
    }
    if (position) {
      const { x = 0, y = 0, width = 8, height = 8 } = position;
      this.menu.popper.updateReference({
        // @ts-ignore
        getRect() {
          return { width, height, x, y };
        },
      });
    }
    this.menu.show();
  }
  hide() {
    // console.log("[DOMAIN/ui]dropdown-menu/index - hide");
    this.menu.hide();
  }
  unmount() {
    super.destroy();
    this.menu.unmount();
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    this.on(Events.StateChange, handler);
  }
}
