import React from "react";
import { CheckboxCore } from "@/domains/ui/checkbox";
import { CheckboxGroupCore } from "@/domains/ui/checkbox/group";
export declare const CheckboxOption: React.MemoExoticComponent<(props: {
    label: string;
    store: CheckboxCore;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element>;
export declare const CheckboxGroup: <T extends any>(props: {
    store: CheckboxGroupCore<T>;
} & React.HTMLAttributes<HTMLDivElement>) => React.JSX.Element;
