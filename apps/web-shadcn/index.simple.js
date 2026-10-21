import { render } from "@timeless/timeless-dom";
import { SimplePageModel } from "./src/examples/simple/model.js";
import { SimplePageView } from "./src/examples/simple/view.js";

render(SimplePageView(SimplePageModel()), document.getElementById("root"));
