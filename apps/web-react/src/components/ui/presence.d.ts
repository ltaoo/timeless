/**
 * @file 控制内容显隐的组件
 */
import React from "react";
import { PresenceCore } from "@/domains/ui/presence";
export declare const Presence: React.MemoExoticComponent<(props: {
    store: PresenceCore;
    enterClassName?: string;
    exitClassName?: string;
} & React.AllHTMLAttributes<HTMLElement>) => React.JSX.Element>;
