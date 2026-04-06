import { ref, refobj, refarr, computed } from "@timeless/reactive";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
  ApplicationModel,
} from "@timeless/kit";

import { View, ViewProps } from "@/content/view";
import {
  ViewChildren,
  TimelessComponent,
  TimelessElement,
} from "@/content/type";
import { For } from "@/reactive/for";
import { Show } from "@/reactive/show";
import { LazyView } from "@/content/lazy-view";
import { ErrorFallbackFn, withErrorBoundary } from "@/content/error-boundary";
import { h } from "@/util/h";

type SubView = { id?: unknown; name: string; pathname?: string } & Record<
  string,
  any
>;

export function StandardSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    views: Record<string, TimelessComponent>;
    app: ApplicationModel<any>;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    placeholder?: ViewChildren;
    NotFound?: (...args: any[]) => TimelessElement;
    ErrorFallback?: ErrorFallbackFn;
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

  const nodes: any[] = [];

  return For({
    each: subviews,
    render(subview: SubView, idx: any) {
      const PageView = props.views[subview.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return Show({
        when: computed(cur_subview, (d) => {
          if (d && d.id === subview.id) {
            return true;
          }
          return false;
        }),
        ok() {
          return [
            View(
              {
                style: {
                  "z-index": computed(idx, (i) => i + 1),
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
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
                        onMounted() {
                          nodes.push(this);
                        },
                      },
                      [PageView],
                    ),
                  subview.name,
                  props.ErrorFallback,
                ),
              ],
            ),
          ];
        },
      });
    },
  });
}
