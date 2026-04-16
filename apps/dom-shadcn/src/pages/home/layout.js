/**
 * 首页布局
 */
import {
  View,
  Show,
  For,
  Icon,
  Button,
  Img,
  refobj,
  computed,
} from "@timeless/timeless";
import { KeepAliveSubViews, Separator } from "@timeless/shadcn";
import { RouteMenusModel } from "@timeless/kit";

export default function HomeLayoutView(props) {
  const projects = [
    { id: "1", name: "Project A" },
    { id: "2", name: "Project B" },
  ];

  const sidemenu$ = RouteMenusModel({
    view: props.view,
    history: props.history,
    menus: [
      { title: "Home", name: "root.home_layout.index", children: [] },
      { title: "Article", name: "root.home_layout.article" },
      { title: "Project", name: "root.home_layout.project" },
      { title: "Settings", name: "root.home_layout.settings" },
      { title: "Chat", name: "root.home_layout.chat" },
    ],
  });

  return View(
    {
      class: "home-layout",
      style: {
        display: "flex",
        height: "100%",
      },
    },
    [
      View(
        {
          class: "sidebar-wrapper",
          style: {
            width: "80px",
            padding: "24px 0",
            // "border-right": "1px solid #e4e4e7",
            display: "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
          },
        },
        [
          View(
            {
              style: {
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                gap: "12px",
              },
              class: "flex-1",
            },
            [
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "12px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "bold",
                    "font-size": "20px",
                    cursor: "pointer",
                  },
                  class: "bg-zinc-100 dark:bg-zinc-800",
                  onClick() {
                    props.history.push("root.home_layout.index.general");
                  },
                },
                ["T"],
              ),
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    cursor: "pointer",
                  },
                  class: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  onClick() {
                    props.history.push("root.home_layout.article");
                  },
                },
                [Icon({ name: "rss", size: 24 })],
              ),
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "8px",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    cursor: "pointer",
                  },
                  class: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  onClick() {
                    props.history.push("root.home_layout.chat");
                  },
                },
                [Icon({ name: "message-square-more", size: 24 })],
              ),
              Separator({ orientation: "horizontal" }),
              For({
                each: projects,
                render(project) {
                  return View(
                    {
                      style: {
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      },
                      class: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                      onClick() {
                        props.history.push(
                          "root.home_layout.project.workspace",
                          {
                            id: project.id,
                          },
                        );
                      },
                    },
                    [project.name.charAt(0)],
                  );
                },
              }),
            ],
          ),
          View(
            {
              style: {
                display: "flex",
                "flex-direction": "column",
                alignItems: "center",
                gap: "24px",
                padding: "16px 0",
              },
            },
            [
              Button(
                {
                  onClick() {
                    props.history.push("root.admin_layout.dashboard");
                  },
                },
                [Icon({ name: "grid-3x3", size: 24 })],
              ),
              Button(
                {
                  onClick() {
                    const cur = props.app.getTheme();
                    const next = cur === "dark" ? "light" : "dark";
                    props.app.setTheme(next);
                  },
                },
                [Icon({ name: "sun", size: 24 })],
              ),
              View(
                {
                  style: {
                    width: "40px",
                    height: "40px",
                    "border-radius": "50%",
                    overflow: "hidden",
                    cursor: "pointer",
                  },
                },
                [
                  Img({
                    src: "/avatar.jpeg",
                    alt: "User Avatar",
                    style: {
                      width: "100%",
                      height: "100%",
                      "object-fit": "cover",
                    },
                  }),
                ],
              ),
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
