import {
  ref,
  View,
  Show,
  Portal,
  Fragment,
  For,
  ErrorBoundary,
  refarr,
  LazyView,
} from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";

import { Test1_RefShow } from "./tests/test1.js";
import { Test2_RefComputedStyle } from "./tests/test2.js";
import { Test3_RefobjComputedInShow } from "./tests/test3.js";
import { Test4_RefarrFor } from "./tests/test4.js";
import { Test5_RefarrForInShow } from "./tests/test5.js";

function SubContent() {
  const data = refarr([
    {
      label: "World",
      value: props.value,
    },
  ]);

  return View({}, [
    For({
      each: data,
      render(data) {
        return View(
          {
            onClick() {
              console.log(data.a.b);
            },
          },
          ["Hello", data.label],
        );
      },
    }),
  ]);
}

function Content(props, children) {
  // console.log("___", _a);
  return Show({
    when: props.visible_,
    ok() {
      return Portal({}, [View({}, [SubContent()])]);
    },
  });
}

function ApplicationView() {
  const visible_ = ref(true);
  const up_ = ref(true);
  const down_ = ref(true);

  return View({ style: { color: "#fff", padding: "20px" } }, [
    Fragment({}, [
      View(
        {
          onClick() {
            visible_.as((prev) => !prev);
          },
        },
        ["Trigger"],
      ),
      ErrorBoundary(
        {
          throwToGlobal: true,
          fallback(error) {
            const title = error?.name || "Error";
            const message = error?.message || String(error);
            const stack = error?.stack || `${title}: ${message}`;

            return View(
              {
                style: {
                  color: "#d93025",
                  border: "1px solid #f1b7b3",
                  borderRadius: "8px",
                  background: "#fff",
                  padding: "12px 14px",
                  marginTop: "12px",
                  fontFamily:
                    'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  boxShadow: "0 1px 2px rgba(60,64,67,0.15)",
                },
              },
              [
                View(
                  {
                    style: {
                      fontSize: "13px",
                      fontWeight: "600",
                      marginBottom: "8px",
                    },
                  },
                  [`${title}: ${message}`],
                ),
                View(
                  {
                    style: {
                      fontSize: "12px",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap",
                      color: "#5f6368",
                    },
                  },
                  [stack],
                ),
              ],
            );
          },
        },
        () => [
          For({
            each: [{}],
            render() {
              return LazyView(
                {},
                () => new Promise((resolve) => {
                  setTimeout(() => {
                    resolve(SubContent);
                  }, 800);
                }),
              );
            },
          }),
          // Content({ visible_ }, () => [
          //   Show({
          //     when: up_,
          //     ok() {
          //       return View({}, "Up");
          //     },
          //   }),
          //   View({}, ["Content"]),
          //   Show({
          //     when: down_,
          //     ok() {
          //       return View({}, "Down");
          //     },
          //   }),
          // ]),
        ],
      ),
    ]),

    // View(
    //   {
    //     style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" },
    //   },
    //   ["Dep Leak Test - Independent Tests"],
    // ),
    // Test1_RefShow(),
    // Test2_RefComputedStyle(),
    // Test3_RefobjComputedInShow(),
    // Test4_RefarrFor(),
    // Test5_RefarrForInShow(),
  ]);
}

render(ApplicationView({}), document.getElementById("root"));
