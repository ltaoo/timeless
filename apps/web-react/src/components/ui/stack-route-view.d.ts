/**
 * @file 不销毁的路由视图
 */
import React from "react";
import { RouteViewCore } from "@/domains/route_view/index";
export declare const StackRouteView: React.MemoExoticComponent<(props: {
    store: RouteViewCore;
    index: number;
} & React.AllHTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
