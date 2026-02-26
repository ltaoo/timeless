/**
 * @file div
 */
import React, { useEffect, useRef, useState } from "react";

import { useInitialize } from "~/hooks";
import { NodeCore } from "@/domains/ui/node";
import { provide_ui_node } from "@timeless/provider-web";

export const NodeView = React.memo((props: {
  store: NodeCore;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => {
  const { store } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    provide_ui_node(store, ref.current);
  }, []);

  return (
    <div
      ref={ref}
      className={props.className}
      style={props.style}
      onClick={(event) => {
        // console.log("[DOMAIN]ui/node/index - handleClick");
        if ((store as any).longPressing) {
          event.preventDefault();
          event.stopPropagation();
        }
        (store as any).longPressing = false;
        // store.click();
      }}
      onTouchStart={() => {
        (store as any).handleMouseDown();
      }}
      onTouchEnd={(event) => {
        (store as any).handleMouseUp({
          type: "touch end",
          stopPropagation() {
            event.stopPropagation();
          },
        });
        (store as any).longPressing = false;
      }}
      onMouseDown={() => {
        (store as any).handleMouseDown();
      }}
      onMouseUp={(event) => {
        (store as any).handleMouseUp({
          type: "mouse up",
          stopPropagation() {
            event.stopPropagation();
          },
        });
      }}
      onMouseOut={() => {
        (store as any).handleMouseOut();
      }}
    >
      {props.children}
    </div>
  );
});
