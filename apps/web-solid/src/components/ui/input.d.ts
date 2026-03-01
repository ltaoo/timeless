import { JSX } from "solid-js";
import {  InputCore  } from "@timeless/kit";
declare const Input: {
    (props: {
        store: InputCore<any>;
        prefix?: JSX.Element;
        class?: string;
    }): JSX.Element;
    displayName: string;
};
export { Input };
