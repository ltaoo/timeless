# FileInput 文件上传

## 用法

```js
import { FileInput } from "@/components/index.js";

FileInput({
  accept: "image/*",
  multiple: false,
  onChange(e) {
    console.log("File selected:", e.target.files);
  },
});
```

## 属性

```ts
{
  accept?: string,      // 接受的文件类型，如 "image/*"
  multiple?: boolean,   // 是否多选
  disabled?: boolean,
  onChange?: (e: Event) => void,
}
```
