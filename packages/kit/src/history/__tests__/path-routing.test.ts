import { describe, expect, it, vi, afterEach } from "vitest";
import { HistoryCore } from "../index";
import { NavigatorCore } from "../../navigator";
import { RouteViewCore } from "../../route_view";
import { buildRoutes } from "../../route_view/utils";

function createHistory(configure: Parameters<typeof buildRoutes>[0]) {
  const built = buildRoutes(configure);
  const root = new RouteViewCore({
    name: "root",
    pathname: "/",
    title: "Root",
    visible: true,
    parent: null,
    views: [],
  });
  root.isRoot = true;
  const history = new HistoryCore({
    view: root,
    router: new NavigatorCore(),
    routes: built.routes,
    views: { root },
  });
  return { ...built, history };
}

const configure = {
  reader: {
    title: "Reader",
    pathname: "/",
    options: { require: ["reader:read"] },
    children: {
      home: { title: "Home", pathname: "/home", is_default: true },
      articles: {
        title: "Articles",
        pathname: "/articles",
        is_notfound_fallback: true,
      },
      settings: {
        title: "Settings",
        pathname: "/settings",
        options: { require: ["settings:write"] },
        children: {
          reader: {
            title: "Reader settings",
            pathname: "/settings/reader",
            is_default: true,
            is_notfound_fallback: true,
          },
          accounts: {
            title: "Accounts",
            pathname: "/settings/accounts",
            component: () => "accounts",
          },
          legacy: {
            title: "Accounts",
            pathname: "/settings/freshrss",
            component: () => "accounts",
          },
          nested: {
            title: "Nested",
            pathname: "/settings/nested",
            is_default: false,
            children: {
              index: {
                title: "Index",
                pathname: "/settings/nested/index",
                is_default: true,
                is_notfound_fallback: true,
              },
            },
          },
        },
      },
    },
  },
};

describe("pathname resolution", () => {
  afterEach(() => vi.useRealTimers());
  it("resolves exact paths and layout defaults, including several layout levels", () => {
    const { history, defaultRouteName } = createHistory(configure);
    expect(defaultRouteName).toBe("root.reader.home");
    expect(history.matchPath("/")?.pathname).toBe("/home");
    expect(history.matchPath("/settings")?.pathname).toBe("/settings/reader");
    expect(history.matchPath("/settings/accounts")?.name).toBe(
      "root.reader.settings.accounts",
    );
    const defaultAlias = createHistory({
      layout: {
        title: "Layout",
        pathname: "/layout",
        children: {
          leaf: { title: "Leaf", pathname: "/leaf", default: true },
        },
      },
    });
    expect(defaultAlias.history.matchPath("/layout")?.pathname).toBe("/leaf");
    const nested = createHistory({
      layout: {
        title: "Layout",
        pathname: "/layout",
        children: {
          inner: {
            title: "Inner",
            pathname: "/layout/inner",
            is_default: true,
            children: {
              leaf: {
                title: "Leaf",
                pathname: "/layout/inner/leaf",
                is_default: true,
              },
            },
          },
        },
      },
    });
    expect(nested.history.matchPath("/layout")?.pathname).toBe(
      "/layout/inner/leaf",
    );
    vi.useFakeTimers();
    nested.history.push("root.layout");
    expect(nested.history.$router.href).toBe("/layout/inner/leaf");
  });
  it("uses the most specific fallback without matching similarly named path segments", () => {
    const { history } = createHistory(configure);
    expect(history.matchPath("/settings/missing")?.pathname).toBe(
      "/settings/reader",
    );
    expect(history.matchPath("/settings/nested/missing")?.pathname).toBe(
      "/settings/nested/index",
    );
    expect(history.matchPath("/settings-other/missing")?.pathname).toBe(
      "/articles",
    );
    expect(history.matchPath("/missing")?.pathname).toBe("/articles");
  });
  it("uses the configured global notfound route and returns null when none exists", () => {
    const { history, notfoundRouteName } = createHistory({
      missing: { title: "Missing", pathname: "/404", notfound: true },
    });
    expect(history.matchPath("/unknown")?.name).toBe(notfoundRouteName);
    expect(
      createHistory({
        home: { title: "Home", pathname: "/home" },
      }).history.matchPath("/unknown"),
    ).toBeNull();
  });
  it("inherits required permissions without changing unrelated route options", () => {
    const { history } = createHistory(configure);
    expect(history.matchPath("/settings/accounts")?.options?.require).toEqual([
      "reader:read",
      "settings:write",
    ]);
    expect(configure.reader.options.require).toEqual(["reader:read"]);
    const other = createHistory({
      layout: {
        title: "Layout",
        pathname: "/layout",
        options: { keep_alive: false },
        children: {
          leaf: {
            title: "Leaf",
            pathname: "/leaf",
            options: { require: ["login"] },
          },
        },
      },
    });
    expect(other.history.matchPath("/leaf")?.options).toEqual({
      require: ["login"],
    });
  });
  it("keeps repeated page declarations as separate paths", () => {
    const { history } = createHistory(configure);
    expect(history.matchPath("/settings/freshrss")?.name).toBe(
      "root.reader.settings.legacy",
    );
    expect(history.matchPath("/settings/freshrss")?.pathname).toBe(
      "/settings/freshrss",
    );
    vi.useFakeTimers();
    history.push("root.reader.settings.legacy", { feed: "one" });
    expect(history.$router.href).toBe("/settings/freshrss?feed=one");
  });
});
