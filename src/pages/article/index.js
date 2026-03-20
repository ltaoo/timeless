import { articles } from "./data.js";

export default function ArticleListPageView(props) {
  const curId = ref(props.history.$router.query.id);
  props.history.onRouteChange(({ view }) => {
    console.log(
      "history.onRouteChange",
      view.query.id,
      props.history.$router.query.id,
    );
    if (view.query.id) {
      curId.as(view.query.id);
    }
  });

  return View({ class: "flex w-full h-full bg-white dark:bg-zinc-950" }, [
    View(
      {
        class:
          "w-[240px] h-full border-r border-zinc-200 dark:border-zinc-800 flex flex-col",
      },
      [
        View(
          { class: "px-4 py-4 border-b border-zinc-100 dark:border-zinc-800" },
          [
            View(
              {
                class: "text-sm font-semibold text-zinc-900 dark:text-zinc-100",
              },
              "Articles",
            ),
          ],
        ),
        View({ class: "flex-1 overflow-y-auto py-2" }, [
          For({
            each: articles,
            render(article) {
              return View(
                {
                  class: cn([
                    "mx-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                    computed(curId, (id) =>
                      id === article.id
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                    ),
                  ]),
                  onClick() {
                    curId.as(article.id);
                    props.history.push("root.home_layout.article.content", {
                      id: article.id,
                    });
                  },
                },
                [
                  View(
                    {
                      class: cn([
                        "text-sm leading-relaxed line-clamp-1",
                        computed(curId, (id) =>
                          id === article.id
                            ? "text-zinc-900 font-medium dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-400",
                        ),
                      ]),
                    },
                    article.title,
                  ),
                ],
              );
            },
          }),
        ]),
      ],
    ),
    View({ class: "relative flex-1 w-0 h-full overflow-y-auto" }, [
      RouteSubViews({
        ...props,
      }),
    ]),
  ]);
}
