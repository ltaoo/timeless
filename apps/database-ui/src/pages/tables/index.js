import {
  MOCK_TABLES,
  createTablesPageModel,
  formatCell,
  getRowKey,
} from "./index.model.js";

function tableV2Columns(panel) {
  return panel.columns.map(function (column) {
    return {
      key: column.name,
      title: column.name,
      dataIndex: column.name,
      sortable: true,
      searchable: true,
      headerClass:
        "px-3 py-2 text-xs font-medium text-muted-foreground border-r border-border min-w-0 overflow-hidden",
      cellClass: "px-3 py-2 text-sm border-r border-b border-border truncate",
      render: function (item) {
        return formatCell(item[column.name]);
      },
    };
  });
}

function TablePanelView(panel, model) {
  var name = "tables-" + panel.name;
  return Timeless.TableV2({
    rows: panel.data,
    columns: tableV2Columns(panel),
    rowKey: getRowKey(panel.columns),
    name: name,
    searchable: true,
    resizable: true,
    searchPlaceholder: "Search " + panel.name + "...",
    virtual: {
      size: 30,
      buffer: 6,
      itemHeight: 37,
      class: "flex-1 min-h-0",
      style: { height: "100%", overflow: "auto" },
    },
    class: "flex flex-col h-full min-h-0 gap-2 p-2",
    panelClass: "flex-1 min-h-0 overflow-hidden border border-border rounded",
    headerClass: "shrink-0 border-b border-border bg-muted",
    rowClass: "hover:bg-muted/50",
    attributes: { n: name + "-table" },
    onQueryChange: model.methods.onQueryChange,
    onSortChange: model.methods.onSortChange,
  });
}

/** @param {ViewComponentProps} props */
export default function TablesPageView(props) {
  var model = createTablesPageModel(props);
  model.methods.openTable(MOCK_TABLES[MOCK_TABLES.length - 3].name);

  return View(
    {
      class: "h-full",
      attributes: { n: "tables-page" },
      onUnmounted: model.destroy,
    },
    [
      SplitView({
        resizable: true,
        class: "h-full",
        attributes: { n: "tables-layout" },
        panels: [
          {
            size: 220,
            minSize: 160,
            style: { overflow: "hidden" },
            content: function () {
              return View(
                {
                  class: "flex flex-col h-full border-r border-border",
                  attributes: { n: "tables-sidebar" },
                },
                [
                  View(
                    {
                      class: "p-3 shrink-0",
                      attributes: { n: "tables-sidebar-search" },
                    },
                    [
                      Timeless.Input({
                        value: model.state.searchText,
                        placeholder: "Search tables...",
                        attributes: {
                          n: "tables-sidebar-search-input",
                          "aria-label": "Search tables",
                        },
                        onInput: function (event) {
                          model.methods.setSearchText(
                            String(event.target?.value || ""),
                          );
                        },
                      }),
                    ],
                  ),
                  View(
                    {
                      class: "flex-1 overflow-y-auto",
                      attributes: {
                        n: "tables-sidebar-list",
                        role: "navigation",
                        "aria-label": "Database tables",
                      },
                    },
                    [
                      For({
                        each: model.state.visibleTables,
                        key: "name",
                        render: function (table) {
                          var is_active_ = computed(
                            model.state.currentPanel,
                            function (name) {
                              return name === table.name;
                            },
                          );
                          return Timeless.Button(
                            {
                              class: Timeless.classNames([
                                "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-left select-none transition-colors",
                                computed(is_active_, function (active) {
                                  return active
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "hover:bg-muted text-foreground";
                                }),
                              ]),
                              attributes: {
                                n: "tables-open-" + table.name,
                                type: "button",
                                "aria-current": is_active_,
                              },
                              onClick: function () {
                                model.methods.openTable(table.name);
                              },
                            },
                            [
                              Icon({
                                name: "table",
                                size: 14,
                                attributes: {
                                  n: "tables-" + table.name + "-icon",
                                  "aria-hidden": "true",
                                },
                              }),
                              View(
                                {
                                  class: "truncate",
                                  attributes: {
                                    n: "tables-" + table.name + "-name",
                                  },
                                },
                                [table.name],
                              ),
                              View(
                                {
                                  class:
                                    "ml-auto text-xs text-muted-foreground",
                                  attributes: {
                                    n: "tables-" + table.name + "-column-count",
                                  },
                                },
                                [String(table.columns.length)],
                              ),
                            ],
                          );
                        },
                      }),
                    ],
                  ),
                ],
              );
            },
          },
          {
            size: "auto",
            style: { overflow: "hidden" },
            content: function () {
              return View(
                {
                  class: "flex flex-col h-full",
                  attributes: { n: "tables-main" },
                },
                [
                  View(
                    {
                      class:
                        "flex items-center border-b border-border shrink-0 overflow-x-auto",
                      attributes: {
                        n: "tables-tabs",
                        role: "tablist",
                        "aria-label": "Open tables",
                      },
                    },
                    [
                      For({
                        each: model.state.panels,
                        key: "name",
                        render: function (panel) {
                          var is_active_ = computed(
                            model.state.currentPanel,
                            function (name) {
                              return name === panel.name;
                            },
                          );
                          return View(
                            {
                              class: Timeless.classNames([
                                "flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer select-none border-b-2 transition-colors shrink-0",
                                computed(is_active_, function (active) {
                                  return active
                                    ? "border-primary text-foreground font-medium"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50";
                                }),
                              ]),
                              attributes: {
                                n: "tables-tab-" + panel.name,
                                role: "tab",
                                tabindex: "0",
                                "aria-selected": is_active_,
                              },
                              onClick: function () {
                                model.methods.switchTable(panel.name);
                              },
                              onKeyDown: function (event) {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  model.methods.switchTable(panel.name);
                                }
                              },
                            },
                            [
                              View(
                                {
                                  class: "truncate max-w-[160px]",
                                  attributes: {
                                    n: "tables-tab-" + panel.name + "-label",
                                  },
                                },
                                [panel.name],
                              ),
                              Timeless.Button(
                                {
                                  class:
                                    "flex items-center justify-center w-4 h-4 rounded hover:bg-muted-foreground/20 shrink-0",
                                  attributes: {
                                    n: "tables-close-" + panel.name,
                                    type: "button",
                                    "aria-label": "Close " + panel.name,
                                  },
                                  onClick: function (event) {
                                    event.stopPropagation();
                                    model.methods.closeTable(panel.name);
                                  },
                                },
                                [
                                  Icon({
                                    name: "x",
                                    size: 12,
                                    attributes: {
                                      n: "tables-close-" + panel.name + "-icon",
                                      "aria-hidden": "true",
                                    },
                                  }),
                                ],
                              ),
                            ],
                          );
                        },
                      }),
                    ],
                  ),
                  View(
                    {
                      class: "flex-1 min-h-0",
                      attributes: { n: "tables-content" },
                    },
                    [
                      Show({
                        when: computed(
                          model.state.currentPanel,
                          function (name) {
                            return !name;
                          },
                        ),
                        ok: function () {
                          return View(
                            {
                              class:
                                "flex items-center justify-center h-full text-sm text-muted-foreground",
                              attributes: {
                                n: "tables-empty",
                                role: "status",
                              },
                            },
                            [
                              "Select a table from the sidebar to view its data",
                            ],
                          );
                        },
                      }),
                      For({
                        each: model.state.panels,
                        key: "name",
                        render: function (panel) {
                          return Show({
                            when: computed(
                              model.state.currentPanel,
                              function (name) {
                                return name === panel.name;
                              },
                            ),
                            ok: function () {
                              return TablePanelView(panel, model);
                            },
                          });
                        },
                      }),
                    ],
                  ),
                ],
              );
            },
          },
        ],
      }),
    ],
  );
}
