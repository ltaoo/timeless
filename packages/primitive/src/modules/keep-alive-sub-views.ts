import { ref, refobj, refarr, computed } from "@timeless/reactive";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
  ApplicationModel,
} from "@timeless/kit";

import { For } from "@/reactive/for";
import { View, ViewProps } from "@/content/view";
import {
  ViewChildren,
  TimelessComponent,
  TimelessElement,
} from "@/content/type";
import { LazyView } from "@/content/lazy-view";
import { ErrorFallbackFn, withErrorBoundary } from "@/modules/error-boundary";
import { MountedEvent } from "@/event";

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

  props.view.onCurViewChange((view: SubView) => {
    cur_subview.as(view);
  });
  props.view.onSubViewAppended((v: SubView) => {
    console.log("[KeepAliveSubViews] onSubViewAppended", v);
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
    key: "id",
    each: subviews,
    render(subview) {
      const PageView = props.views[subview.name];
      const idx = subviews.indexOf(subview);
      if (!PageView) {
        return NotFoundPageView;
      }
      return View(
        {
          style: {
            "z-index": idx + 1,
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
          withErrorBoundary(
            () =>
              LazyView(
                {
                  ...props,
                  view: subview,
                },
                PageView,
              ),
            subview.name,
            props.ErrorFallback,
          ),
        ],
      );
    },
    onMounted(event) {
      console.log("the For Mounted in KeepAliveSubViews", event);
      if (props.onMounted) {
        props.onMounted(event);
      }
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
