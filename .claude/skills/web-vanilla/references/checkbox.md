# Checkbox 复选框

## 用法

```js
import { Checkbox } from "@/components/index.js";

Checkbox({
  store: new Timeless.ui.CheckboxCore({
    checked: false,
    disabled: false,
    onChange(checked) {
      console.log(checked);
    },
  }),
});
```
