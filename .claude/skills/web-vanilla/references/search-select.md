# SearchSelect 搜索选择器

## 用法

```js
import { SearchSelect } from "@/components/index.js";

const searchSelect$ = new Timeless.ui.SelectCore({
  placeholder: "搜索...",
  options: [],
});

async function fetchOptions(keyword) {
  const r = await searchReq$.run({ keyword });
  if (r.error) return [];
  return r.data;
}

SearchSelect({
  store: searchSelect$,
  fetchOptions: fetchOptions,
  minLength: 1,
  debounce: 300,
});
```

## 属性

```ts
{
  store: SelectCore,
  fetchOptions: (keyword: string) => Promise<Array<{ value, label }>>,
  minLength?: number,      // 最少输入字符数触发搜索
  debounce?: number,       // 防抖延迟（毫秒）
}
```
