import { JSX } from "solid-js/jsx-runtime";
import {  PopoverCore  } from "@timeless/inner-kit";
export declare function Popover(props: {
    store: PopoverCore;
} & JSX.HTMLAttributes<HTMLElement>): JSX.Element;
export declare const PurePopover: (props: {
    content: JSX.Element;
    side?: Side;
    align?: Align;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
