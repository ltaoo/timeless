import { render } from "@timeless/timeless-macos";
import "virtual:timeless-web-styles";
import { SimplePageModel } from "./src/examples/simple/model.js";
import { SimplePageView } from "./src/examples/simple/view.js";

render(
  SimplePageView(
    SimplePageModel({
      initialDark: globalThis.__nativeBridge_prefersDarkMode?.() ?? false,
      onThemeChange: (dark) => globalThis.__nativeBridge_setDarkMode?.(dark),
    }),
  ),
);
