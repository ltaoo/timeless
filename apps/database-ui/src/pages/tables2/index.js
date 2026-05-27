// ============================================================
// Mock data — shared with tables/index.js
// ============================================================

var MOCK_TABLES = [
  {
    name: "users",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "username", type: "varchar(50)", notnull: true, dflt_value: null, pk: false },
      { cid: 2, name: "email", type: "varchar(100)", notnull: true, dflt_value: null, pk: false },
      { cid: 3, name: "password", type: "varchar(255)", notnull: true, dflt_value: null, pk: false },
      { cid: 4, name: "avatar", type: "varchar(255)", notnull: false, dflt_value: null, pk: false },
      { cid: 5, name: "created_at", type: "datetime", notnull: true, dflt_value: null, pk: false },
    ],
  },
  {
    name: "posts",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "title", type: "varchar(200)", notnull: true, dflt_value: null, pk: false },
      { cid: 2, name: "content", type: "text", notnull: false, dflt_value: null, pk: false },
      { cid: 3, name: "user_id", type: "int", notnull: true, dflt_value: null, pk: false },
      { cid: 4, name: "status", type: "varchar(20)", notnull: false, dflt_value: null, pk: false },
      { cid: 5, name: "created_at", type: "datetime", notnull: true, dflt_value: null, pk: false },
    ],
  },
  {
    name: "comments",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "content", type: "text", notnull: true, dflt_value: null, pk: false },
      { cid: 2, name: "user_id", type: "int", notnull: true, dflt_value: null, pk: false },
      { cid: 3, name: "post_id", type: "int", notnull: true, dflt_value: null, pk: false },
      { cid: 4, name: "created_at", type: "datetime", notnull: true, dflt_value: null, pk: false },
    ],
  },
  {
    name: "tags",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "name", type: "varchar(50)", notnull: true, dflt_value: null, pk: false },
    ],
  },
  {
    name: "post_tags",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "post_id", type: "int", notnull: true, dflt_value: null, pk: false },
      { cid: 2, name: "tag_id", type: "int", notnull: true, dflt_value: null, pk: false },
    ],
  },
  {
    name: "analytics",
    columns: [
      { cid: 0, name: "id", type: "int", notnull: true, dflt_value: null, pk: true },
      { cid: 1, name: "event_name", type: "varchar(100)", notnull: true, dflt_value: null, pk: false },
      { cid: 2, name: "user_id", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 3, name: "session_id", type: "varchar(64)", notnull: false, dflt_value: null, pk: false },
      { cid: 4, name: "page_url", type: "varchar(500)", notnull: false, dflt_value: null, pk: false },
      { cid: 5, name: "referrer", type: "varchar(500)", notnull: false, dflt_value: null, pk: false },
      { cid: 6, name: "browser", type: "varchar(100)", notnull: false, dflt_value: null, pk: false },
      { cid: 7, name: "os", type: "varchar(50)", notnull: false, dflt_value: null, pk: false },
      { cid: 8, name: "device_type", type: "varchar(20)", notnull: false, dflt_value: null, pk: false },
      { cid: 9, name: "country", type: "varchar(50)", notnull: false, dflt_value: null, pk: false },
      { cid: 10, name: "city", type: "varchar(100)", notnull: false, dflt_value: null, pk: false },
      { cid: 11, name: "duration_ms", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 12, name: "scroll_depth_pct", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 13, name: "click_target", type: "varchar(200)", notnull: false, dflt_value: null, pk: false },
      { cid: 14, name: "custom_event", type: "varchar(100)", notnull: false, dflt_value: null, pk: false },
      { cid: 15, name: "value", type: "real", notnull: false, dflt_value: null, pk: false },
      { cid: 16, name: "utm_source", type: "varchar(100)", notnull: false, dflt_value: null, pk: false },
      { cid: 17, name: "utm_medium", type: "varchar(100)", notnull: false, dflt_value: null, pk: false },
      { cid: 18, name: "utm_campaign", type: "varchar(200)", notnull: false, dflt_value: null, pk: false },
      { cid: 19, name: "ip_address", type: "varchar(45)", notnull: false, dflt_value: null, pk: false },
      { cid: 20, name: "user_agent", type: "text", notnull: false, dflt_value: null, pk: false },
      { cid: 21, name: "screen_width", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 22, name: "screen_height", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 23, name: "is_bounce", type: "int", notnull: false, dflt_value: null, pk: false },
      { cid: 24, name: "created_at", type: "datetime", notnull: true, dflt_value: null, pk: false },
    ],
  },
];

var STATUSES = ["draft", "published", "review", "archived"];
var USERNAMES = ["alice", "bob", "charlie", "diana", "eve", "frank", "grace", "hank", "iris", "jack"];
var TAG_NAMES = ["sqlite", "database", "tutorial", "performance", "security", "react", "javascript", "api", "devops", "testing"];
var EVENT_NAMES = ["page_view", "click", "scroll", "form_submit", "video_play", "download", "signup", "login", "search", "share"];
var PAGE_URLS = ["/home", "/products", "/about", "/contact", "/blog/post-1", "/pricing", "/docs/getting-started", "/dashboard", "/settings", "/profile"];
var REFERRERS = ["https://google.com", "https://twitter.com", "https://reddit.com", "https://news.ycombinator.com", "https://github.com", null, null, null];
var BROWSERS = ["Chrome 120", "Firefox 121", "Safari 17", "Edge 120", "Chrome 119", "Firefox 120"];
var OS_LIST = ["Windows 11", "macOS 14", "Ubuntu 22.04", "iOS 17", "Android 14", "macOS 13"];
var DEVICE_TYPES = ["desktop", "desktop", "desktop", "mobile", "tablet"];
var COUNTRIES = ["US", "GB", "DE", "JP", "BR", "IN", "CA", "AU", "FR", "KR"];
var CITIES = ["New York", "London", "Berlin", "Tokyo", "Sao Paulo", "Mumbai", "Toronto", "Sydney", "Paris", "Seoul"];
var CLICK_TARGETS = ["#hero-btn", ".nav-link", ".card-title", ".cta-button", "#submit-form", ".dropdown-toggle", null, null, null, null];
var CUSTOM_EVENTS = ["video_started", "form_abandoned", "cart_add", "wishlist_add", "item_viewed", "checkout_started", null, null, null, null];
var UTM_SOURCES = ["google", "twitter", "newsletter", "facebook", "linkedin", null, null, null];
var UTM_MEDIUMS = ["cpc", "social", "email", "banner", "affiliate", null, null, null];
var UTM_CAMPAIGNS = ["spring_sale", "launch_2024", "black_friday", "back_to_school", "holiday_special", null, null, null, null];
var SCREEN_SIZES = [[1920, 1080], [1440, 900], [1366, 768], [2560, 1440], [390, 844], [414, 896], [768, 1024], [1280, 720]];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDate() {
  var y = 2024 + Math.floor(Math.random() * 2);
  var m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  var d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  var h = String(Math.floor(Math.random() * 24)).padStart(2, "0");
  var mi = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  var s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return y + "-" + m + "-" + d + " " + h + ":" + mi + ":" + s;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockRows(tableName, count) {
  var rows = [];
  for (var i = 0; i < count; i++) {
    switch (tableName) {
      case "users":
        rows.push({
          id: i + 1,
          username: USERNAMES[i] || "user" + (i + 1),
          email: (USERNAMES[i] || "user" + (i + 1)) + "@example.com",
          password: "hash_" + Math.random().toString(36).slice(2, 10),
          avatar: i % 3 === 0 ? "/avatars/" + (USERNAMES[i] || "user" + (i + 1)) + ".png" : null,
          created_at: randDate(),
        });
        break;
      case "posts":
        rows.push({
          id: i + 1,
          title: "Post #" + (i + 1) + " — " + pick(["Getting Started", "Advanced Guide", "Tips & Tricks", "Best Practices", "Deep Dive"]),
          content: i % 3 === 0 ? null : "Full content body for post #" + (i + 1) + ".",
          user_id: randInt(1, 10),
          status: pick(STATUSES),
          created_at: randDate(),
        });
        break;
      case "comments":
        rows.push({
          id: i + 1,
          content: pick(["Great article!", "Thanks for sharing.", "Well written!", "Bookmarked.", "Keep it up!"]),
          user_id: randInt(1, 10),
          post_id: randInt(1, 30),
          created_at: randDate(),
        });
        break;
      case "tags":
        rows.push({
          id: i + 1,
          name: TAG_NAMES[i] || "tag-" + (i + 1),
        });
        break;
      case "post_tags":
        rows.push({
          id: i + 1,
          post_id: randInt(1, 30),
          tag_id: randInt(1, 10),
        });
        break;
      case "analytics":
        var screen = pick(SCREEN_SIZES);
        rows.push({
          id: i + 1,
          event_name: pick(EVENT_NAMES),
          user_id: randInt(1, 5000),
          session_id: "sess_" + Math.random().toString(36).slice(2, 18),
          page_url: pick(PAGE_URLS),
          referrer: pick(REFERRERS),
          browser: pick(BROWSERS),
          os: pick(OS_LIST),
          device_type: pick(DEVICE_TYPES),
          country: pick(COUNTRIES),
          city: pick(CITIES),
          duration_ms: randInt(100, 300000),
          scroll_depth_pct: randInt(0, 100),
          click_target: pick(CLICK_TARGETS),
          custom_event: pick(CUSTOM_EVENTS),
          value: Math.round(Math.random() * 100000) / 100,
          utm_source: pick(UTM_SOURCES),
          utm_medium: pick(UTM_MEDIUMS),
          utm_campaign: pick(UTM_CAMPAIGNS),
          ip_address: "192.168." + randInt(1, 255) + "." + randInt(1, 255),
          user_agent: "Mozilla/5.0 (" + pick(["Windows NT 10.0", "Macintosh", "X11"]) + ") " + pick(["Chrome", "Firefox", "Safari"]) + "/" + randInt(100, 130) + ".0",
          screen_width: screen[0],
          screen_height: screen[1],
          is_bounce: randInt(0, 1),
          created_at: randDate(),
        });
        break;
    }
  }
  return rows;
}

// ============================================================
// Helpers
// ============================================================

function formatCell(val) {
  if (val === null) return "NULL";
  if (val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function getRowKey(columns) {
  for (var i = 0; i < columns.length; i++) {
    if (columns[i].pk) return columns[i].name;
  }
  return columns.length > 0 ? columns[0].name : "id";
}

// ============================================================
// Column resize handle — uses TableColumnModel.resizeColumn()
// ============================================================

/**
 * @param {number} gridIdx — the grid-column index to resize
 * @param {Object} model — TableColumnModel instance
 * @param {Object} [opts]
 * @param {boolean} [opts.onLeft] — handle is on left edge (right-fixed columns)
 */
function makeColumnResizeHandleV2(gridIdx, model, opts) {
  var onLeft = !!(opts && opts.onLeft);

  return View({
    class: onLeft
      ? "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize"
      : "absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize",
    style: onLeft
      ? { "margin-left": "-3px", "z-index": "1" }
      : { "margin-right": "-3px", "z-index": "1" },
    onMounted: function (event) {
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
        backgroundColor: "#d0d0d0",
      });
      $el.appendChild($line);

      function onEnter() {
        $line.style.backgroundColor = "#3376cd";
        $line.style.width = "2px";
        $line.style.marginLeft = "-1px";
      }
      function onLeave() {
        $line.style.backgroundColor = "#d0d0d0";
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

        function onMove(me) {
          var delta = me.clientX - startX;
          // Model handles onLeft delta negation and min-width clamping internally
          model.resizeColumn(gridIdx, delta, { onLeft: onLeft });
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
// Model import
// ============================================================
import { createTableColumnModel } from "@/lib/TableModel.js";

// ============================================================
// Main component
// ============================================================

/** @param {ViewComponentProps} props */
export default function TablesPageView(props) {
  var tables_ = refarr(MOCK_TABLES);
  var panels_ = refarr([]);
  var curPanel_ = ref(null);
  var searchText_ = ref("");

  function findPanel(name) {
    if (!name) return null;
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

    // Create the column model for this panel
    var colModel = createTableColumnModel(tableMeta.columns, {
      leftFixed: ["id", "event_name"],
      rightFixed: ["created_at"],
    });

    var panel = {
      name: name,
      columns: tableMeta.columns,
      colModel: colModel,
      data: refarr([]),
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
      if (ps[i].name === name) { idx = i; break; }
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
  return View({ class: "h-full" }, [
    SplitView({
      resizable: true,
      class: "h-full",
      panels: [
        // ===== Left Sidebar =====
        {
          size: 220,
          minSize: 160,
          style: { overflow: "hidden" },
          content: function () {
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
                    render: function (table) {
                      var isActive = computed(curPanel_, function (t) {
                        return t === table.name;
                      });
                      var isVisible = computed(searchText_, function (t) {
                        return !t || table.name.toLowerCase().includes(t.toLowerCase());
                      });

                      return Show({
                        when: isVisible,
                        ok: function () {
                          return View(
                            {
                              class: Timeless.classNames([
                                "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer select-none transition-colors",
                                computed(isActive, function (active) {
                                  return active
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "hover:bg-muted text-foreground";
                                }),
                              ]),
                              onClick: function () { openTable(table.name); },
                            },
                            [
                              Icon({ name: "table", size: 14 }),
                              View({ class: "truncate" }, [table.name]),
                              View({ class: "ml-auto text-xs text-muted-foreground" }, [
                                String(table.columns.length),
                              ]),
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
          content: function () {
            return View({ class: "flex flex-col h-full" }, [
              // Tab bar
              View(
                { class: "flex items-center border-b border-border shrink-0 overflow-x-auto" },
                [
                  For({
                    each: panels_,
                    render: function (panel) {
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
                          onClick: function () { switchTable(panel.name); },
                        },
                        [
                          View({ class: "truncate max-w-[160px]" }, [panel.name]),
                          View(
                            {
                              class: "flex items-center justify-center w-4 h-4 rounded hover:bg-muted-foreground/20 shrink-0",
                              onClick: function (e) { closeTable(panel.name, e); },
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
                  when: computed(curPanel_, function (t) { return !t; }),
                  ok: function () {
                    return View(
                      { class: "flex items-center justify-center h-full text-sm text-muted-foreground" },
                      ["Select a table from the sidebar to view its data — Model-based (Tables2)"],
                    );
                  },
                }),
                // Active panel
                Show({
                  when: computed(curPanel_, function (t) { return !!t; }),
                  ok: function () {
                    var panel = findPanel(curPanel_.value);
                    if (!panel) return null;

                    var colModel = panel.colModel;
                    var colCount = panel.columns.length;

                    return [
                      // Loading
                      Show({
                        when: computed(panel.loading, function (t) { return t; }),
                        ok: function () {
                          return View(
                            { class: "flex items-center justify-center h-full text-sm text-muted-foreground" },
                            ["Loading data..."],
                          );
                        },
                      }),
                      // Loaded
                      Show({
                        when: computed(panel.loaded, function (t) { return t; }),
                        ok: function () {
                          var cleanupScroll_ = null;
                          var cleanupHeaderScroll_ = null;
                          var headerScrollEl_ = null;
                          var isScrollSyncing_ = false;
                          // Track header grid element for model registration
                          var headerGridEl_ = null;

                          return View({ class: "flex flex-col h-full min-h-0" }, [
                            // Column headers — native scroll synced with body
                            View(
                              {
                                class: "shrink-0 border-b border-border bg-muted/50",
                                style: {
                                  overflow: "auto",
                                  "scrollbar-width": "none",
                                },
                                onMounted: function (event) {
                                  var $hdr = event.target.get$elm();
                                  headerScrollEl_ = $hdr;
                                  function onHeaderScroll() {
                                    if (isScrollSyncing_) return;
                                    isScrollSyncing_ = true;
                                    var $data = document.querySelector("[data-table-body-scroll]");
                                    if ($data) $data.scrollLeft = $hdr.scrollLeft;
                                    isScrollSyncing_ = false;
                                  }
                                  $hdr.addEventListener("scroll", onHeaderScroll);
                                  cleanupHeaderScroll_ = function () {
                                    $hdr.removeEventListener("scroll", onHeaderScroll);
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
                                    onMounted: function (event) {
                                      headerGridEl_ = event.target.get$elm();
                                      colModel.registerGrid(headerGridEl_);
                                    },
                                    beforeUnmounted: function () {
                                      if (headerGridEl_) {
                                        colModel.unregisterGrid(headerGridEl_);
                                        headerGridEl_ = null;
                                      }
                                    },
                                    style: {
                                      display: "grid",
                                      "grid-template-columns": colModel.gridTemplate_,
                                      "min-width": colModel.totalWidthPx_,
                                    },
                                  },
                                  [
                                    View(
                                      {
                                        class: "px-3 py-2 text-xs font-medium text-muted-foreground text-right",
                                        style: {
                                          position: "sticky",
                                          left: "0px",
                                          "z-index": 4,
                                          "background-color": "var(--muted)",
                                        },
                                      },
                                      ["#"],
                                    ),
                                    For({
                                      each: panel.columns,
                                      render: function (col, idx) {
                                        var colIdx = idx.value;
                                        var gridIdx = colModel.gridIdx(colIdx);
                                        var isLeftSticky = colModel.isLeftSticky(gridIdx);
                                        var isRightSticky = colModel.isRightSticky(gridIdx);
                                        var isLast = colIdx === colCount - 1;
                                        var headerStickyStyle = {};
                                        if (isLeftSticky) {
                                          headerStickyStyle.position = "sticky";
                                          headerStickyStyle.left = computed(colModel.stickyLefts_[gridIdx], function (v) { return v + "px"; });
                                          headerStickyStyle["z-index"] = 4;
                                          headerStickyStyle["background-color"] = "var(--muted)";
                                          if (colModel.hasLeftShadow(gridIdx)) {
                                            headerStickyStyle["box-shadow"] = "inset -1px 0 0 0 var(--border)";
                                          }
                                        } else if (isRightSticky) {
                                          headerStickyStyle.position = "sticky";
                                          headerStickyStyle.right = "0px";
                                          headerStickyStyle["z-index"] = 5;
                                          headerStickyStyle["background-color"] = "var(--muted)";
                                          headerStickyStyle["box-shadow"] = "inset 1px 0 0 0 var(--border)";
                                        }
                                        return View(
                                          { class: "px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-1 relative", style: headerStickyStyle },
                                          [
                                            isRightSticky ? makeColumnResizeHandleV2(gridIdx, colModel, { onLeft: true }) : null,
                                            View({ class: "truncate" }, [col.name]),
                                            View(
                                              { class: "text-[10px] text-muted-foreground/60 font-mono shrink-0" },
                                              [col.type],
                                            ),
                                            !isLast && !isRightSticky ? makeColumnResizeHandleV2(gridIdx, colModel) : null,
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
                                style: { "max-height": "100%", overflow: "auto", position: "relative" },
                                key: getRowKey(panel.columns),
                                size: 30,
                                itemHeight: 36,
                                each: panel.data,
                                beforeUnmounted: function () {
                                  if (cleanupScroll_) {
                                    cleanupScroll_();
                                    cleanupScroll_ = null;
                                  }
                                },
                                onMounted: function (event) {
                                  var $elm = event.target.get$elm();
                                  $elm.setAttribute("data-table-body-scroll", "");
                                  function onScroll() {
                                    if (isScrollSyncing_) return;
                                    isScrollSyncing_ = true;
                                    if (headerScrollEl_) headerScrollEl_.scrollLeft = $elm.scrollLeft;
                                    isScrollSyncing_ = false;
                                  }
                                  $elm.addEventListener("scroll", onScroll);
                                  cleanupScroll_ = function () {
                                    $elm.removeEventListener("scroll", onScroll);
                                  };
                                },
                                render: function (row, idx) {
                                  var cellRefs = panel.columns.map(function (col) {
                                    return computed(row, function (t) {
                                      return formatCell(t[col.name]);
                                    });
                                  });

                                  var rowNum = computed(idx, function (i) { return String(i + 1); });

                                  var borderBottom_ = combine(
                                    { idx: idx, data: panel.data },
                                    function (t) {
                                      return t.idx === t.data.length - 1
                                        ? "none"
                                        : "1px solid #e5e7eb";
                                    },
                                  );

                                  // Capture grid element for model registration
                                  var rowGridEl_ = null;

                                  return View(
                                    {
                                      onMounted: function (event) {
                                        rowGridEl_ = event.target.get$elm();
                                        colModel.registerGrid(rowGridEl_);
                                      },
                                      onUnmounted: function () {
                                        if (rowGridEl_) {
                                          colModel.unregisterGrid(rowGridEl_);
                                          rowGridEl_ = null;
                                        }
                                        borderBottom_.destroy();
                                        rowNum.destroy();
                                        cellRefs.forEach(function (r) { r.destroy(); });
                                      },
                                      style: {
                                        display: "grid",
                                        "grid-template-columns": colModel.gridTemplate_,
                                        "min-width": colModel.totalWidthPx_,
                                        "border-bottom": borderBottom_,
                                      },
                                    },
                                    [
                                      View(
                                        {
                                          class: "px-3 py-2 text-xs text-muted-foreground text-right font-mono select-none",
                                          style: {
                                            position: "sticky",
                                            left: "0px",
                                            "z-index": 2,
                                            "background-color": "var(--background)",
                                          },
                                        },
                                        [rowNum],
                                      ),
                                      ...cellRefs.map(function (ref, cidx) {
                                        var cellGridIdx = cidx + 1;
                                        var isLeftSticky = colModel.isLeftSticky(cellGridIdx);
                                        var isRightSticky = colModel.isRightSticky(cellGridIdx);
                                        var cellStickyStyle = {};
                                        if (isLeftSticky) {
                                          cellStickyStyle.position = "sticky";
                                          cellStickyStyle.left = computed(colModel.stickyLefts_[cellGridIdx], function (v) { return v + "px"; });
                                          cellStickyStyle["z-index"] = 2;
                                          cellStickyStyle["background-color"] = "var(--background)";
                                          if (colModel.hasLeftShadow(cellGridIdx)) {
                                            cellStickyStyle["box-shadow"] = "inset -1px 0 0 0 var(--border)";
                                          }
                                        } else if (isRightSticky) {
                                          cellStickyStyle.position = "sticky";
                                          cellStickyStyle.right = "0px";
                                          cellStickyStyle["z-index"] = 2;
                                          cellStickyStyle["background-color"] = "var(--background)";
                                          cellStickyStyle["box-shadow"] = "inset 1px 0 0 0 var(--border)";
                                        }
                                        return View(
                                          { class: "px-3 py-2 text-sm truncate", style: cellStickyStyle },
                                          [ref],
                                        );
                                      }),
                                    ],
                                  );
                                },
                              }),
                            ]),
                          ]);
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
  ]);
}
