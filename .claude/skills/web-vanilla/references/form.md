# Form 表单验证

## 单字段

```js
import { Field, Input, h } from "@/components/index.js";

const field$ = new Timeless.ui.SingleFieldCore({
  label: "用户名",
  name: "username",
  input: new Timeless.ui.InputCore({ defaultValue: "" }),
  rules: [{ required: true, message: "请输入用户名" }],
});

h(Field, { store: field$ }, [Input({ store: field$.input })]);
```

## 表单组合

```js
const form$ = new Timeless.ui.ObjectFieldCore({
  fields: {
    username: fieldUsername$,
    password: fieldPassword$,
  },
});

// 验证
const result = await form$.validate();
if (result.error) {
  console.log(result.error);
  return;
}
const values = result.data;

// 重置
form$.reset();

// 设置值
form$.setFieldsValue({ username: "admin" });
```
