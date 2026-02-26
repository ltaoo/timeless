/**
 * @file 下拉菜单
 */
import { JSX } from "solid-js";
import {  DropdownMenuCore  } from "@timeless/domains";
declare const Root: (props: {
    store: DropdownMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Trigger: (props: {
    store: DropdownMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: DropdownMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Group: (props: {
    store: DropdownMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Label: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Item: (props: {
    store: MenuItemCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Separator: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {
    store: DropdownMenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Sub: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const SubTrigger: (props: {
    store: MenuItemCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const SubContent: (props: {
    store: MenuCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Trigger, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
