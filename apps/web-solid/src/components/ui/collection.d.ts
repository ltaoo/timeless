import { CollectionCore } from "@timeless/kit";
declare const Provider: (props: {
    store: CollectionCore;
    children: JSX.Element;
}) => JSX.Element;
declare const Slot: (props: {
    children: JSX.Element;
}) => JSX.Element;
declare const Item: (props: {
    children: JSX.Element;
}) => JSX.Element;
export { Provider, Slot, Item };
