import React from "react";
import { ElementCore } from "@/domains/ui/element";
export declare function Element(props: {
    store: ElementCore;
} & {
    children: React.ReactElement;
}): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
