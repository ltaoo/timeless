# DropdownMenu 下拉菜单

## 用法

```js
import { DropdownMenu, Button, h } from "@/components/index.js";

DropdownMenu(
  {
    store: new Timeless.ui.DropdownMenuCore({
      trigger: "click",
      items: [
        new Timeless.ui.MenuItemCore({
          label: "编辑",
          onClick() {
            console.log("edit");
          },
        }),
        new Timeless.ui.MenuItemCore({
          label: "删除",
          danger: true,
          onClick() {
            console.log("delete");
          },
        }),
      ],
    }),
  },
  [Button({ store: new Timeless.ui.ButtonCore({}) }, ["打开菜单"])],
);
```

## 菜单项类型

- MenuItemCore - 菜单项
- MenuSeparatorCore - 分割线
- MenuGroupCore - 分组
- MenuCore - 子菜单
