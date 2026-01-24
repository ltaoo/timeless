import { SidebarView } from "../../components/sidebar.js";
import { NotFoundPageView } from "../notfound/index.js";

export function HomeLayoutView(props) {
  /** @type {Timeless.RouteViewCore} */
  const view = props.view;
  const subViews = ref([]);
  const curSubView = ref(view.curView?.name);
  view.onCurViewChange((view) => {
    console.log("[LAYOUT]handle cur view change", view.name);
    curSubView.value = view.name;
  });
  view.onSubViewAppended((v) => {
    console.log(
      "[]HomeLayoutView - view.onSubViewAppended",
      v,
      subViews.value.length,
    );
    subViews.value.push(v);
    console.log("[]HomeLayoutView - after .push(v)", subViews.value.length);
  });

  console.log("[]HomeLayoutView - render", props.view, subViews.value);
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
        SidebarView({
          onClick(menu) {
            console.log("Navigate to:", menu);
            props.history.push(menu.id);
          },
        }),
      ]),
      For({
        class: "flex-1 w-0 h-full",
        each: subViews,
        render(sub_view) {
          const PageView = props.views[sub_view.name];
          console.log("[LAYOUT]HomeLayoutView render sub view", sub_view.name);
          if (!PageView) {
            return NotFoundPageView({
              history: props.history,
            });
          }
          const displayed = computed({ curSubView }, (draft) => {
            console.log(
              "reactive the cur subview change",
              draft.curSubView,
              sub_view.name,
            );
            return [
              "page absolute inset-0 left-[72px] right-0 h-full",
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
              class: classnames(displayed),
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
