const { View } = Timeless;

export default function SettingsPageView(props) {
  return View({ class: "p-6 max-w-2xl space-y-8" }, [
    // Header Section
    View(
      { class: "space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-6" },
      [
        View(
          {
            class: "text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50",
          },
          ["Timeless"],
        ),
        View(
          { class: "text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed" },
          ["A frontend framework/scaffold designed for building code with long-lasting vitality"],
        ),
      ],
    ),

    // Content Section
    View({ class: "space-y-6" }, [
      View({ class: "text-base text-zinc-700 dark:text-zinc-300" }, [
        "Core features are platform and framework agnostic, including",
      ]),

      // List
      View({ class: "space-y-3 pl-4" }, [
        View({ class: "flex items-center gap-3" }, [
          View({ class: "w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" }),
          View({ class: "text-sm text-zinc-600 dark:text-zinc-400" }, [
            "API requests",
          ]),
        ]),
        View({ class: "flex items-center gap-3" }, [
          View({ class: "w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" }),
          View({ class: "text-sm text-zinc-600 dark:text-zinc-400" }, [
            "Data persistence",
          ]),
        ]),
        View({ class: "flex items-center gap-3" }, [
          View({ class: "w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" }),
          View({ class: "text-sm text-zinc-600 dark:text-zinc-400" }, ["Routing"]),
        ]),
        View({ class: "flex items-center gap-3" }, [
          View({ class: "w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" }),
          View({ class: "text-sm text-zinc-600 dark:text-zinc-400" }, [
            "Common UI components",
          ]),
        ]),
      ]),
    ]),
  ]);
}
