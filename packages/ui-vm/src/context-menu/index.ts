import { BaseDomain, Handler } from "@timeless/base";

import { MenuCore } from "@/menu/index";
import { MenuItemCore } from "@/menu/item";
import { Rect, Side, Align } from "@/popper/types";
import { ScrollViewCore } from "@/scroll-view/index";

enum Events {
  StateChange,
  Show,
  Hidden,
}
type TheTypeOfEvent = {
  [Events.StateChange]: ContextMenuState;
  [Events.Show]: void;
  [Events.Hidden]: void;
};
type ContextMenuState = {
  items: MenuItemCore[];
};
type ContextMenuProps = {
  items: MenuItemCore[];
  offsetX?: number;
  offsetY?: number;
  submenuOffsetX?: number;
  submenuOffsetY?: number;
  // trigger?: "contextmenu" | "hover" | "click";
  side?: Side;
  align?: Align;
  view$?: ScrollViewCore;
};
export class ContextMenuCore extends BaseDomain<TheTypeOfEvent> {
  menu: MenuCore;
  disabled = false;
  // trigger: "contextmenu" | "hover" | "click" = "contextmenu";

  state: ContextMenuState = {
    items: [],
  };

  // Virtual element for positioning
  private virtualElement = {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }),
  };
  private initialScrollTop = 0;
  private clickX = 0;
  private clickY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private submenuOffsetX = 0;
  private submenuOffsetY = 0;
  private view$?: ScrollViewCore;

  constructor(
    options: Partial<
      {
        _name: string;
      } & ContextMenuProps
    >,
  ) {
    super(options);
    const {
      _name,
      items = [],
      offsetX = 0,
      offsetY = 0,
      submenuOffsetX = -2,
      submenuOffsetY = -4,
      side = "bottom",
      align = "start",
      view$,
    } = options;
    this.state.items = items;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.submenuOffsetX = submenuOffsetX;
    this.submenuOffsetY = submenuOffsetY;
    this.view$ = view$;
    this.menu = new MenuCore({
      ...options,
      _name: _name ? `${_name}__menu` : "menu-in-context-menu",
      trigger: "contextmenu",
      root: true,
      side,
      align,
      view$,
    });
    // Store reference to parent context menu in menu for hover handling
    // this.menu as any).parentContextMenu = this;

    // Set initial virtual reference
    console.log("[ContextMenuCore] constructor - setting initial reference");
    this.menu.popper.setReference({
      $el: this.virtualElement as any,
      getRect: () => {
        return this.virtualElement.getBoundingClientRect() as Rect;
      },
    });
    console.log("[ContextMenuCore] constructor - reference set, checking:", {
      hasReference: !!this.menu.popper.reference,
      reference: this.menu.popper.reference,
    });

    this._configure_sub_menus(items);
  }

  private _configure_sub_menus(items: MenuItemCore[]) {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.menu) {
        item.menu.setOffset({ x: this.submenuOffsetX, y: this.submenuOffsetY });
        // Also set parent context menu reference for submenus
        (item.menu as any).parentContextMenu = this;
        // Mark submenus as non-root so they don't auto-close sibling root menus
        (item.menu as any)._is_root_menu = false;
      }
    }
  }

  show(position: Partial<{ x: number; y: number }> = {}) {
    const { x = 0, y = 0 } = position;
    console.log("[ContextMenuCore] show at position:", { x, y });
    console.log("[ContextMenuCore] show - before update, reference:", {
      hasReference: !!this.menu.popper.reference,
    });

    // Store initial scroll position and click position
    this.initialScrollTop = this.view$?.getScrollTop() || 0;
    this.clickX = x;
    this.clickY = y;

    // Update virtual element to dynamically calculate position based on scroll
    this.virtualElement.getBoundingClientRect = () => {
      const currentScrollTop = this.view$?.getScrollTop() || 0;
      const scrollDelta = currentScrollTop - this.initialScrollTop;

      const adjustedX = this.clickX + this.offsetX;
      const adjustedY = this.clickY + this.offsetY - scrollDelta;

      return {
        width: 0,
        height: 0,
        x: adjustedX,
        y: adjustedY,
        top: adjustedY,
        right: adjustedX,
        bottom: adjustedY,
        left: adjustedX,
      };
    };

    // Update reference with new position
    this.menu.popper.updateReference({
      $el: this.virtualElement as any,
      getRect: () => {
        return this.virtualElement.getBoundingClientRect() as Rect;
      },
    });

    console.log("[ContextMenuCore] show - after update, reference:", {
      hasReference: !!this.menu.popper.reference,
    });

    console.log("[ContextMenuCore] calling menu.show()");
    this.menu.show();

    // Manually trigger place after show to ensure position is calculated
    console.log("[ContextMenuCore] calling menu.popper.place()");
    this.menu.popper.place();
  }
  hide(opt: { reason: string }) {
    console.log("[]ContextMenuCore - hide");
    this.menu.hide(opt);
  }
  setReference(reference: { $el?: unknown; getRect: () => Rect }) {
    // console.log("[ContextMenuCore]setReference", reference.getRect());
    this.menu.popper.setReference(reference);
  }
  updateReference(reference: { $el?: unknown; getRect: () => Rect }) {
    this.menu.popper.updateReference(reference);
  }
  setItems(items: MenuItemCore[]) {
    this.state.items = items;
    this._configure_sub_menus(items);
    this.menu.setItems(items);
    this.emit(Events.StateChange, { ...this.state });
  }

  onStateChange(handler: Handler<TheTypeOfEvent[Events.StateChange]>) {
    this.on(Events.StateChange, handler);
  }
  onShow(handler: Handler<TheTypeOfEvent[Events.Show]>) {
    this.on(Events.Show, handler);
  }
  onHide(handler: Handler<TheTypeOfEvent[Events.Hidden]>) {
    this.on(Events.Hidden, handler);
  }
}
