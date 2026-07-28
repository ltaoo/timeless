/**
 * @file 最原始的气泡组件
 * 仅负责计算气泡位置，不负责显隐
 */
import { JSX } from "solid-js";
import {  PopperCore  } from "@timeless/inner-kit";
declare const Root: (props: {
    store?: PopperCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Anchor: (props: {
    store: PopperCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Content: (props: {
    store: PopperCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Arrow: (props: {
    store: PopperCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Root, Anchor, Content, Arrow };
