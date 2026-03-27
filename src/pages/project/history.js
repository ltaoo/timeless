import { projects } from "./data.js";

const historyItems = [
  { action: "Updated config.yaml", time: "2 hours ago", user: "Alice" },
  { action: "Merged PR #42", time: "5 hours ago", user: "Bob" },
  { action: "Deployed to staging", time: "1 day ago", user: "Charlie" },
  { action: "Added new module", time: "2 days ago", user: "Alice" },
  { action: "Fixed CI pipeline", time: "3 days ago", user: "Dave" },
  { action: "Released v2.1.0", time: "5 days ago", user: "Bob" },
];

export default function ProjectHistoryView(props) {
  const { id } = props.view.query;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return View({ class: "flex items-center justify-center h-full" }, [
      View(
        { class: "text-sm text-zinc-400 dark:text-zinc-500" },
        "Please select a project.",
      ),
    ]);
  }

  return View({ class: "p-8 h-full" }, [
    View({ class: "max-w-3xl mx-auto" }, [
      View(
        {
          class: "text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6",
        },
        `${project.name} - History`,
      ),
      View({ class: "space-y-1" }, [
        For({
          each: historyItems,
          render(item) {
            return View(
              {
                class:
                  "flex items-center gap-4 px-4 py-3 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors",
              },
              [
                View({
                  class:
                    "w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0",
                }),
                View({ class: "flex-1 min-w-0" }, [
                  View(
                    {
                      class:
                        "text-sm text-zinc-900 dark:text-zinc-100 truncate",
                    },
                    item.action,
                  ),
                  View(
                    {
                      class: "text-xs text-zinc-400 dark:text-zinc-500 mt-0.5",
                    },
                    `${item.user} \u00b7 ${item.time}`,
                  ),
                ]),
              ],
            );
          },
        }),
      ]),
    ]),
  ]);
}
