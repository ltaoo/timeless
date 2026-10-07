import { render } from "@timeless/timeless-dom";

import { ApplicationView } from "@/app.js";

function mount() {
  const root = document.querySelector("#root");
  if (!root) {
    throw new Error("缺少 #root 挂载节点");
  }
  render(ApplicationView(), root);
}

if (import.meta.hot && import.meta.hot.data.initialized) {
  mount();
} else {
  window.addEventListener("DOMContentLoaded", mount, { once: true });
}

if (import.meta.hot) {
  import.meta.hot.data.initialized = true;
  import.meta.hot.accept();
}
