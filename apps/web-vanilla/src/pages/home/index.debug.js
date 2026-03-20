import { Section, Item } from "@/components/index.js";

export default function OverlayView() {
  const ITEM_HEIGHT = 56;
  let nextId = 1;
  const TOTAL = 50;

  const fileNames = [
    "project-archive.zip",
    "design-assets.psd",
    "video-tutorial.mp4",
    "database-backup.sql",
    "photo-gallery.jpg",
    "report-2024.pdf",
    "music-collection.mp3",
    "source-code.tar.gz",
    "presentation.pptx",
    "firmware-update.bin",
    "app-installer.dmg",
    "font-pack.otf",
    "dataset-train.csv",
    "wallpaper-4k.png",
    "ebook-guide.epub",
  ];

  function generateDownloads(count) {
    return Array.from({ length: count }, () => {
      const id = nextId++;
      return {
        id,
        name: fileNames[(id - 1) % fileNames.length],
        size: Math.floor(Math.random() * 500000000) + 1000000,
        status: "completed",
        progress: 100,
        height: ITEM_HEIGHT,
      };
    });
  }

  // Mock HttpClient
  const mockClient = new Timeless.HttpClientCore({});
  mockClient.fetch = async (options) => {
    const url = new URL(options.url, "http://localhost");
    const page = Number(url.searchParams.get("page")) || 1;
    const pageSize = Number(url.searchParams.get("pageSize")) || 10;
    await new Promise((r) => setTimeout(r, 300));
    return {
      data: {
        list: generateDownloads(pageSize),
        page,
        pageSize,
        total: TOTAL,
      },
    };
  };

  /** @param {Record<string, any>} params */
  function fetchDownloadList(params) {
    return { url: "/api/mock/downloads", method: "GET", query: params };
  }

  const list$ = new Timeless.ListCore(
    new Timeless.RequestCore(fetchDownloadList, { client: mockClient }),
    { pageSize: 10 },
  );

  const contextFocusedRecord_ = refobj(null);

  const ui = {
    view$: new Timeless.ui.ScrollViewCore({
      onScroll(pos) {
        ui.waterfall$.methods.handleScroll({ scrollTop: pos.scrollTop });
      },
      async onReachBottom() {
        await list$.loadMore();
        ui.view$.finishLoadingMore();
      },
    }),
    waterfall$: Timeless.ui.WaterfallModel({
      column: 1,
      size: 10,
      buffer: 3,
      gutter: 0,
    }),
    contextMenu$: new Timeless.ui.ContextMenuCore({
      offsetY: -6,
      items: [
        new Timeless.ui.MenuItemCore({
          label: "Delete",
          onClick() {
            if (contextFocusedRecord_.value) {
              const record = contextFocusedRecord_.value;
              ui.waterfall$.methods.deleteCell((item) => item.id === record.id);
              list$.deleteItem((item) => item.id === record.id);
              ui.contextMenu$.hide();
            }
          },
        }),
      ],
    }),
  };

  ui.contextMenu$.menu.onHide(() => {
    contextFocusedRecord_.as(null);
  });

  list$.onDataSourceChange(({ dataSource, reason }) => {
    if (reason === "init") {
      ui.waterfall$.methods.appendItems(dataSource);
    }
  });
  list$.onDataSourceAdded((items) => {
    ui.waterfall$.methods.appendItems(items);
  });

  list$.init();

  return View({ class: "space-y-8" }, [
    // Section("Popover", [
    //   Item("Default", [
    //     Popover(
    //       {
    //         store: new Timeless.ui.PopoverCore({
    //           align: "middle",
    //         }),
    //         title: [
    //           View(
    //             {
    //               class:
    //                 "w-[200px] h-[30px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
    //             },
    //             [Txt("Popover Title")],
    //           ),
    //         ],
    //         content: [
    //           View(
    //             {
    //               class:
    //                 "w-[200px] h-[100px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
    //             },
    //             [Txt("Popover Content")],
    //           ),
    //         ],
    //       },
    //       [
    //         Button(
    //           {
    //             variant: "outline",
    //             store: new Timeless.ui.ButtonCore({}),
    //           },
    //           ["Open Popover"],
    //         ),
    //       ],
    //     ),
    //   ]),
    //   Item("Left Side", [
    //     Popover(
    //       {
    //         store: new Timeless.ui.PopoverCore({
    //           side: "right",
    //           align: "start",
    //         }),
    //         title: [
    //           View(
    //             {
    //               class:
    //                 "w-[200px] h-[30px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
    //             },
    //             [Txt("Popover Title")],
    //           ),
    //         ],
    //         content: [
    //           View(
    //             {
    //               class:
    //                 "w-[200px] h-[100px] bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 select-none",
    //             },
    //             [Txt("Popover Content")],
    //           ),
    //         ],
    //       },
    //       [
    //         Button(
    //           {
    //             variant: "outline",
    //             store: new Timeless.ui.ButtonCore({}),
    //           },
    //           ["Open Popover"],
    //         ),
    //       ],
    //     ),
    //   ]),
    // ]),

    // Section("Dropdown Menu", [
    //   Item("Default", [
    //     DropdownMenu(
    //       {
    //         store: new Timeless.ui.DropdownMenuCore({
    //           items: [
    //             new Timeless.ui.MenuItemCore({
    //               label: "Edit",
    //               onClick() {
    //                 console.log("edit");
    //               },
    //             }),
    //             new Timeless.ui.MenuItemCore({
    //               label: "More",
    //               menu: new Timeless.ui.MenuCore({
    //                 items: [
    //                   new Timeless.ui.MenuItemCore({
    //                     label: "Duplicated",
    //                     onClick() {
    //                       console.log("duplicated");
    //                     },
    //                   }),
    //                   new Timeless.ui.MenuItemCore({
    //                     label: "Duplicated2",
    //                     menu: new Timeless.ui.MenuCore({
    //                       items: [
    //                         new Timeless.ui.MenuItemCore({
    //                           label: "click it",
    //                           onClick() {
    //                             console.log("123");
    //                           },
    //                         }),
    //                       ],
    //                     }),
    //                     onClick() {
    //                       console.log("duplicated");
    //                     },
    //                   }),
    //                 ],
    //               }),
    //               onClick() {
    //                 console.log("more");
    //               },
    //             }),
    //             new Timeless.ui.MenuItemCore({
    //               label: "Delete",
    //               onClick() {
    //                 console.log("delete");
    //               },
    //             }),
    //           ],
    //         }),
    //       },
    //       [
    //         Button(
    //           {
    //             variant: "outline",
    //             store: new Timeless.ui.ButtonCore({
    //               onClick() {
    //                 console.log("click Open Menu");
    //               },
    //             }),
    //           },
    //           ["Open Menu"],
    //         ),
    //       ],
    //     ),
    //   ]),
    // ]),
    View({ class: "h-[300px]" }, [
      ScrollView(
        {
          store: ui.view$,
          class: "bg-white dark:bg-zinc-950",
        },
        [
          ContextMenu({ store: ui.contextMenu$ }, [
            Waterfall({
              store: ui.waterfall$,
              class: "bg-white dark:bg-zinc-950 !overflow-visible !h-auto",
              /** @param {{ id: number; name: string; size: number}} task  */
              render(task) {
                return View(
                  {
                    // "data-context-id": task.id,
                    class: cn([
                      "flex items-center gap-3 px-3 py-2.5",
                      "border-b border-zinc-100 dark:border-zinc-800",
                      "transition-colors",
                      computed(contextFocusedRecord_, (t) => {
                        return t && t.id === task.id
                          ? "bg-blue-50 dark:bg-blue-950/30"
                          : "";
                      }),
                    ]),
                    onContextMenu(event) {
                      contextFocusedRecord_.as(task);
                    },
                  },
                  [
                    View(
                      {
                        class: cn([
                          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                          "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
                        ]),
                      },
                      [
                        (() => {
                          if (task.name) {
                            const ext = task.name
                              .split(".")
                              .pop()
                              .toUpperCase();
                            return ext.length <= 4 ? ext : "FILE";
                          }
                          return "FILE";
                        })(),
                      ],
                    ),
                    View({ class: "flex-1 min-w-0" }, [
                      View(
                        {
                          class:
                            "text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate",
                        },
                        [task.name],
                      ),
                      View(
                        {
                          class: "mt-0.5 text-xs text-emerald-500",
                        },
                        [task.size],
                      ),
                    ]),
                    View(
                      {
                        class:
                          "flex-shrink-0 text-xs text-emerald-500 font-medium",
                      },
                      ["Done"],
                    ),
                  ],
                );
              },
            }),
          ]),
          View(
            {
              class: cn(["py-3 text-center text-xs text-zinc-400"]),
            },
            [Txt("Scroll to bottom to load more")],
          ),
        ],
      ),
    ]),
  ]);
}
