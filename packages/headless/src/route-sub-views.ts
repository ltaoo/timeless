import { ref, refobj, refarr, computed } from "@timeless/reactive";
import { RouteViewCore, HistoryCore } from "@timeless/domains";

import { Component, View, ViewProps } from "./view.js";
import { For } from "./for.js";

export function RouteSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    history: HistoryCore<any, any>;
    views: Record<string, (props: {}) => Component>;
    NotFound?: (...args: any[]) => Component;
  },
) {
  const subViews = refarr(props.view.subViews);
  const curSubView = refobj(props.view.curView);

  props.view.onCurViewChange((view) => {
    curSubView.as(view);
  });
  props.view.onSubViewAppended((v) => {
    subViews.push(v);
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
    each: subViews,
    render(subView: any) {
      const PageView = props.views[subView.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return View(
        {
          style: computed(curSubView, (draft) => {
            return [
              draft && draft.name === subView.name
                ? "display: block;"
                : "display: none;",
            ].join("");
          }),
        },
        [
          PageView({
            ...props,
            view: subView,
            onMounted() {
              nodes.push(this);
            },
          }),
        ],
      );
    },
  });
}
