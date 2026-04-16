import { View, Show, For, refobj, computed } from "@timeless/timeless";
import { KeepAliveSubViews, Separator } from "@timeless/shadcn";

export default function HomePageView(props) {
  const sidemenu$ = refobj({
    cur: "home_index.general",
    menus: [
      { title: "General", name: "home.general" },
      { title: "Input", name: "home.form" },
      { title: "Field", name: "home.validate" },
      { title: "LLM", name: "home.llm" },
      { title: "Data Display", name: "home.data" },
      { title: "ScrollView", name: "home.scroll" },
      { title: "Feedback", name: "home.feedback" },
      { title: "Navigation", name: "home.nav" },
      { title: "Overlay", name: "home.overlay" },
      { title: "Command", name: "home.command" },
      { title: "Debug", name: "home.debug" },
      { title: "Lifecycle", name: "home.lifecycle" },
      { title: "Download Task", name: "home.download_task" },
    ],
    isSelected(menu) {
      return this.cur === menu.name;
    },
  });

  return View(
    {
      style: {
        height: "100%",
        display: "flex",
        flexDirection: "row",
      },
    },
    [
      View(
        {
          style: {
            width: "25%",
            minWidth: "20%",
            maxWidth: "50%",
            display: "flex",
            flexDirection: "column",
            padding: "16px 0",
          },
        },
        [
          View(
            {
              style: {
                padding: "0 12px",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
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
                overflowY: "auto",
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
                        fontSize: "14px",
                        cursor: "pointer",
                      },
                      class: computed(sidemenu$.cur, (t) => {
                        return sidemenu$.isSelected(menu)
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
