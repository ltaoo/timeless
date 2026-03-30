# Flex 弹性布局

## 用法

```js
import { Flex, View } from "@/components/index.js";

// 基础
Flex({ direction: "row" }, [View({}, ["左"]), View({}, ["右"])]);

// 带对齐
Flex({
  direction: "row",
  justify: "between", // start | end | center | between | around | evenly
  items: "center",    // start | end | center | stretch | baseline
  gap: "4",           // 间距
}, [...]);
```
