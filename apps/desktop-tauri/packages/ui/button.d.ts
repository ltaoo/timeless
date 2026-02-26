/**
 * @file 按钮
 */
import { JSX } from "solid-js";
import {  ButtonCore  } from "@timeless/domains";
declare function Root<T = unknown>(props: {
    store: ButtonCore<T>;
} & JSX.HTMLAttributes<HTMLButtonElement>): JSX.Element;
declare function Loading<T = unknown>(props: {
    store: ButtonCore<T>;
} & JSX.HTMLAttributes<HTMLSpanElement>): JSX.Element;
declare function Prefix<T = unknown>(props: {
    store: ButtonCore<T>;
} & JSX.HTMLAttributes<HTMLSpanElement>): JSX.Element;
declare function Text<T = unknown>(props: {
    store: ButtonCore<T>;
} & JSX.HTMLAttributes<HTMLSpanElement>): JSX.Element;
export { Root, Text, Loading, Prefix };
