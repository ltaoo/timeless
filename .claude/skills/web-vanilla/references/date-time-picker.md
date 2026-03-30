# DateTimePicker 日期时间选择器

## 用法

```js
import { DateTimePicker } from "@/components/index.js";

DateTimePicker({
  date: Timeless.ui.DatePickerCore({ today: new Date() }),
  time: Timeless.ui.TimePickerCore({ showSeconds: true }),
  placeholder: "选择日期时间",
});
```
