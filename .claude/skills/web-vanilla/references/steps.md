# Steps 步骤条

## 用法

```js
import { Steps, Step } from "@/components/index.js";

Steps({ current: 1 }, [
  Step({ title: "步骤 1", description: "填写信息" }),
  Step({ title: "步骤 2", description: "确认订单" }),
  Step({ title: "步骤 3", description: "完成支付" }),
]);

// 垂直
Steps({ current: 1, direction: "vertical" }, [...]);
```
