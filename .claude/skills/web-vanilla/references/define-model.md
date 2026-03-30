# defineModel 页面模型

## 用法

```js
import { defineModel } from "@/biz/model.js";
import { ref, refarr } from "@/components/index.js";

export const HomePageViewModel = defineModel((props) => {
  // 状态
  const loading = ref(false);
  const users = refarr([]);

  // 请求（使用 RequestCore）
  const request = {
    list: new Timeless.kit.RequestCore(
      (params) => props.request.post("/api/user/list", params),
      {
        client: props.client,
        process(r) {
          if (r.error) return r.error;
          return Timeless.Result.Ok(r.data);
        },
      },
    ),
  };

  const state = { loading, users };

  const methods = {
    async fetchUsers() {
      loading.as(true);
      const r = await request.list.run({ page: 1, size: 10 });
      loading.as(false);
      if (r.error) return;
      users.as(r.data.list);
    },
  };

  return { state, methods };
});
```

## props 提供的属性

```js
defineModel((props) => {
  // props 包含：
  props.request; // 请求实例（来自 @/biz/request.js）
  props.client; // HttpClientCore
  props.app; // ApplicationModel 实例
  props.history; // HistoryCore 实例
  props.view; // RouteViewCore 实例
});
```

## 导出 model

```js
export const HomePageViewModel = defineModel((props) => {
  const state = {
    /* 状态 */
  };
  const methods = {
    /* 方法 */
  };
  return { state, methods };
});
```

## 最佳实践

- 在 model 中使用 `new Timeless.kit.RequestCore` 定义请求
- 返回 `{ state, methods }` 对象，视图层只消费 state
- 不要在视图层直接调用 service，始终通过 methods 封装
