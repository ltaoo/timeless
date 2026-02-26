/**
 * @file 弹窗 组件
 */
import React from "react";
import { DialogCore } from "@/domains/ui/dialog";
declare const Root: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Portal: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Overlay: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
declare const Content: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Description: React.MemoExoticComponent<(props: {} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Close: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Header: React.MemoExoticComponent<(props: {} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Footer: React.MemoExoticComponent<(props: {} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
declare const Title: React.MemoExoticComponent<(props: {} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
declare const Submit: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLButtonElement>) => React.JSX.Element>;
declare const Cancel: React.MemoExoticComponent<(props: {
    store: DialogCore;
} & React.AllHTMLAttributes<HTMLButtonElement>) => React.JSX.Element>;
export { Root, Portal, Header, Title, Content, Description, Close, Overlay, Footer, Submit, Cancel };
