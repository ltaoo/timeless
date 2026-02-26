import { createApp } from "vue";

import App from "./App.vue";

import "tailwindcss/tailwind.css";
import "./style.css";

const app = createApp(App);
app.mount("#app");

// app.compilerOptions = {
//   isCustomElement: (tag) => tag.startsWith("my-"), // 替换为你的自定义元素前缀
// };
