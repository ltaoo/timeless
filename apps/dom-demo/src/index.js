import { View } from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";

import { Test1_RefShow } from "./tests/test1.js";
import { Test2_RefComputedStyle } from "./tests/test2.js";
import { Test3_RefobjComputedInShow } from "./tests/test3.js";
import { Test4_RefarrFor } from "./tests/test4.js";
import { Test5_RefarrForInShow } from "./tests/test5.js";

function ApplicationView() {
  return View({ style: { color: "#fff", padding: "20px" } }, [
    View(
      {
        style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" },
      },
      ["Dep Leak Test - Independent Tests"],
    ),
    Test1_RefShow(),
    Test2_RefComputedStyle(),
    Test3_RefobjComputedInShow(),
    Test4_RefarrFor(),
    Test5_RefarrForInShow(),
  ]);
}

render(ApplicationView({}), document.getElementById("root"));
