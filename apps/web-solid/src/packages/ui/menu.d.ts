/**
 * @file 菜单 组件
 */
import { JSX } from "solid-js";
import {  MenuCore  } from "@timeless/inner-kit";
declare const Root: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
/** 锚点 */
declare const Anchor: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Group: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Label: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Item: (props: {
    store: MenuItemCore;
    disabled?: boolean;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Separator: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Sub: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const SubTrigger: (props: {
    store: MenuItemCore;
    onMounted?: (el: HTMLDivElement) => void;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const SubContent: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Anchor, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
