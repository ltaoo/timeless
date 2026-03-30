# TimePicker 时间选择器

## 用法

```js
import { TimePicker } from "@/components/index.js";

TimePicker({
  store: Timeless.ui.TimePickerCore({
    defaultValue: { hour: 9, minute: 30 },
    showSeconds: false,
  }),
  placeholder: "选择时间",
});
```
