import {
  Show,
  Grid,
  View,
  For,
  Icon,
  Input,
  Button,
  Fragment,
  Img,
  ref,
  combine,
  computed,
  refarr,
  Portal,
} from "@timeless/timeless";
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
  const count_ = ref(0);
  const columns = 4;
  const focused = ref({ x: 0, y: 0 });
  const keyword_ = ref("");
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

  function handleSelectCard(idx) {
    focused.set(xyFromIdx(idx));
  }
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

  /**
   * @param {{ x: number, y: number }} pos
   * @param {number} idx
   * @returns
   */
  function isFocusedCell(pos, idx) {
    const { x, y } = xyFromIdx(idx);
    // console.log(`[${pos.x},${pos.y}] is ${idx}, ${x},${y}`);
    return pos.x === x && pos.y === y;
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

  return View(
    {
      class: "page",
      onMounted() {
        console.log("[ApplicationView] onMounted");
        const timer = setInterval(() => {
          count_.as((prev) => {
            return prev + 1;
          });
        }, 1000);
        return function () {
          clearInterval(timer);
        };
      },
    },
    [
      Portal({}, [
        View({}, ["first content in body"]),
        View({}, ["second content in body"]),
      ]),
      Img({
        src: "/public/avatar.jpeg",
        style: {
          width: "60px",
          height: "60px",
        },
      }),
      Icon({ name: "bolt", color: "#fff" }),
      View(
        {
          style: {
            color: "#fff",
          },
        },
        [count_],
      ),
      Input({
        placeholder: "Search",
        value: keyword_,
        onMounted(event) {
          console.log("the input mounted", event.target);
        },
      }),
      Button(
        {
          onClick() {
            const v = keyword_.value;
            console.log("click button", v);
          },
        },
        ["Click it"],
      ),
      View(
        {
          class: "navigation",
        },
        [
          View(
            {
              class: "navigate-to",
              style: {
                color: "white",
              },
              onClick() {
                page.set("todo");
              },
            },
            ["Goto Todo List"],
          ),
          View(
            {
              class: "navigate-to",
              style: {
                color: "white",
              },
              onClick() {
                console.log("click app");
                page.set("app");
              },
            },
            ["Goto Application List"],
          ),
        ],
      ),
      Show({
        when: computed(page, (t) => t === "todo"),
        ok() {
          return [
            View(
              {
                class: "subpage-title",
              },
              ["Todo List Page"],
            ),
            For({
              each: todos,
              render(todo) {
                return View({}, [todo.title]);
              },
            }),
          ];
        },
      }),
      Show({
        when: computed(page, (t) => t === "app"),
        ok() {
          return [
            View(
              {
                class: "subpage-title",
              },
              ["Application List Page"],
            ),
            Grid(
              { columns, gap: 16 },
              apps.map((app, idx) => {
                return View(
                  {
                    style: {
                      "border-style": "solid",
                      "border-width": "2px",
                      "border-color": combine({ focused, idx }, (t) => {
                        return isFocusedCell(t.focused, t.idx)
                          ? "#007bff"
                          : "rgba(255,255,255,0.18)";
                      }),
                    },
                    onClick() {
                      handleSelectCard(idx.value);
                    },
                  },
                  [
                    View(
                      { style: { "text-align": "center", "font-size": 22 } },
                      [app.icon],
                    ),
                    View(
                      {
                        style: {
                          "text-align": "center",
                          "font-weight": "bold",
                          fontSize: 14,
                        },
                      },
                      [app.title],
                    ),
                    View(
                      {
                        style: {
                          "text-align": "center",
                          "font-size": 12,
                          color: "gray",
                        },
                      },
                      [app.subtitle],
                    ),
                  ],
                );
              }),
            ),
          ];
        },
      }),
    ],
  );
}

const elm = ApplicationView({});
console.log(elm);
render(elm, document.getElementById("root"), {
  onVNodeTreeCreated(data) {
    console.log(data);
  },
});
