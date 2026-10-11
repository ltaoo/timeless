import { describe, expect, it } from "vitest";
import { HistoryCore } from "../index";
import { NavigatorCore } from "../../navigator";
import { RouteViewCore } from "../../route_view";
import { buildRoutes } from "../../route_view/utils";

function createHistory() {
  const configure = {
    ReaderLayout: { pathname: "/", title: "Reader", options: { require: ["reader:read"] }, children: {
      Dashboard: { pathname: "/dashboard", title: "Dashboard", is_default: true },
      Subscriptions: { pathname: "/subscription", title: "Subscriptions", children: {
        Articles: { pathname: "/subscription/articles", title: "Articles", is_default: true, is_notfound_fallback: true },
      } },
      Settings: { pathname: "/settings", title: "Settings", options: { require: ["settings:write"] }, children: {
        Accounts: { pathname: "/settings/accounts", title: "Accounts", is_default: true, is_notfound_fallback: true },
        Push: { pathname: "/settings/push", title: "Push", options: { menu: "settings", content: "push", require: ["reader:read", "login"] } },
      } },
    } },
  };
  const built = buildRoutes(configure);
  const root = new RouteViewCore({ name: "root", pathname: "/", title: "Root", visible: true, parent: null, views: [] });
  const history = new HistoryCore({ view: root, router: new NavigatorCore(), routes: built.routes, views: { root } });
  return { history, built, configure };
}

describe("published reader routing contract", () => {
  it("matches leaf pages and resolves each layout to its own default", () => {
    const { history, built } = createHistory();
    expect(built.defaultRouteName).toBe("root.ReaderLayout.Dashboard");
    expect(history.matchPath("/")).toBe(history.routes["root.ReaderLayout.Dashboard"]);
    expect(history.matchPath("/subscription")).toBe(history.routes["root.ReaderLayout.Subscriptions.Articles"]);
    expect(history.matchPath("/settings")).toBe(history.routes["root.ReaderLayout.Settings.Accounts"]);
    expect(history.matchPath("/settings/push")).toBe(history.routes["root.ReaderLayout.Settings.Push"]);
  });
  it("uses the nearest fallback without treating a partial path prefix as a layout", () => {
    const { history } = createHistory();
    expect(history.matchPath("/settings/missing")).toBe(history.matchPath("/settings/accounts"));
    expect(history.matchPath("/settings-unrelated/missing")).toBe(history.matchPath("/subscription/articles"));
    expect(history.matchPath("/missing")).toBe(history.matchPath("/subscription/articles"));
  });
  it("inherits and deduplicates permissions without mutating declarations", () => {
    const { history, configure } = createHistory();
    expect(history.matchPath("/settings/accounts")?.options?.require).toEqual(["reader:read", "settings:write"]);
    expect(history.matchPath("/settings/push")?.options?.require).toEqual(["reader:read", "settings:write", "login"]);
    expect(history.matchPath("/dashboard")?.options?.require).toEqual(["reader:read"]);
    expect(configure.ReaderLayout.children.Settings.children.Push.options.require).toEqual(["reader:read", "login"]);
    expect(history.matchPath("/settings/push")?.options?.content).toBe("push");
  });
  it("returns null when the tree has no fallback", () => {
    const built = buildRoutes({ Home: { pathname: "/home", title: "Home" } });
    const root = new RouteViewCore({ name: "root", pathname: "/", title: "Root", visible: true, parent: null, views: [] });
    const history = new HistoryCore({ view: root, router: new NavigatorCore(), routes: built.routes, views: { root } });
    expect(history.matchPath("/missing")).toBeNull();
  });
});
