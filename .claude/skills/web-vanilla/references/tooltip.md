# Tooltip 提示

## 用法

```js
import { Tooltip, TooltipProvider, Button, h } from "@/components/index.js";

TooltipProvider({ delayDuration: 200 }, [
  Tooltip({ content: ["提示内容"], side: "top" }, [
    Button({ store: new Timeless.ui.ButtonCore({}) }, ["hover 我"]),
  ]),
]);
```
