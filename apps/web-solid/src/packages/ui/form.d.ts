import { JSX } from "solid-js";
import {  FormCore  } from "@timeless/domains";
declare function Root<T extends Record<string, unknown>>(props: {
    store: FormCore;
} & JSX.HTMLAttributes<HTMLElement>): JSX.Element;
declare const Field: (props: {
    store: FormFieldCore<any>;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare function Control<T extends Record<string, unknown>>(props: {
    store: FormCore;
} & JSX.HTMLAttributes<HTMLElement>): JSX.Element;
declare function Submit<T extends Record<string, unknown>>(props: {
    store: FormCore;
} & JSX.HTMLAttributes<HTMLButtonElement>): JSX.Element;
export { Root, Field, Control, Submit };
