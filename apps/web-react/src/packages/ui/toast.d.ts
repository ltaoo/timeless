/**
 * @file 小黑块 提示
 */
import React from "react";
import { ToastCore } from "@/domains/ui/toast";
declare const Root: (props: {
    store: ToastCore;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element;
declare const Portal: (props: {
    store: ToastCore;
} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element;
declare const Overlay: (props: {
    store: ToastCore;
} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element;
declare const Content: (props: {
    store: ToastCore;
} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element;
export { Root, Portal, Overlay, Content };
