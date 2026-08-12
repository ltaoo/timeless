import {
  MOCK_TABLES,
  generateMockRows,
  formatCell,
  getRowKey,
} from "./index.model.js";

function ColumnResizeHandler(colIdx, colWidths_, opts) {
  // Resize only the column to the LEFT of the handle (mainstream behavior:
  // Excel, Google Sheets, DataGrip, etc.). Right column stays fixed width.
  // For right-side handles, the column to the left is the current column (colIdx+1 in grid).
  // For left-side handles (right-sticky cols), the column to the left is the previous column (colIdx in grid).
  var MIN = 50;
  var onLeft = !!(opts && opts.onLeft);
  var leftIdx = onLeft ? colIdx : colIdx + 1;

  return View({
    class: "absolute top-0 bottom-0 w-3 cursor-col-resize",
    style: onLeft
      ? { left: "-6px", "z-index": "100" }
      : { right: "-6px", "z-index": "100" },
    onMounted(event) {
      var $el = event.target.get$elm();

      // Clean up stale lines from previous mount cycles
      var $stale = $el.querySelectorAll("[data-col-resize-line]");
      for (var s = 0; s < $stale.length; s++) $stale[s].remove();

      // 1px visible line in the center, non-interactive
      var $line = document.createElement("div");
      $line.setAttribute("data-col-resize-line", "");
      Object.assign($line.style, {
        position: "absolute",
        left: "50%",
        top: "0",
        bottom: "0",
        width: "1px",
        marginLeft: "-0.5px",
        pointerEvents: "none",
        // backgroundColor: "var(--border)",
      });
      $el.appendChild($line);

      // Hover highlight with delay timer (like split-view.ts)
      var hoverTimer = null;
      var isHighlighted = false;

      function showHighlight() {
        isHighlighted = true;
        // $line.style.backgroundColor = "var(--primary)";
        $line.style.width = "2px";
        $line.style.marginLeft = "-1px";
      }
      function hideHighlight() {
        isHighlighted = false;
        // $line.style.backgroundColor = "var(--border)";
        $line.style.width = "1px";
        $line.style.marginLeft = "-0.5px";
      }

      $el.addEventListener("pointerenter", function () {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
        }
        hoverTimer = setTimeout(function () {
          showHighlight();
          hoverTimer = null;
        }, 600);
      });
      $el.addEventListener("pointerleave", function () {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
        if (isHighlighted) {
          hideHighlight();
        }
      });

      function onDown(e) {
        e.preventDefault();
        e.stopPropagation();
        $el.setPointerCapture(e.pointerId);
        var startX = e.clientX;
        var startLeft = colWidths_.value[leftIdx];

        function onMove(me) {
          var delta = me.clientX - startX;
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

    var rowCount = name === "tags" || name === "posts" ? 5000 : 10;
    var rows = generateMockRows(name, rowCount);
    panel.data.as(rows);
    panel._originalRows = rows.slice();
    panel.loading.as(false);
    panel.loaded.as(true);
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
        openTable(MOCK_TABLES[MOCK_TABLES.length - 3].name);
        // Inject hover highlight style — !important beats inline styles on sticky cells
        if (!document.getElementById("row-hover-style")) {
          var style = document.createElement("style");
          style.id = "row-hover-style";
          style.textContent =
            "[data-grid-row].row-hovered > * { background-color: var(--muted) !important; }";
          document.head.appendChild(style);
        }
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
              var searchInput$ = new Timeless.vm.InputCore({
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

                      // ---- Sort state ----
                      // null = no sort, { col, dir: 'asc'|'desc' }
                      var sortState_ = ref(null);

                      function cycleSort(colName) {
                        var cur = sortState_.value;
                        if (!cur || cur.col !== colName) {
                          sortState_.as({ col: colName, dir: "asc" });
                          panel.data.sort(function (a, b) {
                            var va = a[colName];
                            var vb = b[colName];
                            if (va == null) return 1;
                            if (vb == null) return -1;
                            if (va < vb) return -1;
                            if (va > vb) return 1;
                            return 0;
                          });
                        } else if (cur.dir === "asc") {
                          sortState_.as({ col: colName, dir: "desc" });
                          panel.data.sort(function (a, b) {
                            var va = a[colName];
                            var vb = b[colName];
                            if (va == null) return 1;
                            if (vb == null) return -1;
                            if (va < vb) return 1;
                            if (va > vb) return -1;
                            return 0;
                          });
                        } else {
                          sortState_.as(null);
                          panel.data.as(panel._originalRows.slice());
                        }
                        // Fire callback
                        if (props.onSort) {
                          var next = sortState_.value;
                          props.onSort(
                            next
                              ? { column: next.col, direction: next.dir }
                              : { column: null, direction: null },
                          );
                        }
                      }

                      // ---- Filter state ----
                      // { colName: filterText }
                      var filters_ = ref({});
                      // Which column's filter input is currently open
                      var filterOpenCol_ = ref(null);

                      function setFilter(colName, val) {
                        var next = {};
                        var cur = filters_.value;
                        for (var k in cur) {
                          if (cur.hasOwnProperty(k)) next[k] = cur[k];
                        }
                        next[colName] = val;
                        filters_.as(next);
                        if (props.onFilter) {
                          props.onFilter({ column: colName, value: val });
                        }
                      }

                      function clearFilter(colName) {
                        var next = {};
                        var cur = filters_.value;
                        for (var k in cur) {
                          if (cur.hasOwnProperty(k) && k !== colName)
                            next[k] = cur[k];
                        }
                        filters_.as(next);
                        filterOpenCol_.as(null);
                        if (props.onFilter) {
                          props.onFilter({ column: colName, value: "" });
                        }
                      }

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
                      var firstRightFixedIdx_ = null;
                      for (var cri = 0; cri < colCount; cri++) {
                        if (columns_fixed_right[cri + 1]) {
                          firstRightFixedIdx_ = cri + 1;
                          break;
                        }
                      }

                      var scrollbarWidth_ = ref(0);

                      // Scroll-driven shadows on fixed column edges (antd-style)
                      var showLeftShadow_ = ref(false);
                      var showRightShadow_ = ref(false);

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

                      function gridTemplateCols(arr) {
                        return arr
                          .map(function (w, i) {
                            // Last data column fills remaining space.
                            // i > 0 keeps the row-number column (idx 0) always fixed px.
                            if (i > 0 && i === arr.length - 1) {
                              return "minmax(" + w + "px, 1fr)";
                            }
                            return w + "px";
                          })
                          .join(" ");
                      }

                      var grid_template_ = computed(
                        colWidths_,
                        gridTemplateCols,
                      );
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
                        var template = gridTemplateCols(arr);
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
                      // Direct DOM sync for shadow overlays — same pattern, bypasses
                      // ListView reactive lifecycle for newly virtualized rows.
                      var _leftShadowSync_ = computed(
                        showLeftShadow_,
                        function (show) {
                          var $els =
                            document.querySelectorAll("[data-shadow-left]");
                          for (var i = 0; i < $els.length; i++) {
                            $els[i].style.boxShadow = show
                              ? "inset 10px 0 8px -8px var(--table-fixed-shadow)"
                              : "none";
                          }
                          return show;
                        },
                      );
                      var _rightShadowSync_ = computed(
                        showRightShadow_,
                        function (show) {
                          var $els = document.querySelectorAll(
                            "[data-shadow-right]",
                          );
                          for (var i = 0; i < $els.length; i++) {
                            $els[i].style.boxShadow = show
                              ? "inset -10px 0 8px -8px var(--table-fixed-shadow)"
                              : "none";
                          }
                          return show;
                        },
                      );
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
                            var hoveredRow_ = ref(-1);

                            return View(
                              {
                                class: "flex flex-col h-full min-h-0",
                                style: {
                                  "--grid-sync": _grid_sync_,
                                  "--shadow-l": _leftShadowSync_,
                                  "--shadow-r": _rightShadowSync_,
                                },
                              },
                              [
                                // Column headers — native scroll synced with body
                                View(
                                  {
                                    class:
                                      "shrink-0 border-b border-border bg-muted",
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
                                              headerStickyStyle[
                                                "border-right"
                                              ] = "1px solid var(--border)";
                                              // border-right already provides the visual separator;
                                              // inset box-shadow is no longer needed
                                            } else if (isRightSticky) {
                                              headerStickyStyle.position =
                                                "sticky";
                                              headerStickyStyle.right =
                                                computed(
                                                  scrollbarWidth_,
                                                  function (w) {
                                                    return w + "px";
                                                  },
                                                );
                                              headerStickyStyle["z-index"] = 5;
                                              headerStickyStyle[
                                                "background-color"
                                              ] = "var(--muted)";
                                              headerStickyStyle[
                                                "border-right"
                                              ] = "1px solid var(--border)";
                                            }
                                            if (!isRightSticky) {
                                              headerStickyStyle[
                                                "border-right"
                                              ] = "1px solid var(--border)";
                                            }
                                            // Sort indicator — dual chevrons stacked
                                            var sortDir_ = computed(
                                              sortState_,
                                              function (s) {
                                                return s && s.col === col.name
                                                  ? s.dir
                                                  : null;
                                              },
                                            );

                                            var headerChildren = [
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
                                              // Column name + sort + filter — unified header controls
                                              View(
                                                {
                                                  class:
                                                    "flex items-center gap-0.5 cursor-pointer min-w-0",
                                                  onClick(e) {
                                                    e.stopPropagation();
                                                    cycleSort(col.name);
                                                  },
                                                },
                                                [
                                                  View({ class: "truncate" }, [
                                                    col.name,
                                                  ]),
                                                  // Sort indicator: ▲/▼ dual chevron
                                                  View(
                                                    {
                                                      class:
                                                        "flex flex-col shrink-0",
                                                      style: {
                                                        lineHeight: 0,
                                                      },
                                                    },
                                                    [
                                                      View(
                                                        {
                                                          class: computed(
                                                            sortDir_,
                                                            function (dir) {
                                                              return dir ===
                                                                "asc"
                                                                ? "text-primary"
                                                                : "text-muted-foreground/40";
                                                            },
                                                          ),
                                                        },
                                                        [
                                                          Icon({
                                                            name: "chevron-up",
                                                            size: 14,
                                                          }),
                                                        ],
                                                      ),
                                                      View(
                                                        {
                                                          class: computed(
                                                            sortDir_,
                                                            function (dir) {
                                                              return dir ===
                                                                "desc"
                                                                ? "text-primary"
                                                                : "text-muted-foreground/40";
                                                            },
                                                          ),
                                                          style: {
                                                            marginTop: "-5px",
                                                          },
                                                        },
                                                        [
                                                          Icon({
                                                            name: "chevron-down",
                                                            size: 14,
                                                          }),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                              // Filter icon
                                              View(
                                                {
                                                  class:
                                                    "shrink-0 cursor-pointer rounded hover:bg-muted-foreground/15 flex items-center justify-center",
                                                  style: {
                                                    width: "18px",
                                                    height: "18px",
                                                  },
                                                  onClick(e) {
                                                    e.stopPropagation();
                                                    var cur =
                                                      filterOpenCol_.value;
                                                    filterOpenCol_.as(
                                                      cur === col.name
                                                        ? null
                                                        : col.name,
                                                    );
                                                  },
                                                },
                                                [
                                                  Icon({
                                                    name: "funnel",
                                                    size: 12,
                                                  }),
                                                ],
                                              ),
                                              Show({
                                                when:
                                                  !isLast &&
                                                  !isRightSticky &&
                                                  columns_fixed_right[
                                                    gridIdx + 1
                                                  ] !== true,
                                                ok() {
                                                  return ColumnResizeHandler(
                                                    colIdx,
                                                    colWidths_,
                                                  );
                                                },
                                              }),
                                            ];

                                            // Filter dropdown
                                            var hasFilter_ = computed(
                                              filters_,
                                              function (f) {
                                                return !!(
                                                  f[col.name] &&
                                                  f[col.name].length > 0
                                                );
                                              },
                                            );

                                            headerChildren.push(
                                              Show({
                                                when: computed(
                                                  filterOpenCol_,
                                                  function (open) {
                                                    return open === col.name;
                                                  },
                                                ),
                                                ok() {
                                                  var filterInput$ =
                                                    new Timeless.vm.InputCore({
                                                      defaultValue:
                                                        filters_.value[
                                                          col.name
                                                        ] || "",
                                                      placeholder: "Filter...",
                                                    });
                                                  filterInput$.onStateChange(
                                                    function () {
                                                      setFilter(
                                                        col.name,
                                                        filterInput$.value,
                                                      );
                                                    },
                                                  );
                                                  return View(
                                                    {
                                                      class:
                                                        "absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg z-50",
                                                      style: {
                                                        minWidth: "180px",
                                                      },
                                                      onClick(e) {
                                                        e.stopPropagation();
                                                      },
                                                    },
                                                    [
                                                      Input({
                                                        store: filterInput$,
                                                        autoFocus: true,
                                                      }),
                                                      Show({
                                                        when: hasFilter_,
                                                        ok() {
                                                          return View(
                                                            {
                                                              class:
                                                                "text-[10px] text-muted-foreground hover:text-foreground cursor-pointer mt-1 text-right",
                                                              onClick() {
                                                                clearFilter(
                                                                  col.name,
                                                                );
                                                              },
                                                            },
                                                            ["Clear"],
                                                          );
                                                        },
                                                      }),
                                                    ],
                                                  );
                                                },
                                              }),
                                            );
                                            if (gridIdx === lastLeftFixedIdx_) {
                                              headerChildren.push(
                                                View({
                                                  dataset: {
                                                    "shadow-left": "",
                                                  },
                                                  style: {
                                                    position: "absolute",
                                                    top: "0",
                                                    bottom: "-1px",
                                                    right: "0",
                                                    width: "30px",
                                                    transform:
                                                      "translateX(100%)",
                                                    pointerEvents: "none",
                                                    boxShadow: "none",
                                                  },
                                                }),
                                              );
                                            }
                                            if (
                                              gridIdx === firstRightFixedIdx_
                                            ) {
                                              headerChildren.push(
                                                View({
                                                  dataset: {
                                                    "shadow-right": "",
                                                  },
                                                  style: {
                                                    position: "absolute",
                                                    top: "0",
                                                    bottom: "-1px",
                                                    left: "0",
                                                    width: "30px",
                                                    transform:
                                                      "translateX(-100%)",
                                                    pointerEvents: "none",
                                                    boxShadow: "none",
                                                  },
                                                }),
                                              );
                                            }
                                            if (isRightSticky) {
                                              headerChildren.push(
                                                View({
                                                  style: {
                                                    position: "absolute",
                                                    top: "0",
                                                    bottom: "0",
                                                    right: computed(
                                                      scrollbarWidth_,
                                                      function (w) {
                                                        return -w + "px";
                                                      },
                                                    ),
                                                    width: computed(
                                                      scrollbarWidth_,
                                                      function (w) {
                                                        return w + "px";
                                                      },
                                                    ),
                                                    "background-color":
                                                      "var(--muted)",
                                                  },
                                                }),
                                              );
                                            }
                                            return View(
                                              {
                                                class:
                                                  "px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-0.5 relative",
                                                style: headerStickyStyle,
                                              },
                                              headerChildren,
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
                                    itemHeight: 36 + 1,
                                    each: panel.data,
                                    onMounted(event) {
                                      var $elm = event.target.get$elm();
                                      $elm.setAttribute(
                                        "data-table-body-scroll",
                                        "",
                                      );
                                      scrollbarWidth_.as(
                                        $elm.offsetWidth - $elm.clientWidth,
                                      );
                                      // Initialize shadow state
                                      showLeftShadow_.as($elm.scrollLeft > 0);
                                      var atEnd =
                                        $elm.scrollLeft + $elm.clientWidth >=
                                        $elm.scrollWidth - 2;
                                      showRightShadow_.as(!atEnd);
                                      function onScroll() {
                                        if (isScrollSyncing_) return;
                                        isScrollSyncing_ = true;
                                        if (headerScrollEl_)
                                          headerScrollEl_.scrollLeft =
                                            $elm.scrollLeft;
                                        isScrollSyncing_ = false;
                                        showLeftShadow_.as($elm.scrollLeft > 0);
                                        var _atEnd =
                                          $elm.scrollLeft + $elm.clientWidth >=
                                          $elm.scrollWidth - 2;
                                        showRightShadow_.as(!_atEnd);
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
                                          onMounted(event) {
                                            var $row = event.target.get$elm();
                                            function onEnter() {
                                              hoveredRow_.as(idx.value);
                                              $row.classList.add("row-hovered");
                                            }
                                            function onLeave() {
                                              if (
                                                hoveredRow_.value === idx.value
                                              ) {
                                                hoveredRow_.as(-1);
                                              }
                                              $row.classList.remove(
                                                "row-hovered",
                                              );
                                            }
                                            $row.addEventListener(
                                              "pointerenter",
                                              onEnter,
                                            );
                                            $row.addEventListener(
                                              "pointerleave",
                                              onLeave,
                                            );
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
                                                CellStyles["border-right"] =
                                                  "1px solid var(--border)";
                                                // border-right already provides the visual separator;
                                                // inset box-shadow is no longer needed
                                              } else if (is_right_sticky) {
                                                CellStyles.position = "sticky";
                                                CellStyles.right = "0px";
                                                CellStyles["z-index"] = 2;
                                                CellStyles["background-color"] =
                                                  "var(--background)";
                                                CellStyles["border-right"] =
                                                  "1px solid var(--border)";
                                              }
                                              if (!is_right_sticky) {
                                                CellStyles["border-right"] =
                                                  "1px solid var(--border)";
                                              }
                                              CellStyles["border-bottom"] =
                                                "1px solid var(--border)";
                                              var isEdge =
                                                cell_idx ===
                                                  lastLeftFixedIdx_ ||
                                                cell_idx ===
                                                  firstRightFixedIdx_;
                                              var cellChildren;
                                              var cellClass;
                                              if (isEdge) {
                                                CellStyles["overflow"] =
                                                  "visible";
                                                cellClass = "px-3 py-2 text-sm";
                                                cellChildren = [
                                                  View({ class: "truncate" }, [
                                                    ref,
                                                  ]),
                                                ];
                                                if (
                                                  cell_idx === lastLeftFixedIdx_
                                                ) {
                                                  cellChildren.push(
                                                    View({
                                                      dataset: {
                                                        "shadow-left": "",
                                                      },
                                                      style: {
                                                        position: "absolute",
                                                        top: "0",
                                                        bottom: "-1px",
                                                        right: "0",
                                                        width: "30px",
                                                        transform:
                                                          "translateX(100%)",
                                                        pointerEvents: "none",
                                                        boxShadow: "none",
                                                      },
                                                    }),
                                                  );
                                                }
                                                if (
                                                  cell_idx ===
                                                  firstRightFixedIdx_
                                                ) {
                                                  cellChildren.push(
                                                    View({
                                                      dataset: {
                                                        "shadow-right": "",
                                                      },
                                                      style: {
                                                        position: "absolute",
                                                        top: "0",
                                                        bottom: "-1px",
                                                        left: "0",
                                                        width: "30px",
                                                        transform:
                                                          "translateX(-100%)",
                                                        pointerEvents: "none",
                                                        boxShadow: "none",
                                                      },
                                                    }),
                                                  );
                                                }
                                              } else {
                                                cellClass =
                                                  "px-3 py-2 text-sm truncate";
                                                cellChildren = [ref];
                                              }
                                              return View(
                                                {
                                                  class: cellClass,
                                                  style: CellStyles,
                                                },
                                                cellChildren,
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
