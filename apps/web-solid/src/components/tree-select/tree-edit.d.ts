import { JSX } from "solid-js";
import {  TreeSelectModel, TreeSelectNodeModel  } from "@timeless/kit";
export declare function TreeEdit<T extends {
    id: number | string;
    label: string;
    children?: T[];
}>(props: {
    store: TreeSelectModel<T>;
    renderNode: (v: {
        level: number;
        idx: number;
        uid: string;
        node: T;
    }) => JSX.Element;
}): JSX.Element;
export declare function TreeEditNode<T extends {
    id: number | string;
    label: string;
    children?: T[];
}>(props: {
    store: TreeSelectNodeModel<T>;
    renderNode: (v: {
        level: number;
        idx: number;
        uid: string;
        node: T;
    }) => JSX.Element;
}): JSX.Element;
