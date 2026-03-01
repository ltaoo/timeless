import { JSX } from "solid-js/jsx-runtime";

import {  Application  } from "@timeless/kit";>;
  parent?: {
    view: RouteViewCore;
    scrollView?: ScrollViewCore;
  };
};
export type ViewComponent = (props: ViewComponentProps) => JSX.Element;
