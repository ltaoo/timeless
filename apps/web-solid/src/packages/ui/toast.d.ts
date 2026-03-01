/**
 * @file 小黑块 提示
 */
import { JSX } from "solid-js";
import {  ToastCore  } from "@timeless/kit";
declare const Root: (props: {
    store: ToastCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: ToastCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Overlay: (props: {
    store: ToastCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Content: (props: {
    store: ToastCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
export { Root, Portal, Overlay, Content };
