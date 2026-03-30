# Label 标签

## 用法

```js
import { Label } from "@/components/index.js";

View({}, [
  Label({ for: "input-id" }, ["用户名"]),
  Input({ id: "input-id", store: new Timeless.ui.InputCore({}) }),
]);
```
