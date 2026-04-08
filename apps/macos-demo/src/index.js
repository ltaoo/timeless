import {
  View,
  For,
  Show,
  ref,
  computed,
  refarr,
  Img,
  Button,
  Input,
} from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-native";

const apps = [
  { icon: "Movies", title: "Movies", subtitle: "Movies & Shows" },
  { icon: "Music", title: "Music", subtitle: "Your Favorites" },
  { icon: "Photos", title: "Photos", subtitle: "Photo Library" },
  { icon: "Settings", title: "Settings", subtitle: "Preferences" },
  { icon: "Weather", title: "Weather", subtitle: "5-Day Forecast" },
  { icon: "Browser", title: "Browser", subtitle: "Surf the Web" },
];

function ApplicationView() {
  const page = ref("todo");
  const count_ = ref(0);
  const todos = refarr([
    { id: 1, title: "Buy groceries" },
    { id: 2, title: "Study for exam" },
    { id: 3, title: "Build native app" },
  ]);
  const inputText = ref("");

  return View(
    {
      style: {
        padding: "20px",
      },
      onMounted() {
        console.log("[macOS Demo] onMounted");
        const timer = setInterval(() => {
          count_.as((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
      },
    },
    [
      View(
        {
          style: {
            "font-size": "24px",
            "font-weight": "bold",
            "margin-bottom": "16px",
          },
        },
        ["Timeless macOS Demo"],
      ),
      View(
        {
          style: {
            "margin-bottom": "12px",
            color: "#666",
          },
        },
        ["Counter: ", count_],
      ),
      // Image example
      View(
        {
          style: {
            "margin-bottom": "12px",
            "font-size": "16px",
            "font-weight": "bold",
          },
        },
        ["Image Component:"],
      ),
      // Img({
      //   src: "https://picsum.photos/200/120",
      //   style: {
      //     width: "200px",
      //     height: "120px",
      //     "margin-bottom": "12px",
      //   },
      // }),
      // Input example
      View(
        {
          style: {
            "margin-bottom": "8px",
            "font-size": "16px",
            "font-weight": "bold",
          },
        },
        ["Input Component:"],
      ),
      Input({
        placeholder: "Type something here...",
        value: inputText,
        style: {
          "font-size": "14px",
          "margin-bottom": "8px",
        },
        onInput(e) {
          inputText.set(e.target.value);
        },
      }),
      View(
        {
          style: {
            "margin-bottom": "12px",
            color: "#888",
            "font-size": "13px",
          },
        },
        ["You typed: ", inputText],
      ),
      // Button examples
      View(
        {
          style: {
            "margin-bottom": "8px",
            "font-size": "16px",
            "font-weight": "bold",
          },
        },
        ["Button Component:"],
      ),
      Button(
        {
          style: {
            "margin-bottom": "12px",
          },
          onClick() {
            count_.set(0);
          },
        },
        ["Reset Counter"],
      ),
      // Navigation
      View(
        {
          style: {
            "margin-bottom": "8px",
          },
        },
        [
          View(
            {
              style: {
                color: "#007bff",
                "margin-right": "16px",
              },
              onClick() {
                page.set("todo");
              },
            },
            ["Todo List"],
          ),
          View(
            {
              style: {
                color: "#007bff",
              },
              onClick() {
                page.set("app");
              },
            },
            ["App List"],
          ),
        ],
      ),
      Show({
        when: computed(page, (t) => t === "todo"),
        ok() {
          return [
            View(
              {
                style: {
                  "font-size": "18px",
                  "font-weight": "bold",
                  "margin-bottom": "8px",
                },
              },
              ["Todo List"],
            ),
            For({
              each: todos,
              render(todo) {
                return View(
                  {
                    style: {
                      padding: "8px",
                      "margin-bottom": "4px",
                      "background-color": "#f5f5f5",
                    },
                  },
                  [todo.title],
                );
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
                style: {
                  "font-size": "18px",
                  "font-weight": "bold",
                  "margin-bottom": "8px",
                },
              },
              ["Applications"],
            ),
            ...apps.map((app) =>
              View(
                {
                  style: {
                    padding: "8px",
                    "margin-bottom": "4px",
                    "background-color": "#f0f0f0",
                  },
                },
                [
                  View(
                    { style: { "font-weight": "bold" } },
                    [app.title],
                  ),
                  View(
                    { style: { color: "#888", "font-size": "12px" } },
                    [app.subtitle],
                  ),
                ],
              ),
            ),
          ];
        },
      }),
    ],
  );
}

// Render the app
var root = { type: "view", children: [], style: {}, attrs: {}, listeners: {} };
var elm = ApplicationView({});
render(elm, root);

if (root.children.length > 0) {
  __nativeBridge_render(root.children[0]);
}
