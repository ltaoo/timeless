import { refobj, refarr, computed } from "../core";
import {
  MountedEvent,
  View,
  ViewChildren,
  TimelessComponent,
  TimelessElement,
  LazyView,
  KeepAlive,
  For,
  ListenerManager,
} from "../core";
import {
  RouteViewCore,
  HistoryCore,
  StorageCore,
  HttpClientCore,
  ApplicationModel,
} from "@timeless/inner-kit";

import { ErrorFallbackFn } from "./error-boundary";

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
  const listener$ = ListenerManager();
  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound();
    }
    return View(
      {
        class: "not-found",
        attributes: { n: "keep-alive-sub-view-not-found" },
      },
      ["Not Found"],
    );
  })();

  return For({
    key: "id",
    each: subviews,
    onMounted(event) {
      // console.log("the For Mounted in KeepAliveSubViews", event);
      listener$.append([
        props.view.onSubViewsChange((views: SubView[]) => {
          subviews.as(views);
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
      const presence_state = refobj(subview.$presence.state);
      const presence_listener$ = ListenerManager([presence_state]);
      const animation = subview.animation || {};

      presence_listener$.add(
        subview.$presence.onStateChange((state: Record<string, boolean>) => {
          presence_state.as(state);
        }),
      );

      return KeepAlive(
        {
          when: computed(presence_state, (state) => {
            return (
              state.mounted && (state.visible || state.enter || state.exit)
            );
          }),
          class: computed(presence_state, (state) => {
            return [
              "route-view",
              state.enter ? animation.in : "",
              state.exit ? animation.out : "",
            ]
              .filter(Boolean)
              .join(" ");
          }),
          style: {
            "z-index": computed(idx, (t) => t + 1),
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            overflow: "auto",
            "overflow-anchor": "none",
          },
          attributes: { n: "keep-alive-sub-view" },
          dataset: {
            name: subview.name,
            pathname: subview.pathname,
          },
          onUnmounted() {
            presence_listener$.destroy();
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
