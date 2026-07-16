const { View, Text } = Timeless;
import { projects } from "./data.js";

export default function ProjectWorkspaceView(props) {
  const { id } = props.view.query;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return View({ class: "flex items-center justify-center h-full" }, [
      View(
        { class: "text-sm text-zinc-400 dark:text-zinc-500" },
        ["Please select a project."],
      ),
    ]);
  }

  return View({ class: "p-8 h-full" }, [
    View({ class: "max-w-3xl mx-auto" }, [
      View(
        {
          class: "text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2",
        },
        [project.name],
      ),
      View(
        { class: "text-sm text-zinc-500 dark:text-zinc-400 mb-6" },
        [project.description],
      ),
      View(
        {
          class: "rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-900",
        },
        [
          View(
            {
              class: "text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4",
            },
            ["Workspace"],
          ),
          View({ class: "grid grid-cols-2 gap-4" }, [
            WorkspaceCard("Files", "128 files"),
            WorkspaceCard("Members", "6 members"),
            WorkspaceCard("Tasks", "23 open"),
            WorkspaceCard("Updated", project.updatedAt),
          ]),
        ],
      ),
    ]),
  ]);
}

function WorkspaceCard(label, value) {
  return View(
    {
      class: "rounded-md border border-zinc-200 dark:border-zinc-700 p-4",
    },
    [
      View({ class: "text-xs text-zinc-400 dark:text-zinc-500 mb-1" }, [label]),
      View(
        { class: "text-sm font-medium text-zinc-900 dark:text-zinc-100" },
        [value],
      ),
    ],
  );
}
