# Table 表格

## 用法

```js
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  For,
} from "@/components/index.js";

Table({}, [
  TableHeader({}, [
    TableRow({}, [TableHead({}, ["姓名"]), TableHead({}, ["年龄"])]),
  ]),
  TableBody({}, [
    For({
      each: dataList,
      render(item) {
        return TableRow({}, [
          TableCell({}, [item.name]),
          TableCell({}, [item.age]),
        ]);
      },
    }),
  ]),
]);
```
