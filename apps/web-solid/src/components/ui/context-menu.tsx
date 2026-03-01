/**
 * @file 右键菜单
 */
import { For, createSignal, onMount, JSX } from "solid-js";
import { ChevronRight } from "lucide-solid";

import {  ContextMenuCore  } from "@timeless/kit"; }}
      onContextMenu={(event) => {
        event.preventDefault();
        const $$span = $span;
        if (!$$span) {
          return;
        }
        const { pageX: x, pageY: y } = event;
        contextMenu.updateReference({
          getRect() {
            const size = $$span.getBoundingClientRect();
            const { top, left, right, bottom } = size;
            return {
              // 会基于鼠标位置和 reference 宽高计算气泡位置，这里给的宽高，就是离鼠标有多远距离
              width: 4,
              height: 4,
              top,
              left,
              right,
              bottom,
              x,
              y,
            };
          },
        });
        contextMenu.show({ x, y });
      }}
      onPointerDown={() => {
        // ...
      }}
      onPointerMove={() => {
        // ...
      }}
      onPointerCancel={() => {
        // ...
      }}
      onPointerUp={() => {
        // ...
      }}
    >
      {props.children}
    </span>
  );
};
const Portal = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  return <Menu.Portal store={props.store}>{props.children}</Menu.Portal>;
};
const Content = (props: { store: ContextMenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  return (
    <Menu.Content class={props.class} store={store.menu}>
      {props.children}
    </Menu.Content>
  );
};
const Group = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <Menu.Group>{props.children}</Menu.Group>;
};
const Label = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <Menu.Label class={props.class}>{props.children}</Menu.Label>;
};
const Item = (props: { store: MenuItemCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  return (
    <Menu.Item class={props.class} store={store}>
      {props.children}
    </Menu.Item>
  );
};
const Separator = (props: {} & JSX.HTMLAttributes<HTMLElement>) => {
  return <Menu.Separator class={props.class}></Menu.Separator>;
};
const Arrow = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return (
    <Menu.Arrow class={props.class} store={store}>
      {props.children}
    </Menu.Arrow>
  );
};
const Sub = (props: { subMenu: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { subMenu } = props;
  return <Menu.Sub store={subMenu}>{props.children}</Menu.Sub>;
};
const SubTrigger = (
  props: {
    parent: MenuCore;
    item: MenuItemCore;
  } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { item } = props;
  return (
    <Menu.SubTrigger class={props.class} store={item}>
      {props.children}
    </Menu.SubTrigger>
  );
};
const SubContent = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  return (
    <Menu.SubContent class={props.class} store={store}>
      {props.children}
    </Menu.SubContent>
  );
};
// const Root = ContextMenuRoot;
// const Trigger = ContextMenuTrigger;
// const Portal = ContextMenuPortal;
// const Content = ContextMenuContent;
// const Group = ContextMenuGroup;
// const Label = ContextMenuLabel;
// const Item = ContextMenuItem;
// const Separator = ContextMenuSeparator;
// const Arrow = ContextMenuArrow;
// const Sub = ContextMenuSub;
// const SubTrigger = ContextMenuSubTrigger;
// const SubContent = ContextMenuSubContent;
// export { Root, Trigger, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
