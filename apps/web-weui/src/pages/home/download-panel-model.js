export function createDownloadPanelModel() {
  const loading_ = ref(true);
  const downloads_ = refarr([], { key: "id" });
  const download_items = [
    {
      id: "video-01",
      title: "WeChat Channels · Product Demo.mp4",
      meta: "MP4 · 24.8 MB",
    },
    {
      id: "video-02",
      title: "Summer travel highlights.mp4",
      meta: "MP4 · 18.2 MB",
    },
    {
      id: "video-03",
      title: "Design review recording.mp4",
      meta: "MP4 · 31.6 MB",
    },
    {
      id: "video-04",
      title: "Weekly team sync.mp4",
      meta: "MP4 · 16.4 MB",
    },
    {
      id: "video-05",
      title: "Launch trailer 4K.mp4",
      meta: "MP4 · 42.1 MB",
    },
    {
      id: "video-06",
      title: "Customer interview.mp4",
      meta: "MP4 · 20.7 MB",
    },
  ];
  let loading_timer = null;

  const popover$ = new Timeless.vm.PopoverCore({
    side: "bottom",
    align: "end",
    destroyOnClose: false,
  });
  popover$.popper.setOffset({ x: 0, y: 8 });

  const model = {
    state: {
      loading: loading_,
      downloads: downloads_,
    },
    ui: {
      popover$,
      dropdown$: null,
    },
    methods: {
      handlePanelTriggerPointerDown(event) {
        const trigger = event.currentTarget;
        const will_open = !popover$.visible;
        if (will_open) {
          model.methods.loadDownloads();
        }
        popover$.popper.setReference(
          {
            $el: trigger,
            getRect() {
              return trigger.getBoundingClientRect();
            },
          },
          { force: true },
        );
        event.preventDefault();
        event.stopPropagation();
        popover$.toggle();
      },
      placePanel() {
        setTimeout(() => {
          popover$.popper.place();
        }, 0);
      },
      togglePanel() {
        const will_open = !popover$.visible;
        if (will_open) {
          model.methods.loadDownloads();
        }
        popover$.toggle();
      },
      loadDownloads() {
        if (loading_timer !== null) {
          clearTimeout(loading_timer);
        }
        downloads_.as([]);
        loading_.as(true);
        loading_timer = setTimeout(() => {
          downloads_.as(download_items.map((item) => ({ ...item })));
          loading_.as(false);
          loading_timer = null;
        }, 3000);
      },
      closeMenu() {
        model.ui.dropdown$.hide();
      },
      closePanel() {
        model.ui.dropdown$.hide();
        popover$.hide();
      },
      selectMenuItem(action) {
        if (action === "refresh") {
          model.methods.loadDownloads();
        }
        model.methods.closeMenu();
      },
      toggleMenu() {
        model.ui.dropdown$.toggle();
      },
    },
  };

  model.ui.dropdown$ = new Timeless.vm.DropdownMenuCore({
    trigger: "hover",
    side: "bottom",
    align: "end",
    items: [
      new Timeless.vm.MenuItemCore({
        label: "刷新",
        onClick() {
          model.methods.selectMenuItem("refresh");
        },
      }),
      new Timeless.vm.MenuItemCore({
        label: "管理下载任务",
        onClick() {
          model.methods.selectMenuItem("manage");
        },
      }),
      new Timeless.vm.MenuItemCore({
        label: "清空下载记录",
        onClick() {
          model.methods.selectMenuItem("clear");
        },
      }),
      new Timeless.vm.MenuItemCore({
        label: "关闭",
        onClick() {
          model.methods.closePanel();
        },
      }),
    ],
  });

  return model;
}
