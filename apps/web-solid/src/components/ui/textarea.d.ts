import { JSX } from "solid-js/jsx-runtime";
import {  InputCore  } from "@timeless/kit";
export interface TextareaProps extends HTMLTextAreaElement {
}
declare const Textarea: {
    (props: {
        store: InputCore<string>;
    } & JSX.HTMLAttributes<HTMLTextAreaElement>): JSX.Element;
    displayName: string;
};
export { Textarea };
