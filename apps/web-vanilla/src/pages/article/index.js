import { articles, categories } from "./data.js";
import { SidebarLayout } from "@/components/layout.js";

export default function ArticleListPageView(props) {
  const curId = ref(props.view.query.id);

  console.log(
    "[]ArticleListPageView",
    props.view.query,
    props.history.$router.query,
  );

  const categoryId = props.view.query.cate_id;
  const category = categories.find((c) => c.id === categoryId);
  const filteredArticles = articles.filter((a) => a.categoryId === categoryId);

  // 自动选中第一篇文章
  const firstArticle = filteredArticles[0];
  if (firstArticle && !props.view.query.id) {
    curId.as(firstArticle.id);
    props.history.replace("root.home_layout.article.category.content", {
      ...props.view.query,
      id: firstArticle.id,
    });
  }

  props.history.onRouteChange(({ view }) => {
    curId.as(view.query.id);
  });

  return SidebarLayout({
    class: 'h-full',
    sidebarWidth: "240px",
    sidebarClass: "border-r border-zinc-200 dark:border-zinc-800 flex flex-col",
    sidebar: [
      View(
        { class: "px-4 py-4 border-b border-zinc-100 dark:border-zinc-800" },
        [
          View(
            {
              class: "text-sm font-semibold text-zinc-900 dark:text-zinc-100",
            },
            category ? category.name : "Articles",
          ),
        ],
      ),
      View({ class: "flex-1 overflow-y-auto py-2" }, [
        For({
          each: filteredArticles,
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
                  props.history.push(
                    "root.home_layout.article.category.content",
                    { ...props.view.query, id: article.id },
                  );
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
                  [View({}, [article.id, article.title])],
                ),
              ],
            );
          },
        }),
      ]),
    ],
  }, [
    StandardSubViews({
      ...props,
    }),
  ]);
}
