/**
 * @file 提供 加载中、没有数据、加载更多等内容的组件
 */
import React from "react";
import { ListCore } from "@/domains/list";
export declare const ListView: React.MemoExoticComponent<(props: {
    wrapClassName?: string;
    store: ListCore<any, any>;
    skeleton?: React.ReactElement;
    extraEmpty?: React.ReactElement;
    extraNoMore?: React.ReactElement;
    onRefresh?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
