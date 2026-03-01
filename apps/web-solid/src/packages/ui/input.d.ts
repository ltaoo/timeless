/**
 * @file 输入框
 */
import { JSX } from "solid-js";
import {  InputCore  } from "@timeless/kit";
declare const Input: (props: {
    store: InputCore<any>;
} & JSX.HTMLAttributes<HTMLInputElement>) => JSX.Element;
export { Input };
