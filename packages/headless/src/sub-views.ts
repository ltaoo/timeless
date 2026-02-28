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
} from "@timeless/domains";

import { Component, View, ViewProps } from "./view.js";
import { For } from "./for.js";
import { Show } from "./show.js";

export function RouteSubViews(
  props: ViewProps & {
    subclass?: ClassNameRef;
    view: RouteViewCore;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    views: Record<string, (props: {}) => Component>;
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
    class: props.class,
    // style: "position: relative; width: 100%; height: 100%;",
    each: subviews,
    render(subview: any, idx) {
      const PageView = props.views[subview.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return Show(
        {
          class: props.subclass,
          style: `z-index: ${idx + 1}; position: absolute; width: 100%; height: 100%;"`,
          dataset: {
            name: subview.name,
            pathname: subview.pathname,
          },
          when: computed(cur_subview, (d) => d && d.name === subview.name),
        },
        [
          PageView({
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
