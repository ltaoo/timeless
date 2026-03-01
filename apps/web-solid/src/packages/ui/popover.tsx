import { JSX } from "solid-js/jsx-runtime";
import { Portal as PortalPrimitive } from "solid-js/web";

import {  PopoverCore  } from "@timeless/kit";}>
      {props.children}
    </PopperPrimitive.Content>
  );
};

const Close = (
  props: {
    store: PopoverCore;
  } & JSX.HTMLAttributes<HTMLElement>
) => {
  const { store } = props;
  // const store = useContext(PopoverContext);
  return (
    <button
      class={props.class}
      onClick={() => {
        store.hide();
      }}
    >
      {props.children}
    </button>
  );
};

const Arrow = (props: { store: PopoverCore } & JSX.HTMLAttributes<HTMLElement>) => {
  const { store } = props;
  return <PopperPrimitive.Arrow store={store.popper} class={props.class}></PopperPrimitive.Arrow>;
};

export { Root, Trigger, Content, Portal, Close, Arrow };
