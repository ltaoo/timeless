import { ref, refobj, refarr, computed } from "@timeless/timeless";
import {
  MountedEvent,
  View,
  ViewChildren,
  TimelessComponent,
  TimelessElement,
  LazyView,
  For,
  ListenerManager,
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

export function KeepAliveSubViews(props: {
  placeholder?: ViewChildren;
  view: RouteViewCore;
  views: Record<string, TimelessComponent>;
  app: ApplicationModel<any>;
  history: HistoryCore<any, any>;
  storage: StorageCore<any>;
  client: HttpClientCore;
  NotFound?: (...args: any[]) => TimelessElement;
  ErrorFallback?: ErrorFallbackFn;
  onMounted?: (event: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
}) {
  const subviews = refarr(props.view.subViews as SubView[]);
  const cur_subview = refobj(props.view.curView as SubView);
  const listener$ = ListenerManager();
  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound();
    }
    return View({ class: "not-found" }, ["Not Found"]);
  })();

  return For({
    key: "id",
    each: subviews,
    onMounted(event) {
      // console.log("the For Mounted in KeepAliveSubViews", event);
      listener$.append([
        props.view.onCurViewChange((view: SubView) => {
          cur_subview.as(view);
        }),
        props.view.onSubViewAppended((v: SubView) => {
          // console.log(
          //   "[KeepAliveSubViews] onSubViewAppended",
          //   v,
          //   subviews.length,
          // );
          subviews.push(v);
        }),
        props.view.onSubViewRemoved((v: SubView) => {
          subviews.remove(v);
        }),
      ]);
      if (props.onMounted) {
        props.onMounted(event);
      }
      return listener$.clear;
    },
    render(subview, idx) {
      const PageView = props.views[subview.name];
      // const idx = subviews.indexOf(subview);
      if (!PageView) {
        return NotFoundPageView;
      }
      return View(
        {
          style: {
            "z-index": computed(idx, (t) => t + 1),
            position: "relative",
            width: "100%",
            height: "100%",
            display: computed(cur_subview, (t) => {
              return t && t.id === subview.id ? "block" : "none";
            }),
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
      );
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  });
}
