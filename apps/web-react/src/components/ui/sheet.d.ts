import React from "react";
import { VariantProps } from "class-variance-authority";
import { DialogCore } from "@/domains/ui/dialog";
declare const sheetVariants: any;
export declare const Sheet: React.MemoExoticComponent<(props: {
    store: DialogCore;
    size?: VariantProps<typeof sheetVariants>["size"];
    hideTitle?: boolean;
} & Omit<React.AllHTMLAttributes<HTMLDivElement>, "size">) => React.JSX.Element>;
export {};
