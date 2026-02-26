import React from "react";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
export declare const Root: React.MemoExoticComponent<(props: {
    store: ScrollViewCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
/**
 * 下拉刷新指示器
 */
export declare const Indicator: React.MemoExoticComponent<(props: {
    store: ScrollViewCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
export declare const Progress: React.MemoExoticComponent<(props: {
    store: ScrollViewCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
export declare const Loading: React.MemoExoticComponent<(props: {
    store: ScrollViewCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
