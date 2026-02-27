import { NotFoundPageView } from "../notfound/index.js";

export function HomeLayoutView(props) {
  const view = props.view;
  const subViews = refarr([]);
  const curSubView = refobj(view.curView);
  view.onCurViewChange((view) => {
    curSubView.as(view);
  });
  view.onSubViewAppended((v) => {
    subViews.push(v);
  });

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
              id: "root.home_layout.logic",
              name: "Logic",
            },
          ],
          render(menu) {
            return View(
              {
                class: cn([
                  "sidebar-item flex items-center justify-center w-full h-[72px] cursor-pointer",
                  computed(curSubView, (s) => {
                    return s && s.name === menu.id ? "bg-[#f5f5f5]" : "";
                  }),
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
          if (!PageView) {
            return NotFoundPageView({
              history: props.history,
            });
          }
          const displayed = computed(curSubView, (s) => {
            return [
              "page absolute inset-0 right-0 h-full",
              s && s.name === sub_view.name ? "display" : "hidden",
            ].join(" ");
          });
          return View(
            {
              class: displayed,
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
