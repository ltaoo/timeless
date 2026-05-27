import {
  MOCK_TABLES,
  generateMockRows,
  formatCell,
  getRowKey,
} from "./index.model.js";

function ColumnResizeHandler(colIdx, colWidths_, opts) {
  // Resize only the column to the LEFT of the handle (mainstream behavior:
  // Excel, Google Sheets, DataGrip, etc.). Right column stays fixed width.
  var leftIdx = colIdx + 1;
  var MIN = 50;
  var onLeft = !!(opts && opts.onLeft);

  return View({
    class: onLeft
      ? "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize"
      : "absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize",
    style: onLeft
      ? { "margin-left": "-3px", "z-index": "1" }
      : { "margin-right": "-3px", "z-index": "1" },
    onMounted(event) {
      var $el = event.target.get$elm();

      // 1px visible line in the center, non-interactive
      var $line = document.createElement("div");
      Object.assign($line.style, {
        position: "absolute",
        left: "50%",
        top: "0",
        bottom: "0",
        width: "1px",
        marginLeft: "-0.5px",
        pointerEvents: "none",
        backgroundColor: "var(--border)",
      });
      $el.appendChild($line);

      // Hover highlight: blue glow on hover
      function onEnter() {
        $line.style.backgroundColor = "var(--primary)";
        $line.style.width = "2px";
        $line.style.marginLeft = "-1px";
      }
      function onLeave() {
        $line.style.backgroundColor = "var(--border)";
        $line.style.width = "1px";
        $line.style.marginLeft = "-0.5px";
      }
      $el.addEventListener("pointerenter", onEnter);
      $el.addEventListener("pointerleave", onLeave);

      function onDown(e) {
        e.preventDefault();
        e.stopPropagation();
        $el.setPointerCapture(e.pointerId);
        var startX = e.clientX;
        var startLeft = colWidths_.value[leftIdx];

        function onMove(me) {
          var delta = me.clientX - startX;
          // For left-side handles, negate delta: dragging left should expand the column
          if (onLeft) delta = -delta;
          var arr = colWidths_.value.slice();
          arr[leftIdx] = Math.max(MIN, startLeft + delta);
          colWidths_.as(arr);
        }

        function onUp() {
          $el.removeEventListener("pointermove", onMove);
          $el.removeEventListener("pointerup", onUp);
          $el.removeEventListener("pointercancel", onUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        $el.addEventListener("pointermove", onMove);
        $el.addEventListener("pointerup", onUp);
        $el.addEventListener("pointercancel", onUp);
      }

      $el.addEventListener("pointerdown", onDown);
    },
  });
}

// ============================================================
// Main component
// ============================================================

/**
 * @typedef {Object} TablePanel
 * @property {string} name
 * @property {Array<{name: string, type: string}>} columns
 * @property {ReturnType<typeof refarr>} data
 * @property {import("@timeless/timeless").Ref<boolean>} loaded
 * @property {import("@timeless/timeless").Ref<boolean>} loading
 */

/** @param {ViewComponentProps} props */
export default function TablesPageView(props) {
  var tables_ = refarr(MOCK_TABLES);
  var panels_ = refarr(/** @type {TablePanel[]} */ ([]));
  var curPanel_ = ref(null);
  var searchText_ = ref("");

  function findPanel(name) {
    if (!name) return null;
    // return panels_.find((ps) => ps.name === name) ?? null;
    var ps = panels_.value;
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].name === name) return ps[i];
    }
    return null;
  }

  function openTable(name) {
    var existing = findPanel(name);
    if (existing) {
      curPanel_.as(name);
      return;
    }

    var tables = tables_.value;
    var tableMeta = null;
    for (var i = 0; i < tables.length; i++) {
      if (tables[i].name === name) {
        tableMeta = tables[i];
        break;
      }
    }
    if (!tableMeta) return;

    var panel = {
      name: name,
      columns: tableMeta.columns,
      data: refarr(/** @type {{}[]} */ ([])),
      loaded: ref(false),
      loading: ref(true),
    };
    panels_.push(panel);
    curPanel_.as(name);

    setTimeout(function () {
      var rowCount = name === "tags" ? 10 : 5000;
      var rows = generateMockRows(name, rowCount);
      panel.data.as(rows);
      panel.loading.as(false);
      panel.loaded.as(true);
    }, 200);
  }

  function closeTable(name, e) {
    if (e) e.stopPropagation();

    var ps = panels_.value;
    var idx = -1;
    for (var i = 0; i < ps.length; i++) {
      if (ps[i].name === name) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return;

    panels_.remove(idx);

    if (curPanel_.value === name) {
      var newPs = panels_.value;
      if (newPs.length > 0) {
        var nextIdx = idx >= newPs.length ? newPs.length - 1 : idx;
        curPanel_.as(newPs[nextIdx].name);
      } else {
        curPanel_.as(null);
      }
    }
  }

  function switchTable(name) {
    curPanel_.as(name);
  }

  // === Render ===
  return View(
    {
      class: "h-full",
      onMounted() {
        openTable(MOCK_TABLES[MOCK_TABLES.length - 1].name);
      },
    },
    [
      SplitView({
        resizable: true,
        class: "h-full",
        panels: [
          // ===== Left Sidebar =====
          {
            size: 220,
            minSize: 160,
            style: { overflow: "hidden" },
            content() {
              var searchInput$ = new Timeless.ui.InputCore({
                defaultValue: "",
                placeholder: "Search tables...",
              });
              searchInput$.onStateChange(function () {
                searchText_.as(searchInput$.value);
              });

              return View(
                { class: "flex flex-col h-full border-r border-border" },
                [
                  View({ class: "p-3 shrink-0" }, [
                    Input({ id: "table-search", store: searchInput$ }),
                  ]),
                  View({ class: "flex-1 overflow-y-auto" }, [
                    For({
                      each: tables_,
                      render(table) {
                        var isActive = computed(curPanel_, function (t) {
                          return t === table.name;
                        });
                        var isVisible = computed(searchText_, function (t) {
                          return (
                            !t ||
                            table.name.toLowerCase().includes(t.toLowerCase())
                          );
                        });

                        return Show({
                          when: isVisible,
                          ok() {
                            return View(
                              {
                                class: Timeless.classNames([
                                  "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none transition-colors",
                                  computed(isActive, (active) => {
                                    return active
                                      ? "bg-accent text-accent-foreground font-medium"
                                      : "hover:bg-muted text-foreground";
                                  }),
                                ]),
                                onClick() {
                                  openTable(table.name);
                                },
                              },
                              [
                                Icon({ name: "table", size: 14 }),
                                View({ class: "truncate" }, [table.name]),
                                View(
                                  {
                                    class:
                                      "ml-auto text-xs text-muted-foreground",
                                  },
                                  [String(table.columns.length)],
                                ),
                              ],
                            );
                          },
                        });
                      },
                    }),
                  ]),
                ],
              );
            },
          },
          // ===== Right Main =====
          {
            size: "auto",
            style: { overflow: "hidden" },
            content() {
              return View({ class: "flex flex-col h-full" }, [
                // Tab bar
                View(
                  {
                    class:
                      "flex items-center border-b border-border shrink-0 overflow-x-auto",
                  },
                  [
                    For({
                      each: panels_,
                      render(panel) {
                        var isActive = computed(curPanel_, function (t) {
                          return t === panel.name;
                        });
                        return View(
                          {
                            class: Timeless.classNames([
                              "flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer select-none border-b-2 transition-colors shrink-0",
                              computed(isActive, function (active) {
                                return active
                                  ? "border-primary text-foreground font-medium"
                                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50";
                              }),
                            ]),
                            onClick() {
                              switchTable(panel.name);
                            },
                          },
                          [
                            View({ class: "truncate max-w-[160px]" }, [
                              panel.name,
                            ]),
                            View(
                              {
                                class:
                                  "flex items-center justify-center w-4 h-4 rounded hover:bg-muted-foreground/20 shrink-0",
                                onClick(e) {
                                  closeTable(panel.name, e);
                                },
                              },
                              [Icon({ name: "x", size: 12 })],
                            ),
                          ],
                        );
                      },
                    }),
                  ],
                ),
                // Content area
                View({ class: "flex-1 min-h-0 flex flex-col" }, [
                  // Empty
                  Show({
                    when: computed(curPanel_, function (t) {
                      return !t;
                    }),
                    ok() {
                      return View(
                        {
                          class:
                            "flex items-center justify-center h-full text-sm text-muted-foreground",
                        },
                        ["Select a table from the sidebar to view its data"],
                      );
                    },
                  }),
                  // Active panel
                  Show({
                    when: computed(curPanel_, (t) => {
                      return !!t;
                    }),
                    ok() {
                      var panel = findPanel(curPanel_.value);
                      if (!panel) {
                        return null;
                      }
                      var colCount = panel.columns.length;
                      // column 0 = row number (48px), columns 1..colCount = data columns (150px each)
                      var widths = [48];
                      for (var ci = 0; ci < colCount; ci++) {
                        widths.push(150);
                      }
                      var colWidths_ = refarr(widths);

                      // Fixed column detection
                      var fixedLeftInfo_ = [{ gridIdx: 0, name: "#" }];
                      for (var ci = 0; ci < colCount; ci++) {
                        var cn = panel.columns[ci].name;
                        if (cn === "id" || cn === "event_name") {
                          fixedLeftInfo_.push({ gridIdx: ci + 1, name: cn });
                        }
                      }
                      var lastLeftFixedIdx_ =
                        fixedLeftInfo_[fixedLeftInfo_.length - 1].gridIdx;

                      var columns_fixed_right = {};
                      for (var cri = 0; cri < colCount; cri++) {
                        if (panel.columns[cri].name === "created_at") {
                          columns_fixed_right[cri + 1] = true;
                        }
                      }

                      // Sticky left offsets (reactive to column resize)
                      var columns_sticky_left = {};
                      for (var fi = 0; fi < fixedLeftInfo_.length; fi++) {
                        (function (gi) {
                          columns_sticky_left[gi] = computed(
                            colWidths_,
                            function (arr) {
                              var left = 0;
                              for (
                                var fj = 0;
                                fj < fixedLeftInfo_.length;
                                fj++
                              ) {
                                var gj = fixedLeftInfo_[fj].gridIdx;
                                if (gj === gi) return left;
                                left += arr[gj];
                              }
                              return 0;
                            },
                          );
                        })(fixedLeftInfo_[fi].gridIdx);
                      }

                      var grid_template_ = computed(colWidths_, function (arr) {
                        return arr
                          .map(function (w) {
                            return w + "px";
                          })
                          .join(" ");
                      });
                      var totalWidth_ = computed(colWidths_, function (arr) {
                        var sum = 0;
                        for (var i = 0; i < arr.length; i++) {
                          sum += arr[i];
                        }
                        return sum;
                      });
                      var total_table_width_ = computed(
                        totalWidth_,
                        function (w) {
                          return w + "px";
                        },
                      );
                      // Direct DOM sync for body rows — bypasses ListView reactive lifecycle issues.
                      // Must be assigned to a var and read in a rendered View to trigger lazy evaluation.
                      var _grid_sync_ = computed(colWidths_, function (arr) {
                        var template = arr
                          .map(function (w) {
                            return w + "px";
                          })
                          .join(" ");
                        var totalPx =
                          arr.reduce(function (a, b) {
                            return a + b;
                          }, 0) + "px";
                        var $rows =
                          document.querySelectorAll("[data-grid-row]");
                        for (var ri = 0; ri < $rows.length; ri++) {
                          $rows[ri].style.gridTemplateColumns = template;
                          $rows[ri].style.minWidth = totalPx;
                        }
                        return template;
                      });
                      return [
                        // Loading
                        Show({
                          when: panel.loading,
                          ok() {
                            return View(
                              {
                                class:
                                  "flex items-center justify-center h-full text-sm text-muted-foreground",
                              },
                              ["Loading data..."],
                            );
                          },
                        }),
                        // Loaded
                        Show({
                          when: computed(panel.loaded, function (t) {
                            return t;
                          }),
                          ok() {
                            var cleanupScroll_ = null;
                            var cleanupHeaderScroll_ = null;
                            var headerScrollEl_ = null;
                            var isScrollSyncing_ = false;

                            return View(
                              {
                                class: "flex flex-col h-full min-h-0",
                                style: { "--grid-sync": _grid_sync_ },
                              },
                              [
                                // Column headers — native scroll synced with body
                                View(
                                  {
                                    class:
                                      "shrink-0 border-b border-border bg-muted/50",
                                    style: {
                                      overflow: "auto",
                                      "scrollbar-width": "none",
                                    },
                                    onMounted(event) {
                                      var $hdr = event.target.get$elm();
                                      headerScrollEl_ = $hdr;
                                      function onHeaderScroll() {
                                        if (isScrollSyncing_) return;
                                        isScrollSyncing_ = true;
                                        var $data = document.querySelector(
                                          "[data-table-body-scroll]",
                                        );
                                        if ($data) {
                                          $data.scrollLeft = $hdr.scrollLeft;
                                          isScrollSyncing_ = false;
                                        }
                                      }
                                      $hdr.addEventListener(
                                        "scroll",
                                        onHeaderScroll,
                                      );
                                      cleanupHeaderScroll_ = function () {
                                        $hdr.removeEventListener(
                                          "scroll",
                                          onHeaderScroll,
                                        );
                                      };
                                    },
                                    beforeUnmounted: function () {
                                      if (cleanupHeaderScroll_) {
                                        cleanupHeaderScroll_();
                                        cleanupHeaderScroll_ = null;
                                      }
                                      headerScrollEl_ = null;
                                    },
                                  },
                                  [
                                    View(
                                      {
                                        style: {
                                          display: "grid",
                                          "grid-template-columns":
                                            grid_template_,
                                          "min-width": total_table_width_,
                                        },
                                      },
                                      [
                                        View(
                                          {
                                            class:
                                              "px-3 py-2 text-xs font-medium text-muted-foreground text-right",
                                            style: {
                                              position: "sticky",
                                              left: "0px",
                                              "z-index": 4,
                                              "background-color":
                                                "var(--muted)",
                                              "border-right":
                                                "1px solid var(--border)",
                                            },
                                          },
                                          ["#"],
                                        ),
                                        For({
                                          each: panel.columns,
                                          render(col, idx) {
                                            var colIdx = idx.value;
                                            var gridIdx = colIdx + 1;
                                            var isLeftSticky =
                                              columns_sticky_left[gridIdx] !==
                                              undefined;
                                            var isRightSticky =
                                              columns_fixed_right[gridIdx] ===
                                              true;
                                            var isLast =
                                              colIdx === colCount - 1;
                                            var headerStickyStyle = {};
                                            if (isLeftSticky) {
                                              headerStickyStyle.position =
                                                "sticky";
                                              headerStickyStyle.left = computed(
                                                columns_sticky_left[gridIdx],
                                                function (v) {
                                                  return v + "px";
                                                },
                                              );
                                              headerStickyStyle["z-index"] = 4;
                                              headerStickyStyle[
                                                "background-color"
                                              ] = "var(--muted)";
                                              if (
                                                gridIdx === lastLeftFixedIdx_
                                              ) {
                                                headerStickyStyle[
                                                  "box-shadow"
                                                ] =
                                                  "inset -1px 0 0 0 var(--border)";
                                              }
                                            } else if (isRightSticky) {
                                              headerStickyStyle.position =
                                                "sticky";
                                              headerStickyStyle.right = "0px";
                                              headerStickyStyle["z-index"] = 5;
                                              headerStickyStyle[
                                                "background-color"
                                              ] = "var(--muted)";
                                              headerStickyStyle["box-shadow"] =
                                                "inset 1px 0 0 0 var(--border)";
                                            }
                                            headerStickyStyle["border-right"] =
                                              "1px solid var(--border)";
                                            return View(
                                              {
                                                class:
                                                  "px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1 relative",
                                                style: headerStickyStyle,
                                              },
                                              [
                                                Show({
                                                  when: isRightSticky,
                                                  ok() {
                                                    return ColumnResizeHandler(
                                                      colIdx,
                                                      colWidths_,
                                                      { onLeft: true },
                                                    );
                                                  },
                                                }),
                                                View({ class: "truncate" }, [
                                                  col.name,
                                                ]),
                                                View(
                                                  {
                                                    class:
                                                      "text-[10px] text-muted-foreground/60 font-mono shrink-0",
                                                  },
                                                  [col.type],
                                                ),
                                                Show({
                                                  when:
                                                    !isLast && !isRightSticky,
                                                  ok() {
                                                    return ColumnResizeHandler(
                                                      colIdx,
                                                      colWidths_,
                                                    );
                                                  },
                                                }),
                                              ],
                                            );
                                          },
                                        }),
                                      ],
                                    ),
                                  ],
                                ),
                                // Data rows (scrollable both axes)
                                View({ class: "flex-1 min-h-0" }, [
                                  ListView({
                                    style: {
                                      "max-height": "100%",
                                      overflow: "auto",
                                      position: "relative",
                                    },
                                    key: getRowKey(panel.columns),
                                    size: 30,
                                    itemHeight: 37,
                                    each: panel.data,
                                    onMounted(event) {
                                      var $elm = event.target.get$elm();
                                      $elm.setAttribute(
                                        "data-table-body-scroll",
                                        "",
                                      );
                                      function onScroll() {
                                        if (isScrollSyncing_) return;
                                        isScrollSyncing_ = true;
                                        if (headerScrollEl_)
                                          headerScrollEl_.scrollLeft =
                                            $elm.scrollLeft;
                                        isScrollSyncing_ = false;
                                      }
                                      $elm.addEventListener("scroll", onScroll);
                                      cleanupScroll_ = function () {
                                        $elm.removeEventListener(
                                          "scroll",
                                          onScroll,
                                        );
                                      };
                                    },
                                    beforeUnmounted() {
                                      if (cleanupScroll_) {
                                        cleanupScroll_();
                                        cleanupScroll_ = null;
                                      }
                                    },
                                    render(row, idx) {
                                      // var cellRefs = panel.columns.map(
                                      //   function (col) {
                                      //     return computed(row, function (t) {
                                      //       return formatCell(t[col.name]);
                                      //     });
                                      //   },
                                      // );

                                      var rowNum = computed(idx, function (i) {
                                        return String(i + 1);
                                      });

                                      return View(
                                        {
                                          dataset: {
                                            "grid-row": "",
                                          },
                                          style: {
                                            display: "grid",
                                            "grid-template-columns":
                                              grid_template_,
                                            "min-width": total_table_width_,
                                          },
                                          onUnmounted: function () {
                                            rowNum.destroy();
                                            // cellRefs.forEach(function (r) {
                                            //   r.destroy();
                                            // });
                                          },
                                        },
                                        [
                                          View(
                                            {
                                              class:
                                                "px-3 py-2 text-xs text-muted-foreground text-right font-mono select-none",
                                              style: {
                                                position: "sticky",
                                                left: "0px",
                                                "z-index": 2,
                                                "background-color":
                                                  "var(--background)",
                                                "border-right":
                                                  "1px solid var(--border)",
                                                "border-bottom":
                                                  "1px solid var(--border)",
                                              },
                                            },
                                            [rowNum],
                                          ),
                                          For({
                                            each: panel.columns,
                                            render(column, cidx) {
                                              const ref = formatCell(
                                                row[column.name],
                                              );
                                              var cell_idx = cidx.value + 1;
                                              var is_left_sticky =
                                                columns_sticky_left[
                                                  cell_idx
                                                ] !== undefined;
                                              var is_right_sticky =
                                                columns_fixed_right[
                                                  cell_idx
                                                ] === true;
                                              var CellStyles = {};
                                              if (is_left_sticky) {
                                                CellStyles.position = "sticky";
                                                CellStyles.left = computed(
                                                  columns_sticky_left[cell_idx],
                                                  function (v) {
                                                    return v + "px";
                                                  },
                                                );
                                                CellStyles["z-index"] = 2;
                                                CellStyles["background-color"] =
                                                  "var(--background)";
                                                if (
                                                  cell_idx === lastLeftFixedIdx_
                                                ) {
                                                  CellStyles["box-shadow"] =
                                                    "inset -1px 0 0 0 var(--border)";
                                                }
                                              } else if (is_right_sticky) {
                                                CellStyles.position = "sticky";
                                                CellStyles.right = "0px";
                                                CellStyles["z-index"] = 2;
                                                CellStyles["background-color"] =
                                                  "var(--background)";
                                                CellStyles["box-shadow"] =
                                                  "inset 1px 0 0 0 var(--border)";
                                              }
                                              CellStyles["border-right"] =
                                                "1px solid var(--border)";
                                              CellStyles["border-bottom"] =
                                                "1px solid var(--border)";
                                              return View(
                                                {
                                                  class:
                                                    "px-3 py-2 text-sm truncate",
                                                  style: CellStyles,
                                                },
                                                [ref],
                                              );
                                            },
                                          }),
                                        ],
                                      );
                                    },
                                  }),
                                ]),
                              ],
                            );
                          },
                        }),
                      ];
                    },
                  }),
                ]),
              ]);
            },
          },
        ],
      }),
    ],
  );
}
