import { Grid, View, For, ref, combine, refarr } from "@timeless/timeless";
import { render } from "@timeless/timeless-tui";

const apps = [
  { icon: "🎬", title: "Movies", subtitle: "Movies & Shows" },
  { icon: "🎵", title: "Music", subtitle: "Your Favorites" },
  { icon: "📷", title: "Photos", subtitle: "Photo Library" },
  { icon: "📡", title: "Live TV", subtitle: "200+ Channels" },
  { icon: "🎮", title: "Games", subtitle: "Play & Compete" },
  { icon: "⚙️", title: "Settings", subtitle: "Preferences" },
  { icon: "⛅", title: "Weather", subtitle: "5-Day Forecast" },
  { icon: "🛒", title: "Store", subtitle: "Discover Apps" },
  { icon: "💪", title: "Fitness", subtitle: "Track Workouts" },
  { icon: "📰", title: "News", subtitle: "Headlines" },
  { icon: "🧸", title: "Kids", subtitle: "Family Friendly" },
  { icon: "🌐", title: "Browser", subtitle: "Surf the Web" },
];

function ApplicationView() {
  const page = ref("todo");
  const columns = 4;
  const todoPageStyle = combine(page, (p) => ({
    opacity: p === "todo" ? 1 : 0,
  }));
  const appPageStyle = combine(page, (p) => ({
    opacity: p === "app" ? 1 : 0,
  }));
  const todos = refarr([
    {
      id: 1,
      title: "Buy groceries",
    },
    {
      id: 2,
      title: "Study for exam exam exam",
    },
  ]);

  return View({}, [
    View({}, [
      View(
        {
          onClick() {
            // console.log("click todo");
            page.set("todo");
          },
        },
        ["Goto Todo List"],
      ),
      View(
        {
          onClick() {
            // console.log("click app");
            page.set("app");
          },
        },
        ["Goto Application List"],
      ),
    ]),
    View(
      {
        style: todoPageStyle,
      },
      [
        View({}, ["Todo List Page"]),
        For({
          each: todos,
          render(todo) {
            return View({}, [todo.title]);
          },
        }),
      ],
    ),
    View(
      {
        style: appPageStyle,
      },
      [
        View({}, ["Application List Page"]),
        Grid(
          { columns, gap: 16 },
          apps.map((app, idx) => {
            return View(
              {
                style: {
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.18)",
                },
              },
              [
                View({ style: { textAlign: "center", fontSize: 22 } }, [
                  app.icon,
                ]),
                View(
                  {
                    style: {
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 14,
                    },
                  },
                  [app.title],
                ),
                View(
                  {
                    style: { textAlign: "center", fontSize: 12, color: "gray" },
                  },
                  [app.subtitle],
                ),
              ],
            );
          }),
        ),
      ],
    ),
  ]);
}

const elm = ApplicationView({});
render(elm, {
  // onVNodeTreeCreated(data) {
  //   console.log(data);
  // },
});
