/**
 * @file 可滚动容器，支持下拉刷新、滚动监听等
 */
import { JSX } from "solid-js";
import {  ScrollViewCore  } from "@timeless/inner-kit";
export declare const ScrollView: (props: {
    store: ScrollViewCore;
    extra?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
