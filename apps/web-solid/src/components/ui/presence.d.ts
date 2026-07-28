/**
 * @file 控制内容显隐的组件
 */
import { JSX } from "solid-js";
import {  PresenceCore  } from "@timeless/inner-kit";
export declare const Presence: (props: {
    store: PresenceCore;
    animation?: {
        in: string;
        out: string;
    };
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
