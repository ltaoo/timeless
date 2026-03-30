# ContextMenu 右键菜单

## 用法

```js
import { ContextMenu, View, h } from "@/components/index.js";

ContextMenu(
  {
    store: new Timeless.ui.ContextMenuCore({
      items: [
        new Timeless.ui.MenuItemCore({
          label: "复制",
          onClick() {
            console.log("copy");
          },
        }),
        new Timeless.ui.MenuSeparatorCore(),
        new Timeless.ui.MenuItemCore({
          label: "全选",
          onClick() {
            console.log("select all");
          },
        }),
      ],
    }),
  },
  [h(View, {}, ["右键这片区域"])],
);
```
