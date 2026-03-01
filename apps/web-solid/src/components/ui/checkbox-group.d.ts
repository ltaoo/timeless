/**
 * @file 多选按钮组件
 */
import { JSX } from "solid-js";
import {  CheckboxCore  } from "@timeless/kit";
export declare const CheckboxOption: (props: {
    label: string;
    store: CheckboxCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
export declare const CheckboxGroup: <T extends any>(props: {
    store: CheckboxGroupCore<T>;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
