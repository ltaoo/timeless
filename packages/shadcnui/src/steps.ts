import { View } from "@timeless/headless";
import { For } from "@timeless/headless";
import { Show } from "@timeless/headless";
import { computed } from "@timeless/headless";
import { Txt } from "@timeless/headless";

export function Steps(props: {
  current: number;
  items: any[];
  class?: string;
}) {
  const { current, items, class: cn } = props;

  return View({ class: ["w-full", cn].filter(Boolean).join(" ") }, [
    View({ class: "flex items-center justify-between" }, [
      For({
        each: items,
        render: (item, index) => {
          return View({ class: "flex flex-1 items-center" }, [
            View({ class: "flex flex-col items-center relative z-10" }, [
              View(
                {
                  class: computed({ current }, (d) =>
                    [
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      index < d.current
                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "",
                      index === d.current
                        ? "border-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                        : "",
                      index > d.current
                        ? "border-2 border-zinc-200 text-zinc-500 dark:border-zinc-700"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" "),
                  ),
                },
                [
                  Txt(
                    computed({ current }, (d) =>
                      index < d.current ? "✓" : String(index + 1),
                    ),
                  ),
                ],
              ),
              View(
                {
                  class:
                    "mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400",
                },
                [Txt(item.title)],
              ),
            ]),
            Show({ when: computed({}, () => index < items.length - 1) }, [
              View({
                class: computed({ current }, (d) =>
                  [
                    "h-[2px] w-full flex-1 mx-2 transition-colors",
                    index < d.current
                      ? "bg-zinc-900 dark:bg-zinc-50"
                      : "bg-zinc-200 dark:bg-zinc-700",
                  ].join(" "),
                ),
              }),
            ]),
          ]);
        },
      }),
    ]),
  ]);
}
