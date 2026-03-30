# Textarea 多行文本

## 用法

```js
import { Textarea } from "@/components/index.js";

Textarea({
  store: new Timeless.ui.InputCore({
    defaultValue: "",
    placeholder: "请输入多行文本",
  }),
  rows: 4,
});
```
