import {
  ref,
  refobj,
  refarr,
  computed,
  ClassNameRef,
} from "@timeless/reactive";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
} from "@timeless/kit";

import { Component, View, ViewProps } from "./view";
import { For } from "./for";
import { AsyncView } from "./async-view";

export function KeepAliveSubViews(
  props: ViewProps & {
    subclass?: ClassNameRef;
    view: RouteViewCore;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    views: Record<
      string,
      | ((...args: any[]) => Component)
      | (() => Promise<{ default: (...args: any[]) => Component }>)
    >;
    NotFound?: (...args: any[]) => Component;
  },
) {
  const subviews = refarr(props.view.subViews);
  const cur_subview = refobj(props.view.curView);

  props.view.onCurViewChange((view) => {
    cur_subview.as(view);
  });
  props.view.onSubViewAppended((v) => {
    subviews.push(v);
  });
  props.view.onSubViewRemoved((v) => {
    subviews.remove(v);
  });

  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound();
    }
    return View({ class: ref("not-found") }, ["Not Found"]);
  })();

  const nodes: any[] = [];

  return For({
    // class: props.class,
    // style: "position: relative;",
    each: subviews,
    render(subview: any, idx) {
      const PageView = props.views[subview.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return View(
        {
          class: props.subclass,
          style: computed(cur_subview, (d) => {
            return [
              `z-index: ${idx + 1}; width: 100%; height: 100%;`,
              d && d.name === subview.name
                ? "display: block;"
                : "display: none;",
            ].join("");
          }),
          dataset: {
            name: subview.name,
            pathname: subview.pathname,
          },
        },
        [
          AsyncView(PageView, {
            ...props,
            view: subview,
            onMounted() {
              nodes.push(this);
            },
          }),
        ],
      );
    },
  });
}
