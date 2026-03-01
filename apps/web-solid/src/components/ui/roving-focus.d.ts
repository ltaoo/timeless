import { JSX } from "solid-js/jsx-runtime";
import {  RovingFocusCore  } from "@timeless/kit";
declare const Root: (props: {
    store: RovingFocusCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Item: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Item };
