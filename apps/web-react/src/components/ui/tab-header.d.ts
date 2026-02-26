import React from "react";
import { TabHeaderCore } from "@/domains/ui/tab-header";
export declare const TabHeader: React.MemoExoticComponent<(<T extends {
    key: "id";
    options: {
        id: string;
        text: string;
        [x: string]: any;
    }[];
}>(props: {
    store: TabHeaderCore<T>;
}) => React.JSX.Element)>;
