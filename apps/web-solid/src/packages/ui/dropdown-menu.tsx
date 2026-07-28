/**
 * @file 下拉菜单
 */
import { createSignal, JSX, onMount } from "solid-js";

import {  DropdownMenuCore  } from "@timeless/inner-kit";);
  // });

  return (
    <MenuPrimitive.SubTrigger class={props.class} store={store}>
      {props.children}
    </MenuPrimitive.SubTrigger>
  );
};

const SubContent = (props: { store: MenuCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;

  return (
    <MenuPrimitive.SubContent store={store} class={props.class}>
      {props.children}
    </MenuPrimitive.SubContent>
  );
};

export { Root, Trigger, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
