import { JSX } from "solid-js";
import {  SelectCore  } from "@timeless/kit";
declare const Root: (props: {
    store: SelectCore<any>;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Trigger: (props: {
    store: SelectCore<any>;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Value: (props: {
    store: SelectCore<any>;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Icon: (props: {
    class?: string;
    children: JSX.Element;
}) => JSX.Element;
declare const Portal: (props: {
    children: JSX.Element;
}) => JSX.Element;
declare const Content: (props: {
    store: SelectCore<any>;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Viewport: (props: {
    store: SelectCore<any>;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Group: (props: {
    store: SelectCore<any>;
    children: JSX.Element;
}) => JSX.Element;
declare const Label: (props: {
    class?: string;
    children: JSX.Element;
}) => JSX.Element;
declare const Option: (props: {
    parent: SelectCore<any>;
    store: SelectOptionCore<any>;
    value?: string;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const OptionText: (props: {
    store: SelectOptionCore<any>;
    children: JSX.Element;
}) => JSX.Element;
declare const ItemIndicator: (props: {
    store: SelectOptionCore<any>;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Trigger, Value, Icon, Portal, Content, Viewport, Group, Label, Option, OptionText, ItemIndicator, };
