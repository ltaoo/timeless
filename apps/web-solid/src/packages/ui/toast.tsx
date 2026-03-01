/**
 * @file 小黑块 提示
 */
import { createSignal, JSX } from "solid-js";

import { Portal as PortalPrimitive } from "~/packages/ui/portal";
import { Presence } from "~/components/ui/presence";
import {  ToastCore  } from "@timeless/kit"; classList={props.classList}>
      <Presence store={props.store.presence} class={cn(props.class)}>
        {props.children}
      </Presence>
    </div>
  );
};

export { Root, Portal, Overlay, Content };
