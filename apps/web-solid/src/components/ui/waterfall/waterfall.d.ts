/**
 * @file 支持多列的瀑布流组件
 */
import { JSX } from "solid-js";
import {  WaterfallModel  } from "@timeless/kit";
export declare function WaterfallView<T extends Record<string, unknown>>(props: {
    store: WaterfallModel<T>;
    fallback?: JSX.Element;
    extra?: JSX.Element;
    render: (payload: T, idx: number) => JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element;
export declare function WaterfallColumnView<T extends Record<string, unknown>>(props: {
    store: WaterfallColumnModel<T>;
    render: (payload: T, idx: number) => JSX.Element;
}): JSX.Element;
export declare function WaterfallCellView<T extends Record<string, unknown>>(props: {
    store: WaterfallCellModel<T>;
    idx: number;
    render: (payload: T, idx: number) => JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element;
