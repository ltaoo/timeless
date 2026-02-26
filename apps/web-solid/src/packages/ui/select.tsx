import { JSX, Show, createContext, createSignal, onMount, useContext } from "solid-js";
import { Portal as PortalPrimitive } from "solid-js/web";

import {  SelectCore  } from "@timeless/domains";, item.value, nextState.selected));
    setState(v);
  });

  return (
    <Show when={state().selected}>
      <span class={props.class} aria-hidden>
        {props.children}
      </span>
    </Show>
  );
};

// const ScrollUpButton = (props: { class?: string; children: JSX.Element }) => {
//   const canScrollUp = () => true;
//   return (
//     <Show when={canScrollUp()}>
//       <ScrollButtonImpl class={props.class}>{props.children}</ScrollButtonImpl>
//     </Show>
//   );
// };

// const ScrollDownButton = (props: { class?: string; children: JSX.Element }) => {
//   const canScrollDown = () => true;
//   return (
//     <Show when={canScrollDown()}>
//       <ScrollButtonImpl class={props.class}>{props.children}</ScrollButtonImpl>
//     </Show>
//   );
// };

// const ScrollButtonImpl = (props: { class?: string; children: JSX.Element }) => {
//   return (
//     <div
//       class={props.class}
//       onPointerMove={() => {
//         // ...
//       }}
//       onPointerLeave={() => {
//         // ...
//       }}
//     >
//       {props.children}
//     </div>
//   );
// };

// const Separator = (props: { class?: string }) => {
//   return <div class={props.class} aria-hidden />;
// };

// const Arrow = () => {
//   const store = useContext(SelectContext);
//   return <PopperPrimitive.Arrow store={store.popper}></PopperPrimitive.Arrow>;
// };

const BubbleSelect = (props: { children: JSX.Element }) => {
  return <select />;
};

export {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Group,
  Label,
  Option,
  OptionText,
  ItemIndicator,
  //   ScrollUpButton,
  //   ScrollDownButton,
  //   Separator,
  //   Arrow,
};
