import { JSX, onCleanup, onMount } from "solid-js";

import {  DismissableLayerCore  } from "@timeless/domains";

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

/**
 * Listens for `pointerdown` outside a react subtree. We use `pointerdown` rather than `pointerup`
 * to mimic layer dismissing behaviour present in OS.
 * Returns props to pass to the node we want to check for outside events.
 */
function usePointerDownOutside(
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void,
  ownerDocument: Document = globalThis?.document
) {
  //   const handlePointerDownOutside = useCallbackRef(
  //     onPointerDownOutside
  //   ) as EventListener;
  //   const isPointerInsideReactTreeRef = React.useRef(false);
  //   const handleClickRef = React.useRef(() => {});
}

function handleAndDispatchCustomEvent<E extends CustomEvent, OriginalEvent extends Event>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: { originalEvent: OriginalEvent } & (E extends CustomEvent<infer D> ? D : never),
  { discrete }: { discrete: boolean }
) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail,
  });
  if (handler) {
    target.addEventListener(name, handler as EventListener, { once: true });
  }
  target.dispatchEvent(event);
}
