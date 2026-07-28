import { JSX } from "solid-js";
import {  TabsCore  } from "@timeless/inner-kit";
declare const Root: (props: {
    store: TabsCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const List: (props: {
    store: TabsCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Trigger: (props: {
    store: TabsCore;
    value: string;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: TabsCore;
    value: string;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, List, Trigger, Content };
