import { DouyinApplicationView } from "./app.js";

document.addEventListener("DOMContentLoaded", function () {
  document.documentElement.style.setProperty(
    "--app-height",
    `${window.innerHeight}px`,
  );
  Timeless.DOM.render(DouyinApplicationView(), document.querySelector("#root"));
});
