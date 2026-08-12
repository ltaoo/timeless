import {
  View,
  Show,
  For,
  refobj,
  computed,
  KeepAliveSubViews,
  RouteMenusModel,
} from "@timeless/timeless";
import { Separator } from "@timeless/shadcn";

export default function HomePageView(props) {
  const sidemenu$ = RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "General", name: "home.general" },
      { title: "Overlay", name: "root.home_layout.index.overlay" },
    ],
  });

  return View(
    {
      style: {
        height: "100%",
        display: "flex",
        "flex-direction": "row",
      },
    },
    [
      View(
        {
          style: {
            width: "25%",
            "min-width": "20%",
            "max-width": "50%",
            display: "flex",
            "flex-direction": "column",
            padding: "16px 0",
          },
        },
        [
          View(
            {
              style: {
                padding: "0 12px",
                "margin-bottom": "12px",
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
              },
            },
            [
              View(
                {
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  },
                },
                ["Components"],
              ),
            ],
          ),
          View(
            {
              style: {
                flex: 1,
                "overflow-y": "auto",
              },
            },
            [
              For({
                each: sidemenu$.menus,
                render(menu) {
                  return View(
                    {
                      style: {
                        padding: "8px 12px",
                        "font-size": "14px",
                        cursor: "pointer",
                      },
                      class: computed(sidemenu$.cur, (t) => {
                        return sidemenu$.isSelected(t, menu)
                          ? "bg-zinc-100 font-medium dark:bg-zinc-800"
                          : "text-zinc-500 hover:text-zinc-900";
                      }),
                      onClick() {
                        props.history.push(menu.name);
                      },
                    },
                    [menu.title],
                  );
                },
              }),
            ],
          ),
        ],
      ),
      View(
        {
          style: {
            flex: 1,
            overflow: "auto",
          },
        },
        [KeepAliveSubViews(props)],
      ),
    ],
  );
}
