import { ref, refobj, refarr, computed } from "@timeless/reactive";
import { RouteViewCore, HistoryCore } from "@timeless/domains";

import { Component, View, ViewProps } from "./view.js";
import { For } from "./for.js";

export function RouteSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    history: HistoryCore<any, any>;
    views: Record<string, (props: {}) => Component>;
    NotFound?: Component;
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
      return props.NotFound;
    }
    return View({ class: ref("not-found") }, ["Not Found"]);
  })();

  const nodes: any[] = [];

  return For({
    class: props.class,
    each: subViews,
    onMounted() {
      // console.log("router sub views mounted", nodes);
      // if (props.onMounted) {
      //   props.onMounted();
      // }
      // for (const node of nodes) {
      //   if (typeof node.onMounted === "function") {
      //     node.onMounted();
      //   }
      // }
    },
    render(subView: any) {
      const PageView = props.views[subView.name];
      if (!PageView) {
        return null;
      }
      const displayed = computed(curSubView, (d) => {
        return [
          "page__wrap absolute inset-0",
          d && d.name === subView.name ? "display" : "hidden",
        ].join(" ");
      });

      return View(
        {
          class: displayed,
          // style: computed(curSubView, (draft) => {
          //   return draft && draft.name === subView.name
          //     ? "display: block;"
          //     : "display: none;";
          // }),
        },
        [
          PageView({
            view: subView,
            views: props.views,
            history: props.history,
            onMounted() {
              nodes.push(this);
            },
          }),
        ],
      );
    },
  });
}
