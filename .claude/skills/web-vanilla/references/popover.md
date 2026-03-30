# Popover 气泡弹出框

## 用法

```js
import { Popover, Button, h } from "@/components/index.js";

Popover(
  {
    store: new Timeless.ui.PopoverCore({
      trigger: "click", // click | hover
      side: "bottom", // top | bottom | left | right
      align: "start", // start | center | end
    }),
    content: [h(View, {}, ["弹出内容"])],
  },
  [Button({ store: new Timeless.ui.ButtonCore({}) }, ["点击弹出"])],
);
```
