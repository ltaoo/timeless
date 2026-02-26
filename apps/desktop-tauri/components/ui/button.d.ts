/**
 * @file 按钮
 */
import { JSX } from "solid-js";
import { VariantProps } from "class-variance-authority";
import {  ButtonCore  } from "@timeless/domains";).ClassProp) => string;
declare function Button<T = unknown>(props: {
    store: ButtonCore<T>;
    icon?: JSX.Element;
} & VariantProps<typeof buttonVariants> & JSX.HTMLAttributes<HTMLButtonElement>): JSX.Element;
export { Button };
