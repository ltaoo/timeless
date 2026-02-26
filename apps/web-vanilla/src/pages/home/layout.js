import { NotFoundPageView } from "../notfound/index.js";

export function HomeLayoutView(props) {
  /** @type {import("@timeless/core").RouteViewCore} */
  const view = props.view;
  const subViews = ref([]);
  const curSubView = ref(view.curView?.name);
  view.onCurViewChange((view) => {
    // console.log("[LAYOUT]handle cur view change", view.name);
    curSubView.value = view.name;
  });
  view.onSubViewAppended((v) => {
    // console.log(
    //   "[]HomeLayoutView - view.onSubViewAppended",
    //   v,
    //   subViews.value.length,
    // );
    subViews.value.push(v);
    // console.log("[]HomeLayoutView - after .push(v)", subViews.value.length);
  });

  // console.log("[]HomeLayoutView - render", props.view, subViews.value);
  return Flex(
    {
      class: "layout_home w-full h-full",
      dataset: {
        name: props.view.name,
        pathname: props.view.pathname,
      },
    },
    [
      View({ class: "sidebar-wrapper w-[72px]" }, [
        For({
          each: [
            {
              id: "root.home_layout.index",
              name: "首页",
            },
            {
              id: "root.home_layout.weui",
              name: "Weui",
            },
          ],
          render(menu) {
            return View(
              {
                class: classnames([
                  "sidebar-item flex items-center justify-center w-full h-[72px] cursor-pointer",
                  (() => {
                    if (curSubView.value === menu.id) {
                      return "bg-[#f5f5f5]";
                    }
                    return "";
                  })(),
                ]),
                onClick() {
                  props.history.push(menu.id);
                },
              },
              [View({}, [Txt(menu.name)])],
            );
          },
        }),
      ]),
      For({
        class: "relative flex-1 w-0 h-full",
        each: subViews,
        render(sub_view) {
          const PageView = props.views[sub_view.name];
          // console.log("[LAYOUT]HomeLayoutView render sub view", sub_view.name);
          if (!PageView) {
            return NotFoundPageView({
              history: props.history,
            });
          }
          const displayed = computed({ curSubView }, (draft) => {
            // console.log(
            //   "reactive the cur subview change",
            //   draft.curSubView,
            //   sub_view.name,
            // );
            return [
              "page absolute inset-0 right-0 h-full",
              (() => {
                if (!draft.curSubView) {
                  return "hidden";
                }
                return draft.curSubView === sub_view.name
                  ? "display"
                  : "hidden";
              })(),
            ].join(" ");
          });
          return View(
            {
              class: classnames([displayed]),
              style: {},
              dataset: {
                name: sub_view.name,
                pathname: sub_view.pathname,
              },
            },
            [
              PageView({
                view: sub_view,
                app: props.app,
                history: props.history,
                storage: props.storage,
                client: props.client,
                views: props.views,
              }),
            ],
          );
        },
      }),
    ],
  );
}
