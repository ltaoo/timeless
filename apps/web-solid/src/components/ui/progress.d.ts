/**
 * @file 进度条
 */
import { JSX } from "solid-js";
import {  ProgressCore  } from "@timeless/inner-kit";
declare const Progress: (props: {
    store: ProgressCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Progress };
