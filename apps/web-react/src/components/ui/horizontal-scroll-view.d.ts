/**
 * @file 横向可滚动容器
 */
import React from "react";
import { HorizontalScrollViewCore } from "@/domains/ui/scroll-view/horizontal";
export declare const HorizontalScrollView: React.MemoExoticComponent<(props: {
    store: HorizontalScrollViewCore;
    wrapClassName?: string;
    contentClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
