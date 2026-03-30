# Toast 消息提示

## 用法

```js
import { Toast } from "@/components/index.js";

const toast$ = new Timeless.ui.ToastCore({});
Toast({ store: toast$ });

// 显示消息
toast$.show({
  texts: ["操作成功"],
  type: "success", // success | error | warning | info
  duration: 3000,
});

toast$.show({
  texts: ["出错了", "请稍后重试"],
  type: "error",
});
```
