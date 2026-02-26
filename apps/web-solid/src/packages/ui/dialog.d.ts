/**
 * @file 弹窗 组件
 */
import { JSX } from "solid-js";
import {  DialogCore  } from "@timeless/domains";
declare const Root: (props: {
    store: DialogCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Portal: (props: {
    store: DialogCore;
    enterClassName?: string;
    exitClassName?: string;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Overlay: (props: {
    store: DialogCore;
    enterClassName?: string;
    exitClassName?: string;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Content: (props: {
    store: DialogCore;
    enterClassName?: string;
    exitClassName?: string;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Close: (props: {
    store: DialogCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Header: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Footer: (props: {} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
declare const Title: (props: {} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Submit: (props: {
    store: DialogCore;
} & JSX.HTMLAttributes<HTMLButtonElement>) => JSX.Element;
declare const Cancel: (props: {
    store: DialogCore;
} & JSX.HTMLAttributes<HTMLButtonElement>) => JSX.Element;
export { Root, Portal, Header, Title, Content, Close, Overlay, Footer, Submit, Cancel };
