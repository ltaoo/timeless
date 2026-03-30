# AspectRatio 宽高比

```js
import { AspectRatio, View } from "@/components/index.js";

View({ class: "w-[300px]" }, [
  AspectRatio({ ratio: 16 / 9 }, [
    View({ class: "flex items-center justify-center" }, ["16:9 内容"]),
  ]),
]);
```
