# 网络请求

Timeless 提供 `HttpClientCore` 和 `request_factory` 两种方式发起 HTTP 请求。

---

## 方式一：HttpClientCore（全局客户端）

在 `src/store/index.js` 中初始化并导出：

```js
export const client$ = new Timeless.HttpClientCore({
  headers: { "Content-Type": "application/json" },
});
// 附加 token
client$.appendHeaders({ Authorization: user$.token });
// 注册到框架
Timeless.web.provide_http_client(client$);
```

### HttpClientCore 方法

| 方法 | 说明 |
|------|------|
| `appendHeaders(obj)` | 追加/覆盖请求头 |

---

## 方式二：request_factory（业务请求封装）

在 `src/biz/request.js` 中创建请求实例并定义接口函数：

```js
export const request = Timeless.request_factory({
  headers: { "Content-Type": "application/json" },
});

// GET 请求
export function searchFruits(body) {
  return request.get("/api/fruit", body);
}

// GET 带参数
export function fetchDownloadList(params) {
  return request.get("/api/mock/downloads", params);
}

// POST 请求
export function createItem(data) {
  return request.post("/api/items", data);
}

// PUT 请求
export function updateItem(id, data) {
  return request.put(`/api/items/${id}`, data);
}

// DELETE 请求
export function deleteItem(id) {
  return request.delete(`/api/items/${id}`);
}
```

### request 实例方法

| 方法 | 说明 |
|------|------|
| `request.get(url, params)` | GET 请求，params 序列化为 query string |
| `request.post(url, data)` | POST 请求，data 作为 JSON body |
| `request.put(url, data)` | PUT 请求 |
| `request.delete(url, params)` | DELETE 请求 |

---

## 在业务代码中使用

```js
import { searchFruits } from "@/biz/request.js";

btnSearch.onClick(async () => {
  btnSearch.setLoading(true);
  const r = await searchFruits({ keyword: inputKeyword.value });
  btnSearch.setLoading(false);
  if (r.error) {
    app.tip?.({ text: [r.error.message] });
    return;
  }
  // r.data 为返回数据
  list.as(r.data);
});
```

### 返回值结构

所有请求返回 `Result` 对象：

```js
// 成功
{ data: any, error: null }

// 失败
{ data: null, error: { message: string, ... } }
```

### 常见模式

```js
// 1. 按钮触发请求 + loading 状态
btn.onClick(async () => {
  btn.setLoading(true);
  const r = await someRequest(params);
  btn.setLoading(false);
  if (r.error) { app.tip?.({ text: [r.error.message] }); return; }
  // 处理 r.data
});

// 2. 页面初始化加载数据
async function loadData() {
  const r = await fetchList({ page: 1 });
  if (r.error) return;
  list.as(r.data.items);
}
```

---

## 用户认证与 Token 管理

Token 通过 `StorageCore` 持久化，登录/登出时自动更新请求头：

```js
// 登录时
user$.login({ token: "xxx", username: "test" });
// 内部调用 client$.appendHeaders({ Authorization: token })

// 登出时
user$.logout();
// 内部清除 Authorization 头
```

---

## 完整参考

- 全局客户端初始化见 `apps/web-shadcn/src/store/index.js`
- 业务接口封装见 `apps/web-shadcn/src/biz/request.js`
