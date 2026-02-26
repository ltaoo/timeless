/**
 * @file 按钮
 */
import React from "react";
import { VariantProps } from "class-variance-authority";
import { ButtonCore } from "@/domains/ui/button";
declare const buttonVariants: any;
declare const Button: React.MemoExoticComponent<(props: {
    store: ButtonCore<any>;
} & VariantProps<typeof buttonVariants> & Omit<React.HTMLAttributes<HTMLElement>, "size">) => React.JSX.Element>;
export { Button };
