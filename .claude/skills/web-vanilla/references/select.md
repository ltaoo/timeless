# Select 选择器

## 用法

```js
import { Select } from "@/components/index.js";

Select({
  store: new Timeless.ui.SelectCore({
    defaultValue: "apple",
    placeholder: "请选择",
    options: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "orange", label: "橙子" },
    ],
    disabled: false,
    onChange(value) {
      console.log(value);
    },
  }),
});
```

## Core API

```ts
new SelectCore({
  defaultValue?: string,
  placeholder?: string,
  options?: Array<{ value: string, label: string, disabled?: boolean }>,
  disabled?: boolean,
  onChange?: (value: string) => void,
})

select$.value           // 获取值
select$.setValue("")    // 设置值
select$.setOptions([])  // 设置选项
```
