# DateRangePicker 日期范围选择器

## 用法

```js
import { DateRangePicker } from "@/components/index.js";

DateRangePicker({
  store: Timeless.ui.DateRangePickerCore({
    today: new Date(),
    defaultValue: [new Date(), new Date()],
  }),
  placeholder: ["开始日期", "结束日期"],
});
```
