import { JSX } from "solid-js/jsx-runtime";
import {  PopoverCore  } from "@timeless/kit";
declare const Root: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Trigger: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Close: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Trigger, Content, Portal, Close, Arrow };
