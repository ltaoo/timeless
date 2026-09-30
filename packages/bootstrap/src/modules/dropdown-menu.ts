import { ui, vm } from "@timeless/timeless";
import { computed, refobj } from "@timeless/timeless";
import {
  For,
  Fragment,
  Show,
  ViewChildren,
  ViewProps,
  TimelessElement,
} from "@timeless/timeless";

import { MenuGroup, MenuItem, MenuSeparator, renderMenuEntry } from "./menu";
import type { MenuEntry } from "./menu";
// side-effect：安装 vm.MenuCore.listen_item 的子菜单监听器补丁
import { t } from "./menu-shared";

/**
 * DropdownMenu · Bootstrap 5.3
 *
 * 结构沿用上游：Trigger + 浮层 Content。类名走 .dropdown-menu / .dropdown-item /
 * .dropdown-divider / .dropdown-header（由 menu-shared 的 t 常量提供）。
 * 条目渲染复用 menu.ts 的骨架（renderMenuEntry），因此子菜单、勾选项、
 * icon / shortcut 的行为三者完全一致。
 */
export function DropdownMenu(
  props: ViewProps & { store: vm.DropdownMenuCore },
  children?: ViewChildren,
): TimelessElement {
  const state_ = refobj(props.store.state);

  return Fragment({}, [
    Show({
      when: !!children,
      ok() {
        return ui.DropdownMenuPrimitive.Trigger(
          { store: props.store },
          children,
        );
      },
    }),
    ui.DropdownMenuPrimitive.Content(
      {
        ...props,
        class: t.menu.class,
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
