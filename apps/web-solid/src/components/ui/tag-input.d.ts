import { JSX } from "solid-js";
import { ViewComponentProps } from "~/store/types";
import {  Handler  } from "@timeless/inner-kit";).storage;
    }>;
    ready(): void;
    destroy(): void;
    onChange(handler: Handler<string[]>): () => void;
    onStateChange(handler: Handler<{
        readonly value: string[];
        readonly options: {
            selected: boolean;
            value: string;
            text: string;
        }[];
    }>): () => void;
};
export type TagSelectInput = ReturnType<typeof TagSelectInput>;
export declare function TagInput(props: {
    store: TagSelectInput;
} & JSX.HTMLAttributes<HTMLDivElement>): JSX.Element;
