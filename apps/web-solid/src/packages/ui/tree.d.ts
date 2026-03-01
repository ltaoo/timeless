import { JSX } from "solid-js/jsx-runtime";
import {  TreeCore  } from "@timeless/kit";
declare const Root: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Leaf: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Switcher: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Handler: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Content: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Sub: (props: {
    store: TreeCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
export { Root, Leaf, Handler, Switcher, Content, Arrow, Sub };
