# 控制流与渲染

## Show 条件渲染

**重要**：children 和 fallback 必须用 h() 包裹

```js
import { Show, View, h } from "@/components/index.js";

Show(
  { when: isLoading, fallback: h(View, {}, ["加载完成"]) },
  h(View, {}, ["加载中..."]),
);
```

## For 循环渲染

```js
import { For, View, h } from "@/components/index.js";

For({
  each: items,
  render(item) {
    return h(View, { class: "mb-2" }, [item.name]);
  },
});
```

## Switch + Match 分支

```js
import { Switch, Match, View, h } from "@/components/index.js";

Switch({ when: status }, [
  Match("success", h(View, {}, ["成功"])),
  Match("error", h(View, {}, ["错误"])),
]);
```
