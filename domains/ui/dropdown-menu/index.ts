import { BaseDomain, Handler } from "@/domains/base";
import { MenuCore } from "@/domains/ui/menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { Side } from "@/domains/ui/popper/types";
import { Align } from "@/domains/ui/popper";

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

  constructor(props: { _name?: string } & DropdownMenuProps = {}) {
    super(props);

    console.log("[DropdownMenuCore] constructor", props);

    const {
      _name,
      side,
      align,
      items = [],
      offsetX = 0,
      offsetY = 0,
      submenuOffsetX = 0,
      submenuOffsetY = 0,
      onHidden,
    } = props;
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
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.menu) {
        item.menu.setOffset({ x: submenuOffsetX, y: submenuOffsetY });
      }
    }
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

  setItems(items: MenuItemCore[]) {
    this.items = items;
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
    if (position) {
      let { x = 0, y = 0, width = 8, height = 8 } = position;
      x += this.offsetX;
      y += this.offsetY;
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
