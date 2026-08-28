# @timeless/analytics

零依赖的浏览器无埋点 SDK。自动记录页面加载与 SPA 路由、交互元素点击、表单输入/提交，以及 `fetch`、`XMLHttpRequest` 请求。

```ts
import { init_analytics } from "@timeless/analytics";

const analytics = init_analytics({
  app_id: "console",
  endpoint: "https://collector.example.com/events",
});

analytics.identify("user-42");
analytics.track("order_paid", { order_id: "A100" });
```

也可以接入任意发送通道：

```ts
const analytics = init_analytics({
  app_id: "console",
  transport: ({ events }) => my_queue.publish(events),
});
```

服务端接收 `{ app_id, sent_at, events }`。事件包含稳定的匿名用户 ID、30 分钟会话 ID、页面上下文和事件属性；失败批次会留在内存队列中等待下次 `flush()`。

默认不采集按钮文本、输入内容和 URL query。设置 `capture_text` 或 `capture_input_values` 可显式开启；密码、`data-analytics-mask`、`data-private` 始终屏蔽。使用 `data-analytics-ignore` 排除节点，使用 `data-n` 或 `data-analytics-name` 提供稳定的业务语义名称。

```ts
const analytics = init_analytics({
  app_id: "console",
  endpoint: "/events",
  capture_input_values: true,
  request_filter: (url) => !url.includes("/health"),
  before_send: (event) => (event.properties.internal ? null : event),
});

analytics.opt_out(); // 停止并清空待发送数据
analytics.opt_in();
await analytics.flush();
analytics.stop();
```
