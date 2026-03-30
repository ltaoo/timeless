# Cascader 级联选择器

## 用法

```js
import { Cascader } from "@/components/index.js";

Cascader({
  store: new Timeless.ui.CascaderCore({
    placeholder: "请选择",
    defaultValue: [],
    options: [
      {
        value: "zhejiang",
        label: "浙江",
        children: [
          { value: "hangzhou", label: "杭州" },
          { value: "ningbo", label: "宁波" },
        ],
      },
    ],
    search: true,
    searchPlaceholder: "输入关键词搜索...",
  }),
});
```

## Core API

```ts
new CascaderCore({
  placeholder?: string,
  defaultValue?: string[],  // ["zhejiang", "hangzhou"]
  options?: Array<{ value, label, children? }>,
  search?: boolean,         // 是否支持搜索
  searchPlaceholder?: string,
})
```
