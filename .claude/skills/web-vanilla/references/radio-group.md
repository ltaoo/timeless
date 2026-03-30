# RadioGroup 单选按钮组

## 用法

```js
import { RadioGroup } from "@/components/index.js";

RadioGroup({
  store: new Timeless.ui.RadioGroupCore({
    value: "apple",
    options: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "orange", label: "橙子" },
    ],
    disabled: false,
  }),
  direction: "horizontal", // horizontal | vertical
});
```
