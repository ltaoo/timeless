import {
  computed,
  combine,
  refarr,
  refobj,
  ref,
  Icon,
} from "@timeless/timeless";
import { View, ViewProps, For, Show } from "@timeless/timeless";
import { HistoryCore } from "@timeless/kit";

export function HistoryPanel(
  props: ViewProps & { store: HistoryCore<string, any> },
) {
  const { store, class: cn, ...rest } = props;

  const state = refobj(store.state);
  const histories = refarr(store.$router.histories);
  const collapsed = ref(true);

  store.onStateChange((v) => {
    state.as(v);
  });
  store.$router.onHistoriesChange((v) => {
    histories.as(v);
  });

  const href = computed(state, (s) => s.href);
  const stacks = computed(state, (s) => s.stacks);
  const cursor = computed(state, (s) => s.cursor);

  return View(
    {
      ...rest,
      class: "z-[1000] fixed left-2 bottom-2 right-2",
    },
    [
      View(
        {
          class:
            "rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-zinc-900/50",
        },
        [
          View(
            {
              class:
                "flex items-center justify-between px-4 py-2 cursor-pointer",
              onClick: () => collapsed.as(!collapsed.value),
            },
            [
              View(
                {
                  class:
                    "px-3 py-1.5 rounded-md bg-zinc-100 text-sm font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                },
                [href],
              ),
              Show({
                when: collapsed,
                ok() {
                  return [
                    View({ class: "text-zinc-500 dark:text-zinc-400" }, [
                      Icon({ name: "chevron-right", size: 16 }),
                    ]),
                  ];
                },
              }),
              Show({
                when: computed(collapsed, (c) => !c),
                ok() {
                  return [
                    View({ class: "text-zinc-500 dark:text-zinc-400" }, [
                      Icon({ name: "arrow-down-to-line", size: 16 }),
                    ]),
                  ];
                },
              }),
            ],
          ),
          Show({
            when: computed(collapsed, (c) => !c),
            ok() {
              return [
                View({ class: "p-4 pt-0" }, [
                  View({ class: "mt-4" }, [
                    View(
                      {
                        class:
                          "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
                      },
                      ["路由栈"],
                    ),
                    View(
                      {
                        class:
                          "mt-2 flex space-x-2 max-w-full overflow-x-auto pb-2",
                      },
                      [
                        For({
                          each: stacks,
                          render(stack, index) {
                            const { key, title, query } = stack;
                            return View(
                              {
                                class:
                                  "relative shrink-0 p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
                              },
                              [
                                View(
                                  {
                                    class:
                                      "text-sm font-medium text-zinc-900 dark:text-zinc-100",
                                  },
                                  [key],
                                ),
                                View(
                                  {
                                    class:
                                      "mt-0.5 text-xs text-zinc-500 dark:text-zinc-400",
                                  },
                                  [title],
                                ),
                                View(
                                  {
                                    class:
                                      "my-2 p-2 max-h-[120px] rounded-md bg-zinc-100 overflow-auto dark:bg-zinc-800",
                                    style: { "font-size": "11px" },
                                  },
                                  [
                                    View(
                                      {
                                        as: "pre",
                                        class:
                                          "text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-all",
                                      },
                                      [query],
                                    ),
                                  ],
                                ),
                                Show({
                                  when: combine(
                                    { cursor, index },
                                    (t) => t.index === t.cursor,
                                  ),
                                  ok() {
                                    return [
                                      View(
                                        {
                                          class:
                                            "absolute -bottom-2 left-1/2 -translate-x-1/2 text-zinc-900 dark:text-zinc-100",
                                        },
                                        ["▲"],
                                      ),
                                    ];
                                  },
                                }),
                              ],
                            );
                          },
                        }),
                      ],
                    ),
                  ]),
                  View(
                    {
                      class:
                        "mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800",
                    },
                    [
                      View(
                        {
                          class:
                            "text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400",
                        },
                        ["历史记录"],
                      ),
                      View(
                        {
                          class:
                            "mt-2 flex items-center space-x-3 overflow-x-auto",
                        },
                        [
                          For({
                            each: histories,
                            render(history) {
                              const { pathname } = history;
                              return View(
                                {
                                  class:
                                    "shrink-0 px-2.5 py-1 rounded-md bg-zinc-100 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                                },
                                [pathname],
                              );
                            },
                          }),
                        ],
                      ),
                    ],
                  ),
                ]),
              ];
            },
          }),
        ],
      ),
    ],
  );
}
