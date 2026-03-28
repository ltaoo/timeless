import { articles, categories } from "./data.js";
import { SidebarLayout } from "@/components/layout.js";

/**
 * @param {ViewComponentProps} props
 * @returns
 */
export default function ArticleListPageView(props) {
  const initialQuery =
    props.view.query && Object.keys(props.view.query).length > 0
      ? props.view.query
      : props.history.$router.query;
  const routeQuery = refobj({ ...initialQuery });
  const curId = ref(routeQuery.value.id);
  const categoryId = ref(routeQuery.value.cate_id);

  const category = computed(categoryId, (id) =>
    categories.find((c) => c.id === id),
  );
  const filteredArticles = computed(categoryId, (id) =>
    articles.filter((a) => a.categoryId === id),
  );

  const syncFromQuery = (q = {}) => {
    const nextCateId = q.cate_id;
    const nextId = q.id;
    categoryId.as(nextCateId);
    curId.as(nextId);

    const list = articles.filter((a) => a.categoryId === nextCateId);
    if (list.length === 0) {
      return;
    }

    const first = list[0];
    const exists = nextId && list.some((a) => a.id === nextId);
    if (!exists) {
      curId.as(first.id);
      props.history.replace("root.home_layout.article.category.content", {
        ...routeQuery.value,
        cate_id: nextCateId,
        id: first.id,
      });
    }
  };

  syncFromQuery(routeQuery.value);
  props.history.onRouteChange(({ view, query }) => {
    const name = String(view?.name || "");
    if (!name.startsWith("root.home_layout.article.")) {
      return;
    }
    routeQuery.as({ ...(query || {}) });
    syncFromQuery(routeQuery.value);
  });

  return SidebarLayout(
    {
      class: "h-full",
      sidebarWidth: "240px",
      sidebarClass:
        "border-r border-zinc-200 dark:border-zinc-800 flex flex-col",
      sidebar: [
        View(
          { class: "px-4 py-4 border-b border-zinc-100 dark:border-zinc-800" },
          [
            View(
              {
                class: "text-sm font-semibold text-zinc-900 dark:text-zinc-100",
              },
              computed(category, (c) => (c ? c.name : "Articles")),
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
                      { ...routeQuery.value, id: article.id },
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
    },
    [StandardSubViews(props)],
  );
}
