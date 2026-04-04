import { ref, refobj, refarr, computed } from "@timeless/reactive";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
  ApplicationModel,
} from "@timeless/kit";

import {
  TimelessComponent,
  TimelessElement,
  View,
  ViewChildren,
  ViewProps,
} from "@/content/view";
import { For } from "@/reactive/for";
import { LazyView } from "@/content/lazy-view";
import { ErrorFallbackFn, withErrorBoundary } from "@/content/error-boundary";
import { h } from "@/util/h";

type SubView = { id?: unknown; name: string; pathname?: string } & Record<
  string,
  any
>;

export function KeepAliveSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    views: Record<string, TimelessComponent>;
    app: ApplicationModel<any>;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    NotFound?: (...args: any[]) => TimelessElement;
    ErrorFallback?: ErrorFallbackFn;
    placeholder?: ViewChildren;
  },
) {
  const subviews = refarr(props.view.subViews as SubView[]);
  const cur_subview = refobj(props.view.curView as SubView);

  props.view.onCurViewChange((view: SubView) => {
    cur_subview.as(view);
  });
  props.view.onSubViewAppended((v: SubView) => {
    subviews.push(v);
  });
  props.view.onSubViewRemoved((v: SubView) => {
    subviews.remove(v);
  });

  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound();
    }
    return View({ class: ref("not-found") }, ["Not Found"]);
  })();

  return For({
    each: subviews,
    render(subview: SubView) {
      const PageView = props.views[subview.name];
      const idx = subviews.indexOf(subview);
      if (!PageView) {
        return NotFoundPageView;
      }
      return h(
        View,
        {
          style: {
            "z-index": idx + 1,
            position: "relative",
            width: "100%",
            height: "100%",
            display: computed(cur_subview, (d) =>
              d && d.id === subview.id ? "block" : "none",
            ),
          },
          dataset: {
            name: subview.name,
            pathname: subview.pathname,
          },
        },
        [
          withErrorBoundary(
            () =>
              LazyView(
                {
                  ...props,
                  view: subview,
                },
                [PageView],
              ),
            subview.name,
            props.ErrorFallback,
          ),
        ],
      );
    },
  });
}
