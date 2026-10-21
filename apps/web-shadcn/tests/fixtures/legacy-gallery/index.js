import { render } from "@timeless/timeless-macos";
import { MacOSApplicationModel } from "./model.js";
import { MacOSApplicationView } from "./view.js";
import "./styles.native.css";

// This fixture exercises the native host; application entries use the shared example.
render(MacOSApplicationView(MacOSApplicationModel()));
