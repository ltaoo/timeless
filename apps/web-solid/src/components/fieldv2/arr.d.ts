import { JSX } from "solid-js/jsx-runtime";
import {  ArrayFieldCore  } from "@timeless/domains";
export declare function FieldArrV2<T extends (v: number) => any>(props: {
    store: ArrayFieldCore<T>;
    hide_label?: boolean;
    render: (field: ReturnType<T>) => JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element;
