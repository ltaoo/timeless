import { fetchDownloadList } from "@/biz/request.js";

export default function OverlayView() {
  const contextFocusedRecord_ = refobj(null);

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
  const client$ = new Timeless.HttpClientCore({});
  // @ts-ignore
  client$.fetch = async (options) => {
    console.log("index.debug.js - client$.fetch", options);

    // @ts-ignore
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
  const list$ = new Timeless.ListCore(
    new Timeless.RequestCore(fetchDownloadList, {
      process(tmp) {
        console.log("index.debug.js - client$.fetch", tmp);
        if (tmp.error) {
          return tmp.error;
        }
        return Timeless.Result.Ok({
          list: tmp.data.list.map((v) => {
            return {
              value: v.id,
              label: v.name,
            };
          }),
        });
      },
      client: client$,
    }),
    { pageSize: 60 },
  );

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
    // view$ = new Timeless.ui.ScrollViewCore({});
    hourview$: new Timeless.ui.ScrollViewCore({}),
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
              ui.contextMenu$.hide({ reason: "manual" });
            }
          },
        }),
      ],
    }),
  };

  // ui.contextMenu$.menu.onHide(() => {
  //   contextFocusedRecord_.as(null);
  // });

  // list$.init();
  const state_ = refobj({
    open: false,
  });
  const checked_ = ref(true);

  const platform = getPlatform();
  const search_select$ = new Timeless.ui.SelectCore({
    platform,
    defaultValue: null,
    placeholder: "输入关键词搜索",
    options: [],
    search: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "输入水果名...",
    }),
  });

  const handleSearch = Timeless.utils.debounce(200, async function (keyword) {
    await list$.search({ keyword });
    search_select$.finishSearch();
  });

  search_select$.input$.onChange((v) => {
    if (!search_select$.can_search) {
      return;
    }
    search_select$.startSearch();
    handleSearch(v);
  });
  list$.onDataSourceChange(({ dataSource, reason }) => {
    console.log("index.debug.js - list$.onDataSourceChange", dataSource);
    search_select$.setOptions(
      dataSource.map((item) => {
        return new Timeless.ui.SelectItemCore({
          value: item.value,
          label: item.label,
        });
      }),
    );
    // if (reason === "init") {
    //   ui.waterfall$.methods.appendItems(dataSource);
    // }
  });
  list$.onDataSourceAdded((items) => {
    ui.waterfall$.methods.appendItems(items);
  });

  list$.init();

  return ScrollView(
    {
      class: "p-6 h-screen",
      store: ui.view$,
    },
    [
      View(
        {
          style: {
            height: "1200px",
          },
        },
        [],
      ),
      Select({
        store: search_select$,
      }),
      View(
        {
          style: {
            height: "1200px",
          },
        },
        [],
      ),
      // Button(
      //   {
      //     store: new Timeless.ui.ButtonCore({
      //       onClick() {
      //         console.log("123");
      //         checked_.toggle();
      //       },
      //     }),
      //   },
      //   ["Click it"],
      // ),
      // Show({
      //   when: checked_,
      //   ok() {
      //     return Portal({}, [
      //       View(
      //         {
      //           style: {
      //             "z-index": 300,
      //             position: "fixed",
      //             top: "120px",
      //             right: "120px",
      //             width: "200px",
      //             height: "120px",
      //             border: "1px solid #ccc",
      //           },
      //           onMouseEnter() {
      //             console.log("enter");
      //           },
      //           onMouseLeave() {
      //             console.log("leave");
      //           },
      //         },
      //         ["Checked!"],
      //       ),
      //     ]);
      //   },
      // }),
    ],
  );
}
