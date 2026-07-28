import { JSX } from "solid-js";
import {  ScrollViewCore  } from "@timeless/inner-kit";
export declare const Root: (props: {
    store: ScrollViewCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
/**
 * 下拉刷新指示器
 */
export declare const Indicator: (props: {
    store: ScrollViewCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
export declare const Progress: (props: {
    store: ScrollViewCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
export declare const Loading: (props: {
    store: ScrollViewCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
