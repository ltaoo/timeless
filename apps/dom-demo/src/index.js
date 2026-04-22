import { View, Show, Portal, ref, Fragment } from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";

import { Test1_RefShow } from "./tests/test1.js";
import { Test2_RefComputedStyle } from "./tests/test2.js";
import { Test3_RefobjComputedInShow } from "./tests/test3.js";
import { Test4_RefarrFor } from "./tests/test4.js";
import { Test5_RefarrForInShow } from "./tests/test5.js";

function Content(props, children) {
  return Show({
    when: props.visible_,
    ok() {
      return Portal({}, [View({}, children)]);
    },
  });
}

function ApplicationView() {
  const visible_ = ref(false);
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
      Content(
        {
          visible_,
        },
        () => [
          Show({
            when: up_,
            ok() {
              return View({}, "Up");
            },
          }),
          View({}, ["Content"]),
          Show({
            when: down_,
            ok() {
              return View({}, "Down");
            },
          }),
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
