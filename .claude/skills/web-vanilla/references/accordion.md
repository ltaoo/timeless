# Accordion 手风琴

## 用法

```js
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/index.js";

Accordion(
  { store: new Timeless.ui.AccordionCore({ type: "single" }) },
  [
    AccordionItem({ value: "item-1" }, [
      AccordionTrigger({}, ["第一项"]),
      AccordionContent({}, ["第一项的内容"]),
    ]),
    AccordionItem({ value: "item-2" }, [
      AccordionTrigger({}, ["第二项"]),
      AccordionContent({}, ["第二项的内容"]),
    ]),
  ]
);

// 多个展开
Accordion({ store: new Timeless.ui.AccordionCore({ type: "multiple" }) }, [...]);
```
