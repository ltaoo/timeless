# DatePicker 日期选择器

## 用法

```js
import { DatePicker } from "@/components/index.js";

DatePicker({
  store: Timeless.ui.DatePickerCore({
    today: new Date(),
    defaultValue: new Date(),
  }),
  placeholder: "选择日期",
});
```
