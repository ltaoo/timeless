import { JSX } from "solid-js/jsx-runtime";
import {  CollectionCore  } from "@timeless/kit";
declare const Provider: (props: {
    store: CollectionCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Slot: (props: {
    store: CollectionCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
declare const Item: (props: {
    store: CollectionCore;
} & JSX.HTMLAttributes<HTMLElement>) => JSX.Element;
export { Provider, Slot, Item };
