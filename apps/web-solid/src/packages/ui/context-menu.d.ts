/**
 * @file 右键菜单
 */
import { JSX } from "solid-js";
import {  ContextMenuCore  } from "@timeless/domains";
declare const Root: (props: {
    store: ContextMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
/**
 * 点击展示菜单
 */
declare const Trigger: (props: {
    store: ContextMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: ContextMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Group: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Label: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Item: (props: {
    store: MenuItemCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Separator: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Sub: (props: {
    subMenu: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const SubTrigger: (props: {
    parent: MenuCore;
    item: MenuItemCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const SubContent: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Trigger, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
