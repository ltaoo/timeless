# CheckboxGroup 复选框组

## 用法

```js
import { CheckboxGroup } from "@/components/index.js";

CheckboxGroup({
  store: new Timeless.ui.CheckboxGroupCore({
    options: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "orange", label: "橙子" },
    ],
    value: [],
  }),
  direction: "horizontal", // horizontal | vertical
});
```
