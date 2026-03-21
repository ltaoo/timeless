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
  ApplicationModel,
} from "@timeless/kit";

import { TimelessComponent, TimelessElement, View, ViewProps } from "./view";
import { For } from "./for";
import { Show } from "./show";
import { LazyView } from "./lazy-view";
import { h } from "./h";

export function StandardSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    views: Record<string, TimelessComponent>;
    app: ApplicationModel<any>;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    NotFound?: (...args: any[]) => TimelessElement;
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
    each: subviews,
    render(subview: any, idx) {
      const PageView = props.views[subview.name];
      if (!PageView) {
        return NotFoundPageView;
      }
      return h(
        Show,
        {
          when: computed(cur_subview, (d) => {
            if (d && d.id === subview.id) {
              return true;
            }
            return false;
          }),
        },
        [
          View(
            {
              style: `z-index: ${idx + 1}; position: absolute; left: 0; top: 0; right: 0; bottom: 0;"`,
              dataset: {
                name: subview.name,
                pathname: subview.pathname,
              },
            },
            [
              LazyView(PageView, {
                ...props,
                view: subview,
                onMounted() {
                  nodes.push(this);
                },
              }),
            ],
          ),
        ],
      );
    },
  });
}
