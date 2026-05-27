// ============================================================
// Mock data
// ============================================================

export var MOCK_TABLES = [
  {
    name: "users",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "username",
        type: "varchar(50)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 2,
        name: "email",
        type: "varchar(100)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 3,
        name: "password",
        type: "varchar(255)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 4,
        name: "avatar",
        type: "varchar(255)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 5,
        name: "created_at",
        type: "datetime",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
  {
    name: "posts",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "title",
        type: "varchar(200)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 2,
        name: "content",
        type: "text",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 3,
        name: "user_id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 4,
        name: "status",
        type: "varchar(20)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 5,
        name: "created_at",
        type: "datetime",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
  {
    name: "comments",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "content",
        type: "text",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 2,
        name: "user_id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 3,
        name: "post_id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 4,
        name: "created_at",
        type: "datetime",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
  {
    name: "tags",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "name",
        type: "varchar(50)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
  {
    name: "post_tags",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "post_id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 2,
        name: "tag_id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
  {
    name: "analytics",
    columns: [
      {
        cid: 0,
        name: "id",
        type: "int",
        notnull: true,
        dflt_value: null,
        pk: true,
      },
      {
        cid: 1,
        name: "event_name",
        type: "varchar(100)",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 2,
        name: "user_id",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 3,
        name: "session_id",
        type: "varchar(64)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 4,
        name: "page_url",
        type: "varchar(500)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 5,
        name: "referrer",
        type: "varchar(500)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 6,
        name: "browser",
        type: "varchar(100)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 7,
        name: "os",
        type: "varchar(50)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 8,
        name: "device_type",
        type: "varchar(20)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 9,
        name: "country",
        type: "varchar(50)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 10,
        name: "city",
        type: "varchar(100)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 11,
        name: "duration_ms",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 12,
        name: "scroll_depth_pct",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 13,
        name: "click_target",
        type: "varchar(200)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 14,
        name: "custom_event",
        type: "varchar(100)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 15,
        name: "value",
        type: "real",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 16,
        name: "utm_source",
        type: "varchar(100)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 17,
        name: "utm_medium",
        type: "varchar(100)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 18,
        name: "utm_campaign",
        type: "varchar(200)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 19,
        name: "ip_address",
        type: "varchar(45)",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 20,
        name: "user_agent",
        type: "text",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 21,
        name: "screen_width",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 22,
        name: "screen_height",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 23,
        name: "is_bounce",
        type: "int",
        notnull: false,
        dflt_value: null,
        pk: false,
      },
      {
        cid: 24,
        name: "created_at",
        type: "datetime",
        notnull: true,
        dflt_value: null,
        pk: false,
      },
    ],
  },
];

export var STATUSES = ["draft", "published", "review", "archived"];
export var USERNAMES = [
  "alice",
  "bob",
  "charlie",
  "diana",
  "eve",
  "frank",
  "grace",
  "hank",
  "iris",
  "jack",
];
export var TAG_NAMES = [
  "sqlite",
  "database",
  "tutorial",
  "performance",
  "security",
  "react",
  "javascript",
  "api",
  "devops",
  "testing",
];
export var EVENT_NAMES = [
  "page_view",
  "click",
  "scroll",
  "form_submit",
  "video_play",
  "download",
  "signup",
  "login",
  "search",
  "share",
];
export var PAGE_URLS = [
  "/home",
  "/products",
  "/about",
  "/contact",
  "/blog/post-1",
  "/pricing",
  "/docs/getting-started",
  "/dashboard",
  "/settings",
  "/profile",
];
export var REFERRERS = [
  "https://google.com",
  "https://twitter.com",
  "https://reddit.com",
  "https://news.ycombinator.com",
  "https://github.com",
  null,
  null,
  null,
];
export var BROWSERS = [
  "Chrome 120",
  "Firefox 121",
  "Safari 17",
  "Edge 120",
  "Chrome 119",
  "Firefox 120",
];
export var OS_LIST = [
  "Windows 11",
  "macOS 14",
  "Ubuntu 22.04",
  "iOS 17",
  "Android 14",
  "macOS 13",
];
export var DEVICE_TYPES = ["desktop", "desktop", "desktop", "mobile", "tablet"];
export var COUNTRIES = [
  "US",
  "GB",
  "DE",
  "JP",
  "BR",
  "IN",
  "CA",
  "AU",
  "FR",
  "KR",
];
export var CITIES = [
  "New York",
  "London",
  "Berlin",
  "Tokyo",
  "Sao Paulo",
  "Mumbai",
  "Toronto",
  "Sydney",
  "Paris",
  "Seoul",
];
export var CLICK_TARGETS = [
  "#hero-btn",
  ".nav-link",
  ".card-title",
  ".cta-button",
  "#submit-form",
  ".dropdown-toggle",
  null,
  null,
  null,
  null,
];
export var CUSTOM_EVENTS = [
  "video_started",
  "form_abandoned",
  "cart_add",
  "wishlist_add",
  "item_viewed",
  "checkout_started",
  null,
  null,
  null,
  null,
];
export var UTM_SOURCES = [
  "google",
  "twitter",
  "newsletter",
  "facebook",
  "linkedin",
  null,
  null,
  null,
];
export var UTM_MEDIUMS = [
  "cpc",
  "social",
  "email",
  "banner",
  "affiliate",
  null,
  null,
  null,
];
export var UTM_CAMPAIGNS = [
  "spring_sale",
  "launch_2024",
  "black_friday",
  "back_to_school",
  "holiday_special",
  null,
  null,
  null,
  null,
];
export var SCREEN_SIZES = [
  [1920, 1080],
  [1440, 900],
  [1366, 768],
  [2560, 1440],
  [390, 844],
  [414, 896],
  [768, 1024],
  [1280, 720],
];

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randDate() {
  var y = 2024 + Math.floor(Math.random() * 2);
  var m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  var d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  var h = String(Math.floor(Math.random() * 24)).padStart(2, "0");
  var mi = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  var s = String(Math.floor(Math.random() * 60)).padStart(2, "0");
  return y + "-" + m + "-" + d + " " + h + ":" + mi + ":" + s;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockRows(tableName, count) {
  var rows = [];
  for (var i = 0; i < count; i++) {
    switch (tableName) {
      case "users":
        rows.push({
          id: i + 1,
          username: USERNAMES[i] || "user" + (i + 1),
          email: (USERNAMES[i] || "user" + (i + 1)) + "@example.com",
          password: "hash_" + Math.random().toString(36).slice(2, 10),
          avatar:
            i % 3 === 0
              ? "/avatars/" + (USERNAMES[i] || "user" + (i + 1)) + ".png"
              : null,
          created_at: randDate(),
        });
        break;
      case "posts":
        rows.push({
          id: i + 1,
          title:
            "Post #" +
            (i + 1) +
            " — " +
            pick([
              "Getting Started",
              "Advanced Guide",
              "Tips & Tricks",
              "Best Practices",
              "Deep Dive",
            ]),
          content:
            i % 3 === 0 ? null : "Full content body for post #" + (i + 1) + ".",
          user_id: randInt(1, 10),
          status: pick(STATUSES),
          created_at: randDate(),
        });
        break;
      case "comments":
        rows.push({
          id: i + 1,
          content: pick([
            "Great article!",
            "Thanks for sharing.",
            "Well written!",
            "Bookmarked.",
            "Keep it up!",
          ]),
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
          user_agent:
            "Mozilla/5.0 (" +
            pick(["Windows NT 10.0", "Macintosh", "X11"]) +
            ") " +
            pick(["Chrome", "Firefox", "Safari"]) +
            "/" +
            randInt(100, 130) +
            ".0",
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

export function formatCell(val) {
  if (val === null) return "NULL";
  if (val === undefined) return "";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

export function getRowKey(columns) {
  for (var i = 0; i < columns.length; i++) {
    if (columns[i].pk) return columns[i].name;
  }
  return columns.length > 0 ? columns[0].name : "id";
}
