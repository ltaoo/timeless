import { ref, refobj, refarr, computed } from "@timeless/timeless";
import {
  View,
  ViewProps,
  For,
  Show,
  LazyView,
  ListenerManager,
  ViewChildren,
  TimelessComponent,
  TimelessElement,
} from "@timeless/timeless";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
  ApplicationModel,
} from "@timeless/kit";

import { ErrorFallbackFn, withErrorBoundary } from "./error-boundary";

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
  const listener$ = ListenerManager();

  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound();
    }
    return View({ class: ref("not-found") }, ["Not Found"]);
  })();

  // const nodes: any[] = [];

  return For({
    key: "id",
    each: subviews,
    onMounted(event) {
      // console.log("[timeless/primitive]For in StandardSubview mounted");
      listener$.append([
        props.view.onCurViewChange((view: SubView) => {
          cur_subview.as(view);
        }),
        props.view.onSubViewAppended((v: SubView) => {
          subviews.push(v);
        }),
        props.view.onSubViewRemoved((v: SubView) => {
          subviews.remove(v);
        }),
      ]);
      if (props.onMounted) {
        props.onMounted(event);
      }
      return listener$.clean;
    },
    render(subview: SubView, idx: any) {
      const PageView = props.views[subview.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return Show({
        when: computed(cur_subview, (t) => {
          return t && t.id === subview.id;
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
                LazyView(
                  {
                    ...props,
                    view: subview,
                    // onMounted() {
                    //   nodes.push(this);
                    // },
                  },
                  PageView,
                ),
                // withErrorBoundary(
                //   () =>
                //     ,
                //   subview.name,
                //   props.ErrorFallback,
                // ),
              ],
            ),
          ];
        },
      });
    },
  });
}
