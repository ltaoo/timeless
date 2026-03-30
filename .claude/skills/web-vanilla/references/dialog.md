# Dialog 对话框

## 用法

```js
import { Dialog, View, h } from "@/components/index.js";

const dialog$ = new Timeless.ui.DialogCore({
  title: "标题",
  footer: true,
  maskClosable: true,
  closable: true,
  onOk() {
    dialog$.okBtn.setLoading(true);
    setTimeout(() => {
      dialog$.okBtn.setLoading(false);
    }, 3000);
  },
});

Dialog({ store: dialog$ }, [h(View, {}, ["对话框内容"])]);

// 控制显示
dialog$.show();
dialog$.hide();
```

## 属性

```ts
new DialogCore({
  title?: string,
  footer?: boolean,
  maskClosable?: boolean,
  closable?: boolean,
  fullscreen?: boolean,
  onOk?: () => void,
  onClose?: () => void,
})
```
