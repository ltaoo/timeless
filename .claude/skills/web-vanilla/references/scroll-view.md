# ScrollView 滚动视图

## 用法

```js
import { ScrollView, View } from "@/components/index.js";

const view$ = new Timeless.ui.ScrollViewCore({});

ScrollView({ class: "h-screen", store: view$ }, [View({}, ["滚动内容"])]);

// 滚动控制
view$.scrollTo({ top: 100 });
view$.scrollToTop();
view$.scrollToBottom();

// 事件
view$.onScroll((pos) => {
  console.log(pos);
});
view$.onReachBottom((isReach) => {
  if (isReach) loadMore();
});
```
