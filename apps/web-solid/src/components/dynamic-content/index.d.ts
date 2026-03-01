import { JSX } from "solid-js";
import {  DynamicContentCore  } from "@timeless/kit";
export declare const DynamicContent: (props: {
    store: DynamicContentCore;
    options: {
        value: number;
        content: null | JSX.Element;
    }[];
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
