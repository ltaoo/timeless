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
  Checkbox,
} from "@timeless/timeless";
import { render, TimelessNativeVersion } from "@timeless/timeless-native";
// import { render } from "@timeless/timeless-dom";

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
  const input_ = ref("");
  const agreed = ref(false);
  const subscribe = ref(false);

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
      View({}, [TimelessNativeVersion]),
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
      Img({
        src: "https://picsum.photos/200/120",
        style: {
          width: "200px",
          height: "120px",
          "margin-bottom": "12px",
        },
      }),
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
      View({}, [
        View({}, [
          Input({
            placeholder: "Type something here...",
            value: input_,
            style: {
              "font-size": "14px",
              "margin-bottom": "8px",
            },
            onInput(e) {
              input_.set(e.target.value);
            },
          }),
          Button({}, ["Search"]),
        ]),
        View(
          {
            style: {
              "margin-bottom": "12px",
              color: "#888",
              "font-size": "13px",
            },
          },
          ["You typed: ", input_],
        ),
      ]),
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
      View(
        {
          style: {
            "margin-bottom": "8px",
            "font-size": "16px",
            "font-weight": "bold",
          },
        },
        ["Checkbox Component:"],
      ),
      View(
        {
          style: {
            "margin-bottom": "8px",
          },
        },
        [
          Checkbox({
            checked: agreed,
            onChange(event) {
              agreed.set(event.target.checked);
            },
          }),
          View(
            {
              style: {
                "margin-left": "8px",
              },
            },
            ["I agree to terms"],
          ),
        ],
      ),
      View(
        {
          style: {
            "margin-bottom": "8px",
          },
        },
        [
          Checkbox({
            checked: subscribe,
            onChange(event) {
              subscribe.set(event.target.checked);
            },
          }),
          View(
            {
              style: {
                "margin-left": "8px",
              },
            },
            ["Subscribe to newsletter"],
          ),
        ],
      ),
      View(
        {
          style: {
            "margin-bottom": "12px",
            color: "#888",
            "font-size": "13px",
          },
        },
        [
          "Agreed: ",
          computed(agreed, (v) => (v ? "Yes" : "No")),
          " | Subscribed: ",
          computed(subscribe, (v) => (v ? "Yes" : "No")),
        ],
      ),
    ],
  );
}

// Render the app
// render(ApplicationView({}), document.getElementById("root"));
render(ApplicationView({}));
