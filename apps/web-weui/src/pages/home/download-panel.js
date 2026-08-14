import "./download-panel.css";

export function Popover(props, children) {
  const { store, content, ...content_props } = props;

  return Timeless.ui.PopoverPrimitive.Root({}, [
    Fragment({}, children),
    Timeless.ui.PopoverPrimitive.Portal({ store }, [
      Timeless.ui.PopoverPrimitive.Content(
        {
          ...content_props,
          store,
        },
        content,
      ),
    ]),
  ]);
}

export function DownloadIconButton(props) {
  return View(
    {
      class: "download-icon-button",
      attributes: {
        role: "button",
        tabindex: "0",
        "aria-label": "打开下载面板",
        title: "下载",
      },
      onPointerDown(event) {
        props.store.methods.handlePanelTriggerPointerDown(event);
      },
      onKeyDown(event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          props.store.methods.togglePanel();
        }
      },
    },
    [Timeless.Icon({ name: "download", size: 22 })],
  );
}

export function MoreHorizantalIcon() {
  return Timeless.Icon({ name: "ellipsis", size: 20 });
}

function DownloadPanelView(props) {
  const model = props.store;

  return View(
    {
      class: "download-panel",
      onMounted() {
        model.methods.placePanel();
      },
    },
    [
      View({ class: "download-panel__header" }, [
        View({ class: "download-panel__title" }, ["Downloads"]),
        DropdownMenu({ store: model.ui.dropdown$ }, [
          View(
            {
              class: "download-panel__more-button",
              attributes: {
                role: "button",
                tabindex: "0",
                "aria-label": "更多下载操作",
                title: "更多",
              },
              onKeyDown(event) {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  model.methods.toggleMenu();
                }
              },
            },
            [MoreHorizantalIcon()],
          ),
        ]),
      ]),
      View({ class: "download-panel__content" }, [
        Show({
          when: model.state.loading,
          ok() {
            return View({ class: "download-panel__loading" }, [
              View({ class: "download-panel__spinner" }, [
                Timeless.Icon({ name: "loader-circle", size: 22 }),
              ]),
              View({ class: "download-panel__loading-title" }, [
                "Loading downloads…",
              ]),
              View({ class: "download-panel__loading-hint" }, [
                "数据将在 3 秒后加载，用于观察面板向上增长",
              ]),
            ]);
          },
          else() {
            return View({ class: "download-panel__list" }, [
              For({
                key: "id",
                each: model.state.downloads,
                render(item) {
                  return View({ class: "download-panel__item" }, [
                    View({ class: "download-panel__item-icon" }, [
                      Timeless.Icon({ name: "download", size: 16 }),
                    ]),
                    View({ class: "download-panel__item-body" }, [
                      View({ class: "download-panel__item-title" }, [
                        item.title,
                      ]),
                      View({ class: "download-panel__item-meta" }, [item.meta]),
                    ]),
                    View({ class: "download-panel__item-status" }, [
                      Timeless.Icon({ name: "check", size: 14 }),
                    ]),
                  ]);
                },
              }),
            ]);
          },
        }),
      ]),
    ],
  );
}

export function DownloadPanelPopover(props) {
  return Popover(
    {
      store: props.store.ui.popover$,
      content: [DownloadPanelView({ store: props.store })],
    },
    [DownloadIconButton({ store: props.store })],
  );
}
