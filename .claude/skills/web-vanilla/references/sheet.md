# Sheet 侧边栏

## 用法

```js
import { Sheet, h } from "@/components/index.js";

const sheet$ = new Timeless.ui.DialogCore({
  title: "侧边栏标题",
  footer: true,
});

Sheet(
  { store: sheet$, side: "right" }, // side: left | right | top | bottom
  [h(View, {}, ["侧边栏内容"])],
);

sheet$.show();
sheet$.hide();
```
