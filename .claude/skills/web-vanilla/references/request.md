# HTTP 请求

## request_factory

```js
const request = Timeless.request_factory({
  headers: { "Content-Type": "application/json" },
});

request.get("/api/users", { page: 1 });
request.post("/api/users", { name: "Tom" });
request.put("/api/users/1", { name: "Tom" });
request.delete("/api/users/1");
```

## RequestCore

```js
const req$ = new Timeless.RequestCore(
  (params) => request.get("/api/users", params),
  {
    process(r) {
      if (r.error) return r.error;
      return Timeless.Result.Ok(r.data);
    },
  },
);

const result = await req$.run({ page: 1 });
if (result.error) return;
const data = result.data;

// 状态
req$.loading;
req$.pending;
req$.response;

req$.reload(); // 重新加载
req$.cancel(); // 取消请求
```

## ListCore 分页列表

```js
const list$ = new Timeless.kit.ListCore(req$, { pageSize: 10 });
await list$.loadMore();
await list$.refresh();
```
