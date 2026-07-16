const { View, Text, For, computed, ref, refarr } = Timeless;
const { KeepAliveSubViews } = Timeless.web;
import { StackLayout } from "../../components/layout.js";
import { findMockUserById } from "./data.js";

function stableStringifyQuery(query) {
  if (!query) return "";
  const keys = Object.keys(query).sort();
  const normalized = {};
  for (const k of keys) {
    const v = query[k];
    if (v === undefined) continue;
    normalized[k] = v;
  }
  return JSON.stringify(normalized);
}

function buildTabKey(view) {
  return `${view.name}::${stableStringifyQuery(view.query)}`;
}

function AdminTabBar({ tabs, activeKey, navigateToTab, getTabTitle }) {
  return View(
    {
      class: "shrink-0 flex items-center gap-1 px-3 py-2 border-b border-zinc-200 overflow-x-auto dark:border-zinc-800",
    },
    [
      For({
        each: tabs,
        render(tab) {
          return View(
            {
              class: "shrink-0 max-w-[220px] px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors flex items-center gap-2 " +
                (activeKey.value === tab.key
                  ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"),
              onClick() {
                navigateToTab(tab);
              },
            },
            [View({ class: "truncate" }, [getTabTitle(tab)])],
          );
        },
      }),
    ],
  );
}

export default function AdminLayoutView(props) {
  const sidemenu$ = Timeless.RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "Dashboard", name: "root.admin_layout.dashboard" },
      {
        title: "Users",
        name: "root.admin_layout.users",
        children: ["root.admin_layout.user_detail"],
      },
      {
        title: "User 1",
        name: "root.admin_layout.user_detail",
        query: { id: "3" },
      },
      { title: "Roles", name: "root.admin_layout.roles" },
      { title: "Logs", name: "root.admin_layout.logs" },
      { title: "System", name: "root.admin_layout.system" },
    ],
  });

  const tabs = refarr([]);
  const activeKey = ref("");

  const getTitleForView = (view) => {
    const lastKey = String(view.name || "").split(".").pop();
    if (lastKey === "users") return "Users";
    if (lastKey === "user_detail") {
      const user = findMockUserById(view.query?.id);
      return user ? `User: ${user.name}` : "User Detail";
    }
    return view.title || view.name;
  };

  const ensureTab = (view) => {
    if (!view) return;
    const key = buildTabKey(view);
    const existed = tabs.find((t) => t.key === key);
    if (!existed) {
      tabs.push({
        key,
        name: view.name,
        query: view.query,
        title: getTitleForView(view),
      });
    } else {
      existed.query = view.query;
      existed.title = getTitleForView(view);
    }
    activeKey.as(key);
  };

  if (props.view?.curView) {
    ensureTab(props.view.curView);
  }
  props.view.onCurViewChange((view) => {
    ensureTab(view);
  });

  props.history.onRouteChange(({ view }) => {
    if (!view) return;
    const name = String(view.name || "");
    if (!name.startsWith("root.admin_layout.")) return;
    ensureTab(view);
  });

  const navigateToTab = (tab) => {
    props.history.push(tab.name, tab.query);
  };

  return View({ class: "h-full flex" }, [
    // Sidebar
    View({ class: "w-[22%] min-w-[200px] max-w-[280px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col" }, [
      View({ class: "py-4 h-full flex flex-col" }, [
        View({ class: "px-3 mb-3 flex items-center justify-between" }, [
          View(
            {
              class: "text-xs font-bold text-zinc-400 uppercase tracking-widest",
            },
            ["Admin"],
          ),
        ]),
        View({ class: "flex-1 overflow-y-auto" }, [
          For({
            each: sidemenu$.menus,
            render(menu) {
              return View(
                {
                  class: "px-3 py-2 text-sm cursor-pointer transition-colors " +
                    (sidemenu$.isSelected(sidemenu$.cur, menu)
                      ? "text-zinc-900 bg-zinc-100 font-medium dark:text-zinc-50 dark:bg-zinc-800"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"),
                  onClick() {
                    sidemenu$.handleClick(menu);
                  },
                },
                [menu.title],
              );
            },
          }),
        ]),
      ]),
    ]),
    // Main content
    View({ class: "flex-1 flex flex-col min-w-0" }, [
      StackLayout(
        {
          header: [
            AdminTabBar({
              tabs,
              activeKey,
              navigateToTab,
              getTabTitle(tab) {
                return tab.title;
              },
            }),
          ],
          headerClass: "bg-white dark:bg-zinc-950",
        },
        [KeepAliveSubViews(props)],
      ),
    ]),
  ]);
}
