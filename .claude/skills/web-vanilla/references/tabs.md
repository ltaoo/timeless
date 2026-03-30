# Tabs 标签页

## 用法

```js
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/index.js";

Tabs({ value: "tab1" }, [
  TabsList({}, [
    TabsTrigger({ value: "tab1" }, ["标签一"]),
    TabsTrigger({ value: "tab2" }, ["标签二"]),
  ]),
  TabsContent({ value: "tab1" }, ["标签一的内容"]),
  TabsContent({ value: "tab2" }, ["标签二的内容"]),
]);
```
