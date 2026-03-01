/**
 * @file 按钮
 */
import { JSX } from "solid-js";
import {  ButtonCore  } from "@timeless/kit";
declare function Element<T = unknown>(props: {
    store: ButtonCore<T>;
} & JSX.HTMLAttributes<HTMLButtonElement>): JSX.Element;
export { Element };
