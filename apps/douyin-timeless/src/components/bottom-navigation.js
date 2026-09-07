const NAV_ITEMS = [
  ["home", "首页"],
  ["shop", "商城"],
  ["publish", ""],
  ["message", "消息"],
  ["me", "我"],
];

function active_route(route) {
  if (route === "product") return "shop";
  if (route === "chat") return "message";
  if (route === "profile" || route === "search" || route === "video")
    return "home";
  return route;
}

export function BottomNavigationView(props) {
  const { app_model, theme = "dark" } = props;
  return View({ class: `bottom-navigation bottom-navigation-${theme}` }, [
    ...NAV_ITEMS.map(([route, label]) => {
      if (route === "publish") {
        return View(
          {
            class: "bottom-navigation-item publish-navigation-item",
            attributes: { role: "button", "aria-label": "发布" },
            onClick() {
              app_model.methods.navigate("publish");
            },
          },
          [
            View({ class: "publish-button" }, [
              View({ class: "publish-plus" }, ["+"]),
            ]),
          ],
        );
      }
      return View(
        {
          class: computed(app_model.state.route, (current) => {
            const active = active_route(current) === route ? " is-active" : "";
            return `bottom-navigation-item${active}`;
          }),
          attributes: { role: "button", "aria-label": label },
          onClick() {
            app_model.methods.navigate(route);
          },
        },
        [
          View({ as: "span", class: "bottom-navigation-label" }, [label]),
          route === "message"
            ? View({ as: "span", class: "bottom-navigation-badge" }, ["2"])
            : null,
        ],
      );
    }),
  ]);
}
