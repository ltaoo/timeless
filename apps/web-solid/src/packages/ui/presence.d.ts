/**
 * @file 控制内容显隐的组件
 */
import { JSX } from "solid-js";
import {  PresenceCore  } from "@timeless/domains";
export declare const Presence: (props: {
    store: PresenceCore;
} & JSX.HTMLAttributes<HTMLDivElement>) => JSX.Element;
