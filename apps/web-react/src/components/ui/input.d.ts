/**
 * @file 输入框
 */
import React, { ReactElement } from "react";
import { InputCore } from "@/domains/ui/input";
declare const Input: {
    (props: {
        store: InputCore;
        focus?: boolean;
        prefix?: ReactElement;
        className?: string;
    }): React.JSX.Element;
    displayName: string;
};
export { Input };
