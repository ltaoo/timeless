/**
 * @file 可滚动容器，支持下拉刷新、滚动监听等
 */
import React from "react";
import { ScrollViewCore } from "@/domains/ui/scroll-view";
export declare const ScrollView: React.MemoExoticComponent<(props: {
    store: ScrollViewCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
