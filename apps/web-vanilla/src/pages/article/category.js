import { articles, categories } from "./data.js";
import { SidebarLayout } from "@/components/layout.js";

export default function ArticleCategoryListPageView(props) {
  const curCateId = ref(props.history.$router.query.cate_id);

  const articlesByCategory = categories.map((category) => ({
    ...category,
    articles: articles.filter((a) => a.categoryId === category.id),
  }));

  props.history.onRouteChange(({ view }) => {
    curCateId.as(view.query.cate_id);
  });

  return SidebarLayout({
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
            "Articles",
          ),
        ],
      ),
      View({ class: "flex-1 overflow-y-auto py-2" }, [
        For({
          each: articlesByCategory,
          render(category) {
            return View(
              {
                class: classNames([
                  "mx-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                  computed(curCateId, (id) =>
                    id === category.id
                      ? "bg-zinc-100 dark:bg-zinc-800"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
                  ),
                ]),
                onClick() {
                  curCateId.as(category.id);
                  props.history.push("root.home_layout.article.category", {
                    cate_id: category.id,
                  });
                },
              },
              [
                View(
                  {
                    class: classNames([
                      "text-sm leading-relaxed",
                      computed(curCateId, (id) =>
                        id === category.id
                          ? "text-zinc-900 font-medium dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-400",
                      ),
                    ]),
                  },
                  category.name,
                ),
                View(
                  {
                    class: "text-xs text-zinc-400 dark:text-zinc-500 mt-0.5",
                  },
                  `${category.articles.length} 篇文章`,
                ),
              ],
            );
          },
        }),
      ]),
    ],
  }, [
    h(StandardSubViews, {
      ...props,
    }),
  ]);
}
