# NumberInput 数字输入框

## 用法

```js
import { NumberInput } from "@/components/index.js";

NumberInput({
  store: new Timeless.ui.NumberInputCore({
    defaultValue: 0,
    placeholder: "请输入数字",
    min: 0,
    max: 100,
    step: 1,
    precision: 2,
  }),
  showControls: true,
});
```

## Core API

```ts
new NumberInputCore({
  defaultValue?: number,
  placeholder?: string,
  min?: number,
  max?: number,
  step?: number,
  precision?: number,  // 小数位数
  disabled?: boolean,
})
```
