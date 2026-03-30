# Input 输入框

## 用法

```js
import { Input } from "@/components/index.js";

Input({
  id: "my-input",
  store: new Timeless.ui.InputCore({
    defaultValue: "",
    placeholder: "请输入内容",
    allowClear: true,
    disabled: false,
    readonly: false,
    onChange(value) {
      console.log(value);
    },
    onEnter(value) {
      console.log("enter pressed", value);
    },
  }),
});
```

## Core API

```ts
new InputCore({
  defaultValue?: string,
  placeholder?: string,
  allowClear?: boolean,
  disabled?: boolean,
  readonly?: boolean,
  onChange?: (value: string) => void,
  onEnter?: (value: string) => void,
})

input$.value           // 获取值
input$.setValue("")    // 设置值
input$.focus()         // 聚焦
input$.select()        // 选中
```
