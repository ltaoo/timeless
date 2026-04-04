import { Grid, View, For, ref, combine, refarr } from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-dom";

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
  const focused = ref({ x: 0, y: 0 });
  const todos = refarr([
    {
      id: 1,
      title: "Buy groceries",
    },
  ]);

  function xyFromIdx(idx) {
    return { x: idx % columns, y: Math.floor(idx / columns) };
  }

  function maxXAtRow(y) {
    const maxY = Math.floor((apps.length - 1) / columns);
    if (y === maxY) return (apps.length - 1) % columns;
    return columns - 1;
  }

  function moveFocus(direction) {
    focused.as((prev) => {
      const maxY = Math.floor((apps.length - 1) / columns);
      let { x, y } = prev;

      if (direction === "left") {
        if (x > 0) x -= 1;
        else if (y > 0) {
          y -= 1;
          x = maxXAtRow(y);
        }
      }

      if (direction === "right") {
        const maxX = maxXAtRow(y);
        if (x < maxX) x += 1;
        else if (y < maxY) {
          y += 1;
          x = 0;
        }
      }

      if (direction === "up") {
        if (y > 0) {
          y -= 1;
          x = Math.min(x, maxXAtRow(y));
        }
      }

      if (direction === "down") {
        if (y < maxY) {
          y += 1;
          x = Math.min(x, maxXAtRow(y));
        }
      }

      return { x, y };
    });
  }

  function isFocusedCell(focusedXY, idx) {
    const { x, y } = xyFromIdx(idx);
    return focusedXY.x === x && focusedXY.y === y;
  }

  platform.addEventListener("keydown", handleKeydown);

  function handleKeydown(event) {
    const { key } = event;
    console.log("handleKeydown", key);
    if (key === "ArrowLeft") {
      moveFocus("left");
    }
    if (key === "ArrowRight") {
      moveFocus("right");
    }
    if (key === "ArrowUp") {
      moveFocus("up");
    }
    if (key === "ArrowDown") {
      moveFocus("down");
    }
  }

  return View({}, [
    View({}, [
      View(
        {
          onClick() {
            page.set("todo");
          },
        },
        ["Goto Todo List"],
      ),
      View(
        {
          onClick() {
            page.set("app");
          },
        },
        ["Goto Application List"],
      ),
    ]),
    View(
      {
        style: {
          opacity: combine(page, (p) => (p === "todo" ? 1 : 0)),
        },
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
        style: {
          opacity: combine(page, (p) => (p === "app" ? 1 : 0)),
        },
      },
      [
        View({}, ["Application List Page"]),
        Grid(
          { columns, gap: 16 },
          apps.map((app, idx) => {
            return View(
              {
                style: {
                  borderColor: combine({ focused, idx }, (t) => {
                    return isFocusedCell(t.focused, t.idx)
                      ? "#007bff"
                      : "rgba(255,255,255,0.18)";
                  }),
                },
              },
              [
                View({ style: { fontSize: 22 } }, [app.icon]),
                View({ style: { fontWeight: "bold", fontSize: 14 } }, [
                  app.title,
                ]),
                View({ style: { fontSize: 12, color: "gray" } }, [
                  app.subtitle,
                ]),
              ],
            );
          }),
        ),
      ],
    ),
  ]);
}

const elm = ApplicationView({});
console.log(elm);
// render(elm, document.getElementById("root"), {
//   onVNodeTreeCreated(data) {
//     console.log(data);
//   },
// });
