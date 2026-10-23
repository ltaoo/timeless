import { render } from "@timeless/timeless-windows";
import "virtual:timeless-web-styles";
import { SimplePageModel } from "./src/examples/simple/model.js";
import { SimplePageView } from "./src/examples/simple/view.js";

render(SimplePageView(SimplePageModel()));
