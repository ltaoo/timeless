import { JSX } from "solid-js/jsx-runtime";

import {  cn  } from "@timeless/utils";

export const Label = (props: JSX.HTMLAttributes<HTMLDivElement> & JSX.AriaAttributes) => (
  <div ref={props.ref} class={cn(props.class)}>
    {props.children}
  </div>
);
