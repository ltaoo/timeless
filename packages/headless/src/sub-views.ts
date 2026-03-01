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

export function RouteSubViews(
  props: ViewProps & {
    view: RouteViewCore;
    app: ApplicationModel<any>;
    history: HistoryCore<any, any>;
    storage: StorageCore<any>;
    client: HttpClientCore;
    views: Record<string, TimelessComponent>;
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
      return Show(
        {
          when: computed(cur_subview, (d) => d && d.name === subview.name),
        },
        [
          View(
            {
              style: `z-index: ${idx + 1}; position: absolute; width: 100%; height: 100%;"`,
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
