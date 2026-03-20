import { articles } from "./data.js";

export default function ArticleContentPageView(props) {
  const { id } = props.view.query;
  console.log('[]ArticleContentPageView create', id);

  const article = refobj(null);
  const loading = ref(true);

  loading.as(false);
  const matched = articles.find((v) => v.id === id);
  if (!matched) {
    return;
  }
  article.as(matched);

  return View({ class: "h-full" }, [
    Show(
      {
        when: computed(loading, (l) => l),
      },
      [
        View({ class: "flex items-center justify-center h-full" }, [
          View({ class: "flex flex-col items-center gap-3" }, [
            View({
              class:
                "w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin dark:border-zinc-600 dark:border-t-zinc-300",
            }),
            View(
              { class: "text-sm text-zinc-400 dark:text-zinc-500" },
              "Loading...",
            ),
          ]),
        ]),
      ],
    ),
    Show(
      {
        when: computed(article, (t) => !!t),
      },
      [h(ArticleContent, { data: article })],
    ),
  ]);
}

function ArticleContent(props) {
  return View({ class: "max-w-2xl mx-auto px-8 py-10" }, [
    View({ class: "mb-8" }, [
      View(
        {
          class:
            "text-2xl font-bold text-zinc-900 leading-tight dark:text-zinc-100",
        },
        computed(props.data, (d) => d?.title || ""),
      ),
    ]),
    Separator({ orientation: "horizontal" }),
    View({ class: "mt-6" }, [
      View(
        {
          class: "text-base text-zinc-700 leading-relaxed dark:text-zinc-300",
        },
        computed(props.data, (d) => d?.content || ""),
      ),
    ]),
  ]);
}
