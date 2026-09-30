import { ui, vm } from "@timeless/timeless";
import { classNames, computed, refobj } from "@timeless/timeless";
import {
  For,
  Fragment,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "@timeless/timeless";

import { MenuGroup, MenuItem, MenuSeparator, renderMenuEntry } from "./menu";
import type { MenuEntry } from "./menu";
// side-effect：安装 vm.MenuCore.listen_item 的子菜单监听器补丁
import { t } from "./menu-shared";

/**
 * ContextMenu · Animal Island
 *
 * 由右键 / 长按触发（Trigger 内部处理），浮层类名与 DropdownMenu 共用一套
 * .animal-menu 命名空间，额外加 .animal-menu--context 表达右键菜单的尺寸/定位。
 */
export function ContextMenu(
  props: ViewProps & { store: vm.ContextMenuCore },
  children?: ViewChildren,
): TimelessElement {
  const state_ = refobj(props.store.state);

  return Fragment({}, [
    ui.ContextMenuPrimitive.Trigger({ store: props.store }, children || []),
    ui.ContextMenuPrimitive.Content(
      {
        ...props,
        class: classNames([t.menu.class, "animal-menu--context"]),
        animation: t.animation,
      },
      [
        For({
          each: computed(state_, (s) => s.items),
          render(item: MenuEntry) {
            return renderMenuEntry(item, MenuSeparator, MenuGroup, MenuItem);
          },
        }),
      ],
    ),
  ]);
}
