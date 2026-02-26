import { JSX } from "solid-js/jsx-runtime";

import {  Application  } from "@timeless/domains";>;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};
export type ViewComponent = (props: ViewComponentProps) => JSX.Element;
