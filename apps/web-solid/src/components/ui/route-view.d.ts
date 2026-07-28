/**
 * @file 会销毁页面的视图（如果希望不销毁可以使用 keep-alive-route-view
 */
import { JSX } from "solid-js";
import {  RouteViewCore  } from "@timeless/inner-kit";
export declare function RouteView(props: {
    store: RouteViewCore;
    index: number;
} & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element;
