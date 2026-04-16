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

export default function HomeLayoutView(props) {
  const projects = [
    { id: "1", name: "Project A" },
    { id: "2", name: "Project B" },
  ];

  const sidemenu$ = refobj({
    cur: "home_layout",
    menus: [
      { title: "Home", name: "root.home_layout.index", children: [] },
      { title: "Article", name: "root.home_layout.article" },
      { title: "Project", name: "root.home_layout.project" },
      { title: "Settings", name: "root.home_layout.settings" },
      { title: "Chat", name: "root.home_layout.chat" },
    ],
    isSelected(menu_name) {
      return this.cur === menu_name;
    },
    isSubRoute(name) {
      return this.cur?.startsWith(name);
    },
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
            width: "72px",
            padding: "24px 0",
            borderRight: "1px solid #e4e4e7",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        },
        [
          View(
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "20px",
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
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                flexDirection: "column",
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
                    borderRadius: "50%",
                    overflow: "hidden",
                    cursor: "pointer",
                  },
                },
                [
                  Img({
                    src: "public/avatar.jpeg",
                    alt: "User Avatar",
                    style: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
