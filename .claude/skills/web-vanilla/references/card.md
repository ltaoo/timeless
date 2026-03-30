# Card 卡片

## 用法

```js
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/index.js";

Card({}, [
  CardHeader({}, [
    CardTitle({}, ["卡片标题"]),
    CardDescription({}, ["卡片描述"]),
  ]),
  CardContent({}, ["卡片内容"]),
  CardFooter({}, ["卡片底部"]),
]);
```
